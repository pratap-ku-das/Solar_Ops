const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    projectName: { type: String, required: true },
    projectSize: { type: String, required: true },
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
