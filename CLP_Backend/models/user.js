const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true
    },
    verified: { 
        type: Boolean, 
        default: false },
})

module.exports = mongoose.model('user', userSchema);
