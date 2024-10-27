const model = require("../models/index");
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

require('dotenv').config();

exports.verifyEmail = async (req, res, next) => {
    const { userId, uniqueString } = req.params;
  
    try {
      const verificationRecord = await model.UserVerification.findOne({ userId });
  
      if (!verificationRecord) {
        return res.status(404).json({ error: "Verification record not found or already verified." });
      }
  
      const { expiresAt, uniqueString: hashedUniqueString } = verificationRecord;
  
      if (expiresAt < Date.now()) {
        await model.UserVerification.deleteOne({ userId });
        await model.user.deleteOne({ _id: userId });
        return res.status(400).json({ error: "Verification link has expired. Please sign up again." });
      }
  
      const isMatch = await bcrypt.compare(uniqueString, hashedUniqueString);
  
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid verification details." });
      }
  
      await model.user.updateOne({ _id: userId }, { verified: true });
      await model.UserVerification.deleteOne({ userId });
  
      res.status(200).json({ message: "Email successfully verified. You can now log in." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };