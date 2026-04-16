/**
 * Email Utility Module (Nodemailer)
 * -----------------------------------
 * Configures a reusable Nodemailer transporter using Gmail SMTP.
 * Exports a single `sendEmail` function usable across all controllers.
 *
 * Environment variables required in backend/.env:
 *   EMAIL_USER — Gmail address (e.g. you@gmail.com)
 *   EMAIL_PASS — Gmail App Password (NOT your account password)
 *
 * Note: For Gmail, you must enable "App Passwords" in Google Account
 *       security settings (requires 2-Step Verification to be enabled).
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// ─── Create reusable SMTP transporter using Gmail ──────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration on startup (non-blocking)
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email transporter verification failed:', error.message);
  } else {
    console.log('✅ Email transporter ready — Gmail SMTP connected');
  }
});

/**
 * Sends an email using the configured transporter.
 * @param {Object} options
 * @param {string} options.to      - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html    - HTML content of the email
 * @returns {Promise<Object>}      - Nodemailer send result
 * @throws Will throw if email sending fails
 */
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Amazon 247" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  // Send email and return the info object
  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent to ${to} — Message ID: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;
