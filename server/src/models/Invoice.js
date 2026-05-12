const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    company: { type: String, default: "" },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
    invoiceNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    projectName: { type: String, required: true },
    projectSize: { type: String, required: true },
    invoiceDate: { type: String, default: "" },
    dueDate: { type: String, default: "" },
    paymentTerms: { type: String, default: "Net 15 Days" },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Paid", "Overdue"], default: "Pending" },
    items: [
      {
        name: String,
        hsn: String,
        unit: String,
        qty: Number,
        rate: Number,
        gst: Number
      }
    ],
    payments: [
      {
        amount: Number,
        date: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
