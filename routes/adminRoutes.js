const router = require("express").Router();
const http = require("http");
const url = require("url");
const Organization = require("../models/organization");

router.get("/review", async (req, res) => {
  const unverifiedOrganizations = await Organization.find({
    organizationVerified: false,
    emailVerified: true,
  });
  res.status(200).json(unverifiedOrganizations);
});

router.get("/verify/:id", async (req, res) => {
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

router.post("approve/:id", async (req, res) => {
  const foundOrganization = await Organization.findById(req.params.id);
  foundOrganization.verified = true;
  await foundOrganization.save();
  res.redirect("/admin/review");
});

router.post("reject/:id", async (req, res) => {
  await Organization.findByIdAndDelete(req.params.id);
  res.redirect("/admin/review");
});

module.exports = router;
