require("dotenv").config();
const fs = require("fs");
const path = require("path");
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;
const uploadsPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

connectDB().finally(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
