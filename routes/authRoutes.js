const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Organization = require("../models/organization");
const Admin = require("../models/admin");
const { isAuthenticated } = require("../middleware/auth");
const config = require("../config/config");

// Organization login route
router.post("/organization/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }
    
    const organization = await Organization.findOne({ email: email.toLowerCase() });
    
    if (!organization) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }
    
    if (!organization.emailVerified || !organization.organizationVerified) {
      return res.status(401).json({ 
        msg: "Your organization is not verified yet",
        emailVerified: organization.emailVerified,
        organizationVerified: organization.organizationVerified
      });
    }
    
    const isMatch = await bcrypt.compare(password, organization.password);
    
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }
    
    // Create and send JWT token
    const token = jwt.sign(
      { 
        id: organization._id,
        role: organization.role,
        email: organization.email,
        name: organization.organization_name
      },
      process.env.JWT_SECRET_KEY || config.jwtSecretKey,
      { expiresIn: "24h" }
    );
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    return res.status(200).json({
      msg: "Login successful",
      user: {
        id: organization._id,
        name: organization.organization_name,
        email: organization.email,
        role: organization.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ msg: "Server error during login" });
  }
});

// Admin login route
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }
    
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }
    
    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }
    
    // Create and send JWT token
    const token = jwt.sign(
      { 
        id: admin._id,
        role: admin.role,
        email: admin.email,
        username: admin.username
      },
      process.env.JWT_SECRET_KEY || config.jwtSecretKey,
      { expiresIn: "24h" }
    );
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    return res.status(200).json({
      msg: "Login successful",
      user: {
        id: admin._id,
        name: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ msg: "Server error during login" });
  }
});

// Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ msg: "Logged out successfully" });
});

// Get current user info
router.get("/me", isAuthenticated, async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role === 'admin' || req.user.role === 'super-admin') {
      const admin = await Admin.findById(req.user.id).select("-password");
      
      if (!admin) {
        return res.status(404).json({ msg: "Admin not found" });
      }
      
      return res.status(200).json({
        user: {
          id: admin._id,
          name: admin.username,
          email: admin.email,
          role: admin.role
        }
      });
    } 
    // Check if user is an organization
    else if (req.user.role === 'organization') {
      const organization = await Organization.findById(req.user.id).select("-password");
      
      if (!organization) {
        return res.status(404).json({ msg: "Organization not found" });
      }
      
      return res.status(200).json({
        user: {
          id: organization._id,
          name: organization.organization_name,
          email: organization.email,
          role: organization.role,
          organization_web_url: organization.organization_web_url
        }
      });
    }
    
    return res.status(400).json({ msg: "Invalid user role" });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ msg: "Server error while fetching user data" });
  }
});

module.exports = router; 