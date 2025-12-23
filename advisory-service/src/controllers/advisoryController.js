const advisoryService = require('../services/advisoryService');
const { NotFoundError } = require('../../../common/errors');

class AdvisoryController {
  async getAdvisories(req, res, next) {
    try {
      const userId = req.headers['x-user-id'] || req.params.userId;
      const options = {
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0
      };

      const advisories = await advisoryService.getAdvisories(userId, options);
      
      res.json({
        success: true,
        data: advisories,
        count: advisories.length,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdvisoryById(req, res, next) {
    try {
      const { advisoryId } = req.params;
      const advisory = await advisoryService.getAdvisoryById(advisoryId);
      
      if (!advisory) {
        throw new NotFoundError('Advisory');
      }
      
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

module.exports = new AdvisoryController();

