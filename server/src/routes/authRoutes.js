const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { demoUsers, createId } = require("../data/sampleData");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

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

    return res.json({
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  }

  const user = demoUsers.find((item) => item.email === email.toLowerCase() && item.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid demo credentials." });
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
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "User already exists." });

    const user = await User.create({ name, email: email.toLowerCase(), password, role: role || "bdm" });
    return res.status(201).json({
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  }

  const exists = demoUsers.find((item) => item.email === email.toLowerCase());
  if (exists) return res.status(400).json({ message: "Demo user already exists." });

  const user = { _id: createId(), name, email: email.toLowerCase(), password, role: role || "bdm" };
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
