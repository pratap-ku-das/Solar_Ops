const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const projectRoutes = require("./routes/projectRoutes");
const customerRoutes = require("./routes/customerRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const stockRoutes = require("./routes/stockRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const userRoutes = require("./routes/userRoutes");
const systemRoutes = require("./routes/systemRoutes");

const app = express();
const clientDistPath = path.join(__dirname, "../../client/dist");
const isProduction = process.env.NODE_ENV === "production";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Solar PM API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/system", systemRoutes);

if (isProduction) {
  app.use(express.static(clientDistPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    return res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
