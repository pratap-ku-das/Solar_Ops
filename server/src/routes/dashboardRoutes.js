const express = require("express");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Customer = require("../models/Customer");
const Expense = require("../models/Expense");
const Invoice = require("../models/Invoice");
const { protect } = require("../middleware/authMiddleware");
const { PIPELINE_STAGES } = require("../data/sampleData");

const router = express.Router();

router.get("/stats", protect, async (req, res) => {
  const useDatabase = mongoose.connection.readyState === 1;
  const company = req.user.company || "";

  const companyFilter = company ? { company } : {};

  if (!useDatabase) {
    return res.status(503).json({
      error: "DATABASE_UNAVAILABLE",
      message: "Database is not connected. Start the server with a valid MongoDB connection."
    });
  }

  const projects = await Project.find(companyFilter).sort({ createdAt: -1 }).lean();
  const customers = await Customer.find(companyFilter).lean();
  const expenses = await Expense.find(companyFilter).lean();
  const invoices = await Invoice.find(companyFilter).sort({ createdAt: -1 }).lean();

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

  const now = Date.now();
  const stageIndex = (status) => Math.max(0, PIPELINE_STAGES.indexOf(status));
  const progressFromStatus = (status) => {
    const idx = stageIndex(status);
    const denom = Math.max(1, PIPELINE_STAGES.length - 1);
    return Math.round((idx / denom) * 100);
  };

  const stageSlaDays = {
    "Document Collection": 3,
    "Inspection Process": 5,
    "Login Required": 2,
    "Installation Pending": 7,
    "Subsidy Apply Pending": 10,
    "Document Upload in MNRE Portal": 4
  };

  const normalizeToKeyStage = (status) => {
    if (status === "Document Collection") return "Document Collection";
    if (status === "Inspection Process") return "Inspection Process";
    if (status === "Login Required") return "Login Required";
    if (status === "Installation Pending") return "Installation Pending";
    if (
      status === "Subsidy Apply Pending" ||
      status === "Subsidy Redeemed" ||
      status === "Demand Note Generation" ||
      status === "Demand Note Payment Complete" ||
      status === "Document Upload in MNRE Portal" ||
      status === "Inspection Pending / Complete"
    ) {
      return "Subsidy Processing";
    }
    return null;
  };

  const keyStages = ["Document Collection", "Inspection Process", "Login Required", "Installation Pending", "Subsidy Processing"];
  const keyStageCounts = keyStages.reduce((acc, k) => ({ ...acc, [k]: 0 }), {});
  const keyStageDelays = keyStages.reduce((acc, k) => ({ ...acc, [k]: 0 }), {});

  for (const p of projects) {
    const k = normalizeToKeyStage(p.status);
    if (!k) continue;
    keyStageCounts[k] += 1;
    const sla = stageSlaDays[p.status] ?? stageSlaDays[k] ?? 5;
    const createdAt = p.createdAt ? new Date(p.createdAt).getTime() : now;
    const ageDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    if (ageDays > sla) keyStageDelays[k] += 1;
  }

  const pipelineAnalytics = keyStages.map((k, idx) => {
    const projectsInStage = keyStageCounts[k];
    const prev = idx === 0 ? projectsInStage : keyStageCounts[keyStages[idx - 1]];
    const conversionPct = prev ? Math.round((projectsInStage / prev) * 100) : 0;
    const trendBase = 55 + Math.min(35, Math.round((projectsInStage / Math.max(1, projects.length)) * 100));
    const trend = Math.max(45, Math.min(92, trendBase));
    const funnelPct = idx === 0 ? 100 : Math.round((projectsInStage / Math.max(1, keyStageCounts[keyStages[0]])) * 100);

    return {
      stage: k,
      projects: projectsInStage,
      conversionPct,
      delays: keyStageDelays[k],
      trend,
      funnelPct
    };
  });

  const recentProjectsEnhanced = projects.slice(0, 4).map((p) => ({
    id: p._id,
    customer: p.customerName,
    size: p.projectSize,
    type: p.projectType,
    discom: p.discom,
    stage: p.status,
    progress: progressFromStatus(p.status)
  }));

  const pendingProjectTasks = projects
    .filter((p) => ["Document Collection", "Inspection Process", "Login Required"].includes(p.status))
    .slice(0, 3)
    .map((p) => {
      const sla = stageSlaDays[p.status] ?? 3;
      const createdAt = p.createdAt ? new Date(p.createdAt).getTime() : now;
      const due = new Date(createdAt + sla * 24 * 60 * 60 * 1000);
      return {
        id: p._id,
        title: p.customerName,
        stage: p.status,
        detail: p.status === "Login Required" ? "Consumer OTP / lender portal login pending" : "Operational follow-up required",
        priority: p.status === "Inspection Process" ? "high" : "medium",
        due: due.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      };
    });

  const discomDelayCount = projects.filter((p) => ["Inspection Process", "Inspection Pending / Complete"].includes(p.status)).length;
  const discomTask = discomDelayCount
    ? [
        {
          id: "DISCOM",
          title: "DISCOM Approval",
          stage: `${discomDelayCount} Projects`,
          detail: "Inspection / net-metering queue — prioritize escalations by aging",
          priority: discomDelayCount >= 6 ? "critical" : "high",
          due: new Date(now + 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        }
      ]
    : [];

  const pendingInvoices = invoices.filter((i) => i.status === "Pending" || i.status === "Overdue");
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const invoiceTask = pendingAmount
    ? [
        {
          id: "INVOICE",
          title: "Invoice Follow-up",
          stage: `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(pendingAmount)} Pending`,
          detail: "Receivables follow-up for pending / overdue invoices",
          priority: pendingInvoices.some((i) => i.status === "Overdue") ? "high" : "medium",
          due: new Date(now + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        }
      ]
    : [];

  const pendingTasksEnhanced = [...pendingProjectTasks, ...discomTask, ...invoiceTask].slice(0, 5);

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
    pipelineAnalytics,
    recentProjects: recentProjectsEnhanced,
    pendingTasks: pendingTasksEnhanced,
    installationSchedule,
    projectsByStatus
  });
});

module.exports = router;
