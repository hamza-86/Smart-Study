const nodemailer = require("nodemailer");

let transporter;

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};

const mailSender = async (email, subject, body) => {
  try {
    if (!email || !subject || !body) {
      throw new Error("Missing email parameters");
    }

    if (!transporter) {
      transporter = createTransporter();
    }

    const mailOptions = {
      from: `"SmartLearn" <${process.env.MAIL_USER}>`,
      to: email,
      subject,
      html: body,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.messageId);
    return info;

  } catch (error) {
    console.error("Mail Error:", error.message);
    throw new Error("Email sending failed");
  }
};

module.exports = mailSender;