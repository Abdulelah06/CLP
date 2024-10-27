const express = require("express")
const controllers = require("../controllers")
const router = express.Router()
const authmiddleware = require("../auth/auth_middleware")
router.post("/add",authmiddleware.authenticate('jwt', { session: false }),controllers.comment.addComments)
router.post("/addReply",authmiddleware.authenticate('jwt', { session: false }),controllers.comment.addReplies)
module.exports = router