const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    monzoId: String,
    date: Date,
    type: String,
    name: String,
    amount: Number,
    notes: String,
    description: String,
    budget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
TransactionSchema.index({ "$**": "text" });
module.exports = mongoose.model("Transaction", TransactionSchema);
