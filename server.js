const express = require("express");
const app = express();
const PORT = 5000;
require("dotenv").config();
const pool = require("./config/database");

app.use(express.json());

app.get("/test", (req, res) => {
  res.send("Server is working ✅");
});

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");
const chatRoutes = require("./routes/chatRoutes");
const locationRoutes = require("./routes/locationRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const serviceRoutes = require("./routes/serviceRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/rating", ratingRoutes);
app.use("/api/service", serviceRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("PostgreSQL connection error ❌", err.message);
    process.exit(1);
  } else {
    console.log("Connected to PostgreSQL ✅");
    release();
  }
});