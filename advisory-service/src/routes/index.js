const express = require('express');
const advisoryController = require('../controllers/advisoryController');

const router = express.Router();

router.get('/:userId', advisoryController.getAdvisories.bind(advisoryController));
router.get('/detail/:advisoryId', advisoryController.getAdvisoryById.bind(advisoryController));

module.exports = router;

