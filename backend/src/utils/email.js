const nodemailer = require('nodemailer');
const logger = require('./logger');

// In production, use a real email service (SendGrid, AWS SES, etc.)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// For development, use ethereal.email or console logging
if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
  logger.warn('Email service not configured. Using console logging for emails.');
}

const sendEmail = async (to, subject, html, text) => {
  try {
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
      logger.info('Email would be sent:', { to, subject, text });
      return { success: true, messageId: 'dev-mode' };
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@investmentplatform.com',
      to,
      subject,
      text,
      html
    });

    logger.info('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};

const sendOTP = async (email, otp) => {
  const subject = 'Your OTP Code';
  const text = `Your OTP code is: ${otp}. This code will expire in 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your OTP Code</h2>
      <p>Your one-time password is:</p>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    </div>
  `;

  return sendEmail(email, subject, html, text);
};

const sendMagicLink = async (email, token) => {
  const url = `${process.env.APP_URL}/auth/verify?token=${token}`;
  const subject = 'Your Magic Link';
  const text = `Click this link to login: ${url}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your Magic Link</h2>
      <p>Click the button below to login to your account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Login
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${url}</p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request this link, please ignore this email.</p>
    </div>
  `;

  return sendEmail(email, subject, html, text);
};

const sendPasswordReset = async (email, token) => {
  const url = `${process.env.APP_URL}/auth/reset-password?token=${token}`;
  const subject = 'Reset Your Password';
  const text = `Click this link to reset your password: ${url}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${url}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    </div>
  `;

  return sendEmail(email, subject, html, text);
};

module.exports = {
  sendEmail,
  sendOTP,
  sendMagicLink,
  sendPasswordReset
};

