const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI,{
    serverSelectionTimeoutMS: 30000 // 30 seconds
  });
  console.log("MongoDB Connected...");
};

module.exports = connectDB;
