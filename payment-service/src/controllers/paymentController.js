const paymentService = require('../services/paymentService');
const { ValidationError } = require('../../../common/errors');

class PaymentController {
  async createPayment(req, res, next) {
    try {
      const userId = req.headers['x-user-id'] || req.body.userId;
      const { amount, paymentMethod } = req.body;

      if (!amount || amount <= 0) {
        throw new ValidationError('Valid amount is required');
      }

      if (!paymentMethod) {
        throw new ValidationError('Payment method is required');
      }

      const payment = await paymentService.createPayment(userId, amount, paymentMethod);
      
      res.status(201).json({
        success: true,
        data: payment,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayment(req, res, next) {
    try {
      const { paymentId } = req.params;
      const payment = await paymentService.getPayment(paymentId);
      
      res.json({
        success: true,
        data: payment,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayments(req, res, next) {
    try {
      const userId = req.headers['x-user-id'] || req.params.userId;
      const payments = await paymentService.getPaymentsByUserId(userId);
      
      res.json({
        success: true,
        data: payments,
        count: payments.length,
        correlationId: req.correlationId
      });
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req, res, next) {
    try {
      const signature = req.headers['stripe-signature'];
      const rawBody = req.body;
      const payment = await paymentService.handleWebhook(rawBody, signature);
      res.json({ success: true, data: payment, correlationId: req.correlationId });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();

