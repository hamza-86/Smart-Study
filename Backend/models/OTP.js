const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mailTemplate/MailTemp");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    expires: 300,
  }
);

otpSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    await mailSender(
      this.email,
      "Email Verification",
      emailTemplate(this.otp)
    );
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("OTP", otpSchema);