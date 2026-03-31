const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    type: { type: String, required: true },
    fileName: { type: String, required: true },
    path: { type: String, required: true },
    uploadedBy: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
