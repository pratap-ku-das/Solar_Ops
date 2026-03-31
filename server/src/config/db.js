const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.log("ℹ️ No MONGO_URI found. Starting in demo mode with in-memory sample data.");
    return false;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected");
    return true;
  } catch (error) {
    console.error("⚠️ MongoDB connection failed. Falling back to demo mode:", error.message);
    return false;
  }
};

module.exports = connectDB;
