const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema(
  {
    main: Boolean,
    name: String,
    openingBalance: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);
module.exports = mongoose.model("Account", AccountSchema);
