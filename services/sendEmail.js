const transporter = require("../config/mailerconfig");
function sendEmail(emailVerificationCode,email){
    const emailToSend = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: "Email Verification",
        html: `<p><span style="font-size: larger;">Please verify your email by clicking the following link:</span><br>
        https://hnhbdvm.localto.net/api/users/verify?code=${emailVerificationCode}</p><hr>
        <p>Note: This is one time use verification link to verify your email (will be expired later)</p>`,
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