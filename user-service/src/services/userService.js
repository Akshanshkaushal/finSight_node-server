const userRepository = require('../repositories/userRepository');
const { ValidationError } = require('../../../common/errors');
const { RISK_APPETITE, LOAN_TYPES } = require('../../../common/enums');

class UserService {
  async getProfile(userId) {
    return await userRepository.getProfile(userId);
  }

  async createOrUpdateProfile(userId, profileData) {
    // Validate risk appetite
    if (profileData.riskAppetite && !Object.values(RISK_APPETITE).includes(profileData.riskAppetite)) {
      throw new ValidationError('Invalid risk appetite');
    }

    // Validate income and expenses
    if (profileData.income !== undefined && profileData.income < 0) {
      throw new ValidationError('Income cannot be negative');
    }

    if (profileData.expenses !== undefined && profileData.expenses < 0) {
      throw new ValidationError('Expenses cannot be negative');
    }

    return await userRepository.createOrUpdateProfile(userId, profileData);
  }

  async addLoan(userId, loanData) {
    // Validate loan type
    if (!Object.values(LOAN_TYPES).includes(loanData.loanType)) {
      throw new ValidationError('Invalid loan type');
    }

    // Calculate EMI if not provided
    if (!loanData.emi && loanData.principalAmount && loanData.interestRate && loanData.tenureMonths) {
      loanData.emi = this.calculateEMI(
        loanData.principalAmount,
        loanData.interestRate,
        loanData.tenureMonths
      );
    }

    return await userRepository.addLoan(userId, loanData);
  }

  async updateLoan(loanId, userId, loanData) {
    // Recalculate EMI if relevant fields changed
    if (loanData.principalAmount || loanData.interestRate || loanData.tenureMonths) {
      const existingLoan = await userRepository.getProfile(userId);
      const loan = existingLoan.loans.find(l => l.loanId === loanId);
      if (loan) {
        const principal = loanData.principalAmount || loan.principalAmount;
        const rate = loanData.interestRate || loan.interestRate;
        const tenure = loanData.tenureMonths || loan.tenureMonths;
        loanData.emi = this.calculateEMI(principal, rate, tenure);
      }
    }

    return await userRepository.updateLoan(loanId, userId, loanData);
  }

  async deleteLoan(loanId, userId) {
    return await userRepository.deleteLoan(loanId, userId);
  }

  calculateEMI(principal, annualRate, tenureMonths) {
    const monthlyRate = annualRate / 12 / 100;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi * 100) / 100;
  }
}

module.exports = new UserService();

