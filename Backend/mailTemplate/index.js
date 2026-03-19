/**
 * Mail Templates
 * All email HTML templates used across the application
 *
 * Usage:
 *   const { otpTemplate, courseEnrollmentEmail, ... } = require("../mailTemplate");
 *   await mailSender(email, "Subject", otpTemplate(otp));
 */

const APP_NAME    = "EduFlow";
const LOGO_URL    = "https://i.ibb.co/7Xyj3PC/logo.png"; // replace with your logo
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@eduflow.com";
const CLIENT_URL  = process.env.CLIENT_URL || "http://localhost:3000";

// ── Shared CSS ───────────────────────────────────────────────────────────────
const baseStyles = `
  body { background:#f4f4f4; font-family:Arial,sans-serif; font-size:16px; line-height:1.5; color:#333; margin:0; padding:0; }
  .wrapper { background:#f4f4f4; padding:40px 0; }
  .container { background:#ffffff; max-width:600px; margin:0 auto; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.08); }
  .header { background:#1a1a2e; padding:24px 32px; text-align:center; }
  .header img { max-height:48px; }
  .body { padding:32px; }
  h2 { font-size:22px; margin-top:0; color:#1a1a2e; }
  p { margin:0 0 16px; }
  .highlight { font-weight:bold; color:#1a1a2e; }
  .otp-box { display:inline-block; font-size:32px; font-weight:bold; letter-spacing:8px; background:#f0f4ff; color:#1a1a2e; padding:16px 32px; border-radius:6px; margin:16px 0; }
  .btn { display:inline-block; padding:12px 28px; background:#FFD60A; color:#1a1a2e; text-decoration:none; border-radius:6px; font-size:15px; font-weight:bold; margin-top:16px; }
  .divider { border:none; border-top:1px solid #ebebeb; margin:24px 0; }
  .footer { padding:20px 32px; text-align:center; font-size:13px; color:#999; }
  .footer a { color:#666; }
`;

// ── OTP Template ─────────────────────────────────────────────────────────────

const otpTemplate = (otp) => `
<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Verify your email</title>
<style>${baseStyles}</style></head>
<body><div class="wrapper"><div class="container">
  <div class="header"><img src="${LOGO_URL}" alt="${APP_NAME}"></div>
  <div class="body">
    <h2>Verify your email address</h2>
    <p>Dear User,</p>
    <p>Thank you for signing up for <span class="highlight">${APP_NAME}</span>. Use the OTP below to complete your registration:</p>
    <div style="text-align:center"><div class="otp-box">${otp}</div></div>
    <p>This OTP is valid for <span class="highlight">10 minutes</span>. Do not share it with anyone.</p>
    <p>If you did not request this, you can safely ignore this email.</p>
  </div>
  <hr class="divider">
  <div class="footer">Need help? <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></div>
</div></div></body></html>`;

// ── Welcome Template ──────────────────────────────────────────────────────────

const welcomeTemplate = (firstName) => `
<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Welcome to ${APP_NAME}</title>
<style>${baseStyles}</style></head>
<body><div class="wrapper"><div class="container">
  <div class="header"><img src="${LOGO_URL}" alt="${APP_NAME}"></div>
  <div class="body">
    <h2>Welcome to ${APP_NAME}, ${firstName}! 🎉</h2>
    <p>Your account has been created and verified. Start exploring thousands of courses taught by expert instructors.</p>
    <div style="text-align:center"><a class="btn" href="${CLIENT_URL}/courses">Browse Courses</a></div>
  </div>
  <hr class="divider">
  <div class="footer">Questions? <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></div>
</div></div></body></html>`;

// ── Password Reset Template ───────────────────────────────────────────────────

const resetPasswordTemplate = (firstName, resetLink) => `
<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reset your password</title>
<style>${baseStyles}</style></head>
<body><div class="wrapper"><div class="container">
  <div class="header"><img src="${LOGO_URL}" alt="${APP_NAME}"></div>
  <div class="body">
    <h2>Password Reset Request</h2>
    <p>Hi <span class="highlight">${firstName}</span>,</p>
    <p>We received a request to reset your password. Click the button below — this link expires in <span class="highlight">15 minutes</span>.</p>
    <div style="text-align:center"><a class="btn" href="${resetLink}">Reset Password</a></div>
    <p style="margin-top:24px;font-size:14px;color:#999">If the button doesn't work, paste this URL into your browser:<br>
      <a href="${resetLink}" style="color:#666;word-break:break-all">${resetLink}</a></p>
    <p>If you didn't request a password reset, you can safely ignore this email — your password has not changed.</p>
  </div>
  <hr class="divider">
  <div class="footer">Need help? <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></div>
</div></div></body></html>`;

// ── Course Enrollment Template ────────────────────────────────────────────────

