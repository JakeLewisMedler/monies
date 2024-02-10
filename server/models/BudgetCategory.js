const mongoose = require("mongoose");

const BudgetCategorySchema = new mongoose.Schema(
  {
    name: String,
    type: String
  },
  {
    timestamps: true
  }
);
BudgetCategorySchema.index({ name: "text" });
module.exports = mongoose.model("BudgetCategory", BudgetCategorySchema);
