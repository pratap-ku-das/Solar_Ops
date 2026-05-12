const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const Project = require("../models/Project");
const Customer = require("../models/Customer");
const Document = require("../models/Document");
const { protect, authorize } = require("../middleware/authMiddleware");
const { sendReminderEmail } = require("../utils/emailService");
const { PIPELINE_STAGES, demoProjects, demoCustomers, createId } = require("../data/sampleData");
const sendWhatsApp =
require("../utils/sendWhatsApp");
const router = express.Router();

const generateProjectCode = () => `PRJ-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`)
});

const upload = multer({ storage });

router.get("/pipeline/stages", protect, (req, res) => {
  res.json(PIPELINE_STAGES);
});

router.get("/export/csv", protect, async (req, res) => {
  const company = req.user.company || "";
  const projects = mongoose.connection.readyState === 1 ? await Project.find(company ? { company } : {}).lean() : demoProjects.filter((item) => !company || item.company === company);
  const headers = ["Customer Name", "Mobile", "DISCOM", "Project Size", "Type", "Cost", "Status"];
  const rows = projects.map((project) => [
    project.customerName,
    project.mobileNumber,
    project.discom,
    project.projectSize,
    project.projectType,
    project.projectCost,
    project.status
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=projects.csv");
  res.send(csv);
});

router.get("/", protect, async (req, res) => {
  const { search = "", status = "", discom = "" } = req.query;
  const useDatabase = mongoose.connection.readyState === 1;
  const company = req.user.company || "";

  let projects = useDatabase ? await Project.find(company ? { company } : {}).sort({ createdAt: -1 }).lean() : [...demoProjects].reverse().filter((item) => !company || item.company === company);

  projects = projects.filter((project) => {
    const matchesSearch =
      !search ||
      [project.customerName, project.name, project.mobileNumber, project.consumerNumber]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(String(search).toLowerCase()));

    const matchesStatus = !status || project.status === status;
    const matchesDiscom = !discom || project.discom === discom;

    return matchesSearch && matchesStatus && matchesDiscom;
  });

  res.json(projects);
});

router.get("/:id", protect, async (req, res) => {
  const project = mongoose.connection.readyState === 1
    ? await Project.findOne({ _id: req.params.id, ...(req.user.company ? { company: req.user.company } : {}) }).lean()
    : demoProjects.find((item) => String(item._id) === String(req.params.id) && (!req.user.company || item.company === req.user.company));

  if (!project) return res.status(404).json({ message: "Project not found." });
  res.json(project);
});

router.post("/", protect, authorize("admin", "bdm"), async (req, res) => {
  const company = req.user.company || req.body.company || "";
  const payload = {
    ...req.body,
    company,
    projectCode: req.body.projectCode || generateProjectCode(),
    customerName: req.body.name,
    mobileNumber: req.body.mobileNumber,
    emailAddress: req.body.emailAddress,
    projectCost: Number(req.body.projectCost || 0),
    installedCapacity: parseInt(String(req.body.projectSize || "0").replace(/[^\d]/g, ""), 10) || 0,
    status: req.body.status || "Proposal"
  };

  if (mongoose.connection.readyState === 1) {
    const customer = await Customer.create({
      company,
      name: req.body.name,
      mobileNumber: req.body.mobileNumber,
      emailAddress: req.body.emailAddress,
      discom: req.body.discom,
      address: req.body.address,
      consumerNumber: req.body.consumerNumber,
      leadBy: req.body.leadBy
    });

    const project = await Project.create({ ...payload, customerId: customer._id, documents: [] });
    return res.status(201).json(project);
  }

  const customer = {
    _id: createId(),
    company,
    name: req.body.name,
    mobileNumber: req.body.mobileNumber,
    emailAddress: req.body.emailAddress,
    discom: req.body.discom,
    address: req.body.address,
    consumerNumber: req.body.consumerNumber,
    leadBy: req.body.leadBy,
    createdAt: new Date().toISOString()
  };

  demoCustomers.push(customer);

  const project = {
    _id: createId(),
    ...payload,
    customerId: customer._id,
    documents: [],
    createdAt: new Date().toISOString()
  };

  demoProjects.push(project);
  res.status(201).json(project);
});

router.put(
  "/:id/status",
  protect,
  authorize("admin", "operations", "bdm"),

  async (req, res) => {

    const { status } = req.body;

    if (!PIPELINE_STAGES.includes(status)) {

      return res.status(400).json({
        message: "Invalid pipeline stage."
      });

    }

    // DATABASE MODE

    if (mongoose.connection.readyState === 1) {

      const project =
        await Project.findOne({ _id: req.params.id, ...(req.user.company ? { company: req.user.company } : {}) });

      if (!project) {

        return res.status(404).json({
          message: "Project not found."
        });

      }

      // UPDATE STATUS

      project.status = status;

      await project.save();

      // STAGE MESSAGES

      const stageMessages = {

        Proposal:
          "Your solar proposal has been created.",

        "Document Collection":
          "Document collection process started.",

        "Digital Approval Pending":
          "Your project is waiting for digital approval.",

        "Installation Pending":
          "Installation will start soon.",

        "Inspection Complete":
          "Inspection completed successfully.",

        "Subsidy Disbursed":
          "Your subsidy has been disbursed successfully."

      };

      // WHATSAPP MESSAGE

      const message = `Hello ${project.customerName},

Your solar project status has been updated.

Current Stage:
${project.status}

${stageMessages[project.status] || ""}

Thank you,
Solar Company`;

      // SEND WHATSAPP

      if (project.mobileNumber) {

        await sendWhatsApp(
          project.mobileNumber,
          message
        );

      }

      return res.json(project);

    }

    // DEMO MODE

      const project =
      demoProjects.find(
        (item) =>
          String(item._id) === String(req.params.id) && (!req.user.company || item.company === req.user.company)
      );

    if (!project) {

      return res.status(404).json({
        message: "Project not found."
      });

    }

    project.status = status;

    return res.json(project);

  }
);

router.post("/:id/schedule", protect, authorize("admin", "operations"), async (req, res) => {
  const { installationDate, installationTeam } = req.body;

  let project;
  if (mongoose.connection.readyState === 1) {
    project = await Project.findOne({ _id: req.params.id, ...(req.user.company ? { company: req.user.company } : {}) });
    if (!project) return res.status(404).json({ message: "Project not found." });
    project.installationDate = installationDate;
    project.installationTeam = installationTeam;
    await project.save();
  } else {
    project = demoProjects.find((item) => String(item._id) === String(req.params.id) && (!req.user.company || item.company === req.user.company));
    if (!project) return res.status(404).json({ message: "Project not found." });
    project.installationDate = installationDate;
    project.installationTeam = installationTeam;
  }

  const message = `Installation scheduled for ${project.customerName} on ${installationDate} with ${installationTeam}.`;
  await Promise.allSettled([
    sendReminderEmail({ to: project.emailAddress || "customer@demo.local", subject: "Solar Installation Schedule", text: message }),
    sendReminderEmail({ to: "pratapkudas111@gmail.com", subject: "Assigned Installation Schedule", text: message })
  ]);

  res.json({ message: "Installation scheduled and reminder email triggered.", project });
});

router.post("/:id/documents", protect, authorize("admin", "operations", "bdm"), upload.single("file"), async (req, res) => {
  const documentType = req.body.type || "General Document";
  const documentPayload = {
    type: documentType,
    fileName: req.file?.filename || req.body.fileName || "document.pdf",
    path: req.file ? `/uploads/${req.file.filename}` : req.body.path || "/uploads/document.pdf"
  };

  if (mongoose.connection.readyState === 1) {
    const project = await Project.findOne({ _id: req.params.id, ...(req.user.company ? { company: req.user.company } : {}) });
    if (!project) return res.status(404).json({ message: "Project not found." });

    project.documents.push(documentPayload);
    await project.save();
    await Document.create({
      company: project.company || req.user.company || "",
      projectId: project._id,
      customerId: project.customerId,
      ...documentPayload,
      uploadedBy: req.user.email
    });

    return res.status(201).json({ message: "Document uploaded.", document: documentPayload });
  }

  const project = demoProjects.find((item) => String(item._id) === String(req.params.id) && (!req.user.company || item.company === req.user.company));
  if (!project) return res.status(404).json({ message: "Project not found." });

  project.documents = project.documents || [];
  project.documents.push({ _id: createId(), ...documentPayload });
  res.status(201).json({ message: "Document uploaded.", document: documentPayload });
});

router.delete("/:id", protect, authorize("admin", "operations"), async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const project = await Project.findOneAndDelete({ _id: req.params.id, ...(req.user.company ? { company: req.user.company } : {}) });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    await Document.deleteMany({ projectId: req.params.id, ...(req.user.company ? { company: req.user.company } : {}) });
    return res.json({ message: "Project deleted successfully." });
  }

  const projectIndex = demoProjects.findIndex((item) => String(item._id) === String(req.params.id) && (!req.user.company || item.company === req.user.company));

  if (projectIndex === -1) {
    return res.status(404).json({ message: "Project not found." });
  }

  demoProjects.splice(projectIndex, 1);
  res.json({ message: "Project deleted successfully." });
});

module.exports = router;
