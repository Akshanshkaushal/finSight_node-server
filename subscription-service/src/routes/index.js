const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

router.get('/:userId', subscriptionController.getSubscription.bind(subscriptionController));
router.post('/:userId/upgrade', subscriptionController.upgradeSubscription.bind(subscriptionController));
router.post('/:userId/cancel', subscriptionController.cancelSubscription.bind(subscriptionController));
router.get('/active/premium', subscriptionController.getActivePremiumUsers.bind(subscriptionController));

module.exports = router;

