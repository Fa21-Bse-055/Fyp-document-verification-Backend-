const mongoose = require("mongoose");
const config = require("./config");
const TemporaryOrganizationData = require("../models/organization");
const TemporaryAdminData = require("../models/admin");
const createSuperAdmin = require("../utils/createSuperAdmin");

const connectDB = async () => {
  try {
    const mongoUri = "mongodb+srv://Ahmar:Ahmar123@cluster-102.45rhq.mongodb.net/doc-verification?retryWrites=true&w=majority&appName=Cluster-102";
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected...");
    await TemporaryOrganizationData.deleteMany({});
    console.log("TemporaryOrganizationData cleared on startup");
    await TemporaryAdminData.deleteMany({ email: "ahmaranwar24@gmail.com" });
    console.log("TemporaryAdminData cleared on startup");
    createSuperAdmin();
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
