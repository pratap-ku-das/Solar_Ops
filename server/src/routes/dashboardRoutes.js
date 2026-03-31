const express = require("express");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Customer = require("../models/Customer");
const Expense = require("../models/Expense");
const { protect } = require("../middleware/authMiddleware");
const { demoProjects, demoCustomers, demoExpenses } = require("../data/sampleData");

const router = express.Router();

router.get("/stats", protect, async (req, res) => {
  const useDatabase = mongoose.connection.readyState === 1;

  const projects = useDatabase ? await Project.find().sort({ createdAt: -1 }).lean() : demoProjects;
  const customers = useDatabase ? await Customer.find().lean() : demoCustomers;
  const expenses = useDatabase ? await Expense.find().lean() : demoExpenses;

  const totalRevenue = projects.reduce((sum, project) => sum + Number(project.projectCost || 0), 0);
  const totalInstalledCapacity = projects.reduce((sum, project) => sum + Number(project.installedCapacity || parseInt(project.projectSize, 10) || 0), 0);

  const recentProjects = projects.slice(0, 5);
  const installationSchedule = projects
    .filter((project) => project.installationDate)
    .slice(0, 5)
    .map((project) => ({
      id: project._id,
      customerName: project.customerName,
      installationDate: project.installationDate,
      team: project.installationTeam,
      status: project.status
    }));

  const pendingTasks = projects
    .filter((project) => !["Subsidy Disbursed", "Installation Complete"].includes(project.status))
    .slice(0, 6)
    .map((project) => ({
      id: project._id,
      title: `${project.customerName} - ${project.status}`,
      dueHint: project.installationDate || "Follow up required"
    }));

  const projectsByStatus = Object.entries(
    projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const expenseTotal = expenses.reduce((sum, item) => sum + Number(item.totalCost || 0), 0);

  res.json({
    totals: {
      totalProjects: projects.length,
      totalCustomers: customers.length,
      totalInstalledCapacity,
      totalRevenue,
      totalExpense: expenseTotal,
      profitEstimate: totalRevenue - expenseTotal
    },
    recentProjects,
    pendingTasks,
    installationSchedule,
    projectsByStatus
  });
});

module.exports = router;
