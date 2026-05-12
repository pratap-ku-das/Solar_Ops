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

  try {
    const admin = await User.create({
      name: process.env.ADMIN_NAME || "Company Admin",
      company: process.env.ADMIN_COMPANY || "Solar PM",
      email: (process.env.ADMIN_EMAIL || "admin@solar.com").toLowerCase(),
      password: process.env.ADMIN_PASSWORD || "admin123",
      role: "admin",
      designation: "System Administrator",
      isActive: true
    });

    console.log(`✅ Default admin account created for ${admin.email}`);
    return admin;
  } catch (error) {
    if (error.code === 11000) {
      console.log("ℹ️ Admin user already exists, skipping bootstrap");
      return null;
    }
    throw error;
  }
};

module.exports = bootstrapAdmin;
