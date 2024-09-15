const mongoose = require("mongoose");

const BudgetCategorySchema = new mongoose.Schema(
  {
    name: String,
    order: { type: Number, default: 1 }
  },
  {
    timestamps: true
  }
);
BudgetCategorySchema.index({ name: "text" });
module.exports = mongoose.model("BudgetCategory", BudgetCategorySchema);
