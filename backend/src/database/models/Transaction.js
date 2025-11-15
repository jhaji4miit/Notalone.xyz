const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const Transaction = sequelize.define('Transaction', {
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
  walletId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'wallet_id',
    references: {
      model: 'wallets',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('deposit', 'withdrawal', 'investment', 'dividend', 'refund'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false
  },
  pspReference: {
    type: DataTypes.STRING,
    field: 'psp_reference'
  },
  pspData: {
    type: DataTypes.JSONB,
    field: 'psp_data'
  },
  description: {
    type: DataTypes.TEXT
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at'
  },
  failedAt: {
    type: DataTypes.DATE,
    field: 'failed_at'
  },
  failureReason: {
    type: DataTypes.TEXT,
    field: 'failure_reason'
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
  tableName: 'transactions'
});

module.exports = Transaction;

