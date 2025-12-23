const { NEWS_CATEGORIES, LOAN_TYPES, RISK_LEVELS } = require('../../../common/enums');

class AdviceGenerator {
  generateAdvice(news, userProfile, riskScore, riskLevel) {
    const adviceParts = [];

    // News-specific advice
    if (news.category === NEWS_CATEGORIES.RBI_POLICY) {
      const floatingLoans = (userProfile.loans || []).filter(loan => loan.isFloatingRate);
      if (floatingLoans.length > 0) {
        adviceParts.push(
          `RBI policy changes detected. You have ${floatingLoans.length} floating rate loan(s). ` +
          `Your EMI may increase. Consider reviewing your loan terms or prepaying if possible.`
        );
      } else {
        adviceParts.push(
          `RBI policy announcement detected. Monitor your fixed-rate loans and savings accounts ` +
          `for potential impact on interest rates.`
        );
      }
    }

    if (news.category === NEWS_CATEGORIES.INFLATION) {
      const expenseRatio = userProfile.expenses / userProfile.income;
      if (expenseRatio > 0.6) {
        adviceParts.push(
          `Inflation concerns detected. Your expense-to-income ratio is ${(expenseRatio * 100).toFixed(1)}%. ` +
          `Consider optimizing expenses and building an emergency fund to hedge against inflation.`
        );
      } else {
        adviceParts.push(
          `Inflation trends detected. Review your savings and investment strategy to ensure ` +
          `your returns outpace inflation.`
        );
      }
    }

    if (news.category === NEWS_CATEGORIES.INTEREST_RATE) {
      adviceParts.push(
        `Interest rate changes detected. Review your loan EMIs and savings account rates. ` +
        `Consider refinancing if rates have decreased significantly.`
      );
    }

    // Risk-based advice
    if (riskLevel === RISK_LEVELS.HIGH) {
      adviceParts.push(
        `Your current financial risk level is HIGH. Consider: ` +
        `1) Reducing discretionary expenses, ` +
        `2) Building emergency fund (6 months expenses), ` +
        `3) Reviewing loan terms and considering prepayment options.`
      );
    } else if (riskLevel === RISK_LEVELS.MEDIUM) {
      adviceParts.push(
        `Your financial risk level is MODERATE. Stay vigilant about: ` +
        `1) Monitoring expense patterns, ` +
        `2) Maintaining adequate savings, ` +
        `3) Reviewing financial goals regularly.`
      );
    } else {
      adviceParts.push(
        `Your financial risk level is LOW. Continue maintaining good financial discipline ` +
        `and consider optimizing your savings and investments.`
      );
    }

    // Loan-specific advice
    const totalLoanEMI = (userProfile.loans || []).reduce((sum, loan) => sum + parseFloat(loan.emi || 0), 0);
    const emiToIncomeRatio = totalLoanEMI / userProfile.income;
    if (emiToIncomeRatio > 0.4) {
      adviceParts.push(
        `Your total EMI to income ratio is ${(emiToIncomeRatio * 100).toFixed(1)}%, which is high. ` +
        `Consider debt consolidation or prepayment strategies.`
      );
    }

    return adviceParts.join(' ');
  }
}

module.exports = new AdviceGenerator();

