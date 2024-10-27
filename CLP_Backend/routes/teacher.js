var express = require('express');
var router = express.Router();
var controller = require("../controllers/index")
var authmiddleware = require("../auth/auth_middleware")

router.post("/register",controller.teacher.addTeacher)
router.get("/courses",authmiddleware.authenticate('jwt', { session: false }),controller.teacher.getCoursesByTeacher)
router.get("/getCourses",authmiddleware.authenticate('jwt', { session: false }),controller.teacher.getCoursesByTeacherAdmin)
router.get("/profiles",authmiddleware.authenticate('jwt', { session: false }),controller.teacher.getAllTeachers)
router.get("/search",controller.teacher.getAllTeachersSearch)
router.delete("/delete/:id",authmiddleware.authenticate('jwt', { session: false }),controller.teacher.deleteTeacherAndCourses)
router.patch("/update/:id",authmiddleware.authenticate('jwt', { session: false }),controller.teacher.updateTeacher)
module.exports = router