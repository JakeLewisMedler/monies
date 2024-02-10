const mongoose = require("mongoose");

const BudgetSubCategorySchema = new mongoose.Schema(
  {
    name: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BudgetCategory"
    }
  },
  {
    timestamps: true
  }
);
BudgetSubCategorySchema.index({ name: "text" });
module.exports = mongoose.model("BudgetSubCategory", BudgetSubCategorySchema);
