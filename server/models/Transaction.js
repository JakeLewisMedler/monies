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
    flow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flow",
      default: null
    },
    archived: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);
TransactionSchema.index({ "$**": "text" });
TransactionSchema.index({ amount: 1 });

module.exports = mongoose.model("Transaction", TransactionSchema);
