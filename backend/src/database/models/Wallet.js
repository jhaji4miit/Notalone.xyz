const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  balance: {
    type: DataTypes.DECIMAL(20, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'AED',
    allowNull: false
  },
  pspAccountId: {
    type: DataTypes.STRING,
    field: 'psp_account_id'
  },
  pspAccountStatus: {
    type: DataTypes.ENUM('pending', 'active', 'suspended', 'closed'),
    defaultValue: 'pending',
    field: 'psp_account_status'
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
  tableName: 'wallets'
});

module.exports = Wallet;

