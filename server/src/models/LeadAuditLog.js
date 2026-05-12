const mongoose = require("mongoose");

const leadAuditLogSchema = new mongoose.Schema(
  {
    company: { type: String, default: "" },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
    leadCode: { type: String, default: "" },
    action: { type: String, required: true },
    fromStatus: { type: String, default: "" },
    toStatus: { type: String, default: "" },
    actorId: { type: String, default: "" },
    actorName: { type: String, default: "" },
    actorRole: { type: String, default: "" },
    note: { type: String, default: "" },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeadAuditLog", leadAuditLogSchema);
