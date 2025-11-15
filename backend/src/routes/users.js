const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all users (Admin only)
router.get('/', requireRole('admin'), async (req, res, next) => {
  try {
    const { User } = require('../database/models');
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      limit: req.query.limit || 50,
      offset: req.query.offset || 0
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { User } = require('../database/models');
    
    // Users can only view their own profile unless admin
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

