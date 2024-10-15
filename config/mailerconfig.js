require("dotenv").config()
const nodemailer = require("nodemailer")

const transporter =  nodemailer.createTransport({
service : "Gmail",
auth :{
    user : process.env.EMAIL_USERNAME,
    pass : process.env.EMAIL_PASSWORD
}
})
// var transporter = nodemailer.createTransport({
//     host: "sandbox.smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//       user: "8e8cb645a28564",
//       pass: "8fee9493ec55eb"
//     }
//   });

module.exports = transporter

