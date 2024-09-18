const mongoose = require("mongoose");

const FlowSchema = new mongoose.Schema(
  {
    name: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BudgetCategory"
    },
    budget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget"
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account"
    }
  },
  {
    timestamps: true
  }
);
FlowSchema.index({ "$**": "text" });
module.exports = mongoose.model("Flow", FlowSchema);
