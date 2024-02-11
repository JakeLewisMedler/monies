const mongoose = require("mongoose");

const FlowSchema = new mongoose.Schema(
  {
    name: String,
    recurring: { type: Boolean, default: false },
    recurringType: {
      type: String,
      enum: ["weekly", "monthly", "annually", "custom"]
    },
    recurringFrequency: Number,
    date: Date,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BudgetCategory"
    },
    budget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget"
    }
  },
  {
    timestamps: true
  }
);
FlowSchema.index({ "$**": "text" });
module.exports = mongoose.model("Flow", FlowSchema);
