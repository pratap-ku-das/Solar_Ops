const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    emailAddress: { type: String },
    discom: { type: String, enum: ["TPCODL", "TPSODL", "TPWODL", "TPNODL"] },
    address: { type: String },
    consumerNumber: { type: String },
    leadBy: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
