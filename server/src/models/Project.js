const mongoose = require("mongoose");
const { PIPELINE_STAGES } = require("../data/sampleData");

const projectSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    name: { type: String, required: true },
    customerName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    emailAddress: { type: String },
    discom: { type: String, enum: ["TPCODL", "TPSODL", "TPWODL", "TPNODL"], required: true },
    projectSize: { type: String, required: true },
    projectType: { type: String, enum: ["On-Grid", "Off-Grid", "Hybrid"], required: true },
    projectCost: { type: Number, required: true },
    panelBrand: { type: String },
    inverterBrand: { type: String },
    panelType: { type: String, enum: ["DCR", "NON-DCR"] },
    address: { type: String },
    consumerNumber: { type: String },
    leadBy: { type: String },
    status: { type: String, enum: PIPELINE_STAGES, default: "Proposal" },
    installedCapacity: { type: Number, default: 0 },
    installationDate: { type: String },
    installationTeam: { type: String },
    documents: [
      {
        type: { type: String },
        fileName: { type: String },
        path: { type: String }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
