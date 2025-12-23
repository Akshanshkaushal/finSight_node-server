const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { RISK_LEVELS } = require('../../../common/enums');

const Advisory = sequelize.define('Advisory', {
  advisoryId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    index: true
  },
  riskScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  riskLevel: {
    type: DataTypes.ENUM(...Object.values(RISK_LEVELS)),
    allowNull: false
  },
  advice: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  newsIds: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'advisories',
  timestamps: true,
  updatedAt: false
});

module.exports = Advisory;

