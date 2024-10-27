const user = require("./user")
const student = require("./student")
const teacher = require("./teacher")
const courses = require("./courses")
const modules = require("./module")
const category = require("./category")
const review = require("./reviews")
const comment = require("./comment")
const UserVerification = require("./UserVerification")

const models = {
    user,
    student,
    teacher,
    courses,
    modules,
    category,
    review,
    comment,
    UserVerification
}

module.exports = models