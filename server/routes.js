const { Router } = require("express");
const router = Router();

let TransactionsController = require("./controllers/transaction");
let FlowController = require("./controllers/flow");
let BudgetCategoryController = require("./controllers/budgetCategory");
let BudgetController = require("./controllers/budget");
let ForecastController = require("./controllers/forecast");

router.get("/transactions", TransactionsController.list_transactions);
router.get("/transactions/unallocated", TransactionsController.list_unallocated_transactions);
router.post("/transactions/upload-csv", TransactionsController.upload_csv);
router.put("/transactions/:_id", TransactionsController.update_transaction);
router.delete("/transactions", TransactionsController.delete_transactions);

router.get("/flows", FlowController.list_flows);
router.post("/flows", FlowController.create_flow);
router.post("/flows/create-temp", FlowController.create_flow_temp);
router.put("/flows/:_id", FlowController.update_flow);
router.delete("/flows", FlowController.delete_flows);
router.delete("/flows/:_id", FlowController.delete_flow);

router.get("/budgets", BudgetController.list_budgets);
router.post("/budgets", BudgetController.create_budget);
router.put("/budgets/:_id", BudgetController.update_budget);
router.delete("/budgets", BudgetController.delete_budgets);
router.delete("/budgets/:_id", BudgetController.delete_budget);

router.get("/budget-categories", BudgetCategoryController.list_budget_categories);
router.post("/budget-categories", BudgetCategoryController.create_budget_category);
router.put("/budget-categories/:_id", BudgetCategoryController.update_budget_category);
router.delete("/budget-categories", BudgetCategoryController.delete_budget_categories);
router.delete("/budget-categories/:_id", BudgetCategoryController.delete_budget_category);

router.get("/forecast", ForecastController.generate_forecast);
router.get("/forecast/budget-category", ForecastController.generate_budget_category_forecast);

module.exports = router;
