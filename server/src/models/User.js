const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    company: { type: String, default: "" },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "operations", "bdm"], default: "bdm" },
    phone: { type: String, default: "" },
    designation: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    passwordResetToken: { type: String, default: "" },
    passwordResetExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
