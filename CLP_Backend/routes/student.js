var express = require('express');
var router = express.Router();
var controller = require("../controllers/index")


router.post("/register",controller.student.addStudent)
router.get("/getall",controller.student.getAllStudents)
router.patch("/update/:id",controller.student.updateStudent)
router.delete("/delete/:id",controller.student.deleteStudent)
module.exports = router