require("dotenv").config();
const router = require("express").Router();
const path = require("path");

const Organization = require("../models/organization");
const Document = require("../models/document");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const genrateUniqueCode = require("../utils/generateUniqueCode");
const domainComparison = require("../services/domainComparison");
const sendEmail = require("../services/sendEmail");
const generateVerificationFile = require("../services/generateVerificationFile");
const upload = require("../config/multerconfig");
<<<<<<< HEAD

router.post("/register", upload.single("CNICImage"), async (req, res) => {
  console.log("req.body : ", req.body);
  console.log("req.file : ", req.file);
=======
const uploadDocument = require("../config/documentUploadConfig");
const { isAuthenticated, isOrganization } = require("../middleware/auth");
const config = require("../config/config");

router.post("/register", upload.single("CNICImage"), async (req, res) => {
  console.log("Organization registration request received");
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);
  
>>>>>>> 9ec19e7824c140c58112ea97feecf77bb1df964c
  const { organization_name, email, password, organization_web_url } = req.body;
  
  try {
    // Validate input
    if (!organization_name || !email || !password || !organization_web_url) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    
    // Check if organization already exists
    const foundOrganization = await Organization.findOne({
      email: email.toLowerCase(),
    });
    
    if (foundOrganization) {
      console.log("Organization already exists:", foundOrganization.email);
      return res.status(500).json({ msg: "Organization already exists!" });
    }
    
    // Normalize the web URL
    let normalizedWebUrl = organization_web_url;
    if (!normalizedWebUrl.startsWith('http://') && !normalizedWebUrl.startsWith('https://')) {
      normalizedWebUrl = 'https://' + normalizedWebUrl;
    }
    
    console.log("Normalized web URL:", normalizedWebUrl);
    
    // Skip domain comparison for testing with gmail.com
    let domainMatch = true;
    if (!email.endsWith('@gmail.com') && !email.endsWith('@hotmail.com') && !email.endsWith('@outlook.com') && !email.endsWith('@yahoo.com')) {
      domainMatch = domainComparison(normalizedWebUrl, email);
    }
    
    if (!domainMatch) {
      return res.status(500).json({
        msg: "Email's domain must match the organization's website domain",
      });
    }
    
    // Generate verification code
    const emailVerificationCode = genrateUniqueCode();
<<<<<<< HEAD
    console.log("emailVerificationCode : ", emailVerificationCode);
    sendEmail(emailVerificationCode, email);

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        try {
          await Organization.create({
            organization_name,
            email: email.toLowerCase(),
            password: hash,
            organization_web_url,
            emailVerificationCode,
            CNICImage: req.file.filename,
          });
          res.status(200).json({
            msg: "Verify your email to get registered on our platform!",
          });
        } catch (err) {
          console.log(err.message);
          res.status(400).json({ msg: err.message });
=======
    console.log("Generated verification code:", emailVerificationCode);
    
    try {
      // Try to send verification email
      try {
        await sendEmail(emailVerificationCode, email);
        console.log("Verification email sent successfully to:", email);
      } catch (emailSendError) {
        console.error("Error sending email, but continuing with registration:", emailSendError);
        // Continue with registration even if email fails
      }
      
      // Hash password and create organization
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          console.error("Error generating salt:", err);
          return res.status(500).json({ msg: "Server Error during password hashing!" });
>>>>>>> 9ec19e7824c140c58112ea97feecf77bb1df964c
        }
        
        bcrypt.hash(password, salt, async (err, hash) => {
          if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).json({ msg: "Server Error during password hashing!" });
          }
          
          try {
            // Create organization with normalized web URL
            const newOrg = await Organization.create({
              organization_name,
              email: email.toLowerCase(),
              password: hash,
              organization_web_url: normalizedWebUrl,
              emailVerificationCode,
              // For testing: set emailVerified to true to bypass email verification
              emailVerified: true,
              CNICImage: req.file ? req.file.filename : null
            });
            
            console.log("Organization created successfully:", newOrg.email);
            
            // For testing: generate verification file immediately
            newOrg.organizationVerificationCode = genrateUniqueCode();
            await newOrg.save();
            generateVerificationFile(newOrg);
            
            // Return verification URL for testing
            const verificationUrl = `http://localhost:3001/verify?code=${emailVerificationCode}`;
            
            res.status(200).json({
              msg: "Organization registered successfully! For testing, email verification is bypassed.",
              verificationUrl: verificationUrl
            });
          } catch (err) {
            console.error("Error creating organization:", err);
            res.status(400).json({ msg: err.message });
          }
        });
      });
    } catch (emailError) {
      console.error("Error in email/registration process:", emailError);
      return res.status(500).json({ 
        msg: "Failed to complete registration. Please try again later.",
        error: emailError.message
      });
    }
  } catch (err) {
    console.error("Server error during registration:", err);
    res.status(500).json({ msg: "Server Error!" });
  }
});
router.get("/verify", async (req, res) => {
  const emailVerificationCode = req.query.code;
  console.log("verificarionCode:", emailVerificationCode);
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
      process.env.JWT_SECRET_KEY || config.jwtSecretKey
    );
    res.cookie("token", token, { httpOnly: true });
    // console.log("token : ",token);
    res.status(200).json({ msg: "Email verified!" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error!" });
  }
});
router.get("/download", cookieReader, async (req, res) => {
  console.log(req.organization);

  const foundOrganization = await Organization.findById(
    req.organization.organization_id
  );

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

router.post("/login", async (req, res) => {
<<<<<<< HEAD
  const { email, password } = req.body;
  const foundUser = await Organization.findOne({ email });
  if (!user) return res.status(400).json({ msg: "User not found!" });
  bcrypt.compare(password, foundUser.password, (err, same) => {
    if (err) return res.status(500).json({ msg: "Server Error!" });
    if (!same) return res.status(400).json({ msg: "Invalid credentials" });
    const token = jwt.sign(
      {
        organization_id: foundUser._id,
        email: foundUser.email,
        role: foundUser.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.cookie("token", token);
    res.status(200).json({ msg: "Organization found!" });
  });
});
function cookieReader(req, res, next) {
  try {
    const token = req.cookies.token;
    console.log("token", token);

    if (token === "") res.status(500).json({ msg: "TOKEN EXPIRED!" });
    const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.organization = data;
    next();
  } catch (error) {
    res.status(401).json({ msg: error.message });
=======
  const { email, password } = req.body
  
  try {
    const foundUser = await Organization.findOne({ email })
    
    if (!foundUser) {
      return res.status(400).json({ msg: "User not found!" })
    }
    
    // For testing: If email is not verified, automatically verify it
    if (!foundUser.emailVerified) {
      console.log("Auto-verifying email for testing purposes");
      foundUser.emailVerified = true;
      
      // Generate verification code if needed
      if (!foundUser.organizationVerificationCode) {
        foundUser.organizationVerificationCode = genrateUniqueCode();
        generateVerificationFile(foundUser);
      }
      
      await foundUser.save();
    }
    
    // For testing: If organization is not verified by admin, automatically verify it
    if (!foundUser.organizationVerified) {
      console.log("Auto-approving organization for testing purposes");
      foundUser.organizationVerified = true;
      await foundUser.save();
    }
    
    bcrypt.compare(password, foundUser.password, (err, same) => {
      if (err) return res.status(500).json({ msg: 'Server Error!' })
      if (!same) return res.status(400).json({ msg: 'Invalid credentials' });
      
      const token = jwt.sign({
        organization_id: foundUser._id,
        email: foundUser.email,
        role: foundUser.role
      }, process.env.JWT_SECRET_KEY || config.jwtSecretKey, { expiresIn: "1h" })
      
      res.cookie("token", token)
      res.status(200).json({ 
        msg: "Login successful",
        user: {
          id: foundUser._id,
          name: foundUser.organization_name,
          email: foundUser.email,
          role: foundUser.role
        }
      })
    })
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server Error!" });
  }
})

// New route for document upload by organizations
router.post("/upload-document", isOrganization, uploadDocument.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ msg: "Title and description are required" });
    }

    const newDocument = await Document.create({
      title,
      description,
      filePath: req.file.path,
      fileType: path.extname(req.file.originalname).substring(1),
      uploadedBy: req.user.id
    });

    return res.status(200).json({ 
      msg: "Document uploaded successfully", 
      document: {
        id: newDocument._id,
        title: newDocument.title,
        status: newDocument.status
      } 
    });
  } catch (error) {
    console.error("Document upload error:", error);
    return res.status(500).json({ msg: "Server error during document upload" });
  }
});

// Get all documents uploaded by the organization
router.get("/my-documents", isOrganization, async (req, res) => {
  try {
    const documents = await Document.find({ uploadedBy: req.user.id });
    return res.status(200).json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return res.status(500).json({ msg: "Server error while fetching documents" });
  }
});

// Get a specific document by ID
router.get("/document/:id", isOrganization, async (req, res) => {
  try {
    const document = await Document.findOne({ 
      _id: req.params.id,
      uploadedBy: req.user.id 
    });
    
    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }
    
    return res.status(200).json({ document });
  } catch (error) {
    console.error("Error fetching document:", error);
    return res.status(500).json({ msg: "Server error while fetching document" });
  }
});

function cookieReader(req, res, next) {
  try {
    const token = req.cookies.token;
    console.log("Token from cookies:", token);

    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }
    
    try {
      const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.organization = data;
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return res.status(401).json({ msg: "Invalid token" });
    }
  } catch (error) {
    console.error("Cookie reading error:", error);
    return res.status(401).json({ msg: error.message });
>>>>>>> 9ec19e7824c140c58112ea97feecf77bb1df964c
  }
}
module.exports = router;
