const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const controller = require('../controllers/order.controller');

router.post('/', authMiddleware, controller.placeOrder);
router.post('/razorpay', authMiddleware, controller.createRazorpayOrder);
router.post('/verify', authMiddleware, controller.verifyRazorpayPayment);
router.get('/', authMiddleware, controller.getUserOrders);
router.get('/:id', authMiddleware, controller.getOrderById);

module.exports = router;
