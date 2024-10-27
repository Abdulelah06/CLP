const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fieldSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    content: {
        type: String,
    }
});

const moduleSchema = new mongoose.Schema({
    moduleName: {
        type: String,
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',  // Reference to the Course model
        required: true
    },
    fields: [fieldSchema]
});

module.exports = mongoose.model('Module', moduleSchema);