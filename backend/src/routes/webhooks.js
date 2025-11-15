const express = require('express');
const { Transaction, Wallet, KYC } = require('../database/models');
const pspService = require('../utils/psp');
const kycService = require('../utils/kyc');
const { sequelize } = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

// PSP Webhook handler
router.post('/psp', express.raw({ type: 'application/json' }), async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const signature = req.headers['x-signature'] || req.headers['x-psp-signature'];
    const payload = req.body;

    // Verify webhook signature
    const isValid = await pspService.verifyWebhook(signature, payload);
    if (!isValid) {
      logger.warn('Invalid PSP webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const webhookData = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const { transactionId, status, amount, currency, type } = webhookData;

    // Find transaction
    const dbTransaction = await Transaction.findOne({
      where: { pspReference: transactionId }
    });

    if (!dbTransaction) {
      logger.warn('Transaction not found for webhook:', transactionId);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update transaction status
    dbTransaction.status = status;
    if (status === 'completed') {
      dbTransaction.completedAt = new Date();
      
      // Update wallet balance for deposits
      if (dbTransaction.type === 'deposit') {
        const wallet = await Wallet.findByPk(dbTransaction.walletId);
        if (wallet) {
          wallet.balance = parseFloat(wallet.balance) + parseFloat(amount);
          await wallet.save({ transaction });
        }
      }
    } else if (status === 'failed') {
      dbTransaction.failedAt = new Date();
      dbTransaction.failureReason = webhookData.reason || 'Transaction failed';
      
      // Revert wallet balance for withdrawals
      if (dbTransaction.type === 'withdrawal') {
        const wallet = await Wallet.findByPk(dbTransaction.walletId);
        if (wallet) {
          wallet.balance = parseFloat(wallet.balance) + parseFloat(amount);
          await wallet.save({ transaction });
        }
      }
    }

    await dbTransaction.save({ transaction });
    await transaction.commit();

    res.json({ received: true });
  } catch (error) {
    await transaction.rollback();
    logger.error('PSP webhook error:', error);
    next(error);
  }
});

// KYC Webhook handler
router.post('/kyc', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const signature = req.headers['x-signature'] || req.headers['x-kyc-signature'];
    const payload = req.body;

    // Verify webhook signature
    const isValid = await kycService.verifyWebhook(signature, payload);
    if (!isValid) {
      logger.warn('Invalid KYC webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const webhookData = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const { reference, status } = webhookData;

    // Find KYC record
    const kyc = await KYC.findOne({
      where: { providerReference: reference }
    });

    if (!kyc) {
      logger.warn('KYC record not found for webhook:', reference);
      return res.status(404).json({ error: 'KYC record not found' });
    }

    // Update KYC status
    kyc.status = status;
    if (status === 'approved') {
      kyc.approvedAt = new Date();
    } else if (status === 'rejected') {
      kyc.rejectedAt = new Date();
      kyc.rejectionReason = webhookData.reason || 'KYC verification failed';
    }

    await kyc.save();

    res.json({ received: true });
  } catch (error) {
    logger.error('KYC webhook error:', error);
    next(error);
  }
});

module.exports = router;

