const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Company = require("../models/Company");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getUserFromRequest = async (req) => {
  const userId = req.user?.id;

  if (userId && isValidObjectId(userId)) {
    const byId = await User.findById(userId);
    if (byId) return byId;
  }

  if (req.user?.email) {
    const byEmail = await User.findOne({ email: req.user.email.toLowerCase() });
    if (byEmail) return byEmail;
  }

  if (req.user?.company) {
    const byCompany = await User.findOne({ company: req.user.company });
    if (byCompany) return byCompany;
  }

  return null;
};

router.get("/status", protect, async (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  const userCount = databaseConnected ? await User.countDocuments() : 0;

  res.json({
    databaseConnected,
    mode: databaseConnected ? "database" : "demo",
    publicRegistrationEnabled: process.env.ALLOW_PUBLIC_REGISTRATION === "true",
    remindersEnabled: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
    storage: "local-uploads",
    userCount,
    environment: process.env.NODE_ENV || "development"
  });
});

const getDefaultSettings = (user, company) => ({
  profile: {
    fullName: user?.name || "Company Admin",
    role: user?.designation || "Super Admin",
    email: user?.email || "",
    phone: user?.phone || "",
    companyName: company?.companyName || user?.company || "SunBright Energy Pvt Ltd",
    logo: company?.logo || "",
    gstNumber: company?.gstNumber || "",
    officeAddress: company?.address || "",
    timezone: "Asia/Kolkata",
    language: "English (India)"
  },
  account: {
    storageUsedGb: 82,
    storageTotalGb: 500,
    teamMembersActive: 18,
    projectsManaged: 142,
    subscriptionPlan: "Enterprise",
    apiUsagePct: 68,
    whatsappCreditsRemaining: 12480,
    monthlyLoginActivity: [34, 41, 38, 44, 47, 28, 25]
  },
  storage: {
    documentsGb: 38,
    invoicesGb: 12,
    customerUploadsGb: 19,
    backupFilesGb: 9,
    systemCacheGb: 4,
    autoDeleteTempFiles: true,
    cloudBackupRetentionDays: 90
  },
  security: {
    twoFactorAuth: true,
    loginAlerts: true,
    deviceSessionManagement: true,
    passwordExpiry: false,
    ipWhitelisting: false,
    auditLogs: true,
    sessionTimeoutMinutes: 30
  },
  notifications: {
    emailNotifications: true,
    whatsappAlerts: true,
    invoiceReminders: true,
    discomUpdates: true,
    subsidyAlerts: true,
    installationNotifications: true,
    teamActivityNotifications: false
  },
  automation: {
    autoInvoiceGeneration: true,
    autoProjectAssignment: true,
    installationScheduling: true,
    paymentReminderAutomation: true,
    subsidyFollowupAutomation: true,
    autoBackup: true,
    dailyReportsEmail: true
  },
  preferences: {
    darkMode: false,
    compactDashboardLayout: false,
    defaultDashboardView: "Pipeline First",
    currencyFormat: "INR (₹)",
    dateFormat: "DD/MM/YYYY",
    languageSelection: "English (India)",
    themeAccentColor: "Emerald"
  },
  integrations: {
    razorpay: "Connected",
    gmailSmtp: "Active",
    whatsappApi: "Connected",
    awsS3: "Connected",
    googleMapsApi: "Enabled",
    mongodbAtlas: "Healthy"
  },
  backup: {
    lastBackup: "Today 02:00 AM",
    backupFrequency: "Daily",
    backupStatus: "Successful",
    disasterRecovery: "Enabled"
  },
  bankDetails: {
    accountName: company?.bankDetails?.accountName || company?.companyName || user?.company || "",
    bankName: company?.bankDetails?.bankName || "",
    accountNumber: company?.bankDetails?.accountNumber || "",
    ifscCode: company?.bankDetails?.ifscCode || "",
    branch: company?.bankDetails?.branch || "",
    upiId: company?.bankDetails?.upiId || ""
  }
});

const deepMerge = (base, override) => {
  if (!override || typeof override !== "object") return base;
  const output = { ...base };
  Object.keys(override).forEach((key) => {
    const incoming = override[key];
    if (incoming && typeof incoming === "object" && !Array.isArray(incoming) && typeof base[key] === "object" && base[key] !== null) {
      output[key] = deepMerge(base[key], incoming);
    } else {
      output[key] = incoming;
    }
  });
  return output;
};

const getUserCompany = async (user) => {
  if (user?.companyId) {
    const byId = await Company.findById(user.companyId);
    if (byId) return byId;
  }
  if (user?.company) {
    return Company.findOne({ companyName: user.company });
  }
  return null;
};

const migrateCompanyName = async (oldName, newName) => {
  if (!oldName || !newName || oldName === newName) {
    return;
  }

  const collections = [
    User,
    require("../models/Project"),
    require("../models/Customer"),
    require("../models/Expense"),
    require("../models/Invoice"),
    require("../models/Stock"),
    require("../models/Lead"),
    require("../models/Document"),
    require("../models/LeadAuditLog")
  ];

  await Promise.all(
    collections.map((Model) =>
      Model.updateMany({ company: oldName }, { $set: { company: newName } })
    )
  );
};

router.get("/settings", protect, async (req, res) => {
  const user = await getUserFromRequest(req);
  const company = await getUserCompany(user);
  const defaults = getDefaultSettings(user, company);
  const stored = company?.systemSettings || {};
  const merged = deepMerge(defaults, stored);
  return res.json(merged);
});

router.put("/settings", protect, async (req, res) => {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(404).json({ message: "User not found" });

  let company = await getUserCompany(user);
  const previousCompanyName = company?.companyName || user.company || "";
  if (!company) {
    company = await Company.create({
      companyName: user.company || "SunBright Energy Pvt Ltd",
      email: user.email || "",
      phone: user.phone || ""
    });
    user.companyId = company._id;
    user.company = company.companyName;
  }

  const payload = req.body || {};
  const defaults = getDefaultSettings(user.toObject(), company.toObject());
  const mergedIncoming = deepMerge(defaults, payload);

  company.companyName = mergedIncoming.profile.companyName || company.companyName;
  company.email = mergedIncoming.profile.email || company.email;
  company.phone = mergedIncoming.profile.phone || company.phone;
  company.logo = mergedIncoming.profile.logo || company.logo;
  company.gstNumber = mergedIncoming.profile.gstNumber || company.gstNumber;
  company.address = mergedIncoming.profile.officeAddress || company.address;
  company.bankDetails = {
    accountName: mergedIncoming.bankDetails?.accountName || "",
    bankName: mergedIncoming.bankDetails?.bankName || "",
    accountNumber: mergedIncoming.bankDetails?.accountNumber || "",
    ifscCode: mergedIncoming.bankDetails?.ifscCode || "",
    branch: mergedIncoming.bankDetails?.branch || "",
    upiId: mergedIncoming.bankDetails?.upiId || ""
  };
  company.systemSettings = mergedIncoming;

  user.name = mergedIncoming.profile.fullName || user.name;
  user.phone = mergedIncoming.profile.phone || user.phone;
  user.designation = mergedIncoming.profile.role || user.designation;
  user.company = mergedIncoming.profile.companyName || user.company;

  await Promise.all([company.save(), user.save()]);

  await migrateCompanyName(previousCompanyName, company.companyName);

  return res.json(mergedIncoming);
});

module.exports = router;
