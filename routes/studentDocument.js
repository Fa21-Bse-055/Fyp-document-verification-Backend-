const express = require('express');
const StudentDocument = require('../models/Documents');
const Organization = require('../models/organization');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post("/send-cert", upload.single('certificate'), async (req, res) => {
  console.log("Received POST /api/student-documents");
    try {
      console.log('Received Fields:', {
        studentEmail: req.body.studentEmail,
        title: req.body.title,
        description: req.body.description,
        day: req.body.day,
        month: req.body.month,
        year: req.body.year,
        issuanceDate: req.body.issuanceDate,
        senderOrganization: req.body.senderOrganization,
        certificatePath: req.file ? req.file.path : null,
      });

      const { studentEmail, title, description, day, month, year, issuanceDate, senderOrganization } = req.body;

      if (!studentEmail || !req.file || !senderOrganization) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // 👇 Find organization by name
      const organization = await Organization.findOne({ "_id" : senderOrganization });
      console.log("2nd console"+ senderOrganization);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      const newCertificate = new StudentDocument({
        studentEmail,
        title,
        description,
        certificatePath: `/uploads/${req.file.filename}`,
        day,
        month,
        year,
        issuanceDate,
        senderOrganization: organization._id, 
      });

      await newCertificate.save();
      console.log("3rd console");
      res.status(201).json({ message: "Certificate sent successfully", newCertificate });

    } catch (error) {
      console.error("Error sending certificate:", error.message);
      res.status(500).json({ message: "Server error" });
    }
});


// router.post('/send-certificate', async (req, res) => {
//   const { certificateId, method } = req.body;

//   try {
//     const cert = await Certificate.findById(certificateId);
//     if (!cert) return res.status(404).json({ message: 'Certificate not found' });

//     if (method === 'gmail') {
//       // Gmail sending
//       const mailOptions = {
//         from: 'yourgmail@gmail.com',
//         to: cert.studentEmail,
//         subject: `Your Certificate: ${cert.title}`,
//         text: `Dear Student,\n\nPlease find your certificate attached.\n\nRegards,\nYour Organization`,
//         attachments: [
//           {
//             filename: `${cert.title}.pdf`,
//             path: `./public${cert.certificatePath}`, // adjust path to stored PDF
//           }
//         ]
//       };

//       await transporter.sendMail(mailOptions);
//       return res.json({ message: 'Certificate sent to student Gmail inbox' });

//     } else if (method === 'dashboard') {
//       // Simulate "sending" to dashboard by setting a flag or log
//       cert.sentToDashboard = true;
//       await cert.save();
//       return res.json({ message: 'Certificate sent to student dashboard' });

//     } else {
//       return res.status(400).json({ message: 'Invalid sending method' });
//     }
//   } catch (err) {
//     console.error('Error sending certificate:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

/**
 * GET /api/student-documents
 * Query Params:
 *   email (required): the student’s email address
 *
 * Returns:
 *   { certificates: [ /* array of StudentDocument docs * / ] }
 */
router.get('/fetch-cert', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'email query parameter is required' });
    }

    // Fetch all certificates for this email
    const certificates = await StudentDocument.find({ studentEmail: email })
      .sort({ sentAt: -1 }); // newest first

    return res.json({ certificates });
  } catch (err) {
    console.error('fetch-student-documents error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
