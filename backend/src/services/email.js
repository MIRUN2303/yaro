const { Resend } = require('resend');

let resend;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (e) {
  console.warn('Resend not configured — emails disabled');
}

const FROM = 'YARO <noreply@yaro.com>';

async function sendWelcome(email, name) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Welcome to YARO',
      html: `<div style="font-family: 'Clash Display', sans-serif; background:#050505; color:#fff; padding:40px; text-align:center;">
        <h1 style="font-size:32px; letter-spacing:4px; color:#c4b5fd;">YARO</h1>
        <p style="font-size:16px; margin:20px 0;">Welcome aboard, ${name}.</p>
        <p style="font-size:14px; color:#a1a1aa;">You are now part of the YARO collective. Wear what stays with you.</p>
        <a href="${process.env.FRONTEND_URL}/store.html" style="display:inline-block; margin-top:24px; padding:12px 32px; background:#c4b5fd; color:#050505; text-decoration:none; border-radius:100px; font-weight:600;">Explore Collections</a>
      </div>`
    });
  } catch (e) { console.error('Email error:', e.message); }
}

async function sendOrderConfirmation(email, name, order) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Order Confirmed — YARO #' + order.order_number,
      html: `<div style="font-family: 'Clash Display', sans-serif; background:#050505; color:#fff; padding:40px;">
        <h1 style="font-size:28px; letter-spacing:3px; color:#c4b5fd;">YARO</h1>
        <p style="font-size:16px;">Thank you, ${name}!</p>
        <p style="font-size:14px; color:#a1a1aa;">Your order <strong>#${order.order_number}</strong> has been confirmed.</p>
        <table style="width:100%; margin:20px 0; border-collapse:collapse;">
          <tr><td style="padding:8px 0; color:#a1a1aa;">Total</td><td style="text-align:right;">₹${(order.total/100).toFixed(2)}</td></tr>
          <tr><td style="padding:8px 0; color:#a1a1aa;">Payment</td><td style="text-align:right; text-transform:capitalize;">${order.payment_status}</td></tr>
        </table>
        <a href="${process.env.FRONTEND_URL}" style="display:inline-block; margin-top:16px; padding:12px 32px; background:#c4b5fd; color:#050505; text-decoration:none; border-radius:100px; font-weight:600;">Continue Shopping</a>
      </div>`
    });
  } catch (e) { console.error('Email error:', e.message); }
}

async function sendShippingUpdate(email, name, order) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Your YARO Order #' + order.order_number + ' Has Shipped',
      html: `<div style="font-family: 'Clash Display', sans-serif; background:#050505; color:#fff; padding:40px;">
        <h1 style="font-size:28px; letter-spacing:3px; color:#c4b5fd;">YARO</h1>
        <p style="font-size:16px;">Hey ${name},</p>
        <p style="font-size:14px; color:#a1a1aa;">Your order <strong>#${order.order_number}</strong> is on its way.</p>
        <p style="font-size:14px; color:#a1a1aa;">Thank you for being part of the YARO collective.</p>
      </div>`
    });
  } catch (e) { console.error('Email error:', e.message); }
}

module.exports = { sendWelcome, sendOrderConfirmation, sendShippingUpdate };
