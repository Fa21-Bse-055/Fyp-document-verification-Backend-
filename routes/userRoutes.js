require("dotenv").config();
const router = require("express").Router();
const path = require("path");

const Organization = require("../models/organization");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const genrateUniqueCode = require("../utils/generateUniqueCode");
const domainComparison = require("../services/domainComparison");
const sendEmail = require("../services/sendEmail");
const generateVerificationFile = require("../services/generateVerificationFile");
const upload = require("../config/multerconfig")

router.post("/register",upload.single("CNICImage"), async (req, res) => {
  console.log("req.file : ", req.file);
  const { organization_name, email, password, organization_web_url} = req.body;
  try {
    const foundOrganization = await Organization.findOne({
      email: email.toLowerCase(),
    });
    if (foundOrganization) {
      console.log("foundOrganization:", foundOrganization);
      return res.status(500).json({ msg: "Organization already exists!" });
    }
    if (!domainComparison(organization_web_url, email)) {
      return res.status(500).json({
        msg: " email's domain must match the organization’s website's domain",
      });
    }
    const emailVerificationCode = genrateUniqueCode();
console.log("emailVerificationCode : ",emailVerificationCode);
    sendEmail(emailVerificationCode,email);

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
      try{
        await Organization.create({
          organization_name,
          email: email.toLowerCase(),
          password: hash,
          organization_web_url,
          emailVerificationCode,
          CNICImage : req.file.filename
        });
        res.status(200).json({
          msg: "Verify your email to get registered on our platform!",
        });
      }catch(err){
        console.log(err.message);
    res.status(400).json({ msg: err.message });
      }
      });
    });
    console.log("Hello------Programmer");
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error!" });
  }
});
router.get("/verify", async (req, res) => {
  const emailVerificationCode = req.query.code;
  console.log("verificarionCode:",emailVerificationCode );
  const foundOrganization = await Organization.findOne({
    emailVerificationCode,
  });
  console.log("foundOrganization:", foundOrganization);
  try {
    if (!foundOrganization) 
      return res.status(500).json({ msg: "Invalid or expired token!" });

    foundOrganization.emailVerified = true;
    foundOrganization.emailVerificationCode = null;
    foundOrganization.organizationVerificationCode = genrateUniqueCode();
    generateVerificationFile(foundOrganization);
    const token = jwt.sign(
      {
        organization_id: foundOrganization._id,
        email: foundOrganization.email,
      },
      process.env.JWT_SECRET_KEY
    );
    res.cookie("token", token,{httpOnly:true});
    // console.log("token : ",token);
    res.status(200).json({ msg: "Email verified!" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error!" });
  }
});
// router.get("/download",(req,res)=>{
//   const token = req.cookies.token
//   console.log(req.cookies);
//   const data = jwt.verify(token,process.env.JWT_SECRET_KEY)
//   res.status(200).json({data})
// })
router.get("/download",cookieReader,  async (req, res) => {

  console.log(req.organization);

  const foundOrganization = await Organization.findById(req.organization.organization_id);

  console.log("foundOrganizationbyId:", foundOrganization);
  try {
  return res.download(
      `./verificationFiles/verification_code_${foundOrganization.organizationVerificationCode}.txt`,
      (err) => {
        if (err) {
          console.log("Error sending file:", err);
        res
            .status(500)
            .json({ msg: "An error occurred while downloading the file." });
        }
      }
    );
  } catch (err) {
    console.log("Error occured:", err.message);
   return res.status(500).json({ msg: "Server Error!" });
  }
});

function cookieReader(req,res,next){
  const token = req.cookies.token
  if(token==="")
  res.status(500).json({msg:"TOKEN EXPIRED!"})
  const data = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.organization = data
        next()
}
module.exports = router;
