const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");
const { demoUsers, createId } = require("../data/sampleData");

const router = express.Router();

const formatUser = (user) => ({
  id: user._id || user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || "",
  designation: user.designation || "",
  isActive: user.isActive !== false,
  createdAt: user.createdAt
});

router.get("/", protect, authorize("admin"), async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return res.json(users.map(formatUser));
  }

  return res.json(demoUsers.map(formatUser));
});

router.post("/", protect, authorize("admin"), async (req, res) => {
  const { name, email, password, role, phone, designation } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  const normalizedEmail = email.toLowerCase();
  const safeRole = ["admin", "operations", "bdm"].includes(role) ? role : "bdm";

  if (mongoose.connection.readyState === 1) {
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: "A user with this email already exists." });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: safeRole,
      phone,
      designation,
      isActive: true
    });

    return res.status(201).json(formatUser(user));
  }

  const exists = demoUsers.find((item) => item.email === normalizedEmail);
  if (exists) {
    return res.status(400).json({ message: "A user with this email already exists." });
  }

  const user = {
    _id: createId(),
    name,
    email: normalizedEmail,
    password,
    role: safeRole,
    phone,
    designation,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  demoUsers.push(user);
  return res.status(201).json(formatUser(user));
});

router.put("/:id/status", protect, authorize("admin"), async (req, res) => {
  const isActive = Boolean(req.body.isActive);

  if (mongoose.connection.readyState === 1) {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json(formatUser(user));
  }

  const user = demoUsers.find((item) => String(item._id) === String(req.params.id));
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  user.isActive = isActive;
  return res.json(formatUser(user));
});

module.exports = router;
