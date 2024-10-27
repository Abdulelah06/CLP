const bcrypt = require('bcryptjs');
const User = require('../models/user');  // Adjust the path as per your project structure
const {sendVerificationEmail} = require("../utils/email.js");

const bcryptSaltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
const bcryptSalt = bcrypt.genSaltSync(bcryptSaltRounds);

exports.addAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, bcryptSalt);

        // Create a new admin user with hashed password
        const newAdmin = new User({
            email,
            password: hashedPassword,
            role: 'admin',
            verified: false
        });

        // Save the admin user to the database
        await newAdmin.save();

        // Send a verification email to the admin email
        await sendVerificationEmail(newAdmin._id, email, res);

        return res.status(201).json({ success: true, message: "Admin created successfully", data: { admin: newAdmin } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
