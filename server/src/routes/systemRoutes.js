const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/status", protect, async (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  const userCount = databaseConnected ? await User.countDocuments() : 0;

  res.json({
    databaseConnected,
    mode: databaseConnected ? "database" : "demo",
    publicRegistrationEnabled: process.env.ALLOW_PUBLIC_REGISTRATION === "true",
    remindersEnabled: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
    storage: "local-uploads",
    userCount,
    environment: process.env.NODE_ENV || "development"
  });
});

module.exports = router;
