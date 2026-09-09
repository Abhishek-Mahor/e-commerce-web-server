const express = require('express');
const router = express.Router();
const Controller = require("../controllers/stylist.controller");
const multer = require("multer");
const upload = multer({storage:multer.memoryStorage()});


// Route to get clothing style suggestions
router.post('/suggest', Controller.suggestOutfit);


module.exports = router;
