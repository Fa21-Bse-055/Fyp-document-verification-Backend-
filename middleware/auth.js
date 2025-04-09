const jwt = require("jsonwebtoken");
const config = require("../config/config");

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY || config.jwtSecretKey);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ msg: error.message });
  }
};

// Middleware to check if user is an organization
const isOrganization = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY || config.jwtSecretKey);
    if (decodedToken.role !== "organization") {
      return res.status(403).json({ msg: "Access denied. Organizations only." });
    }
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ msg: error.message });
  }
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY || config.jwtSecretKey);
    if (decodedToken.role !== "admin" && decodedToken.role !== "super-admin") {
      return res.status(403).json({ msg: "Access denied. Admins only." });
    }
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ msg: error.message });
  }
};

// Middleware to check if user is a super admin
const isSuperAdmin = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY || config.jwtSecretKey);
    if (decodedToken.role !== "super-admin") {
      return res.status(403).json({ msg: "Access denied. Super Admins only." });
    }
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ msg: error.message });
  }
};

module.exports = {
  isAuthenticated,
  isOrganization,
  isAdmin,
  isSuperAdmin
}; 