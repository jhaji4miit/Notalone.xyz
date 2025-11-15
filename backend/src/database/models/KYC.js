const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const KYC = sequelize.define('KYC', {
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
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'approved', 'rejected', 'expired'),
    defaultValue: 'pending',
    allowNull: false
  },
  providerReference: {
    type: DataTypes.STRING,
    field: 'provider_reference'
  },
  providerData: {
    type: DataTypes.JSONB,
    field: 'provider_data'
  },
  submittedAt: {
    type: DataTypes.DATE,
    field: 'submitted_at'
  },
  approvedAt: {
    type: DataTypes.DATE,
    field: 'approved_at'
  },
  rejectedAt: {
    type: DataTypes.DATE,
    field: 'rejected_at'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    field: 'rejection_reason'
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
  tableName: 'kyc_records'
});

module.exports = KYC;

