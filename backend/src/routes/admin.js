const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { User, Profile, KYC, Wallet, Transaction, Product, Portfolio } = require('../database/models');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

// Dashboard stats
router.get('/dashboard', async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const kycApproved = await KYC.count({ where: { status: 'approved' } });
    const totalProducts = await Product.count({ where: { isActive: true } });
    const totalPortfolios = await Portfolio.count({ where: { status: 'active' } });

    // Calculate total wallet balance
    const wallets = await Wallet.findAll();
    const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0);

    // Recent transactions
    const recentTransactions = await Transaction.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email']
      }]
    });

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        kycApproved,
        totalProducts,
        totalPortfolios,
        totalBalance
      },
      recentTransactions
    });
  } catch (error) {
    next(error);
  }
});

// Get all KYC records
router.get('/kyc', async (req, res, next) => {
  try {
    const status = req.query.status;
    const where = status ? { status } : {};

    const kycRecords = await KYC.findAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email'],
        include: [{
          model: Profile,
          as: 'profile'
        }]
      }],
      order: [['createdAt', 'DESC']],
      limit: req.query.limit || 50,
      offset: req.query.offset || 0
    });

    res.json({ kycRecords });
  } catch (error) {
    next(error);
  }
});

// Update KYC status (manual override)
router.put('/kyc/:id', async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    const kyc = await KYC.findByPk(req.params.id);
    if (!kyc) {
      return res.status(404).json({ error: 'KYC record not found' });
    }

    kyc.status = status;
    if (status === 'approved') {
      kyc.approvedAt = new Date();
    } else if (status === 'rejected') {
      kyc.rejectedAt = new Date();
      kyc.rejectionReason = rejectionReason;
    }

    await kyc.save();

    res.json({ kyc, message: 'KYC status updated' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

