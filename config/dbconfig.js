const mongoose = require("mongoose");
require("dotenv").config();
const TemporaryOrganizationData = require("../models/organization");
const TemporaryAdminData = require("../models/admin");
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected...");
  await TemporaryOrganizationData.deleteMany({});
  console.log("TemporaryOrganizationData cleared on startup");
  await TemporaryAdminData.deleteMany({ email: "ahmaranwar24@gmail.com" });
  console.log("TemporaryAdminData cleared on startup");
};

module.exports = connectDB;
