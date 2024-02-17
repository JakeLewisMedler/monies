const { Router } = require("express");
const router = Router();
const fs = require("fs");
const path = require("path");

let models = {
  Transaction: require("./models/Transaction"),
  Budget: require("./models/Budget"),
  BudgetCategory: require("./models/BudgetCategory"),
  Flow: require("./models/Flow"),
  Estimate: require("./models/Estimate")
};

router.post("/backup", async (req, res) => {
  try {
    let directoryPath = path.resolve(__dirname, "../dataBackups/", String(Date.now()));
    await fs.promises.mkdir(directoryPath);
    for (let [name, model] of Object.entries(models)) {
      let items = await model.find({});
      await fs.promises.writeFile(path.resolve(directoryPath, `${name}.json`), JSON.stringify(items), "utf8");
    }
    res.send();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.post("/restore", async (req, res) => {
  try {
    let files = await fs.promises.readdir(path.resolve(__dirname, "../dataBackups/"), { withFileTypes: true });
    let folders = files
      .filter((f) => f.isDirectory())
      .map((f) => f.name)
      .sort((a, b) => (a < b ? 1 : -1));
    if (folders.length == 0) throw "No backups";
    let backupFolder = folders[0];
    console.log(`Restoring backup ${backupFolder}`);

    for (let [name, model] of Object.entries(models)) {
      let data = await fs.promises.readFile(
        path.resolve(__dirname, "../dataBackups", backupFolder, `${name}.json`),
        "utf8"
      );
      let items = JSON.parse(data);
      if (!items) continue;
      await model.deleteMany({});
      let result = await model.create(items);
      console.log(`Restored ${result.length} ${name}`);
    }
    res.send();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

module.exports = router;
