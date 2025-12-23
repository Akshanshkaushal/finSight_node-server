const express = require('express');
const financeController = require('../controllers/financeController');

const router = express.Router();

router.post('/advisories/generate', financeController.generateAdvisory.bind(financeController));

module.exports = router;

