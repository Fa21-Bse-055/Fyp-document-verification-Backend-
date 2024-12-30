const router = require("express").Router();
const bcrypt = require("bcrypt");
const http = require("http");
const jwt = require("jsonwebtoken");
const url = require("url");
const Organization = require("../models/organization");
const Admin = require("../models/admin");
const createSuperAdmin = require("../utils/createSuperAdmin");

createSuperAdmin();
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

router.get("/verify/:id", isAdmin, async (req, res) => {
  const foundOrganization = await Organization.findOne({
    _id: req.params.id,
  });
  console.log("unverifiedOrganizations:", foundOrganization);
  const webUrl = `${foundOrganization.organization_web_url}/verification_code_${foundOrganization.organizationVerificationCode}.txt`;
  console.log(webUrl);
  try {
    const webDomain = url.parse(webUrl);
    console.log(webDomain);
    http
      .get(webUrl, (resFromServer) => {
        if (resFromServer.statusCode === 200) {
          let data = "";
          console.log("The file exists on the server!");
          resFromServer.on("data", (chunk) => {
            data += chunk;
          });
          resFromServer.on("end", () => {
            console.log("File content : ", data);
            if (data === foundOrganization.fileContent) {
              res.status(200).json({ msg: "File contents matched!" });
            } else {
              res.status(500).json({ msg: "File contents did not matched!" });
            }
          });
        } else {
          console.log("File not found, status code:", resFromServer.statusCode);
          res.status(500).json({
            msg: `File not found, status code:', ${resFromServer.statusCode}`,
          });
        }
      })
      .on("error", (err) => {
        console.log("Error occured:", err.message);
        res.status(500).json({ msg: err.message });
      });
  } catch (err) {
    console.log("Error occured:", err.message);
    res.status(500).json({ msg: err.message });
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
  const { email, password } = req.body;
  const foundUser = await Admin.findOne({ email });
  if (!foundUser) return res.status(400).json({ msg: "User not found!" });
  bcrypt.compare(password, foundUser.password, (err, same) => {
    if (err) return res.status(500).json({ msg: "Server Error!" });
    if (!same) return res.status(400).json({ msg: "Invalid credentials" });
    const token = jwt.sign(
      {
        admin_id: foundUser._id,
        email: foundUser.email,
        role: foundUser.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.cookie("token", token);
    res
      .status(200)
      .json({ msg: `Successfully logged in as ${foundUser.role}` });
  });
});

router.get("/logout", isAdmin, (req, res) => {
  res.cookie("token", "");
  res.status(200).json({ msg: "Logout" });
});

function isSuperAdmin(req, res, next) {
  try {
    const token = req.cookies.token;
    if (token === "") {
      return res.status(400).json({ msg: "No token, authorization denied" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (decodedToken.role !== "super-admin")
      return res.status(403).json({ msg: "Access denied. Super Admins only." });
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ msg: error.message });
  }
}
function isAdmin(req, res, next) {
  console.log("Hello from Admin");

  try {
    const token = req.cookies.token;
    if (token === "") {
      return res.status(400).json({ msg: "No token, authorization denied" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (decodedToken.role !== "admin" && decodedToken.role !== "super-admin")
      return res.status(403).json({ msg: "Access denied. Admins only." });
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ msg: error.message });
  }
}
module.exports = router;
