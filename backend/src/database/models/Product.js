const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  minInvestment: {
    type: DataTypes.DECIMAL(20, 2),
    field: 'min_investment',
    allowNull: false
  },
  maxInvestment: {
    type: DataTypes.DECIMAL(20, 2),
    field: 'max_investment'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'AED',
    allowNull: false
  },
  expectedReturn: {
    type: DataTypes.DECIMAL(5, 2),
    field: 'expected_return'
  },
  riskLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    field: 'risk_level',
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  metadata: {
    type: DataTypes.JSONB
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  tableName: 'products'
});

module.exports = Product;

