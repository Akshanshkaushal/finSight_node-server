const Stripe = require('stripe');
const config = require('../config');
const { createLogger } = require('../../../common/utils/logger');

const logger = createLogger('payment-gateway');
const stripe = new Stripe(config.stripe.secretKey);

class PaymentGateway {
  async createCheckoutSession({ paymentId, userId, amount }) {
    if (!stripe) {
      throw new Error('Stripe not configured (missing STRIPE_SECRET)');
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'FinSight Subscription'
            },
            unit_amount: Math.round(parseFloat(amount) * 100)
          },
          quantity: 1
        }
      ],
      metadata: { paymentId, userId },
      success_url: config.stripe.successUrl,
      cancel_url: config.stripe.cancelUrl
    });
    return { sessionUrl: session.url, sessionId: session.id };
  }

  verifyWebhook(rawBody, signature) {
    if (!stripe || !config.stripe.webhookSecret) {
      throw new Error('Stripe webhook not configured');
    }
    return stripe.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);
  }
}

module.exports = new PaymentGateway();

