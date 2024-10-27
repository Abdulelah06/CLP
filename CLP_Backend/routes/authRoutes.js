var express = require('express');
var router = express.Router();
var controller = require("../controllers/index")

router.get('/verify/:userId/:uniqueString', controller.auth.verifyEmail);
module.exports = router