const courseEnrollmentEmail = (courseName, firstName) => `
<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Enrollment Confirmed</title>
<style>${baseStyles}</style></head>
<body><div class="wrapper"><div class="container">
  <div class="header"><img src="${LOGO_URL}" alt="${APP_NAME}"></div>
  <div class="body">
    <h2>You're enrolled! 🚀</h2>
    <p>Hi <span class="highlight">${firstName}</span>,</p>
    <p>Congratulations! You have successfully enrolled in:</p>
    <p style="font-size:20px;font-weight:bold;text-align:center;padding:16px;background:#f0f4ff;border-radius:6px">"${courseName}"</p>
    <p>Head to your learning dashboard to start watching lectures right away.</p>
    <div style="text-align:center"><a class="btn" href="${CLIENT_URL}/student/dashboard">Go to Dashboard</a></div>
  </div>
  <hr class="divider">
  <div class="footer">Questions? <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></div>
</div></div></body></html>`;

// ── Payment Success Template ──────────────────────────────────────────────────

const paymentSuccessEmail = (firstName, amount, orderId, paymentId) => `
<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payment Confirmed</title>
<style>${baseStyles}</style></head>
<body><div class="wrapper"><div class="container">
  <div class="header"><img src="${LOGO_URL}" alt="${APP_NAME}"></div>
  <div class="body">
    <h2>Payment Confirmed ✅</h2>
    <p>Hi <span class="highlight">${firstName}</span>,</p>
    <p>We have successfully received your payment. Here are your details:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr style="background:#f9f9f9">
        <td style="padding:10px 14px;font-weight:bold">Amount Paid</td>
        <td style="padding:10px 14px">₹${amount}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-weight:bold">Order ID</td>
        <td style="padding:10px 14px">${orderId}</td>
      </tr>
      <tr style="background:#f9f9f9">
        <td style="padding:10px 14px;font-weight:bold">Payment ID</td>
        <td style="padding:10px 14px">${paymentId}</td>
      </tr>
    </table>
    <p>Your course access has been activated. Happy learning!</p>
    <div style="text-align:center"><a class="btn" href="${CLIENT_URL}/student/dashboard">Start Learning</a></div>
  </div>
  <hr class="divider">
  <div class="footer">Keep this email as your receipt. Questions? <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></div>
</div></div></body></html>`;

// ── Certificate Issued Template ───────────────────────────────────────────────

const certificateIssuedEmail = (firstName, courseName, certificateUrl, uniqueCode) => `
<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Your Certificate is Ready</title>
<style>${baseStyles}</style></head>
<body><div class="wrapper"><div class="container">
  <div class="header"><img src="${LOGO_URL}" alt="${APP_NAME}"></div>
  <div class="body">
    <h2>🎓 Congratulations, ${firstName}!</h2>
    <p>You have successfully completed <span class="highlight">"${courseName}"</span> and earned your certificate.</p>
    <p style="text-align:center;font-size:14px;color:#666">Verification Code: <span class="highlight">${uniqueCode}</span></p>
    <div style="text-align:center"><a class="btn" href="${certificateUrl}">View Certificate</a></div>
    <p style="margin-top:16px;font-size:13px;color:#999;text-align:center">
      Anyone can verify this certificate at: <a href="${CLIENT_URL}/certificates/verify/${uniqueCode}">${CLIENT_URL}/certificates/verify/${uniqueCode}</a>
    </p>
  </div>
  <hr class="divider">
  <div class="footer"><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></div>
</div></div></body></html>`;

// ── New Enrollment Notification (to Instructor) ───────────────────────────────

const newEnrollmentInstructorEmail = (instructorFirstName, studentName, courseName, totalStudents) => `
<!DOCTYPE html><html><head><meta charset="UTF-8"><title>New Enrollment</title>
<style>${baseStyles}</style></head>
<body><div class="wrapper"><div class="container">
  <div class="header"><img src="${LOGO_URL}" alt="${APP_NAME}"></div>
  <div class="body">
    <h2>New Student Enrolled 🎉</h2>
    <p>Hi <span class="highlight">${instructorFirstName}</span>,</p>
    <p><span class="highlight">${studentName}</span> just enrolled in your course <span class="highlight">"${courseName}"</span>.</p>
    <p>Total students in this course: <span class="highlight">${totalStudents}</span></p>
    <div style="text-align:center"><a class="btn" href="${CLIENT_URL}/instructor/dashboard">View Dashboard</a></div>
  </div>
  <hr class="divider">
  <div class="footer"><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></div>
</div></div></body></html>`;

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  otpTemplate,
  welcomeTemplate,
  resetPasswordTemplate,
  courseEnrollmentEmail,
  paymentSuccessEmail,
  certificateIssuedEmail,
  newEnrollmentInstructorEmail,
};oy