require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const express = require("express");
const connectDB = require("./config/dbconfig");
const app = express();
const cors = require("cors");
const fileErrorHandler = require("./middleware/fileErrorHandler");
const cookieParser = require("cookie-parser");

connectDB();
app.use(cookieParser())
app.use(cors({
  origin:'http://localhost:8081',
  credentials:true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use(fileErrorHandler)

app.listen(process.env.PORT, () => {
  console.log(`Server is running on Port: ${process.env.PORT}`);
});
