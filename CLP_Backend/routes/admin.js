var express = require('express');
var router = express.Router();
var controller = require("../controllers/index")
var authmiddleware = require("../auth/auth_middleware")

router.post("/add",controller.admin.addAdmin)

module.exports = router