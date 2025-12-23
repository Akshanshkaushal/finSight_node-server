const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get('/:userId', notificationController.getNotifications.bind(notificationController));
router.get('/detail/:notificationId', notificationController.getNotificationById.bind(notificationController));

module.exports = router;

