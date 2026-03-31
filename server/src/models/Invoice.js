const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    projectName: { type: String, required: true },
    projectSize: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Paid", "Overdue"], default: "Pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
