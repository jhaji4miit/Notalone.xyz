const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { Portfolio, Product, Wallet, Transaction } = require('../database/models');
const { sequelize } = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

router.use(authenticate);

// Get portfolio
router.get('/', async (req, res, next) => {
  try {
    const portfolios = await Portfolio.findAll({
      where: {
        userId: req.user.id,
        status: 'active'
      },
      include: [{
        model: Product,
        as: 'product'
      }],
      order: [['purchasedAt', 'DESC']]
    });

    // Calculate total value
    const totalValue = portfolios.reduce((sum, p) => {
      return sum + parseFloat(p.currentValue || p.amount);
    }, 0);

    res.json({
      portfolios,
      summary: {
        totalInvestments: portfolios.length,
        totalValue,
        currency: process.env.PRIMARY_CURRENCY || 'AED'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get portfolio item by ID
router.get('/:id', async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [{
        model: Product,
        as: 'product'
      }]
    });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    res.json({ portfolio });
  } catch (error) {
    next(error);
  }
});

// Invest in product
router.post('/invest', [
  body('productId').isUUID(),
  body('amount').isFloat({ min: 0.01 })
], async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, amount } = req.body;

    // Get product
    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check minimum investment
    if (parseFloat(amount) < parseFloat(product.minInvestment)) {
      return res.status(400).json({ 
        error: `Minimum investment is ${product.minInvestment} ${product.currency}` 
      });
    }

    // Check maximum investment
    if (product.maxInvestment && parseFloat(amount) > parseFloat(product.maxInvestment)) {
      return res.status(400).json({ 
        error: `Maximum investment is ${product.maxInvestment} ${product.currency}` 
      });
    }

    // Get wallet
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Check balance
    if (parseFloat(wallet.balance) < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create portfolio entry
    const portfolio = await Portfolio.create({
      userId: req.user.id,
      productId,
      amount,
      currency: product.currency,
      purchasePrice: amount,
      currentValue: amount,
      purchasedAt: new Date()
    }, { transaction });

    // Deduct from wallet
    wallet.balance = parseFloat(wallet.balance) - parseFloat(amount);
    await wallet.save({ transaction });

    // Create transaction record
    await Transaction.create({
      userId: req.user.id,
      walletId: wallet.id,
      type: 'investment',
      amount,
      currency: product.currency,
      status: 'completed',
      description: `Investment in ${product.name}`,
      completedAt: new Date()
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      message: 'Investment successful',
      portfolio
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Investment error:', error);
    next(error);
  }
});

module.exports = router;

