var express = require('express');
var router = express.Router();
var student =require("./student")
var teacher = require("./teacher")
var login = require("./login")
var modules= require("./module")
var courses = require("./course")
var category = require("./category")
var admin = require("./admin")
var review = require("./review")
var comment = require("./comments")
var authRoutes = require("./authRoutes")
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.use('/auth', authRoutes)
router.use("/course",courses)
router.use("/student",student)
router.use("/teacher",teacher)
router.use("/login",login),
router.use("/module",modules)
router.use("/category",category)
router.use("/admin",admin)
router.use("/review",review)
router.use("/comment",comment)


module.exports = router;
