const fs = require("fs");
function generateVerificationFile(foundOrganization) {
  const fileContent = `
Organization: ${foundOrganization.organization_name}
Verification Code: ${foundOrganization.organizationVerificationCode}
Issued by: Document Verification System
Date: ${new Date().toDateString()}

This file is used to verify the ownership of the domain for ${
    foundOrganization.organization_name
  }.
Please upload this file to the root directory of your website: ${
    foundOrganization.organization_web_url
  }
    `;
  fs.writeFile(
    `./verificationFiles/verification_code_${foundOrganization.organizationVerificationCode}.txt`,
    fileContent,
    async (err) => {
      if (err) {
        console.log("Error writing file", err.message);
      } else {
        console.log("File created and content written!");
        foundOrganization.fileContent = fileContent;
        await foundOrganization.save();
      }
    }
  );
}

module.exports = generateVerificationFile;
