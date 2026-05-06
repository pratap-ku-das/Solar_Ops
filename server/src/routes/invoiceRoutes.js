
const express = require("express");
const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const { protect, authorize } = require("../middleware/authMiddleware");
const { demoInvoices, createId } = require("../data/sampleData");

const router = express.Router();

// Update invoice
router.put(":id", protect, authorize("admin", "bdm"), async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json(invoice);
  }
  res.status(501).json({ message: "Demo mode: update not supported" });
});

// Add payment to invoice
router.post(":id/payments", protect, authorize("admin", "bdm"), async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    invoice.payments = invoice.payments || [];
    invoice.payments.push({ amount: req.body.amount, date: req.body.date });
    await invoice.save();
    return res.json(invoice);
  }
  res.status(501).json({ message: "Demo mode: payment not supported" });
});

router.get("/", protect, async (req, res) => {
  const invoices = mongoose.connection.readyState === 1 ? await Invoice.find().sort({ createdAt: -1 }) : [...demoInvoices].reverse();
  res.json(invoices);
});

router.post("/", protect, authorize("admin", "bdm"), async (req, res) => {
  const payload = {
    ...req.body,
    amount: Number(req.body.amount || 0),
    invoiceNumber: req.body.invoiceNumber || `INV-${Date.now()}`
  };

  if (mongoose.connection.readyState === 1) {
    const invoice = await Invoice.create(payload);
    return res.status(201).json(invoice);
  }

  const invoice = { _id: createId(), ...payload, createdAt: new Date().toISOString() };
  demoInvoices.push(invoice);
  res.status(201).json(invoice);
});

module.exports = router;
