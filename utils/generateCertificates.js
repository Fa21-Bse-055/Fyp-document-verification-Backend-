const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generatePdfForStudent(data, outputPath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Load background image
    const templatePath = path.join(__dirname, '../uploads/modern_vintage_certificate.png');
    const imageBuffer = fs.readFileSync(templatePath);
    doc.image(imageBuffer, 0, 0, {
      width: doc.page.width,
      height: doc.page.height
    });

    // Set font and color
    doc
  .fillColor('grey')           
  .font('Times-Bold')         
  .fontSize(21);   

    // === Proper Field Placements ===

    // Name (centered near the top under "Comsats Institute...")
    doc.fontSize(18).text(data.name || 'Unnamed', 0, 190, {
      align: 'center',
      width: doc.page.width
    });

    // Day, Month, Year - placed at exact horizontal positions
    doc.fontSize(14);
    doc.text(data.day || 'DD', 200, 390);     // Day
    doc.text(data.month || 'Month', 370, 390); // Month
    doc.text(data.year || 'YYYY', 620, 390);   // Year

    // Issuance Date - at lower left (correct field)
    doc.fontSize(12).text(data.issuanceDate || 'Date', 250, 430);

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

module.exports = { generatePdfForStudent };
