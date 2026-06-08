const express = require('express');
const router = express.Router();
const { razorpay } = require('../services/razorpay');
const { authenticate } = require('../middleware/auth');
const { verifyPayment } = require('../services/razorpay');

// GET /api/payments/key — expose Razorpay key to frontend
router.get('/key', (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// POST /api/payments/create-order
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    if (!amount) return res.status(400).json({ error: 'Amount required' });

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: receipt || 'rcpt_' + Date.now(),
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/verify
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const isValid = await verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    res.json({ message: 'Payment verified', status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/webhook (Razorpay webhook)
router.post('/webhook', async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const crypto = require('crypto');
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    const actualSig = req.headers['x-razorpay-signature'];
    if (expectedSig !== actualSig) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payment = req.body.payload?.payment?.entity;

    if (event === 'payment.captured' && payment) {
      const { supabase } = require('../config/supabase');
      await supabase
        .from('orders')
        .update({ payment_status: 'confirmed', razorpay_payment_id: payment.id })
        .eq('razorpay_order_id', payment.order_id);
    }

    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
