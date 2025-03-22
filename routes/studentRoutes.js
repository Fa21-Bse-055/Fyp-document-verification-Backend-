require("dotenv").config();
const router = require("express").Router();
const bcrypt = require("bcrypt");
const Student = require("../models/student");
const upload = require("../config/multerconfig");
const { default: axios } = require("axios");
router.post("/register", upload.single(), async (req, res) => {
  try {
    console.log("body : ", req.body);

    const { name, email, password } = req.body;
    const foundStudent = await Student.findOne({
      email: email,
    });
    if (foundStudent) {
      console.log("student found:", foundStudent);
      return res.status(500).json({ msg: "student already exists!" });
    }
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password || "google", salt, async (err, hash) => {
        try {
          await Student.create({
            name,
            email,
            password: hash,
          });
          return res.status(200).json({ msg: "Data Saved Successfully!" });
        } catch (error) {
          console.log(error.message);
          return res.status(500).json({ msg: error.message });
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
});
router.get("/register-with-google", (req, res) => {
  const loginPageUrl = `${process.env.AUTH_URL}?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=email profile`;
  return res.redirect(loginPageUrl);
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.post(
      process.env.TOKEN_URL,
      {
        code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: "authorization_code",
      },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    console.log(response.data);

    const { access_token } = response.data;
    console.log("access_token : ", access_token);

    const user_info = await axios.get(process.env.RESOURCE_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const resFromIR = await axios.post(
      "http://localhost:3000/api/students/register",
      {
        name: user_info.data["name"],
        email: user_info.data["email"],
      }
    );
    return res.send(resFromIR.data);
  } catch (e) {
    return res.status(500).json({ msg: e.response.data.msg });
  }
});

module.exports = router;
