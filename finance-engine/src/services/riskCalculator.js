const { RISK_WEIGHTS, RISK_THRESHOLDS, RISK_LEVELS } = require('../../../common/enums');
const { NEWS_CATEGORIES, LOAN_TYPES, RISK_APPETITE } = require('../../../common/enums');

class RiskCalculator {
  calculateRiskScore(news, userProfile) {
    let riskScore = 0;

    // News impact weight (30%)
    const newsImpact = this.calculateNewsImpact(news);
    riskScore += RISK_WEIGHTS.NEWS_IMPACT * newsImpact;

    // Loan exposure weight (25%)
    const loanExposure = this.calculateLoanExposure(userProfile.loans || [], news);
    riskScore += RISK_WEIGHTS.LOAN_EXPOSURE * loanExposure;

    // Expense ratio weight (25%)
    const expenseRatio = this.calculateExpenseRatio(userProfile.income, userProfile.expenses);
    riskScore += RISK_WEIGHTS.EXPENSE_RATIO * expenseRatio;

    // Risk appetite weight (20%)
    const riskAppetiteScore = this.calculateRiskAppetiteScore(userProfile.riskAppetite);
    riskScore += RISK_WEIGHTS.RISK_APPETITE * riskAppetiteScore;

    return Math.min(Math.round(riskScore), 100);
  }

  calculateNewsImpact(news) {
    let impact = 0;

    // Impact level contribution
    switch (news.impactLevel) {
      case 'HIGH':
        impact += 80;
        break;
      case 'MEDIUM':
        impact += 50;
        break;
      case 'LOW':
        impact += 20;
        break;
    }

    // Category-specific multipliers
    if (news.category === NEWS_CATEGORIES.RBI_POLICY) {
      impact *= 1.2;
    } else if (news.category === NEWS_CATEGORIES.INFLATION) {
      impact *= 1.1;
    }

    // Credibility adjustment
    impact *= (news.credibility / 100);

    return Math.min(impact, 100);
  }

  calculateLoanExposure(loans, news) {
    if (!loans || loans.length === 0) {
      return 0;
    }

    let exposureScore = 0;
    const totalLoanAmount = loans.reduce((sum, loan) => sum + parseFloat(loan.principalAmount || 0), 0);

    // Base exposure based on total loan amount
    // Assuming average loan amount of 10L, normalize to 0-100
    exposureScore = Math.min((totalLoanAmount / 1000000) * 20, 40);

    // Floating rate loans are more risky with interest rate news
    if (news.category === NEWS_CATEGORIES.INTEREST_RATE || news.category === NEWS_CATEGORIES.RBI_POLICY) {
      const floatingLoans = loans.filter(loan => loan.isFloatingRate);
      if (floatingLoans.length > 0) {
        const floatingLoanAmount = floatingLoans.reduce((sum, loan) => sum + parseFloat(loan.principalAmount || 0), 0);
        exposureScore += (floatingLoanAmount / totalLoanAmount) * 40;
      }
    }

    // High-value loans (home loans) are more sensitive
    const homeLoans = loans.filter(loan => loan.loanType === LOAN_TYPES.HOME_LOAN);
    if (homeLoans.length > 0) {
      exposureScore += 20;
    }

    return Math.min(exposureScore, 100);
  }

  calculateExpenseRatio(income, expenses) {
    if (!income || income === 0) {
      return 50; // Default moderate risk if no income data
    }

    const ratio = (expenses / income) * 100;

    // Higher expense ratio = higher risk
    if (ratio >= 80) return 100;
    if (ratio >= 60) return 70;
    if (ratio >= 40) return 40;
    if (ratio >= 20) return 20;
    return 10;
  }

  calculateRiskAppetiteScore(riskAppetite) {
    switch (riskAppetite) {
      case RISK_APPETITE.CONSERVATIVE:
        return 30; // Lower risk score for conservative users
      case RISK_APPETITE.MODERATE:
        return 50;
      case RISK_APPETITE.AGGRESSIVE:
        return 70; // Higher risk score for aggressive users
      default:
        return 50;
    }
  }

  getRiskLevel(riskScore) {
    if (riskScore < RISK_THRESHOLDS.LOW) {
      return RISK_LEVELS.LOW;
    } else if (riskScore < RISK_THRESHOLDS.MEDIUM) {
      return RISK_LEVELS.MEDIUM;
    } else {
      return RISK_LEVELS.HIGH;
    }
  }
}

module.exports = new RiskCalculator();

