const mongoose = require("mongoose");

const studentSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    fullName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        default: NaN
    },
}, {
    timestamps: true
  })

module.exports = mongoose.model('student', studentSchema);