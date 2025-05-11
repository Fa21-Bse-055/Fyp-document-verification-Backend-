const mongoose = require("mongoose");

const studentDocumentSchema = mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String,
    required: false
  },
  certificatePath: {    // file path to the certificate (PDF)
    type: String,
    required: true
  },
  studentEmail: {       // IMPORTANT: to map certificate to student
    type: String,
    required: true
  },
  senderOrganization: { // who sent it
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organization',
    required: true
  },
  day: { type: String },
  month: { type: String },
  year: { type: String },
  issuanceDate: { type: String },
  sentAt: {              // when the certificate was sent
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("StudentDocument", studentDocumentSchema);
