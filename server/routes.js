const { Router } = require("express");
const router = Router();

let Controller = require("./controller");

router.get("/transactions", Controller.list_transactions);
router.get("/transactions/unallocated", Controller.list_unallocated_transactions);
router.get("/budgets", Controller.list_budgets);

router.put("/transactions/:_id", Controller.update_transaction);
router.put("/budgets/:_id", Controller.update_budget);

router.post("/budgets", Controller.create_budget);
router.post("/budgets/create-temp", Controller.create_budget_temp);
router.post("/upload-csv", Controller.upload_csv);

router.delete("/transactions", Controller.delete_transactions);
router.delete("/budgets", Controller.delete_budgets);
module.exports = router;
