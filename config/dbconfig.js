const mongoose = require("mongoose");
require("dotenv").config();
const TemporaryData = require("../models/organization")
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected...");
  await TemporaryData.deleteMany({})
  console.log('Temporary data cleared on startup');

};


module.exports = connectDB;
