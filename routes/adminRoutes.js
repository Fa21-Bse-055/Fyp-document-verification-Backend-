const router = require("express").Router();
const bcrypt = require("bcrypt");
const http = require("http");
const jwt = require("jsonwebtoken");
const url = require("url");
const Organization = require("../models/organization");
const Admin = require("../models/admin");
const Document = require("../models/document");
const createSuperAdmin = require("../utils/createSuperAdmin");
const { isAdmin, isSuperAdmin } = require("../middleware/auth");
const config = require("../config/config");

router.post("/create-admin", isSuperAdmin, async (req, res) => {
  const { username, email, password } = req.body;
  const foundAdmin = await Admin.findOne({ email });
  if (foundAdmin) return res.status(500).json({ msg: "User already exists!" });
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return res.status(500).json({ msg: "Server Error!" });
    bcrypt.hash(password, salt, async (err, hash) => {
      if (err) return res.status(500).json({ msg: "Server Error!" });
      await Admin.create({
        username,
        email,
        password: hash,
      });
    });
    res.status(200).json({ msg: "Admin Created Successfully!" });
  });
});

router.get("/review", isAdmin, async (req, res) => {
  const unverifiedOrganizations = await Organization.find({
    organizationVerified: false,
    emailVerified: true,
  });
  res.status(200).json(unverifiedOrganizations);
});

router.get("/organizations", isAdmin, async (req, res) => {
  const { status } = req.query;

  let query = {};

  if (status === "pending") {
    query = { organizationVerified: false, emailVerified: true };
  } else if (status === "verified") {
    query = { organizationVerified: true };
  }

  const organizations = await Organization.find(query);
  res.status(200).json(organizations);
});


router.get("/verify/:id", isAdmin, async (req, res) => {
  try {
    const foundOrganization = await Organization.findOne({
      _id: req.params.id,
    });
    
    if (!foundOrganization) {
      return res.status(404).json({ msg: "Organization not found" });
    }
    
    console.log("Organization found:", foundOrganization);
    
    // Make sure the URL has a protocol
    let webUrl = foundOrganization.organization_web_url;
    if (!webUrl.startsWith('http://') && !webUrl.startsWith('https://')) {
      webUrl = 'https://' + webUrl;
    }
    
    // Construct the verification file URL
    const verificationFileUrl = `${webUrl}/verification_code_${foundOrganization.organizationVerificationCode}.txt`;
    console.log("Verification file URL:", verificationFileUrl);
    
    try {
      // Parse the URL properly
      const parsedUrl = new URL(verificationFileUrl);
      console.log("Parsed URL:", parsedUrl);
      
      // Use http module to get the file
      http.get(verificationFileUrl, (resFromServer) => {
        if (resFromServer.statusCode === 200) {
          let data = "";
          console.log("The file exists on the server!");
          
          resFromServer.on("data", (chunk) => {
            data += chunk;
          });
          
          resFromServer.on("end", () => {
            console.log("File content:", data);
            if (data === foundOrganization.fileContent) {
              res.status(200).json({ msg: "File contents matched!" });
            } else {
              res.status(500).json({ msg: "File contents did not match!" });
            }
          });
        } else {
          console.log("File not found, status code:", resFromServer.statusCode);
          res.status(500).json({
            msg: `File not found, status code: ${resFromServer.statusCode}`,
          });
        }
      }).on("error", (err) => {
        console.log("Error occurred:", err.message);
        res.status(500).json({ msg: err.message });
      });
    } catch (err) {
      console.log("Error parsing URL:", err.message);
      res.status(500).json({ msg: "Invalid URL format: " + err.message });
    }
  } catch (err) {
    console.log("Error finding organization:", err.message);
    res.status(500).json({ msg: "Server Error: " + err.message });
  }
});

router.post("/approve/:id", isAdmin, async (req, res) => {
  const foundOrganization = await Organization.findById(req.params.id);
  foundOrganization.organizationVerified = true;
  await foundOrganization.save();
  res.redirect("/api/admin/review");
});

router.post("/reject/:id", isAdmin, async (req, res) => {
  await Organization.findByIdAndDelete(req.params.id);
  res.redirect("/api/admin/review");
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find the admin user
    const foundUser = await Admin.findOne({ email });
    if (!foundUser) {
      return res.status(400).json({ msg: "User not found!" });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    
    // Create JWT token
    const token = jwt.sign(
      {
        id: foundUser._id,
        role: foundUser.role,
        email: foundUser.email,
        username: foundUser.username,
      },
      process.env.JWT_SECRET_KEY || config.jwtSecretKey,
      { expiresIn: "1h" }
    );
    
    // Set cookie and send response
    res.cookie("token", token, { httpOnly: true });
    
    // Return success with user data
    return res.status(200).json({ 
      msg: `Successfully logged in as ${foundUser.role}`,
      user: {
        id: foundUser._id,
        name: foundUser.username,
        email: foundUser.email,
        role: foundUser.role
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ msg: "Server Error!" });
  }
});


router.get("/logout", isAdmin, (req, res) => {
  res.cookie("token", "");
  res.status(200).json({ msg: "Logout" });
});

// New routes for document management

// Get all pending documents for review
router.get("/pending-documents", isAdmin, async (req, res) => {
  try {
    const pendingDocuments = await Document.find({ status: "pending" })
      .populate("uploadedBy", "organization_name email organization_web_url");
    
    return res.status(200).json({ documents: pendingDocuments });
  } catch (error) {
    console.error("Error fetching pending documents:", error);
    return res.status(500).json({ msg: "Server error while fetching documents" });
  }
});

// Get all documents (with optional filter)
router.get("/documents", isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }
    
    const documents = await Document.find(query)
      .populate("uploadedBy", "organization_name email organization_web_url")
      .populate("verifiedBy", "username email");
    
    return res.status(200).json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return res.status(500).json({ msg: "Server error while fetching documents" });
  }
});

// Get specific document by ID
router.get("/document/:id", isAdmin, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("uploadedBy", "organization_name email organization_web_url")
      .populate("verifiedBy", "username email");
    
    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }
    
    return res.status(200).json({ document });
  } catch (error) {
    console.error("Error fetching document:", error);
    return res.status(500).json({ msg: "Server error while fetching document" });
  }
});

// Approve or reject a document
router.put("/document/:id/verify", isAdmin, async (req, res) => {
  try {
    const { status, feedback } = req.body;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: "Invalid status. Use 'approved' or 'rejected'" });
    }
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }
    
    document.status = status;
    document.verifiedBy = req.user.id;
    document.feedback = feedback || "";
    document.updatedAt = Date.now();
    
    await document.save();
    
    return res.status(200).json({ 
      msg: `Document ${status} successfully`,
      document
    });
  } catch (error) {
    console.error("Error verifying document:", error);
    return res.status(500).json({ msg: "Server error while verifying document" });
  }
});

// Get all admins (super-admin only)
router.get("/admins", isSuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find({}, { password: 0 });
    return res.status(200).json({ admins });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return res.status(500).json({ msg: "Server error while fetching admins" });
  }
});

// Delete an admin (super-admin only)
router.delete("/admin/:id", isSuperAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }
    
    if (admin.role === "super-admin") {
      return res.status(403).json({ msg: "Cannot delete a super-admin" });
    }
    
    await Admin.findByIdAndDelete(req.params.id);
    
    return res.status(200).json({ msg: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return res.status(500).json({ msg: "Server error while deleting admin" });
  }
});

module.exports = router;
