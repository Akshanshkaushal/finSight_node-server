const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { LOAN_TYPES } = require('../../../common/enums');

const Loan = sequelize.define('Loan', {
  loanId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  loanType: {
    type: DataTypes.ENUM(...Object.values(LOAN_TYPES)),
    allowNull: false
  },
  principalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  interestRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  tenureMonths: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  isFloatingRate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emi: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
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
  tableName: 'loans',
  timestamps: true
});

module.exports = Loan;

