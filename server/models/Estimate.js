const mongoose = require("mongoose");

const EstimateSchema = new mongoose.Schema(
  {
    type: String,
    amount: Number,
    date: Date,
    flow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flow"
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
module.exports = mongoose.model("Estimate", EstimateSchema);
