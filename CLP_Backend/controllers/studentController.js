const model = require("../models/index");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const {sendVerificationEmail} = require("../utils/email.js");

require('dotenv').config();

const bcryptSaltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
const bcryptSalt = bcrypt.genSaltSync(bcryptSaltRounds);

exports.addStudent = async (req, res) => {
    const { email, password, fullName } = req.body;
    console.log("Hi");
    let session;
    try {
        // Start a transaction
        session = await model.student.startSession();
        session.startTransaction();

        const existingUser = await model.user.findOne({ email }).session(session);
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, bcryptSalt);


        // Create user
        const newUser = new model.user({ email, password:hashedPassword, verified:false, role: "student" });
        const user = await newUser.save({ session });

        // Create student
        const newStudent = new model.student({
            userId: user._id,
            fullName,
            email: email
        });
        const student = await newStudent.save({ session });

        // Send a verification email to the student email
        await sendVerificationEmail(user._id, email, res);
        
        // Generate token
        const token = jwt.sign({ userId: user._id, email:email,role: "student" }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Send response with token
        return res.status(200).json({ success: true, message: "Student created", data:{token,role:"student"} });

    } catch (err) {
        // Rollback transaction if there's an error
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        // Handle error
        console.error(err);
        return res.status(500).json({ success: false, message: "Failed to create student", error: err.message });
    }
};

exports.getAllStudents = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Current page number, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 9; // Number of documents per page, default to 10 if not provided
    let search = req.query.search || ''; // Search parameter for fullname, default to empty string if not provided

    try {
        // Decode and sanitize search parameter
        search = decodeURIComponent(search);

        // Create regex for case-insensitive search
        const searchRegex = new RegExp(search, 'i');

        // Count total number of documents matching search criteria
        const count = await model.student.countDocuments({ fullName: { $regex: searchRegex } });

        // Calculate total pages based on limit
        const totalPages = Math.ceil(count / limit);

        // Fetch students with pagination and search
        const students = await model.student.find({ fullName: { $regex: searchRegex } })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(); // Convert Mongoose documents to plain JavaScript objects

        return res.status(200).json({
            success: true,
            message: 'Students retrieved successfully',
            data: {
                students,
                totalPages,
                currentPage: page,
                total: count
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
};

exports.updateStudent = async (req, res) => {
    const studentId = req.params.id;
    const { fullName } = req.body;

    try {
        // Check if student exists
        let student = await model.student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Update student fields
        if (fullName) {
            student.fullName = fullName;
        }

        // Save updated student information
        await student.save();

        return res.status(200).json({
            success: true,
            message: "Student updated successfully",
            data: student
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

exports.deleteStudent = async (req, res) => {
    const { id } = req.params; // Assuming the student ID is passed in the URL params

    let session;
    try {
        // Start a transaction
        session = await model.student.startSession();
        session.startTransaction();

        // Delete the student
        const deletedStudent = await model.student.findByIdAndDelete(id).session(session);
        if (!deletedStudent) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Delete the corresponding user
        // Assuming you have a 'User' model imported and defined similarly to your schema
        const deletedUser = await model.user.findByIdAndDelete(deletedStudent.userId).session(session);
        if (!deletedUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Student and corresponding user deleted successfully",
            data: {
                deletedStudent,
                deletedUser
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