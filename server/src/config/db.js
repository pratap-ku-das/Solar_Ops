const mongoose = require("mongoose");
const dns = require("dns");

const configureMongoDns = (mongoUri) => {
  if (!mongoUri || !mongoUri.startsWith("mongodb+srv://")) {
    return;
  }

  const servers = (process.env.MONGO_DNS_SERVERS || "8.8.8.8,1.1.1.1")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!servers.length) {
    return;
  }

  try {
    dns.setServers(servers);
    console.log(`ℹ️ Using custom DNS servers for MongoDB SRV lookup: ${servers.join(", ")}`);
  } catch (error) {
    console.error("⚠️ Unable to apply custom DNS servers for MongoDB:", error.message);
  }
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const allowDemoMode = process.env.ALLOW_DEMO_MODE === "true" || process.env.NODE_ENV !== "production";
  const connectOptions = {
    serverSelectionTimeoutMS: 10000,
    family: 4
  };

  configureMongoDns(mongoUri);

  if (!mongoUri) {
    if (allowDemoMode) {
      console.log("ℹ️ No MONGO_URI found. Starting in demo mode with in-memory sample data.");
      return false;
    }

    throw new Error("MONGO_URI is required when demo mode is disabled.");
  }

  try {
    await mongoose.connect(mongoUri, connectOptions);
    console.log("✅ MongoDB connected");
    return true;
  } catch (error) {
    const message = error?.message || "Unknown MongoDB error";

    if (message.includes("querySrv")) {
      console.error("⚠️ MongoDB DNS lookup failed. A non-SRV Atlas URI may be required on this network:", message);
    } else if (message.toLowerCase().includes("whitelist")) {
      console.error("⚠️ MongoDB Atlas blocked this IP. Add the current machine IP in Atlas Network Access:", message);
    } else {
      console.error("⚠️ MongoDB connection failed:", message);
    }

    if (allowDemoMode) {
      console.error("ℹ️ Falling back to demo mode.");
      return false;
    }

    throw error;
  }
};

module.exports = connectDB;
