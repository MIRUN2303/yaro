const Razorpay = require('razorpay');

let _razorpay = null;
function getRazorpay() {
  if (!_razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      const err = new Error('Razorpay not configured');
      err.code = 'RAZORPAY_NOT_CONFIGURED';
      throw err;
    }
    _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return _razorpay;
}

async function createOrder(amount, receipt) {
  const rzp = getRazorpay();
  const options = {
    amount: amount * 100,
    currency: 'INR',
    receipt: receipt,
    payment_capture: 1
  };
  return rzp.orders.create(options);
}

async function verifyPayment(orderId, paymentId, signature) {
  const crypto = require('crypto');
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(orderId + '|' + paymentId)
    .digest('hex');
  return expectedSig === signature;
}

module.exports = { getRazorpay, createOrder, verifyPayment };
