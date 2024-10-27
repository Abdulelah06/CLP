const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
      await mongoose.connect(process.env.DB_URL, {
        
    connectTimeoutMS: 30000, // Increase connection timeout to 30 seconds
      });
      console.log('Connected to the database');
    } catch (error) {
      console.error('Error connecting to the database', error);
      process.exit(1);
    }
  };
  
module.exports = connectDB;