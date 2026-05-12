const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const Lead = require("../models/Lead");
const LeadAuditLog = require("../models/LeadAuditLog");
const Project = require("../models/Project");
const Customer = require("../models/Customer");
const User = require("../models/User");
const Company = require("../models/Company");
const Document = require("../models/Document");
const { protect, authorize } = require("../middleware/authMiddleware");
const { sendReminderEmail } = require("../utils/emailService");
const { demoLeads, demoLeadAuditLogs, demoProjects, demoCustomers, createId } = require("../data/sampleData");

const router = express.Router();
const leadStatuses = ["New", "Qualified", "Site Survey", "Proposal Sent", "Negotiation", "Confirmed", "Lost"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`)
});

const upload = multer({ storage });

const generateLeadCode = () => `LD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
const generateProjectCode = () => `PRJ-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const getCompanyFilter = (user) => {
  const filter = {};
  if (user?.company) filter.company = user.company;
  if (user?.role === "bdm") filter.assignedSalespersonId = user.id || user._id;
  return filter;
};

const pushTimeline = (lead, type, message, actor = {}) => {
  lead.activityTimeline = lead.activityTimeline || [];
  lead.activityTimeline.unshift({ type, message, by: actor.name || actor.email || "System", at: new Date() });
};

const appendAuditLog = async ({ lead, action, fromStatus, toStatus, actor, note = "", metadata = {} }) => {
  const payload = {
    company: lead.company || actor.company || "",
    leadId: lead._id,
    leadCode: lead.leadCode,
    action,
    fromStatus,
    toStatus,
    actorId: actor.id || actor._id || "",
    actorName: actor.name || actor.email || "System",
    actorRole: actor.role || "system",
    note,
    metadata
  };

  if (mongoose.connection.readyState === 1) {
    await LeadAuditLog.create(payload);
    return;
  }

  demoLeadAuditLogs.unshift({ _id: createId(), ...payload, createdAt: new Date().toISOString() });
};

const notifyLeadEvent = async ({ lead, actor, subject, text }) => {
  const recipients = [lead.email, lead.assignedSalespersonEmail, actor?.email]
    .filter(Boolean)
    .filter((email, index, list) => list.indexOf(email) === index);

  await Promise.allSettled(
    recipients.map((email) =>
      sendReminderEmail({
        to: email,
        subject,
        text
      })
    )
  );
};

const canAccessLead = (lead, user) => {
  if (!lead || !user) return false;
  if (user.role === "admin" || user.role === "operations") return true;
  if (user.role === "bdm") {
    return String(lead.assignedSalespersonId || "") === String(user.id || user._id);
  }
  return false;
};

const serializeLead = (lead, auditLogs = []) => ({
  ...lead,
  auditLogs
});

router.get("/", protect, async (req, res) => {
  const { search = "", status = "", source = "", page = 1, limit = 10, sortBy = "createdAt", sortDir = "desc" } = req.query;
  const useDatabase = mongoose.connection.readyState === 1;
  const companyFilter = getCompanyFilter(req.user);

  let leads = useDatabase
    ? await Lead.find(companyFilter).sort({ [sortBy]: sortDir === "asc" ? 1 : -1 }).lean()
    : [...demoLeads].filter((item) => {
        if (companyFilter.company && item.company !== companyFilter.company) return false;
        if (companyFilter.assignedSalespersonId && String(item.assignedSalespersonId) !== String(companyFilter.assignedSalespersonId)) return false;
        return true;
      });

  leads = leads.filter((lead) => {
    const query = String(search).toLowerCase();
    const matchesSearch =
      !query ||
      [lead.leadCode, lead.customerName, lead.phoneNumber, lead.email, lead.address, lead.assignedSalespersonName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    const matchesStatus = !status || lead.status === status;
    const matchesSource = !source || lead.leadSource === source;
    return matchesSearch && matchesStatus && matchesSource;
  });

  leads = [...leads].sort((left, right) => {
    const leftValue = left?.[sortBy] || "";
    const rightValue = right?.[sortBy] || "";
    if (leftValue === rightValue) return 0;
    const comparison = String(leftValue) > String(rightValue) ? 1 : -1;
    return sortDir === "asc" ? comparison : -comparison;
  });

  const total = leads.length;
  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Number(limit) || 10);
  const start = (pageNumber - 1) * pageSize;
  const items = leads.slice(start, start + pageSize);

  res.json({ items, total, page: pageNumber, pages: Math.max(1, Math.ceil(total / pageSize)) });
});

router.get("/:id", protect, async (req, res) => {
  const useDatabase = mongoose.connection.readyState === 1;
  const lead = useDatabase
    ? await Lead.findOne({ _id: req.params.id, ...getCompanyFilter(req.user) }).lean()
    : demoLeads.find((item) => String(item._id) === String(req.params.id) && canAccessLead(item, req.user));

  if (!lead) return res.status(404).json({ message: "Lead not found." });

  const auditLogs = useDatabase
    ? await LeadAuditLog.find({ leadId: req.params.id, ...(req.user.company ? { company: req.user.company } : {}) }).sort({ createdAt: -1 }).lean()
    : demoLeadAuditLogs.filter((log) => String(log.leadId) === String(req.params.id));

  res.json(serializeLead(lead, auditLogs));
});

router.post("/", protect, authorize("admin", "operations", "bdm"), upload.single("electricityBill"), async (req, res) => {
  const company = req.user.company || req.body.company || "";
  const assignedSalespersonId = req.body.assignedSalespersonId || (req.user.role === "bdm" ? (req.user.id || req.user._id) : "");
  const assignedSalespersonName = req.body.assignedSalespersonName || req.user.name || "";
  const assignedSalespersonEmail = req.body.assignedSalespersonEmail || req.user.email || "";
  const lead = {
    company,
    leadCode: generateLeadCode(),
    customerName: req.body.customerName,
    phoneNumber: req.body.mobileNumber || req.body.phoneNumber,
    email: req.body.email || "",
    address: req.body.address || "",
    cityState: req.body.cityState || "",
    discom: req.body.discom || "TPCODL",
    systemRequirementKw: Number(req.body.systemRequirementKw || 0),
    roofType: req.body.roofType || "",
    electricityBill: req.file
      ? { fileName: req.file.filename, path: `/uploads/${req.file.filename}`, mimeType: req.file.mimetype }
      : { fileName: "", path: "", mimeType: "" },
    leadSource: req.body.leadSource || "Website",
    notes: req.body.notes || "",
    assignedSalespersonId,
    assignedSalespersonName,
    assignedSalespersonEmail,
    status: "New",
    communicationHistory: [],
    siteSurvey: {
      surveyDate: "",
      surveyor: "",
      roofCondition: "",
      shadowAnalysis: "",
      notes: ""
    },
    proposal: {
      amount: Number(req.body.proposalValue || 0),
      validity: "",
      notes: "",
      fileName: "",
      path: ""
    },
    activityTimeline: [],
    createdBy: req.user.name || req.user.email || ""
  };

  pushTimeline(lead, "Created", `Lead ${lead.leadCode} created for ${lead.customerName}.`, req.user);

  if (mongoose.connection.readyState === 1) {
    const createdLead = await Lead.create(lead);
    await appendAuditLog({ lead: createdLead, action: "Lead Created", toStatus: "New", actor: req.user, note: "New lead created" });

    const companyRecord = req.user.company ? await Company.findOne({ companyName: req.user.company }) : null;
    await notifyLeadEvent({
      lead: { ...createdLead.toObject(), assignedSalespersonEmail },
      actor: req.user,
      subject: `New lead created - ${createdLead.customerName}`,
      text: `A new lead was created for ${createdLead.customerName}.\nLead ID: ${createdLead.leadCode}\nStatus: New\nAssigned to: ${assignedSalespersonName}\nCompany: ${req.user.company || "SolarOps"}`
    });

    if (companyRecord?.email) {
      await sendReminderEmail({
        to: companyRecord.email,
        subject: `New lead added - ${createdLead.customerName}`,
        text: `Lead ${createdLead.leadCode} was created by ${req.user.name || req.user.email || "a team member"}.`
      });
    }

    return res.status(201).json(createdLead);
  }

  const demoLead = { _id: createId(), ...lead, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  demoLeads.unshift(demoLead);
  demoLeadAuditLogs.unshift({ _id: createId(), leadId: demoLead._id, leadCode: demoLead.leadCode, action: "Lead Created", toStatus: "New", actorName: req.user.name || req.user.email || "System", actorRole: req.user.role, note: "New lead created", metadata: {}, createdAt: new Date().toISOString() });
  await notifyLeadEvent({
    lead: { ...demoLead, assignedSalespersonEmail },
    actor: req.user,
    subject: `New lead created - ${demoLead.customerName}`,
    text: `A new lead was created for ${demoLead.customerName}. Lead ID: ${demoLead.leadCode}`
  });
  res.status(201).json(demoLead);
});

router.put("/:id/status", protect, async (req, res) => {
  const { status, note = "" } = req.body;
  if (!leadStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid lead status." });
  }

  const useDatabase = mongoose.connection.readyState === 1;
  const scopeFilter = getCompanyFilter(req.user);
  const canEdit = req.user.role === "admin" || req.user.role === "operations" || (req.user.role === "bdm" && String(scopeFilter.assignedSalespersonId || "") === String(req.user.id || req.user._id));
  if (!canEdit) {
    return res.status(403).json({ message: "Access denied for this role." });
  }

  if (useDatabase) {
    const lead = await Lead.findOne({ _id: req.params.id, ...(req.user.company ? { company: req.user.company } : {}), ...(req.user.role === "bdm" ? { assignedSalespersonId: req.user.id || req.user._id } : {}) });
    if (!lead) return res.status(404).json({ message: "Lead not found." });
    const previousStatus = lead.status;
    lead.status = status;
    lead.updatedBy = req.user.name || req.user.email || "";
    pushTimeline(lead, "Status Changed", `${lead.customerName} moved from ${previousStatus} to ${status}.`, req.user);
    await lead.save();
    await appendAuditLog({ lead, action: "Status Updated", fromStatus: previousStatus, toStatus: status, actor: req.user, note, metadata: { note } });
    await notifyLeadEvent({
      lead,
      actor: req.user,
      subject: `Lead status changed - ${lead.customerName}`,
      text: `Lead ${lead.leadCode} status changed from ${previousStatus} to ${status}.\n${note ? `Note: ${note}` : ""}`
    });
    return res.json(lead);
  }

  const lead = demoLeads.find((item) => String(item._id) === String(req.params.id) && canAccessLead(item, req.user));
  if (!lead) return res.status(404).json({ message: "Lead not found." });
  const previousStatus = lead.status;
  lead.status = status;
  lead.updatedBy = req.user.name || req.user.email || "";
  pushTimeline(lead, "Status Changed", `${lead.customerName} moved from ${previousStatus} to ${status}.`, req.user);
  demoLeadAuditLogs.unshift({ _id: createId(), leadId: lead._id, leadCode: lead.leadCode, action: "Status Updated", fromStatus: previousStatus, toStatus: status, actorName: req.user.name || req.user.email || "System", actorRole: req.user.role, note, metadata: { note }, createdAt: new Date().toISOString() });
  await notifyLeadEvent({
    lead,
    actor: req.user,
    subject: `Lead status changed - ${lead.customerName}`,
    text: `Lead ${lead.leadCode} status changed from ${previousStatus} to ${status}.`
  });
  return res.json(lead);
});

router.post("/:id/communication", protect, async (req, res) => {
  const { channel = "Note", note = "" } = req.body;
  if (!note.trim()) return res.status(400).json({ message: "Communication note is required." });

  const useDatabase = mongoose.connection.readyState === 1;
  const scopeFilter = getCompanyFilter(req.user);

  if (useDatabase) {
    const lead = await Lead.findOne({ _id: req.params.id, ...(req.user.company ? { company: req.user.company } : {}), ...(req.user.role === "bdm" ? { assignedSalespersonId: req.user.id || req.user._id } : {}) });
    if (!lead) return res.status(404).json({ message: "Lead not found." });
    lead.communicationHistory.unshift({ channel, note, by: req.user.name || req.user.email || "System", at: new Date() });
    pushTimeline(lead, "Communication", note, req.user);
    await lead.save();
    await appendAuditLog({ lead, action: "Communication Added", actor: req.user, note, metadata: { channel } });
    return res.json(lead);
  }

  const lead = demoLeads.find((item) => String(item._id) === String(req.params.id) && canAccessLead(item, req.user));
  if (!lead) return res.status(404).json({ message: "Lead not found." });
  lead.communicationHistory.unshift({ channel, note, by: req.user.name || req.user.email || "System", at: new Date().toISOString() });
  pushTimeline(lead, "Communication", note, req.user);
  demoLeadAuditLogs.unshift({ _id: createId(), leadId: lead._id, leadCode: lead.leadCode, action: "Communication Added", actorName: req.user.name || req.user.email || "System", actorRole: req.user.role, note, metadata: { channel }, createdAt: new Date().toISOString() });
  return res.json(lead);
});

router.post("/:id/convert", protect, authorize("admin", "operations"), async (req, res) => {
  const useDatabase = mongoose.connection.readyState === 1;

  if (useDatabase) {
    const lead = await Lead.findOne({ _id: req.params.id, ...(req.user.company ? { company: req.user.company } : {}) });
    if (!lead) return res.status(404).json({ message: "Lead not found." });
    if (lead.status !== "Confirmed") return res.status(400).json({ message: "Only confirmed leads can be converted." });
    if (lead.convertedProjectId) return res.status(400).json({ message: "Lead is already converted into a project." });

    const existingCustomer = await Customer.findOne({
      company: lead.company || req.user.company || "",
      $or: [
        { mobileNumber: lead.phoneNumber },
        { emailAddress: lead.email }
      ]
    });

    const customer = existingCustomer || await Customer.create({
      company: lead.company || req.user.company || "",
      name: lead.customerName,
      mobileNumber: lead.phoneNumber,
      emailAddress: lead.email,
      address: lead.address,
      consumerNumber: "",
      leadBy: lead.assignedSalespersonName
    });

    const projectCode = generateProjectCode();
    const project = await Project.create({
      company: lead.company || req.user.company || "",
      projectCode,
      customerId: customer._id,
      name: lead.customerName,
      customerName: lead.customerName,
      mobileNumber: lead.phoneNumber,
      emailAddress: lead.email,
      discom: lead.discom || "TPCODL",
      projectSize: `${Number(lead.systemRequirementKw || 0)}kW`,
      projectType: "On-Grid",
      projectCost: Number(lead.proposal?.amount || 0),
      panelBrand: "",
      inverterBrand: "",
      panelType: "DCR",
      address: lead.address,
      consumerNumber: "",
      leadBy: lead.assignedSalespersonName,
      sourceLeadId: String(lead._id),
      sourceLeadCode: lead.leadCode,
      leadSource: lead.leadSource,
      proposalValue: Number(lead.proposal?.amount || 0),
      assignedTeam: lead.assignedSalespersonName || req.user.name || "",
      timelineTracker: [
        { label: "Project Initiated", at: new Date().toISOString(), by: req.user.name || req.user.email || "System" }
      ],
      status: "Project Initiated",
      installedCapacity: Number(lead.systemRequirementKw || 0),
      installationDate: "",
      installationTeam: "",
      documents: lead.electricityBill?.path
        ? [{ type: "Electricity Bill", fileName: lead.electricityBill.fileName, path: lead.electricityBill.path }]
        : []
    });

    lead.convertedProjectId = String(project._id);
    lead.convertedAt = new Date();
    lead.status = "Confirmed";
    pushTimeline(lead, "Converted", `Converted to project ${project.projectCode}.`, req.user);
    await lead.save();
    await appendAuditLog({ lead, action: "Lead Converted", fromStatus: "Confirmed", toStatus: "Project Initiated", actor: req.user, metadata: { projectId: String(project._id), projectCode } });
    await notifyLeadEvent({
      lead,
      actor: req.user,
      subject: `Lead converted to project - ${lead.customerName}`,
      text: `Lead ${lead.leadCode} was converted into project ${project.projectCode}.`
    });

    return res.json({ message: "Lead converted successfully.", lead, project });
  }

  const lead = demoLeads.find((item) => String(item._id) === String(req.params.id));
  if (!lead) return res.status(404).json({ message: "Lead not found." });
  if (lead.status !== "Confirmed") return res.status(400).json({ message: "Only confirmed leads can be converted." });
  if (lead.convertedProjectId) return res.status(400).json({ message: "Lead is already converted into a project." });

  const customer = {
    _id: createId(),
    company: lead.company || req.user.company || "",
    name: lead.customerName,
    mobileNumber: lead.phoneNumber,
    emailAddress: lead.email,
    address: lead.address,
    consumerNumber: "",
    leadBy: lead.assignedSalespersonName,
    createdAt: new Date().toISOString()
  };
  demoCustomers.unshift(customer);

  const projectCode = generateProjectCode();
  const project = {
    _id: createId(),
    company: lead.company || req.user.company || "",
    projectCode,
    customerId: customer._id,
    name: lead.customerName,
    customerName: lead.customerName,
    mobileNumber: lead.phoneNumber,
    emailAddress: lead.email,
    discom: lead.discom || "TPCODL",
    projectSize: `${Number(lead.systemRequirementKw || 0)}kW`,
    projectType: "On-Grid",
    projectCost: Number(lead.proposal?.amount || 0),
    panelBrand: "",
    inverterBrand: "",
    panelType: "DCR",
    address: lead.address,
    consumerNumber: "",
    leadBy: lead.assignedSalespersonName,
    sourceLeadId: String(lead._id),
    sourceLeadCode: lead.leadCode,
    leadSource: lead.leadSource,
    proposalValue: Number(lead.proposal?.amount || 0),
    assignedTeam: lead.assignedSalespersonName || req.user.name || "",
    timelineTracker: [{ label: "Project Initiated", at: new Date().toISOString(), by: req.user.name || req.user.email || "System" }],
    status: "Project Initiated",
    installedCapacity: Number(lead.systemRequirementKw || 0),
    installationDate: "",
    installationTeam: "",
    documents: lead.electricityBill?.path
      ? [{ _id: createId(), type: "Electricity Bill", fileName: lead.electricityBill.fileName, path: lead.electricityBill.path }]
      : [],
    createdAt: new Date().toISOString()
  };
  demoProjects.unshift(project);
  lead.convertedProjectId = String(project._id);
  lead.convertedAt = new Date().toISOString();
  pushTimeline(lead, "Converted", `Converted to project ${project.projectCode}.`, req.user);
  demoLeadAuditLogs.unshift({ _id: createId(), leadId: lead._id, leadCode: lead.leadCode, action: "Lead Converted", fromStatus: "Confirmed", toStatus: "Project Initiated", actorName: req.user.name || req.user.email || "System", actorRole: req.user.role, metadata: { projectId: project._id, projectCode }, createdAt: new Date().toISOString() });
  await notifyLeadEvent({
    lead,
    actor: req.user,
    subject: `Lead converted to project - ${lead.customerName}`,
    text: `Lead ${lead.leadCode} was converted into project ${project.projectCode}.`
  });
  return res.json({ message: "Lead converted successfully.", lead, project });
});

router.post("/:id/documents", protect, authorize("admin", "operations", "bdm"), upload.single("file"), async (req, res) => {
  const lead = mongoose.connection.readyState === 1
    ? await Lead.findOne({ _id: req.params.id, ...(req.user.company ? { company: req.user.company } : {}) })
    : demoLeads.find((item) => String(item._id) === String(req.params.id) && canAccessLead(item, req.user));

  if (!lead) return res.status(404).json({ message: "Lead not found." });

  const documentPayload = {
    type: req.body.type || "General Document",
    fileName: req.file?.filename || req.body.fileName || "document.pdf",
    path: req.file ? `/uploads/${req.file.filename}` : req.body.path || "/uploads/document.pdf"
  };

  lead.electricityBill = {
    fileName: documentPayload.fileName,
    path: documentPayload.path,
    mimeType: req.file?.mimetype || "application/pdf"
  };
  lead.communicationHistory.unshift({ channel: "Document", note: `${documentPayload.type} uploaded.`, by: req.user.name || req.user.email || "System", at: new Date().toISOString() });
  pushTimeline(lead, "Document Uploaded", `${documentPayload.type} uploaded for the lead.`, req.user);

  if (mongoose.connection.readyState === 1) {
    await lead.save();
    await Document.create({
      company: lead.company || req.user.company || "",
      customerId: null,
      leadId: lead._id,
      type: documentPayload.type,
      fileName: documentPayload.fileName,
      path: documentPayload.path,
      uploadedBy: req.user.email
    });
    return res.status(201).json({ message: "Document uploaded.", document: documentPayload });
  }

  await notifyLeadEvent({
    lead,
    actor: req.user,
    subject: `Lead document uploaded - ${lead.customerName}`,
    text: `A document was uploaded for lead ${lead.leadCode}.`
  });
  return res.status(201).json({ message: "Document uploaded.", document: documentPayload });
});

router.delete("/:id", protect, authorize("admin", "operations"), async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, ...(req.user.company ? { company: req.user.company } : {}) });
    if (!lead) return res.status(404).json({ message: "Lead not found." });
    await LeadAuditLog.deleteMany({ leadId: req.params.id, ...(req.user.company ? { company: req.user.company } : {}) });
    return res.json({ message: "Lead deleted successfully." });
  }

  const index = demoLeads.findIndex((item) => String(item._id) === String(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Lead not found." });
  demoLeads.splice(index, 1);
  return res.json({ message: "Lead deleted successfully." });
});

module.exports = router;
