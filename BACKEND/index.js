require("dotenv").config();

const cors = require("cors");
const express = require("express");
const { google } = require("googleapis");
const mongoose = require("mongoose");
const { convert } = require("html-to-text");
const authRoutes = require("./routes/auth");
const emailRoutes = require("./routes/email");
const analyticsRoutes = require("./routes/analytics");
const aiRoutes = require("./routes/ai.js");
const connectDB = require("./db");
const Email = require("./models/Email");

const redisClient = require("./redisClient");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/emails", emailRoutes);
app.use("/ai", aiRoutes);

// ================= DB =================
connectDB();
mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});


// ================= START =================
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
});