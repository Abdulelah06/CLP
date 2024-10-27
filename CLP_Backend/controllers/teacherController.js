const model = require("../models/index");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {sendVerificationEmail} = require("../utils/email.js");
require('dotenv').config();
const mongoose = require("mongoose")

const bcryptSaltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
const bcryptSalt = bcrypt.genSaltSync(bcryptSaltRounds);

exports.addTeacher = async (req, res) => {
    const { email, password, fullName } = req.body;
    
    let session;
    try {
        // Start a transaction
        session = await model.teacher.startSession();
        session.startTransaction();
        
        // Check if email already exists
        const existingUser = await model.user.findOne({ email }).session(session);
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, bcryptSalt);

        // Create user
        const newUser = new model.user({ email, password: hashedPassword, verified:false, role: "teacher" });
        const user = await newUser.save({ session });

        // Create teacher
        const newTeacher = new model.teacher({
            userId: user._id,
            fullName,
        });
        const teacher = await newTeacher.save({ session });

        // Send a verification email to the teacher email
        await sendVerificationEmail(user._id, email, res);

        // Generate token
        const token = jwt.sign({ userId: user._id, email:email,role: "teacher" }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Send response with token
        return res.status(200).json({ success: true, message: "Teacher created", data:{token,role:"teacher"} });

    } catch (err) {
        // Rollback transaction if there's an error
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        // Handle error
        console.error(err);
        return res.status(500).json({ success: false, message: "Failed to create teacher", error: err.message });
    }
};

