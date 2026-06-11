const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { createOrder, verifyPayment } = require('../services/razorpay');
const { sendOrderConfirmation, sendShippingUpdate } = require('../services/email');
const { adminAuth } = require('../middleware/admin');

function generateOrderNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let num = 'YARO-';
  for (let i = 0; i < 8; i++) num += chars.charAt(Math.floor(Math.random() * chars.length));
  return num;
}

// POST /api/orders/create
router.post('/create', authenticate, async (req, res) => {
  try {
    const { items, subtotal, shipping, tax, total, shipping_address } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'No items in order' });

    // Create Razorpay order
    const receipt = 'rcpt_' + Date.now();
    const razorpayOrder = await createOrder(total, receipt);

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order in database
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.id,
        order_number: orderNumber,
        subtotal,
        shipping: shipping || 0,
        tax: tax || 0,
        total,
        payment_status: 'pending',
        razorpay_order_id: razorpayOrder.id,
        shipping_address: shipping_address || null
      })
      .select()
      .single();

    if (error) throw error;

    // Insert order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      size: item.size || '',
      quantity: item.quantity || 1,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    res.status(201).json({
      order_id: order.id,
      order_number: orderNumber,
      razorpay_order_id: razorpayOrder.id,
      razorpay_key_id: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/verify
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    const isValid = await verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        payment_status: 'confirmed',
        razorpay_payment_id: razorpay_payment_id
      })
      .eq('id', order_id)
      .select('*, user:users(id, name, email)')
      .single();

    if (error) throw error;

    // Send confirmation email
    if (order.user?.email) {
      sendOrderConfirmation(order.user.email, order.user.name || 'Customer', order);
    }

    res.json({ message: 'Payment verified', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders (user's orders, or all orders for admin)
router.get('/', async (req, res) => {
  try {
    // Check for admin token first (admin JWT), fall back to user auth
    const jwt = require('jsonwebtoken');
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    let isAdmin = false;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role === 'admin') isAdmin = true;
    } catch (e) { /* not admin token, check user token below */ }

    if (!isAdmin) {
      // Fall back to regular user authentication
      try {
        const { supabase: sb } = require('../config/supabase');
        const { data: { user }, error } = await sb.auth.getUser(token);
        if (error || !user) return res.status(401).json({ error: 'Authentication required' });
        req.user = user;
      } catch (e) {
        return res.status(401).json({ error: 'Authentication required' });
      }
    }

    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (!isAdmin) {
      query = query.eq('user_id', req.user.id);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Order not found' });
    if (data.user_id !== req.user.id && req.admin?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id/status (admin)
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { payment_status, fulfillment_status } = req.body;
    const updates = {};
    if (payment_status) updates.payment_status = payment_status;
    if (fulfillment_status) updates.fulfillment_status = fulfillment_status;

    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, user:users(id, name, email)')
      .single();

    if (error) throw error;
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Send shipping update if status changed to shipped
    if (fulfillment_status === 'shipped' && order.user?.email) {
      sendShippingUpdate(order.user.email, order.user.name || 'Customer', order);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id/cancel-action (admin approve/reject cancellation)
router.put('/:id/cancel-action', adminAuth, async (req, res) => {
  try {
    const { action, admin_note } = req.body;
    if (!action || !['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use "approved" or "rejected"' });
    }

    const updates = {};
    if (action === 'approved') {
      updates.fulfillment_status = 'cancelled';
      updates.cancellation = { status: 'approved', admin_note: admin_note || null };
    } else {
      updates.cancellation = { status: 'rejected', admin_note: admin_note || null };
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Order not found' });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
