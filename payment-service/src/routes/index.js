const express = require('express');
const bodyParser = require('body-parser');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/', paymentController.createPayment.bind(paymentController));
router.get('/:paymentId', paymentController.getPayment.bind(paymentController));
router.get('/user/:userId', paymentController.getPayments.bind(paymentController));
// Stripe webhook needs raw body
router.post('/webhook/stripe', bodyParser.raw({ type: 'application/json' }), paymentController.handleWebhook.bind(paymentController));

module.exports = router;

