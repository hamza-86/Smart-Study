const Razorpay = require("razorpay");

const hasRazorpayConfig =
  Boolean(process.env.RAZORPAY_KEY) && Boolean(process.env.RAZORPAY_SECRET);

exports.instance = hasRazorpayConfig
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    })
  : null;

exports.hasRazorpayConfig = hasRazorpayConfig;
