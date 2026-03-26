const Razorpay = require("razorpay");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const razorpayKey = process.env.RAZORPAY_KEY || process.env.RAZORPAY_KEY_ID;
const razorpaySecret = process.env.RAZORPAY_SECRET || process.env.RAZORPAY_SECRET_KEY;
const hasRazorpayConfig =
  Boolean(razorpayKey) && Boolean(razorpaySecret);

exports.instance = hasRazorpayConfig
  ? new Razorpay({
      key_id: razorpayKey,
      key_secret: razorpaySecret,
    })
  : null;

exports.hasRazorpayConfig = hasRazorpayConfig;
