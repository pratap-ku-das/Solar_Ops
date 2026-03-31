const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { demoUsers, createId } = require("../data/sampleData");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const allowDemoMode = process.env.ALLOW_DEMO_MODE === "true" || process.env.NODE_ENV !== "production";
const allowPublicRegistration = process.env.ALLOW_PUBLIC_REGISTRATION === "true";

const generateToken = (user) =>
  jwt.sign(
    { id: user._id || user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET || "super-secret-key",
    { expiresIn: "7d" }
  );

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  if (mongoose.connection.readyState === 1) {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "Your account is inactive. Please contact the admin team." });
    }

    return res.json({
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  }

  if (!allowDemoMode) {
    return res.status(503).json({ message: "Database unavailable. Please contact your administrator." });
  }

  const user = demoUsers.find((item) => item.email === email.toLowerCase() && item.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid starter credentials." });
  }

  return res.json({
    token: generateToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  if (mongoose.connection.readyState === 1) {
    const existingUsers = await User.countDocuments();

    if (existingUsers > 0 && !allowPublicRegistration) {
      return res.status(403).json({ message: "Self-registration is disabled. Ask your admin to create an account from the Team page." });
    }

    const normalizedEmail = email.toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ message: "User already exists." });

    const safeRole = existingUsers === 0 ? "admin" : ["operations", "bdm"].includes(role) ? role : "bdm";

    const user = await User.create({ name, email: normalizedEmail, password, role: safeRole, isActive: true });
    return res.status(201).json({
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  }

  if (!allowDemoMode) {
    return res.status(503).json({ message: "Registration is unavailable until the database is connected." });
  }

  const exists = demoUsers.find((item) => item.email === email.toLowerCase());
  if (exists) return res.status(400).json({ message: "Starter user already exists." });

  const safeRole = ["admin", "operations", "bdm"].includes(role) ? role : "bdm";
  const user = { _id: createId(), name, email: email.toLowerCase(), password, role: safeRole, isActive: true };
  demoUsers.push(user);

  return res.status(201).json({
    token: generateToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
