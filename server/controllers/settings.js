const Settings = require("../models/Settings");

const ensureSettings = async () => {
  let settings = await Settings.findOne({});
  if (!settings) await Settings.create({});
};
ensureSettings();
