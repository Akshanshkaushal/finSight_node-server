const authService = require('../services/authService');
const { ValidationError } = require('../../../common/errors');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await authService.register(email, password);
      
      res.status(201).json({
        success: true,
        data: user,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      res.json({
        success: true,
        data: result,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }

      const result = await authService.refreshAccessToken(refreshToken);
      
      res.json({
        success: true,
        data: result,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const userId = req.user?.userId;
      if (userId) {
        await authService.logout(userId);
      }
      
      res.json({
        success: true,
        message: 'Logged out successfully',
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

