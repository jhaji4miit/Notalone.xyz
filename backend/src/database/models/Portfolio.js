const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const Portfolio = sequelize.define('Portfolio', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'product_id',
    references: {
      model: 'products',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(20, 2),
    field: 'purchase_price',
    allowNull: false
  },
  currentValue: {
    type: DataTypes.DECIMAL(20, 2),
    field: 'current_value'
  },
  status: {
    type: DataTypes.ENUM('active', 'sold', 'matured', 'cancelled'),
    defaultValue: 'active',
    allowNull: false
  },
  purchasedAt: {
    type: DataTypes.DATE,
    field: 'purchased_at',
    allowNull: false
  },
  soldAt: {
    type: DataTypes.DATE,
    field: 'sold_at'
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
  tableName: 'portfolios'
});

module.exports = Portfolio;

