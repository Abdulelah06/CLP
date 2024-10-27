var express = require('express');
var router = express.Router();
var controller = require("../controllers/index")
var authmiddleware = require("../auth/auth_middleware")
var middleware = require("../middlewares/video")

router.post("/add",controller.modules.addFieldsToModule)
router.post("/addVideo",authmiddleware.authenticate('jwt', { session: false }),middleware.single("video"),controller.modules.addVideosToFields)
router.post("/addName",authmiddleware.authenticate('jwt', { session: false }),controller.modules.updateFieldName)
router.post("/updateField",authmiddleware.authenticate('jwt', { session: false }),controller.modules.updateFieldInModule)
router.post("/addFields",authmiddleware.authenticate('jwt', { session: false }),controller.modules.addVideoAndTextField)
router.delete("/delete/:id",authmiddleware.authenticate('jwt', { session: false }),controller.modules.deleteModule)
router.patch("/updateName/:id",authmiddleware.authenticate('jwt', { session: false }),controller.modules.updateModuleName)
router.get("/get/:id",controller.modules.getModuleById)
module.exports = router