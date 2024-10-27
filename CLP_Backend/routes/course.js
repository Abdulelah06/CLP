var express = require('express');
var router = express.Router();
var controller = require("../controllers/index")
var authmiddleware = require("../auth/auth_middleware")

router.post("/create",authmiddleware.authenticate('jwt', { session: false }),controller.course.addCourse)
router.get("/getall",controller.course.getAllCourses)
router.get("/get/:id",controller.course.getOneCourse)
router.get("/getUpdate/:id",controller.course.getUpdate)
router.get("/search",controller.course.getAllCoursesSearch)
router.put("/update/:id",authmiddleware.authenticate('jwt', { session: false }),controller.course.update)
router.delete("/delete/:id",authmiddleware.authenticate('jwt', { session: false }),controller.course.deleteCourse)
module.exports = router