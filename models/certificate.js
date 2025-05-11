const mongoose = require("mongoose");

const certificateSchema = mongoose.Schema({
  cert_id: Number,
  cert_hash: String,
});

const certificateModel = mongoose.model("Certificate", certificateSchema);

module.exports = certificateModel;
