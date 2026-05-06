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


// Get customer details, documents, and projects by customer ID
const Document = require("../models/Document");
const Project = require("../models/Project");

router.get("/:id/details", protect, async (req, res) => {
  try {
    const { id } = req.params;
    let customer, documents, projects;
    if (mongoose.connection.readyState === 1) {
      customer = await Customer.findById(id);
      documents = await Document.find({ customerId: id });
      projects = await Project.find({ customerId: id });
    } else {
      // Demo mode: find in-memory
      customer = demoCustomers.find((c) => c._id === id);
      documents = [];
      projects = [];
    }
    res.json({ customer, documents, projects });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customer details" });
  }
});


// Update customer details by ID
router.put("/:id", protect, authorize("admin", "bdm"), async (req, res) => {
  try {
    const { id } = req.params;
    let updatedCustomer;
    if (mongoose.connection.readyState === 1) {
      updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, { new: true });
    } else {
      // Demo mode: update in-memory
      const idx = demoCustomers.findIndex((c) => c._id === id);
      if (idx !== -1) {
        demoCustomers[idx] = { ...demoCustomers[idx], ...req.body };
        updatedCustomer = demoCustomers[idx];
      }
    }
    if (!updatedCustomer) return res.status(404).json({ error: "Customer not found" });
    res.json(updatedCustomer);
  } catch (err) {
    res.status(500).json({ error: "Failed to update customer" });
  }
});

module.exports = router;
