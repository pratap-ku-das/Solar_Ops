const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");
const { demoUsers, createId } = require("../data/sampleData");

const router = express.Router();

const formatUser = (user) => ({
  id: user._id || user.id,
  name: user.name,
  company: user.company || "",
  email: user.email,
  role: user.role,
  phone: user.phone || "",
  designation: user.designation || "",
  isActive: user.isActive !== false,
  createdAt: user.createdAt
});

router.get("/", protect, authorize("admin"), async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const query = req.user.company ? { company: req.user.company } : {};
    const users = await User.find(query).sort({ createdAt: -1 }).lean();
    return res.json(users.map(formatUser));
  }

  const users = req.user.company ? demoUsers.filter((item) => item.company === req.user.company) : demoUsers;
  return res.json(users.map(formatUser));
});

router.post("/", protect, authorize("admin"), async (req, res) => {
  const { name, company, email, password, role, phone, designation } = req.body;

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
      company: company || req.user.company || "",
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
    company: company || req.user.company || "",
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

router.put("/:id", protect, authorize("admin"), async (req, res) => {
  const { name, phone, designation, role } = req.body;
  const userId = req.params.id;

  if (!name) {
    return res.status(400).json({ message: "Name is required." });
  }

  const safeRole = ["admin", "operations", "bdm"].includes(role) ? role : "bdm";

  if (mongoose.connection.readyState === 1) {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure admin can only edit users in their company
    if (user.company !== req.user.company) {
      return res.status(403).json({ message: "Access denied. Cannot edit users from another company." });
    }

    user.name = name;
    user.phone = phone || "";
    user.designation = designation || "";
    user.role = safeRole;
    
    await user.save();
    return res.json(formatUser(user));
  }

  // Demo mode
  const user = demoUsers.find((item) => String(item._id) === String(userId));
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (user.company !== req.user.company) {
    return res.status(403).json({ message: "Access denied. Cannot edit users from another company." });
  }

  user.name = name;
  user.phone = phone || "";
  user.designation = designation || "";
  user.role = safeRole;

  return res.json(formatUser(user));
});

router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  const targetUserId = String(req.params.id);

  if (String(req.user.id) === targetUserId) {
    return res.status(400).json({ message: "You cannot delete your own account." });
  }

  if (mongoose.connection.readyState === 1) {
    const query = { _id: targetUserId };

    if (req.user.company) {
      query.company = req.user.company;
    }

    const deletedUser = await User.findOneAndDelete(query);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ message: "User deleted successfully." });
  }

  const userIndex = demoUsers.findIndex((item) => String(item._id) === targetUserId && (!req.user.company || item.company === req.user.company));

  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found." });
  }

  demoUsers.splice(userIndex, 1);
  return res.json({ message: "User deleted successfully." });
});

module.exports = router;
