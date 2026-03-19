/**
 * Mail Sender Utility
 * Reuses a single Nodemailer transporter for the process lifetime
 */

const nodemailer = require("nodemailer");
const logger     = require("./logger");

// Lazily created — avoids building the transporter before .env is loaded
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host:   process.env.MAIL_HOST,
    port:   Number(process.env.MAIL_PORT) || 587,
    secure: process.env.MAIL_PORT === "465", // true for 465 (SSL), false for 587 (TLS)
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  return transporter;
};

/**
 * Send an HTML email
 *
 * @param {string} to       - recipient email address
 * @param {string} subject  - email subject
 * @param {string} html     - HTML body
 * @returns {object}        - Nodemailer info object
 */
const mailSender = async (to, subject, html) => {
  if (!to || !subject || !html) {
    throw new Error("mailSender: to, subject, and html are all required");
  }

  try {
    const info = await getTransporter().sendMail({
      from:    `"${process.env.MAIL_FROM_NAME || "EduFlow"}" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });

    logger.info("Email sent", { to, subject, messageId: info.messageId });
    return info;
  } catch (error) {
    logger.error("Email sending failed", error, { to, subject });
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

module.exports = mailSender;