const mongoose = require("mongoose");
const dns = require("dns");
const { MongoMemoryServer } = require("mongodb-memory-server");

let embeddedMongoServer = null;

const configureMongoDns = (mongoUri) => {
  if (!mongoUri || !mongoUri.startsWith("mongodb+srv://")) {
    return;
  }

  const dnsServers = process.env.MONGO_DNS_SERVERS;

  if (!dnsServers) {
    return;
  }

  const servers = dnsServers
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

const startEmbeddedMongo = async (dbName) => {
  if (embeddedMongoServer) {
    return embeddedMongoServer.getUri(dbName);
  }

  embeddedMongoServer = await MongoMemoryServer.create({
    instance: {
      ip: "127.0.0.1",
      port: 27017,
      dbName
    }
  });

  const embeddedUri = embeddedMongoServer.getUri(dbName);
  console.log(`ℹ️ Started embedded MongoDB at ${embeddedUri}`);
  return embeddedUri;
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
    const isLocalMongoUri = mongoUri.startsWith("mongodb://127.0.0.1") || mongoUri.startsWith("mongodb://localhost");

    if (message.includes("querySrv")) {
      console.error("⚠️ MongoDB DNS lookup failed. A non-SRV Atlas URI may be required on this network:", message);
    } else if (message.toLowerCase().includes("whitelist")) {
      console.error("⚠️ MongoDB Atlas blocked this IP. Add the current machine IP in Atlas Network Access:", message);
    } else if (isLocalMongoUri && message.toLowerCase().includes("econnrefused")) {
      console.error("⚠️ Local MongoDB is not running. Start MongoDB Community Server or your Docker container, then reconnect Compass:", message);
    } else {
      console.error("⚠️ MongoDB connection failed:", message);
    }

    if (isLocalMongoUri || allowDemoMode) {
      const fallbackUri = await startEmbeddedMongo("solar_pm");
      await mongoose.connect(fallbackUri, connectOptions);
      console.log("✅ MongoDB connected via embedded local server");
      return true;
    }

    throw error;
  }
};

module.exports = connectDB;
