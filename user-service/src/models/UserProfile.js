const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { RISK_APPETITE, LOAN_TYPES } = require('../../../common/enums');

const UserProfile = sequelize.define('UserProfile', {
  profileId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  income: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  expenses: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  riskAppetite: {
    type: DataTypes.ENUM(...Object.values(RISK_APPETITE)),
    allowNull: false,
    defaultValue: RISK_APPETITE.MODERATE
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_profiles',
  timestamps: true
});

module.exports = UserProfile;

