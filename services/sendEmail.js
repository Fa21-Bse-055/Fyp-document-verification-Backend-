const transporter = require("../config/mailerconfig");

/**
 * Sends a verification email to the user
 * @param {string} emailVerificationCode - The verification code
 * @param {string} email - The recipient's email address
 * @returns {Promise} - A promise that resolves when the email is sent
 */
function sendEmail(emailVerificationCode, email) {
  console.log("Sending verification email to:", email);
  
  return new Promise((resolve, reject) => {
    // Create email content
    const emailToSend = {
      from: `"Document Verification System" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: "Email Verification - Document Verification System",
      html: `<html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
          <p style="font-size: larger; color: #555;">Hello,</p>
          <p style="font-size: larger; color: #555;">
            Please verify your email by clicking the button below:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="http://localhost:3001/verify?code=${emailVerificationCode}" 
              style="background-color: #4ecdc4; color: white; padding: 12px 20px; text-decoration: none; font-size: large; border-radius: 5px;">
              Verify Email
            </a>
          </div>
          <p style="color: #555; font-size: medium; margin-top: 20px;">
            If the button doesn't work, copy and paste this URL into your browser:
          </p>
          <p style="background-color: #f8f8f8; padding: 10px; border-radius: 4px; word-break: break-all;">
            http://localhost:3001/verify?code=${emailVerificationCode}
          </p>
          <hr style="border: 1px solid #ddd; margin: 40px 0;">
          <p style="color: #888; font-size: medium;">
            <strong>Note:</strong> This is a one-time use verification link to verify your email and will expire soon.
          </p>
        </div>
      </body>
    </html>
    `,
    };

    // Log the verification details for debugging/testing
    console.log("Verification code:", emailVerificationCode);
    console.log("Verification URL: http://localhost:3001/verify?code=" + emailVerificationCode);
    
    try {
      // Send the email
      transporter.sendMail(emailToSend, (err, info) => {
        if (err) {
          console.error("Error sending email:", err);
          // Still resolve with a message so the application continues
          resolve({ 
            success: false, 
            message: "Email could not be sent, but verification code was generated",
            verificationCode: emailVerificationCode
          });
        } else {
          console.log("Email sent successfully:", info.response);
          resolve({
            success: true,
            message: "Email sent successfully",
            info: info
          });
        }
      });
    } catch (error) {
      console.error("Exception while sending email:", error);
      // Still resolve with a message so the application continues
      resolve({ 
        success: false, 
        message: "Email service unavailable, but verification code was generated",
        verificationCode: emailVerificationCode
      });
    }
  });
}

module.exports = sendEmail;