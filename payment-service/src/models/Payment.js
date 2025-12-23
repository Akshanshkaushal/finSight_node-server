const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  paymentId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    index: true
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'INR'
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED'),
    defaultValue: 'PENDING'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gatewayTransactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gatewayResponse: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  webhookReceived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  tableName: 'payments',
  timestamps: true
});

module.exports = Payment;

