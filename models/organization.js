const mongoose = require("mongoose");

const organizationSchema = mongoose.Schema({
  organization_name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  organization_web_url: { type: String },
  emailVerified: { type: String, default: false },
  emailVerificationCode: { type: String },
  organizationVerified: { type: Boolean, default: false },
  organizationVerificationCode: { type: String },
  fileContent: { type: String },
});

module.exports = mongoose.model("organization", organizationSchema);
