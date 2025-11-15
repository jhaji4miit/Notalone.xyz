const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, requireRole } = require('../middleware/auth');
const { Product } = require('../database/models');
const { Op } = require('sequelize');

const router = express.Router();

// Public routes - product discovery
router.get('/', async (req, res, next) => {
  try {
    const { category, riskLevel, minAmount, maxAmount, search } = req.query;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const where = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (riskLevel) {
      where.riskLevel = riskLevel;
    }

    if (minAmount) {
      where.minInvestment = { [Op.gte]: parseFloat(minAmount) };
    }

    if (maxAmount) {
      where.maxInvestment = { [Op.lte]: parseFloat(maxAmount) };
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const products = await Product.findAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({ products });
  } catch (error) {
    next(error);
  }
});

// Get product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
});

// Admin routes - require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

// Create product
router.post('/', [
  body('name').notEmpty(),
  body('category').notEmpty(),
  body('minInvestment').isFloat({ min: 0 }),
  body('riskLevel').isIn(['low', 'medium', 'high'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.create(req.body);

    res.status(201).json({ product, message: 'Product created successfully' });
  } catch (error) {
    next(error);
  }
});

// Update product
router.put('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.update(req.body);

    res.json({ product, message: 'Product updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete product (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.isActive = false;
    await product.save();

    res.json({ message: 'Product deactivated successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

