const express = require('express');
const { authenticate } = require('../middleware/auth');
const { Wallet, Transaction } = require('../database/models');
const { Op } = require('sequelize');

const router = express.Router();

router.use(authenticate);

// Get wallet
router.get('/', async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ where: { userId: req.user.id } });

    if (!wallet) {
      // Create wallet if doesn't exist
      wallet = await Wallet.create({
        userId: req.user.id,
        balance: 0,
        currency: process.env.PRIMARY_CURRENCY || 'AED'
      });
    }

    res.json({ wallet });
  } catch (error) {
    next(error);
  }
});

// Get wallet balance
router.get('/balance', async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });

    if (!wallet) {
      return res.json({ balance: 0, currency: process.env.PRIMARY_CURRENCY || 'AED' });
    }

    res.json({
      balance: wallet.balance,
      currency: wallet.currency
    });
  } catch (error) {
    next(error);
  }
});

// Get transaction history
router.get('/transactions', async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    
    if (!wallet) {
      return res.json({ transactions: [] });
    }

    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const type = req.query.type;

    const where = { walletId: wallet.id };
    if (type) {
      where.type = type;
    }

    const transactions = await Transaction.findAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({ transactions });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

