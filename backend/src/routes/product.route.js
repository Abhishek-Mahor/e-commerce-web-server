const express = require('express');
const router = express.Router();

const Controller = require("../controllers/product.controller");





// Get all products
router.get('/', Controller.getAllProducts);

// Get product by ID
router.get('/:id', Controller.getProductById);

module.exports = router;
