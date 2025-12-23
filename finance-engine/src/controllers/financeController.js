const financeEngineService = require('../services/financeEngineService');
const { ValidationError } = require('../../../common/errors');

class FinanceController {
  async generateAdvisory(req, res, next) {
    try {
      const userId = req.headers['x-user-id'] || req.body.userId;
      const newsId = req.body.newsId;

      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      if (!newsId) {
        throw new ValidationError('News ID is required');
      }

      // Fetch news (would typically come from news service)
      const newsEvent = req.body.news || { newsId, impactLevel: 'MEDIUM', category: 'OTHER', credibility: 80 };

      const advisory = await financeEngineService.generateAdvisoryForUser(userId, newsEvent);

      res.json({
        success: true,
        data: advisory,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FinanceController();

