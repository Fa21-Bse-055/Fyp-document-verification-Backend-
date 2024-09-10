const nodemailer = require("nodemailer")
require("dotenv").config()

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    },
})

const email = {
    from: "ahmaranwar24@gmail.com",
    to: "ahmaranwar40@gmail.com",
    subject: "Test email by Node.js",
    text: "This is a test email sent from Node.js!"
}

transporter.sendMail(email, (err, info) => {
    if (err) {
        console.log("Error occurred", err);
    }
    else{
        console.log("Email sent",info);
    }
})