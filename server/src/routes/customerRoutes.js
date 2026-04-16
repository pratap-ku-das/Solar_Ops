const express = require("express");
const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Project = require("../models/Project");
const { protect, authorize } = require("../middleware/authMiddleware");
const { demoCustomers, demoProjects, createId } = require("../data/sampleData");

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

router.delete("/:id", protect, authorize("admin", "bdm", "operations"), async (req, res) => {
  const customerId = req.params.id;

  if (mongoose.connection.readyState === 1) {
    const customer = await Customer.findByIdAndDelete(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found." });

    await Project.deleteMany({ customerId: customer._id });
    return res.json({ message: "Customer and associated projects deleted." });
  }

  const custIndex = demoCustomers.findIndex((c) => String(c._id) === String(customerId));
  if (custIndex === -1) return res.status(404).json({ message: "Customer not found." });

  const deletedCustomer = demoCustomers.splice(custIndex, 1)[0];
  for (let i = demoProjects.length - 1; i >= 0; i--) {
    if (String(demoProjects[i].customerId) === String(deletedCustomer._id)) {
      demoProjects.splice(i, 1);
    }
  }

  res.json({ message: "Customer and associated demo projects removed." });
});

module.exports = router;
