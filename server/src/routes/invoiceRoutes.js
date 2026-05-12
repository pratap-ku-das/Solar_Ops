
const express = require("express");
const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const Company = require("../models/Company");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");
const { demoInvoices, createId } = require("../data/sampleData");

const router = express.Router();

const getUserCompany = async (user) => {
  if (user?.companyId) {
    const byId = await Company.findById(user.companyId).lean();
    if (byId) return byId;
  }
  if (user?.company) {
    return Company.findOne({ companyName: user.company }).lean();
  }
  return null;
};

// Update invoice
router.put("/:id", protect, authorize("admin", "bdm"), async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const invoice = await Invoice.findOneAndUpdate({ _id: req.params.id, ...(req.user.company ? { company: req.user.company } : {}) }, req.body, { new: true });
    return res.json(invoice);
  }
  res.status(501).json({ message: "Demo mode: update not supported" });
});

// Add payment to invoice
router.post("/:id/payments", protect, authorize("admin", "bdm"), async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const invoice = await Invoice.findOne({ _id: req.params.id, ...(req.user.company ? { company: req.user.company } : {}) });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    invoice.payments = invoice.payments || [];
    invoice.payments.push({ amount: req.body.amount, date: req.body.date });
    await invoice.save();
    return res.json(invoice);
  }
  res.status(501).json({ message: "Demo mode: payment not supported" });
});

router.get("/", protect, async (req, res) => {
  const company = req.user.company || "";
  if (mongoose.connection.readyState === 1) {
    const invoices = await Invoice.find(company ? { company } : {})
      .populate("companyId")
      .sort({ createdAt: -1 })
      .lean();

    const companyRecord = await getUserCompany(req.user);

    const enrichedInvoices = invoices.map((invoice) => ({
      ...invoice,
      companyId: invoice.companyId && Object.keys(invoice.companyId || {}).length ? invoice.companyId : companyRecord
    }));

    return res.json(enrichedInvoices);
  }
  const invoices = [...demoInvoices].reverse().filter((item) => !company || item.company === company);
  res.json(invoices);
});

router.post("/", protect, authorize("admin", "bdm"), async (req, res) => {
  const payload = {
    ...req.body,
    company: req.user.company || req.body.company || "",
    amount: Number(req.body.amount || 0),
    invoiceNumber: req.body.invoiceNumber || `INV-${Date.now()}`
  };

  if (mongoose.connection.readyState === 1) {
    // Get user with companyId
    const user = await User.findById(req.user.id).populate("companyId");
    if (user && user.companyId) {
      payload.companyId = user.companyId._id;
    }
    
    const invoice = await Invoice.create(payload);
    const populatedInvoice = await Invoice.findById(invoice._id).populate("companyId");
    return res.status(201).json(populatedInvoice);
  }

  const invoice = { _id: createId(), ...payload, createdAt: new Date().toISOString() };
  demoInvoices.push(invoice);
  res.status(201).json(invoice);
});

module.exports = router;
