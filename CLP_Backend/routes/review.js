var express = require('express');
var router = express.Router();
var controller = require("../controllers/index")
var authmiddleware = require("../auth/auth_middleware")

router.post("/create",authmiddleware.authenticate('jwt', { session: false }),controller.reviews.addReview)


module.exports = router