const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const controller = require('../controllers/cart.controller');

router.get('/', authMiddleware, controller.getCart);
router.post('/', authMiddleware, controller.addToCart);
router.put('/update', authMiddleware, controller.updateCartItemQuantity);
router.delete('/:productId', authMiddleware, controller.removeCartItem);

module.exports = router;
