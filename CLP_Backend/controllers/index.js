const student = require("./studentController")
const teacher = require("./teacherController")
const login = require("./loginController")
const course = require("./courseController")
const modules = require("./moduleController")
const category = require("./categoryController")
const admin = require("./adminController")
const reviews = require("./reviewController")
const comment = require("./commentController")
const auth = require("./authController")
const controllers = {
    student,
    teacher,
    login,
    course,
    modules,
    category,
    admin,
    reviews,
    comment,
    auth
}

module.exports = controllers