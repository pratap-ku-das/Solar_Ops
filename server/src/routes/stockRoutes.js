const express = require("express");
const mongoose = require("mongoose");
const Stock = require("../models/Stock");
const { protect, authorize } = require("../middleware/authMiddleware");
const { demoStock, createId } = require("../data/sampleData");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const company = req.user.company || "";
  const items = mongoose.connection.readyState === 1 ? await Stock.find(company ? { company } : {}).sort({ createdAt: -1 }) : [...demoStock].reverse().filter((item) => !company || item.company === company);
  res.json(items);
});

router.post("/", protect, authorize("admin", "operations"), async (req, res) => {
  const payload = {
    ...req.body,
    company: req.user.company || req.body.company || "",
    availableQuantity: Number(req.body.availableQuantity || 0),
    stockIn: Number(req.body.stockIn || 0),
    stockOut: Number(req.body.stockOut || 0)
  };

  if (mongoose.connection.readyState === 1) {
    const item = await Stock.create(payload);
    return res.status(201).json(item);
  }

  const item = { _id: createId(), ...payload, createdAt: new Date().toISOString() };
  demoStock.push(item);
  res.status(201).json(item);
});

router.put("/:id/movement", protect, authorize("admin", "operations"), async (req, res) => {
  const quantity = Number(req.body.quantity || 0);
  const type = req.body.type || "out";

  if (mongoose.connection.readyState === 1) {
    const item = await Stock.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Stock item not found." });

    if (type === "in") {
      item.stockIn += quantity;
      item.availableQuantity += quantity;
    } else {
      item.stockOut += quantity;
      item.availableQuantity -= quantity;
    }

    await item.save();
    return res.json(item);
  }

  const item = demoStock.find((stock) => String(stock._id) === String(req.params.id));
  if (!item) return res.status(404).json({ message: "Stock item not found." });

  if (type === "in") {
    item.stockIn += quantity;
    item.availableQuantity += quantity;
  } else {
    item.stockOut += quantity;
    item.availableQuantity -= quantity;
  }

  res.json(item);
});

module.exports = router;
