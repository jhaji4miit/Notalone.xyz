const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { Wallet, Transaction } = require('../database/models');
const pspService = require('../utils/psp');
const { sequelize } = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

router.use(authenticate);

// Initiate deposit
router.post('/deposit', [
  body('amount').isFloat({ min: 0.01 }),
  body('currency').optional().isLength({ min: 3, max: 3 })
], async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, currency = process.env.PRIMARY_CURRENCY || 'AED' } = req.body;

    // Get or create wallet
    let wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user.id,
        balance: 0,
        currency,
        pspAccountStatus: 'pending'
      }, { transaction });
    }

    // Create PSP account if not exists
    if (!wallet.pspAccountId) {
      const profile = await require('../database/models').Profile.findOne({
        where: { userId: req.user.id }
      });

      const accountResult = await pspService.createAccount(req.user.id, {
        email: req.user.email,
        ...(profile && {
          firstName: profile.firstName,
          lastName: profile.lastName
        })
      });

      wallet.pspAccountId = accountResult.accountId;
      wallet.pspAccountStatus = accountResult.status;
      await wallet.save({ transaction });
    }

    // Initiate deposit with PSP
    const depositResult = await pspService.initiateDeposit(
      wallet.pspAccountId,
      amount,
      currency,
      { userId: req.user.id }
    );

    // Create transaction record
    const dbTransaction = await Transaction.create({
      userId: req.user.id,
      walletId: wallet.id,
      type: 'deposit',
      amount,
      currency,
      status: depositResult.status,
      pspReference: depositResult.transactionId,
      pspData: depositResult
    }, { transaction });

    await transaction.commit();

    res.json({
      message: 'Deposit initiated',
      transaction: {
        id: dbTransaction.id,
        amount,
        currency,
        status: dbTransaction.status,
        redirectUrl: depositResult.redirectUrl
      }
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Deposit initiation error:', error);
    next(error);
  }
});

// Initiate withdrawal
router.post('/withdraw', [
  body('amount').isFloat({ min: 0.01 }),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('destination').notEmpty()
], async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, currency = process.env.PRIMARY_CURRENCY || 'AED', destination } = req.body;

    // Get wallet
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Check balance
    if (parseFloat(wallet.balance) < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Initiate withdrawal with PSP
    const withdrawalResult = await pspService.initiateWithdrawal(
      wallet.pspAccountId,
      amount,
      currency,
      destination,
      { userId: req.user.id }
    );

    // Create transaction record
    const dbTransaction = await Transaction.create({
      userId: req.user.id,
      walletId: wallet.id,
      type: 'withdrawal',
      amount,
      currency,
      status: withdrawalResult.status,
      pspReference: withdrawalResult.transactionId,
      pspData: withdrawalResult
    }, { transaction });

    // Update balance (will be confirmed via webhook)
    wallet.balance = parseFloat(wallet.balance) - parseFloat(amount);
    await wallet.save({ transaction });

    await transaction.commit();

    res.json({
      message: 'Withdrawal initiated',
      transaction: {
        id: dbTransaction.id,
        amount,
        currency,
        status: dbTransaction.status
      }
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Withdrawal initiation error:', error);
    next(error);
  }
});

// Check transaction status
router.get('/transaction/:id', async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Poll PSP for status if pending/processing
    if (transaction.status === 'pending' || transaction.status === 'processing') {
      try {
        const statusResult = await pspService.checkTransactionStatus(transaction.pspReference);
        
        if (statusResult.status !== transaction.status) {
          transaction.status = statusResult.status;
          if (statusResult.status === 'completed') {
            transaction.completedAt = new Date();
          } else if (statusResult.status === 'failed') {
            transaction.failedAt = new Date();
            transaction.failureReason = statusResult.data?.reason || 'Transaction failed';
          }
          await transaction.save();
        }
      } catch (error) {
        logger.error('Transaction status check error:', error);
      }
    }

    res.json({ transaction });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

