require("dotenv").config()
const nodemailer = require("nodemailer")

// Create a transporter using Gmail with app password
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  },
  debug: false, // Disable debug output
  logger: false // Disable logging information about the mail transport
})

// Export the transporter without verification
module.exports = transporter

