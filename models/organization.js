const mongoose = require("mongoose");

const organizationSchema = mongoose.Schema({
  organization_name: { type: String, required: true }, // from user
  email: { type: String, required: true }, // from user
  password: { type: String, required: true }, // from user
  organization_web_url: { type: String, required: true }, // from user
  emailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String },
  organizationVerified: { type: Boolean, default: false },
  organizationVerificationCode: { type: String },
  fileContent: { type: String },
  CNICImage: { type: String },
  role: { type: String, default: "organization" }
});

module.exports = mongoose.model("organization", organizationSchema);
