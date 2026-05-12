const mongoose = require("mongoose");

const leadStatusValues = ["New", "Qualified", "Site Survey", "Proposal Sent", "Negotiation", "Confirmed", "Lost"];

const communicationSchema = new mongoose.Schema(
  {
    channel: { type: String, default: "Note" },
    note: { type: String, default: "" },
    by: { type: String, default: "" },
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const activitySchema = new mongoose.Schema(
  {
    type: { type: String, default: "Lead Updated" },
    message: { type: String, default: "" },
    by: { type: String, default: "" },
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    company: { type: String, default: "" },
    leadCode: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    cityState: { type: String, default: "" },
    discom: { type: String, enum: ["TPCODL", "TPSODL", "TPWODL", "TPNODL"], default: "TPCODL" },
    systemRequirementKw: { type: Number, default: 0 },
    roofType: { type: String, default: "" },
    electricityBill: {
      fileName: { type: String, default: "" },
      path: { type: String, default: "" },
      mimeType: { type: String, default: "" }
    },
    leadSource: { type: String, default: "Website" },
    notes: { type: String, default: "" },
    assignedSalespersonId: { type: String, default: "" },
    assignedSalespersonName: { type: String, default: "" },
    assignedSalespersonEmail: { type: String, default: "" },
    status: { type: String, enum: leadStatusValues, default: "New" },
    communicationHistory: { type: [communicationSchema], default: [] },
    siteSurvey: {
      surveyDate: { type: String, default: "" },
      surveyor: { type: String, default: "" },
      roofCondition: { type: String, default: "" },
      shadowAnalysis: { type: String, default: "" },
      notes: { type: String, default: "" }
    },
    proposal: {
      amount: { type: Number, default: 0 },
      validity: { type: String, default: "" },
      notes: { type: String, default: "" },
      fileName: { type: String, default: "" },
      path: { type: String, default: "" }
    },
    activityTimeline: { type: [activitySchema], default: [] },
    convertedProjectId: { type: String, default: "" },
    convertedAt: { type: Date, default: null },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
