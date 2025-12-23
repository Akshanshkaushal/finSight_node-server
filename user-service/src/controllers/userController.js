const userService = require('../services/userService');

class UserController {
  async getProfile(req, res, next) {
    try {
      const userId = req.headers['x-user-id'] || req.params.userId;
      const profile = await userService.getProfile(userId);
      
      res.json({
        success: true,
        data: profile,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }

  async createOrUpdateProfile(req, res, next) {
    try {
      const userId = req.headers['x-user-id'] || req.params.userId;
      const profile = await userService.createOrUpdateProfile(userId, req.body);
      
      res.json({
        success: true,
        data: profile,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }

  async addLoan(req, res, next) {
    try {
      const userId = req.headers['x-user-id'] || req.params.userId;
      const loan = await userService.addLoan(userId, req.body);
      
      res.status(201).json({
        success: true,
        data: loan,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }

  async updateLoan(req, res, next) {
    try {
      const { loanId } = req.params;
      const userId = req.headers['x-user-id'];
      const loan = await userService.updateLoan(loanId, userId, req.body);
      
      res.json({
        success: true,
        data: loan,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteLoan(req, res, next) {
    try {
      const { loanId } = req.params;
      const userId = req.headers['x-user-id'];
      await userService.deleteLoan(loanId, userId);
      
      res.json({
        success: true,
        message: 'Loan deleted successfully',
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

