const model = require("../models/index");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await model.user.findOne({ email });
        if (!user) {
            return res.status(200).json({ success: false, message: "User not found" });
        }
        
        if (email !== "admin@gmail.com"){
            if (!user.verified) {
                return res.status(200).json({ success: false, message: "Email hasn't been verified yet. Check your inbox." });
            }
        }
        

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id,email:user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Send the response with the token
        return res.status(200).json({ success: true, message: "Login successful", data:{token,role:user.role} });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};