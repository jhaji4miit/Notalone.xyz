const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { User } = require('../database/models');
const { sendOTP, sendMagicLink, sendPasswordReset } = require('../utils/email');
const { setOTP, getOTP, deleteOTP, setToken, getToken, deleteToken } = require('../utils/redis');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Sign up
router.post('/signup', [
  body('email').isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 8 }),
  body('role').optional().isIn(['end_user', 'admin'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role = 'end_user' } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      email,
      password: password || null, // Allow null for magic link signup
      role
    });

    // Generate OTP for email verification
    const otp = generateOTP();
    await setOTP(email, otp);

    // Send OTP email
    await sendOTP(email, otp);

    res.status(201).json({
      message: 'User created successfully. Please verify your email with the OTP sent.',
      userId: user.id
    });
  } catch (error) {
    next(error);
  }
});

// Verify email with OTP
router.post('/verify-email', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    const storedOTP = await getOTP(email);
    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();

    await deleteOTP(email);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
});

// Login with password
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    next(error);
  }
});

// Request magic link
router.post('/magic-link', [
  body('email').isEmail().normalizeEmail()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    let user = await User.findOne({ where: { email } });
    if (!user) {
      // Create user if doesn't exist
      user = await User.create({ email, password: null });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    const token = uuidv4();
    await setToken(`magic:${email}`, token, 900); // 15 minutes

    await sendMagicLink(email, token);

    res.json({ message: 'Magic link sent to your email' });
  } catch (error) {
    next(error);
  }
});

// Verify magic link
router.get('/verify-magic-link', async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    // Find user by token (in production, store email with token)
    // For simplicity, we'll need to pass email or store token->email mapping
    // This is a simplified version
    res.status(400).json({ error: 'Please use POST /auth/verify-magic-link with email and token' });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-magic-link', [
  body('email').isEmail().normalizeEmail(),
  body('token').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, token } = req.body;

    const storedToken = await getToken(`magic:${email}`);
    if (!storedToken || storedToken !== token) {
      return res.status(400).json({ error: 'Invalid or expired magic link' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.lastLoginAt = new Date();
    await user.save();

    await deleteToken(`magic:${email}`);

    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    next(error);
  }
});

// Request password reset
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If the email exists, a password reset link has been sent' });
    }

    const token = uuidv4();
    await setToken(`reset:${email}`, token, 3600); // 1 hour

    await sendPasswordReset(email, token);

    res.json({ message: 'If the email exists, a password reset link has been sent' });
  } catch (error) {
    next(error);
  }
});

// Reset password
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail(),
  body('token').notEmpty(),
  body('password').isLength({ min: 8 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, token, password } = req.body;

    const storedToken = await getToken(`reset:${email}`);
    if (!storedToken || storedToken !== token) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = password;
    await user.save();

    await deleteToken(`reset:${email}`);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

