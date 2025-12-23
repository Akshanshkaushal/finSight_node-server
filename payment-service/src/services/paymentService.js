const Payment = require('../models/Payment');
const paymentGateway = require('./paymentGateway');
const axios = require('axios');
const config = require('../config');
const { NotFoundError, ValidationError } = require('../../../common/errors');

class PaymentService {
  async createPayment(userId, amount, paymentMethod) {
    const payment = await Payment.create({
      userId,
      amount,
      paymentMethod,
      status: 'PENDING'
    });

    // Create Stripe Checkout session
    const session = await paymentGateway.createCheckoutSession({
      paymentId: payment.paymentId,
      userId,
      amount
    });

    await payment.update({
      status: 'PROCESSING',
      gatewayTransactionId: session.sessionId,
      gatewayResponse: { sessionUrl: session.sessionUrl }
    });

    return { ...payment.toJSON(), sessionUrl: session.sessionUrl };
  }

  async handleWebhook(rawBody, signature) {
    try {
      const event = paymentGateway.verifyWebhook(rawBody, signature);
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const paymentId = session.metadata?.paymentId;
        const payment = await Payment.findOne({ where: { paymentId } });
        if (!payment) throw new NotFoundError('Payment');

        await payment.update({
          status: 'SUCCESS',
          webhookReceived: true,
          gatewayTransactionId: session.id,
          gatewayResponse: session
        });
        await this.notifySubscriptionUpgrade(payment.userId, payment.paymentId);
        return payment.toJSON();
      }
      if (event.type === 'checkout.session.async_payment_failed') {
        const session = event.data.object;
        const paymentId = session.metadata?.paymentId;
        const payment = await Payment.findOne({ where: { paymentId } });
        if (!payment) throw new NotFoundError('Payment');
        await payment.update({
          status: 'FAILED',
          webhookReceived: true,
          failureReason: 'Payment failed',
          gatewayTransactionId: session.id,
          gatewayResponse: session
        });
        return payment.toJSON();
      }
      return { received: true, event: event.type };
    } catch (error) {
      throw new ValidationError(error.message);
    }
  }

  async notifySubscriptionUpgrade(userId, paymentId) {
    try {
      await axios.post(
        `${config.subscriptionServiceUrl}/subscriptions/${userId}/upgrade`,
        { paymentId },
        { timeout: 5000 }
      );
    } catch (error) {
      console.error('Error notifying subscription service:', error);
      // In production, implement retry logic or event queue
    }
  }

  async getPayment(paymentId) {
    const payment = await Payment.findOne({ where: { paymentId } });
    if (!payment) {
      throw new NotFoundError('Payment');
    }
    return payment.toJSON();
  }

  async getPaymentsByUserId(userId) {
    const payments = await Payment.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    return payments.map(p => p.toJSON());
  }
}

module.exports = new PaymentService();

