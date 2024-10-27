const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true
    },
   
    description: {
        type: String,
        required: true
    },
    teacherId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    status:{
        type: String,
        default:"draft",

    }
});

module.exports = mongoose.model('Course', courseSchema);