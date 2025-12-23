const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } = require('../../../common/enums');

const Notification = sequelize.define('Notification', {
  notificationId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    index: true
  },
  advisoryId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  notificationType: {
    type: DataTypes.ENUM(...Object.values(NOTIFICATION_TYPES)),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM(...Object.values(NOTIFICATION_PRIORITY)),
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'SENT', 'FAILED'),
    defaultValue: 'PENDING'
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'notifications',
  timestamps: true
});

module.exports = Notification;

