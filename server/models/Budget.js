const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema(
  {
    name: String,
    recurring: { type: Boolean, default: false },
    recurringType: {
      type: String,
      enum: ["weekly", "monthly", "annually", "custom"],
    },
    recurringFrequency: Number,
    date: Date,
  },
  {
    timestamps: true,
  }
);
BudgetSchema.index({ "$**": "text" });
module.exports = mongoose.model("Budget", BudgetSchema);
