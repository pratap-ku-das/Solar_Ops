const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../models/User");
const Company = require("../models/Company");
const { demoUsers, createId } = require("../data/sampleData");
const { protect } = require("../middleware/authMiddleware");
const { sendReminderEmail } = require("../utils/emailService");

const router = express.Router();
const allowDemoMode = process.env.ALLOW_DEMO_MODE === "true" || process.env.NODE_ENV !== "production";
const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";

const generateToken = (user) =>
  jwt.sign(
    { id: user._id || user.id, name: user.name, company: user.company || "", email: user.email, role: user.role },
    process.env.JWT_SECRET || "super-secret-key",
    { expiresIn: "7d" }
  );

const formatUser = (user) => ({
  id: user._id || user.id,
  name: user.name,
  company: user.company || "",
  email: user.email,
  role: user.role,
  isActive: user.isActive !== false
});

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

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
      user: formatUser(user)
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
    user: formatUser(user)
  });
});

router.post("/register", async (req, res) => {
  const { name, company, email, password, role, address, phone, gstNumber } = req.body;

  if (!name || !company || !email || !password) {
    return res.status(400).json({ message: "Name, company, email, and password are required." });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  if (mongoose.connection.readyState === 1) {
    const normalizedEmail = email.toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ message: "User already exists." });

    const safeRole = ["admin", "operations", "bdm"].includes(role) ? role : "admin";

    // Create company record
    const companyRecord = await Company.create({
      companyName: company,
      address: address || "",
      phone: phone || "",
      email: email || "",
      gstNumber: gstNumber || ""
    });

    // Create user with companyId
    const user = await User.create({ 
      name, 
      company, 
      companyId: companyRecord._id,
      email: normalizedEmail, 
      password, 
      role: safeRole, 
      isActive: true 
    });

    return res.status(201).json({
      token: generateToken(user),
      user: formatUser(user)
    });
  }

  if (!allowDemoMode) {
    return res.status(503).json({ message: "Registration is unavailable until the database is connected." });
  }

  const exists = demoUsers.find((item) => item.email === email.toLowerCase());
  if (exists) return res.status(400).json({ message: "Starter user already exists." });

  const safeRole = ["admin", "operations", "bdm"].includes(role) ? role : "admin";
  const user = { 
    _id: createId(), 
    name, 
    company, 
    companyId: createId(),
    email: email.toLowerCase(), 
    password, 
    role: safeRole, 
    isActive: true 
  };
  demoUsers.push(user);

  return res.status(201).json({
    token: generateToken(user),
    user: formatUser(user)
  });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const normalizedEmail = email.toLowerCase();

  if (mongoose.connection.readyState === 1) {
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.passwordResetToken = hashToken(resetToken);
      user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save({ validateBeforeSave: false });

      const resetLink = `${clientUrl}/reset-password/${resetToken}`;
      await sendReminderEmail({
        to: user.email,
        subject: "Reset your Solar PM password",
        text: `We received a request to reset your Solar PM password.\n\nUse this link within 30 minutes:\n${resetLink}\n\nIf you did not request this, you can ignore this email.`
      });
    }

    return res.json({ message: "If the email exists, a reset link has been sent." });
  }

  if (!allowDemoMode) {
    return res.status(503).json({ message: "Password reset is unavailable until the database is connected." });
  }

  const user = demoUsers.find((item) => item.email === normalizedEmail);
  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
    const resetLink = `${clientUrl}/reset-password/${resetToken}`;

    await sendReminderEmail({
      to: user.email,
      subject: "Reset your Solar PM password",
      text: `Use this link within 30 minutes:\n${resetLink}`
    });
  }

  return res.json({ message: "If the email exists, a reset link has been sent." });
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "New password is required." });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  const tokenHash = hashToken(token);

  if (mongoose.connection.readyState === 1) {
    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Reset token is invalid or has expired." });
    }

    user.password = password;
    user.passwordResetToken = "";
    user.passwordResetExpires = null;
    await user.save();

    return res.json({ message: "Password updated successfully." });
  }

  if (!allowDemoMode) {
    return res.status(503).json({ message: "Password reset is unavailable until the database is connected." });
  }

  const user = demoUsers.find((item) => item.passwordResetToken === tokenHash && item.passwordResetExpires && new Date(item.passwordResetExpires) > new Date());
  if (!user) {
    return res.status(400).json({ message: "Reset token is invalid or has expired." });
  }

  user.password = password;
  user.passwordResetToken = "";
  user.passwordResetExpires = null;

  return res.json({ message: "Password updated successfully." });
});

router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
