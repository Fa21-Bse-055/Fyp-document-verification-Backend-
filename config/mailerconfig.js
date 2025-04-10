require("dotenv").config()
const nodemailer = require("nodemailer")

// Create a transporter using Gmail with app password
const transporter = nodemailer.createTransport({
  service : "Gmail" ,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  },
})

// Export the transporter without verification
module.exports = transporter

