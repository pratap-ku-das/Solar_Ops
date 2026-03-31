const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    availableQuantity: { type: Number, default: 0 },
    unit: { type: String, default: "pcs" },
    stockIn: { type: Number, default: 0 },
    stockOut: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stock", stockSchema);
