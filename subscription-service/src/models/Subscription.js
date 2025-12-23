const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { SUBSCRIPTION_PLANS, SUBSCRIPTION_STATUS } = require('../../../common/enums');

const Subscription = sequelize.define('Subscription', {
  subscriptionId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    index: true
  },
  plan: {
    type: DataTypes.ENUM(...Object.values(SUBSCRIPTION_PLANS)),
    allowNull: false,
    defaultValue: SUBSCRIPTION_PLANS.FREE
  },
  status: {
    type: DataTypes.ENUM(...Object.values(SUBSCRIPTION_STATUS)),
    allowNull: false,
    defaultValue: SUBSCRIPTION_STATUS.ACTIVE
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  paymentId: {
    type: DataTypes.UUID,
    allowNull: true
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
  tableName: 'subscriptions',
  timestamps: true
});

module.exports = Subscription;