exports.getCoursesByTeacher = async (req, res) => {
    let teacherId = req.user._id.toString();

    if (req.query.teacher && req.user.role === "admin") {
        teacherId = req.query.teacher;
    } else if (req.query.teacher && req.user.role !== "admin") {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const page = parseInt(req.query.page) || 1; // Current page number, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 12; // Number of documents per page, default to 12 if not provided
    const search = req.query.search ? decodeURIComponent(req.query.search) : '';
    const categoryId = req.query.category ? req.query.category : null;

    try {
        // Create a regex to search for course names containing the search value
        const searchRegex = new RegExp(search, 'i'); // 'i' for case-insensitive

        // Construct the query object for finding courses
        const query = { teacherId, courseName: { $regex: searchRegex } };
        if (categoryId) {
            query.category = categoryId
        }

        // Count documents that match the search criteria
        const count = await model.courses.countDocuments(query);
        const totalPages = Math.ceil(count / limit);

        // Find courses with pagination and search
        const courses = await model.courses.find(query)
            .select('courseName description teacherId category status') // Select fields explicitly
            .populate('category', 'name') // Populate category name
            .populate('teacherId', 'email') // Populate teacher email
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(); // Convert documents to plain JavaScript objects

        // Map over courses to add modules and titleVideo
        const coursesWithDetails = await Promise.all(
            courses.map(async (course) => {
                // Fetch modules with fields
                const modules = await model.modules.find({ courseId: course._id }).select('moduleName fields').lean();

                // Find the first video URL in fields
                let titleVideo = null;
                for (const module of modules) {
                    for (const field of module.fields) {
                        if (field.content && (field.content.startsWith('http://res.cloudinary.com/') || field.content.startsWith('https://res.cloudinary.com/'))) {
                            titleVideo = field.content;
                            break;
                        }
                    }
                    if (titleVideo) break;
                }

                // Add modules and titleVideo to course object
                course.modules = modules;
                course.titleVideo = titleVideo;

                return course;
            })
        );

        return res.status(200).json({
            success: true,
            message: "Courses retrieved successfully",
            data: { courses: coursesWithDetails, totalPages, currentPage: page, total: count }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
exports.getAllTeachers = async (req, res) => {
    const teacherId = req.user._id.toString(); // Assuming user ID is extracted from token via middleware
    
    if (req.user.role !== "admin") {
        return res.status(401).json({ success: false, message: "Unauthorized access, only admin can access" });
    }
    
    const page = parseInt(req.query.page) || 1; // Current page number, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 9; // Number of documents per page, default to 10 if not provided
    let search = req.query.search || ''; // Search parameter, default to empty string if not provided
    let category = req.query.category || null; // Category parameter, default to null if not provided

    try {
        // Decode the search parameter using decodeURIComponent
        search = decodeURIComponent(search);

        // Create a regex to search for teacher fullname containing the search value
        const searchRegex = new RegExp(search, 'i'); // 'i' for case-insensitive

        // Create a query object for MongoDB
        const query = { fullName: { $regex: searchRegex } };

        // Add category filter if provided
        if (category) {
            query.category = category; // Assuming category is stored as an ObjectId reference
        }

        // Count documents that match the search criteria
        const count = await model.teacher.countDocuments(query);
        const totalPages = Math.ceil(count / limit);

        // Find teachers with pagination and search
        const teachers = await model.teacher.find(query)
            .populate('userId') // Optionally populate userId with their role (example)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(); // Convert documents to plain JavaScript objects

        return res.status(200).json({
            success: true,
            message: "Teachers retrieved successfully",
            data: {
                teachers: teachers,
                totalPages: totalPages,
                currentPage: page,
                total: count
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};
exports.getAllTeachersSearch = async (req, res) => {
    
    
    const page = parseInt(req.query.page) || 1; // Current page number, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 9; // Number of documents per page, default to 10 if not provided
    const search = req.query.search || ''; // Search parameter, default to empty string if not provided

    try {
        // Create a regex to search for teacher names containing the search value
        const searchRegex = new RegExp(search, 'i'); // 'i' for case-insensitive

        // Find teachers with pagination and search
        const count = await model.teacher.countDocuments({ fullName: { $regex: searchRegex } });
        const totalPages = Math.ceil(count / limit);

        const teachers = await model.teacher.find({ fullName: { $regex: searchRegex } })
            .populate('userId', 'role') // Optionally populate userId with their role (example)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(); // Convert documents to plain JavaScript objects

        return res.status(200).json({
            success: true,
            message: "Teachers retrieved successfully",
            data: {
                teachers: teachers,
                totalPages: totalPages,
                currentPage: page,
                total: count
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

exports.deleteTeacherAndCourses = async (req, res) => {

    const role = req.user.role 
    if (role !== 'admin') {
        return res.status(401).json({ success: false, message: "Unauthorized access, only admin can access" });
    }

    const teacherId = req.params.id;

    let session;
    try {
        // Start a transaction
        session = await model.teacher.startSession();
        session.startTransaction();

        // Delete the teacher
        const deletedTeacher = await model.teacher.findByIdAndDelete(teacherId).session(session);
        if (!deletedTeacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }
           
        const deletedUser = await model.user.findOneAndDelete({ _id: deletedTeacher.userId }).session(session);
        if (!deletedUser) {
            console.log(`User with ID ${deletedTeacher.userId} not found in user collection.`);
        }

        // Find all courses where teacherId matches
        const coursesToDelete = await model.courses.find({ teacherId: deletedUser._id }).session(session);

        // Delete courses
        const deletedCourses = await model.courses.deleteMany({ teacherId: deletedUser._id }).session(session);

        // Ensure coursesToDelete is an array of course documents
        const courseIds = coursesToDelete.map(course => course._id);

        // Delete modules for each course deleted
        const deletedModules = await Promise.all(
            courseIds.map(async (courseId) => {
                const result = await model.modules.deleteMany({ courseId: courseId }).session(session);
                return result;
            })
        );

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Teacher and associated courses deleted successfully",
            data: {
                deletedTeacher,
                deletedCourses,
                deletedModules
            }
        });
    } catch (err) {
        // Rollback transaction if there's an error
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        console.error(err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
exports.updateTeacher = async (req, res) => {
    const { fullName } = req.body;
    const { id } = req.params; // Assuming the teacher ID is passed in the URL params

    try {
        

        // Construct the update object with the fields that can be updated
        const updateFields = {};
        if (fullName) updateFields.fullName = fullName;

        // Update the teacher in the database
        const updatedTeacher = await model.teacher.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        );

        if (!updatedTeacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Teacher updated successfully",
            data: updatedTeacher
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

exports.getCoursesByTeacherAdmin = async (req, res) => {
    const teacherId = req.query.teacher; // Assuming user ID is extracted from token via middleware
    const page = parseInt(req.query.page) || 1; // Current page number, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 12; // Number of documents per page, default to 12 if not provided
    const search = req.query.search ? decodeURIComponent(req.query.search) : '';
    const role = req.user.role

    if (role !== 'admin') {
        return res.status(401).json({ success: false, message: "Unauthorized access, only admin can access" });
    }
    try {
        // Create a regex to search for course names containing the search value
        const searchRegex = new RegExp(search, 'i'); // 'i' for case-insensitive

        // Count documents that match the search criteria
        const count = await model.courses.countDocuments({ teacherId, courseName: { $regex: searchRegex } });
        const totalPages = Math.ceil(count / limit);

        // Find courses with pagination and search
        const courses = await model.courses.find({ teacherId, courseName: { $regex: searchRegex } })
            .select('courseName description teacherId category status') // Select fields explicitly
            .populate('teacherId', 'email') // Optionally populate teacherId with their email (example)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(); // Convert documents to plain JavaScript objects

        // Map over courses to add category names and modules
        const coursesWithCategory = await Promise.all(
            courses.map(async course => {
                // Fetch category name
                const category = await model.category.findById(course.category);
                course.categoryName = category ? category.name : null;

                // Fetch teacher info
                const teacher = await model.user.findById(course.teacherId);
                if (teacher) {
                    course.teacherEmail = teacher.email; // Add teacher email to course object
                }

                // Fetch modules with fields and find titleVideo
                const modules = await model.modules.find({ courseId: course._id }).select('moduleName fields').lean();

                let titleVideo = null;

                // Find the first video URL in fields
                for (const module of modules) {
                    for (const field of module.fields) {
                        if (field.content && (field.content.startsWith('http://res.cloudinary.com/') || field.content.startsWith('https://res.cloudinary.com/'))) {
                            titleVideo = field.content;
                            break;
                        }
                    }
                    if (titleVideo) break;
                }

                // Add titleVideo and modules to course object
                if (titleVideo) {
                    course.titleVideo = titleVideo;
                }
                course.modules = modules;

                return course;
            })
        );

        return res.status(200).json({
            success: true,
            message: "Courses retrieved successfully",
            data: { courses: coursesWithCategory, totalPages, currentPage: page, total: count }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};