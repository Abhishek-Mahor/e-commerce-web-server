const express = require('express');
const router = express.Router();
const Controller = require("../../controllers/product.controller");


router.get('/', Controller.getAllProducts);
router.get('/:id', Controller.getProductById);

module.exports = router;
