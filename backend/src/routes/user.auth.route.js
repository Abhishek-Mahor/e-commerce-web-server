const express = require("express");
const Controller = require("../controllers/user.auth.controller");

const router = express.Router();

router.post('/signup', Controller.signup);
router.post('/signin', Controller.signin);
router.post('/logout', Controller.logout);

module.exports = router;

