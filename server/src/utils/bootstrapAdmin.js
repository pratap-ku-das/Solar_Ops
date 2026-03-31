const mongoose = require("mongoose");
const User = require("../models/User");

const bootstrapAdmin = async () => {
  if (mongoose.connection.readyState !== 1) {
    return null;
  }

  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    return null;
  }

  const admin = await User.create({
    name: process.env.ADMIN_NAME || "Company Admin",
    email: (process.env.ADMIN_EMAIL || "admin@solar.com").toLowerCase(),
    password: process.env.ADMIN_PASSWORD || "admin123",
    role: "admin",
    designation: "System Administrator",
    isActive: true
  });

  console.log(`✅ Default admin account created for ${admin.email}`);
  return admin;
};

module.exports = bootstrapAdmin;
