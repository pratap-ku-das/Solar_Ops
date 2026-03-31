const express = require("express");
const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const { protect, authorize } = require("../middleware/authMiddleware");
const { demoCustomers, createId } = require("../data/sampleData");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const customers = mongoose.connection.readyState === 1 ? await Customer.find().sort({ createdAt: -1 }) : [...demoCustomers].reverse();
  res.json(customers);
});

router.post("/", protect, authorize("admin", "bdm"), async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const customer = await Customer.create(req.body);
    return res.status(201).json(customer);
  }

  const customer = { _id: createId(), ...req.body, createdAt: new Date().toISOString() };
  demoCustomers.push(customer);
  res.status(201).json(customer);
});

module.exports = router;
