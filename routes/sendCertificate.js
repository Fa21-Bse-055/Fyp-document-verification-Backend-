const express = require('express');
const router = express.Router();
const studentDocument = require('../models/Documents');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hammadawan939858@gmail.com',      
    pass: 'svaz vopv ttpa xkvu'          
  }
});

router.post("/send-certificate", async (req, res) => {
  console.log(req.body);
  try {
    const { certificateId, method } = req.body;
    console.log("certificateId", certificateId);
    const cert = await studentDocument.findById(certificateId);
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });

    if (method === 'gmail') {
      // Gmail sending
      const mailOptions = {
        from: 'hammadawan939858@gmail.com',
        to: cert.studentEmail,
        subject: `Your Certificate: ${cert.title}`,
        text: `Dear Student,\n\nPlease find your certificate attached.\n\nRegards,\nYour Organization`,
        attachments: [
          {
            filename: `${cert.title}.pdf`,
            path: `./${cert.certificatePath}`, // adjust path to stored PDF
          }
        ]
      };

      await transporter.sendMail(mailOptions);
      return res.json({ message: 'Certificate sent to student Gmail inbox' });

    } else if (method === 'dashboard') {
      // Simulate "sending" to dashboard by setting a flag or log
      cert.sentToDashboard = true;
      await cert.save();
      return res.json({ message: 'Certificate sent to student dashboard' });

    } else {
      return res.status(400).json({ message: 'Invalid sending method' });
    }
  } catch (err) {
    console.error('Error sending certificate:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
