const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    projectName: { type: String, required: true },
    materialCost: { type: Number, default: 0 },
    laborCost: { type: Number, default: 0 },
    transportCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
