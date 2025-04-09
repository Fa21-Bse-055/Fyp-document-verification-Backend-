const fs = require("fs");
const path = require("path");

/**
 * Generates a verification file for the organization
 * @param {Object} foundOrganization - The organization object
 */
function generateVerificationFile(foundOrganization) {
  const verificationDir = path.join(__dirname, "..", "verificationFiles");
  
  // Make sure the directory exists
  if (!fs.existsSync(verificationDir)) {
    try {
      fs.mkdirSync(verificationDir, { recursive: true });
      console.log("Created verificationFiles directory");
    } catch (dirError) {
      console.error("Error creating verificationFiles directory:", dirError.message);
      return;
    }
  }
  
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
  
  const filePath = path.join(
    verificationDir, 
    `verification_code_${foundOrganization.organizationVerificationCode}.txt`
  );
  
  try {
    fs.writeFileSync(filePath, fileContent);
    console.log("Verification file created successfully at:", filePath);
    
    // Update the organization with file content
    foundOrganization.fileContent = fileContent;
    foundOrganization.save().then(() => {
      console.log("Organization updated with file content");
    }).catch(saveErr => {
      console.error("Error saving organization with file content:", saveErr.message);
    });
  } catch (err) {
    console.error("Error writing verification file:", err.message);
  }
}

module.exports = generateVerificationFile;
