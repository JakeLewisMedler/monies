const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    monzoId: String,
    date: Date,
    name: String,
    amount: Number,
    notes: { type: String, default: "" },
    description: String,
    flow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flow",
      default: null
    },
    oneoff: { type: Boolean, default: false },
    archived: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);
TransactionSchema.index({ "$**": "text" });
TransactionSchema.index({ amount: 1 });

module.exports = mongoose.model("Transaction", TransactionSchema);
