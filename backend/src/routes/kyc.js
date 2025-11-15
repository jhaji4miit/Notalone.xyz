const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { KYC, Profile } = require('../database/models');
const kycService = require('../utils/kyc');
const logger = require('../utils/logger');

const router = express.Router();

router.use(authenticate);

// Initiate KYC
router.post('/initiate', async (req, res, next) => {
  try {
    // Check if KYC already exists
    let kyc = await KYC.findOne({ where: { userId: req.user.id } });

    if (kyc && (kyc.status === 'approved' || kyc.status === 'in_progress')) {
      return res.status(400).json({ error: 'KYC process already in progress or approved' });
    }

    // Get user profile
    const profile = await Profile.findOne({ where: { userId: req.user.id } });
    if (!profile || !profile.firstName || !profile.lastName) {
      return res.status(400).json({ error: 'Please complete your profile before initiating KYC' });
    }

    // Prepare user data for KYC
    const userData = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: req.user.email,
      country: profile.country,
      residency: profile.residency,
      dateOfBirth: profile.dateOfBirth,
      phoneNumber: profile.phoneNumber
    };

    // Initiate KYC with provider
    const kycResult = await kycService.initiateKYC(req.user.id, userData);

    // Create or update KYC record
    if (kyc) {
      kyc.status = kycResult.status;
      kyc.providerReference = kycResult.reference;
      kyc.providerData = kycResult;
      kyc.submittedAt = new Date();
      await kyc.save();
    } else {
      kyc = await KYC.create({
        userId: req.user.id,
        status: kycResult.status,
        providerReference: kycResult.reference,
        providerData: kycResult,
        submittedAt: new Date()
      });
    }

    res.json({
      message: 'KYC process initiated',
      kyc: {
        id: kyc.id,
        status: kyc.status,
        providerReference: kyc.providerReference,
        redirectUrl: kycResult.redirectUrl
      }
    });
  } catch (error) {
    logger.error('KYC initiation error:', error);
    next(error);
  }
});

// Get KYC status
router.get('/status', async (req, res, next) => {
  try {
    let kyc = await KYC.findOne({ where: { userId: req.user.id } });

    if (!kyc) {
      return res.json({ status: 'not_started', message: 'KYC process not initiated' });
    }

    // Check status with provider if in progress
    if (kyc.status === 'pending' || kyc.status === 'in_progress') {
      try {
        const statusResult = await kycService.checkKYCStatus(kyc.providerReference);
        
        // Update status if changed
        if (statusResult.status !== kyc.status) {
          kyc.status = statusResult.status;
          if (statusResult.status === 'approved') {
            kyc.approvedAt = new Date();
          } else if (statusResult.status === 'rejected') {
            kyc.rejectedAt = new Date();
            kyc.rejectionReason = statusResult.data?.reason || 'KYC verification failed';
          }
          await kyc.save();
        }
      } catch (error) {
        logger.error('KYC status check error:', error);
        // Continue with stored status if check fails
      }
    }

    res.json({
      status: kyc.status,
      providerReference: kyc.providerReference,
      submittedAt: kyc.submittedAt,
      approvedAt: kyc.approvedAt,
      rejectedAt: kyc.rejectedAt,
      rejectionReason: kyc.rejectionReason
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

