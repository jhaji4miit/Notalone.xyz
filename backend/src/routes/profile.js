const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { Profile, User } = require('../database/models');

const router = express.Router();

router.use(authenticate);

// Get profile
router.get('/', async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ where: { userId: req.user.id } });

    if (!profile) {
      // Create empty profile if doesn't exist
      profile = await Profile.create({ userId: req.user.id });
    }

    res.json({ profile });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/', [
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('country').optional().isLength({ min: 2, max: 2 }),
  body('residency').optional().isLength({ min: 2, max: 2 }),
  body('phoneNumber').optional().trim(),
  body('dateOfBirth').optional().isISO8601()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let profile = await Profile.findOne({ where: { userId: req.user.id } });

    if (!profile) {
      profile = await Profile.create({ userId: req.user.id });
    }

    const { firstName, lastName, country, residency, phoneNumber, dateOfBirth } = req.body;

    if (firstName !== undefined) profile.firstName = firstName;
    if (lastName !== undefined) profile.lastName = lastName;
    if (country !== undefined) profile.country = country;
    if (residency !== undefined) profile.residency = residency;
    if (phoneNumber !== undefined) profile.phoneNumber = phoneNumber;
    if (dateOfBirth !== undefined) profile.dateOfBirth = dateOfBirth;

    await profile.save();

    res.json({ profile, message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Accept risk disclosure
router.post('/accept-risk-disclosure', async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ where: { userId: req.user.id } });

    if (!profile) {
      profile = await Profile.create({ userId: req.user.id });
    }

    profile.riskDisclosureAccepted = true;
    profile.riskDisclosureAcceptedAt = new Date();
    await profile.save();

    res.json({ message: 'Risk disclosure accepted', profile });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

