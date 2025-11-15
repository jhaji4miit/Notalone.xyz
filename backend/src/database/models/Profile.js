const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const Profile = sequelize.define('Profile', {
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
  firstName: {
    type: DataTypes.STRING,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING,
    field: 'last_name'
  },
  country: {
    type: DataTypes.STRING(2), // ISO country code
    allowNull: false
  },
  residency: {
    type: DataTypes.STRING(2), // ISO country code
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    field: 'phone_number'
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    field: 'date_of_birth'
  },
  riskDisclosureAccepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'risk_disclosure_accepted'
  },
  riskDisclosureAcceptedAt: {
    type: DataTypes.DATE,
    field: 'risk_disclosure_accepted_at'
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
  tableName: 'profiles'
});

module.exports = Profile;

