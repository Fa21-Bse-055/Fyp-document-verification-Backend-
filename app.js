const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const express = require("express");
const connectDB = require("./config/dbconfig");
const config = require("./config/config");
const app = express();
const cors = require("cors");
const fileErrorHandler = require("./middleware/fileErrorHandler");
const cookieParser = require("cookie-parser");
const createSuperAdmin = require("./utils/createSuperAdmin");

connectDB();
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3002",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use(fileErrorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on Port: ${config.port}`);
});
