const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/:userId', userController.getProfile.bind(userController));
router.put('/:userId', userController.createOrUpdateProfile.bind(userController));
router.post('/:userId/loans', userController.addLoan.bind(userController));
router.put('/loans/:loanId', userController.updateLoan.bind(userController));
router.delete('/loans/:loanId', userController.deleteLoan.bind(userController));

module.exports = router;

