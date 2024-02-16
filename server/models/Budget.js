const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema(
  {
    name: String,
    estimate: Boolean,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BudgetCategory"
    }
  },
  {
    timestamps: true
  }
);
BudgetSchema.index({ name: "text" });
module.exports = mongoose.model("Budget", BudgetSchema);
