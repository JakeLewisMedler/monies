const { Router } = require("express");
const router = Router();
let { verifyToken } = require("./middleware");

let TransactionsController = require("./controllers/transaction");
let FlowController = require("./controllers/flow");
let EstimateController = require("./controllers/estimate");
let BudgetCategoryController = require("./controllers/budgetCategory");
let BudgetController = require("./controllers/budget");
let ForecastController = require("./controllers/forecast");
let SettingsController = require("./controllers/settings");

router.get("/transactions", verifyToken, TransactionsController.list_transactions);
router.get("/transactions/unallocated", verifyToken, TransactionsController.list_unallocated_transactions);
router.post("/transactions/upload-csv", verifyToken, TransactionsController.upload_csv);
router.put("/transactions/:_id", verifyToken, TransactionsController.update_transaction);
router.delete("/transactions", verifyToken, TransactionsController.delete_transactions);

router.get("/flows", verifyToken, FlowController.list_flows);
router.post("/flows", verifyToken, FlowController.create_flow);
router.post("/flows/create-temp", verifyToken, FlowController.create_flow_temp);
router.put("/flows/:_id", verifyToken, FlowController.update_flow);
router.delete("/flows", verifyToken, FlowController.delete_flows);
router.delete("/flows/:_id", verifyToken, FlowController.delete_flow);

router.get("/estimates", verifyToken, EstimateController.list_estimates);
router.post("/estimates", verifyToken, EstimateController.create_estimate);
router.post("/estimates/delete", verifyToken, EstimateController.delete_estimates);
router.put("/estimates/:_id", verifyToken, EstimateController.update_estimate);
router.delete("/estimates/:_id", verifyToken, EstimateController.delete_estimate);

router.get("/budgets", verifyToken, BudgetController.list_budgets);
router.post("/budgets", verifyToken, BudgetController.create_budget);
router.put("/budgets/:_id", verifyToken, BudgetController.update_budget);

router.delete("/budgets", verifyToken, BudgetController.delete_budgets);
router.delete("/budgets/:_id", verifyToken, BudgetController.delete_budget);

router.get("/budget-categories", verifyToken, BudgetCategoryController.list_budget_categories);
router.post("/budget-categories", verifyToken, BudgetCategoryController.create_budget_category);
router.put("/budget-categories/:_id", verifyToken, BudgetCategoryController.update_budget_category);
router.put("/budget-categories/:_id/move", verifyToken, BudgetCategoryController.move_budget_category);
router.delete("/budget-categories", verifyToken, BudgetCategoryController.delete_budget_categories);
router.delete("/budget-categories/:_id", verifyToken, BudgetCategoryController.delete_budget_category);

router.get("/forecast", verifyToken, ForecastController.generate_forecast);

const backup = require("./backup");
router.use(backup);

module.exports = router;
