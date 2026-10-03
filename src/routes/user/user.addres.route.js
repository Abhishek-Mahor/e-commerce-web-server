const express = require("express");
const Controller = require("../../controllers/user/user.address.controller");
const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();


router.post('/addAddress', authMiddleware, Controller.addAddress);
router.get('/', authMiddleware, Controller.getAddress);

module.exports = router;