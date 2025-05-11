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
const studentDocumentsRoutes = require("./routes/studentDocument");
const bulkUploadRoute = require("./routes/csvUploadRoutes");
const path = require("path");
const sendCertificateRoute = require("./routes/sendCertificate");
const chatRoutes = require("./routes/chatRoutes");

connectDB();
app.use(cookieParser());
// app.use(
//   cors({
//     origin: "http://localhost:3001",
//     credentials: true,
//   })
// );
const allowedOrigins = [
  'http://localhost:3001',
  'http://192.168.100.3:3001',
  'http://172.0.6.207:3001',
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/uploads', express.static('uploads'));
app.use('/uploads', cors({ origin: 'http://localhost:3001' }), express.static(path.join(__dirname, 'uploads')));

app.get('/test-cors', cors({ origin: 'http://localhost:3001' }), (req, res) => {
  res.json({ message: "CORS working!" });
});


app.use("/api/chat", chatRoutes);

app.use("/api/student-documents", studentDocumentsRoutes);
app.use("/api", sendCertificateRoute);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

app.use("/api", bulkUploadRoute);

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

app.use(fileErrorHandler);
app.use((error,req, res, next) => {
  res.status(404).json({ message:error.message });
});

app.listen(config.port, () => {
  console.log(`Server is running on Port: ${config.port}`);
});
