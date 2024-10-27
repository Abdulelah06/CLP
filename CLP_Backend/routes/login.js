var express = require('express');
var router = express.Router();
var controller = require("../controllers/index")

router.post("/",controller.login.login)

module.exports = router