const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const Document = require("../models/Documents");
const { generatePdfForStudent } = require('../utils/generateCertificates');

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/bulk-upload", upload.single("file"), async (req, res) => {
  
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    else{
    const results = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", async () => {
        // const placeholderPath = "/uploads/generated/placeholder.pdf";
        for (const row of results) {

          const exists = await Document.findOne({
            studentEmail: row.email,
            issuanceDate: row.issuanceDate   // or whatever unique key you choose
          });
        
          if (exists) {
            console.log(`Skipping ${row.email}: certificate already exists.`);
            continue;
          }

          const filename = `${row.email}-${Date.now()}.pdf`;
          const outputPath = path.join(__dirname, '../uploads/generated/', filename);

          await generatePdfForStudent({
            name: row.name,
            day: row.day,
            month: row.month,
            year: row.year,
            issuanceDate: row.issuanceDate,
            course: row.course || 'Certificate of Completion'
          }, outputPath);

          const doc = new Document({
            title:   `${row.name}'s Certificate`,
            description: "Auto-generated from CSV",
            certificatePath: `/uploads/generated/${filename}`,          // so your static serve hits it
            senderOrganization: "660f7dd1abc1234567890abc",
            studentEmail: row.email,
            day: row.day,
            month: row.month,
            year: row.year,
            issuanceDate: row.issuanceDate
          });
          await doc.save();
        }

        fs.unlinkSync(filePath); // clean up the CSV file
        res.status(200).json({ message: "Certificates created successfully." });
      });}
  } catch (err) {
    console.error("Bulk Upload Error:", err);
    res.status(500).json({ error: "Something went wrong during bulk upload." });
  }
});

module.exports = router;
