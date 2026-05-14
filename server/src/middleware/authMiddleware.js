const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Company = require("../models/Company");
const { demoUsers } = require("../data/sampleData");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Not authorized. Token missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "super-secret-key");

    const attachDemoUser = () => {
      const demoUser = demoUsers.find((item) => item.email === decoded.email);
      req.user = demoUser ? { ...decoded, ...demoUser } : decoded;
      next();
    };

    if (mongoose.connection.readyState !== 1) {
      attachDemoUser();
      return;
    }

    (async () => {
      let user = null;

      if (decoded.id) {
        user = await User.findById(decoded.id).lean();
      }

      if (!user && decoded.email) {
        user = await User.findOne({ email: String(decoded.email).toLowerCase() }).lean();
      }

      if (!user) {
        const company = decoded.companyId ? await Company.findById(decoded.companyId).lean() : null;
        req.user = {
          ...decoded,
          company: company?.companyName || decoded.company || "",
          companyId: company?._id || decoded.companyId || null
        };
        next();
        return;
      }

      const company = user.companyId ? await Company.findById(user.companyId).lean() : null;
      req.user = {
        ...decoded,
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        company: company?.companyName || user.company || decoded.company || "",
        companyId: company?._id || user.companyId || decoded.companyId || null,
        phone: user.phone || "",
        designation: user.designation || "",
        isActive: user.isActive !== false
      };
      next();
    })().catch((error) => {
      console.error("Auth hydration failed:", error.message);
      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(401).json({ message: "Not authorized. Token invalid." });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied for this role." });
  }

  next();
};

module.exports = { protect, authorize };
