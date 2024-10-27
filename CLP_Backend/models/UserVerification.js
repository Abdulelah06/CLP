const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserVerificationSchema = new Schema({
    userId: String,
    uniqueString: String,
    createAt: Date,
    expiresAt: Date,
});

const UserVerificationModel = mongoose.model('UserVerification', UserVerificationSchema);

module.exports = UserVerificationModel;
