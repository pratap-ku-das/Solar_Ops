const express = require("express");
const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const Project = require("../models/Project");
const { protect, authorize } = require("../middleware/authMiddleware");
const { demoExpenses, demoProjects, createId } = require("../data/sampleData");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const expenses = mongoose.connection.readyState === 1 ? await Expense.find().sort({ createdAt: -1 }).lean() : [...demoExpenses].reverse();
  const projects = mongoose.connection.readyState === 1 ? await Project.find().lean() : demoProjects;

  const enriched = expenses.map((expense) => {
    const project = projects.find((item) => String(item._id) === String(expense.projectId) || item.name === expense.projectName);
    const projectCost = Number(project?.projectCost || 0);
    return {
      ...expense,
      totalCost: Number(expense.totalCost || 0),
      projectCost,
      profitOrLoss: projectCost - Number(expense.totalCost || 0)
    };
  });

  res.json(enriched);
});

router.post("/", protect, authorize("admin", "operations"), async (req, res) => {
  const materialCost = Number(req.body.materialCost || 0);
  const laborCost = Number(req.body.laborCost || 0);
  const transportCost = Number(req.body.transportCost || 0);
  const payload = {
    ...req.body,
    totalCost: materialCost + laborCost + transportCost
  };

  if (mongoose.connection.readyState === 1) {
    const expense = await Expense.create(payload);
    return res.status(201).json(expense);
  }

  const expense = { _id: createId(), ...payload, createdAt: new Date().toISOString() };
  demoExpenses.push(expense);
  res.status(201).json(expense);
});

module.exports = router;
