var express = require('express');
var router = express.Router();
var controller = require("../controllers/index")
var authmiddleware = require("../auth/auth_middleware")

router.post("/add",authmiddleware.authenticate('jwt', { session: false }),controller.category.addCategory)
router.get("/getall",controller.category.getAllCategories)
module.exports = router