const transporter = require("../config/mailerconfig");
function sendEmail(emailVerificationCode,email){
  console.log("email : ",email);
    const emailToSend = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: "Email Verification",
        html: `<html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
            <p style="font-size: larger; color: #555;">Hello,</p>
            <p style="font-size: larger; color: #555;">
              Please verify your email by clicking the button below:
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="http://localhost:8081/verify?code=${emailVerificationCode}" 
                style="background-color: #7289DA; color: white; padding: 12px 20px; text-decoration: none; font-size: large; border-radius: 5px;">
                Verify Email
              </a>
            </div>
            <hr style="border: 1px solid #ddd; margin: 40px 0;">
            <p style="color: #888; font-size: medium;">
              <strong>Note:</strong> This is a one-time use verification link to verify your email and will expire soon.
            </p>
          </div>
        </body>
      </html>
      `,
      };
  
      transporter.sendMail(emailToSend, (err, info) => {
        if (err) {
          console.error("Error occurred:", err.message);
        } else {
          console.log("Email sent:", info.response);
        }
      });
}

module.exports = sendEmail