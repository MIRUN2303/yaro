const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function createOrder(amount, receipt) {
  const options = {
    amount: amount * 100, // Razorpay expects paise
    currency: 'INR',
    receipt: receipt,
    payment_capture: 1
  };
  return razorpay.orders.create(options);
}

async function verifyPayment(orderId, paymentId, signature) {
  const crypto = require('crypto');
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(orderId + '|' + paymentId)
    .digest('hex');
  return expectedSig === signature;
}

module.exports = { razorpay, createOrder, verifyPayment };
