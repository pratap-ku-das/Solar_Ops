require("dotenv").config();
const fs = require("fs");
const path = require("path");
const app = require("./app");
const connectDB = require("./config/db");
const bootstrapAdmin = require("./utils/bootstrapAdmin");

const PORT = process.env.PORT || 5000;
const uploadsPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const startServer = async () => {
  try {
    const dbConnected = await connectDB();

    if (dbConnected) {
      await bootstrapAdmin();
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
