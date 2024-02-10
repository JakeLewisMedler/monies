const { Router } = require("express");
const router = Router();

let TransactionsController = require("./controllers/transaction");
let BudgetsController = require("./controllers/budget");
let BudgetsCategoryController = require("./controllers/budgetCategory");

router.get("/transactions", TransactionsController.list_transactions);
router.get("/transactions/unallocated", TransactionsController.list_unallocated_transactions);
router.post("/upload-csv", TransactionsController.upload_csv);
router.put("/transactions/:_id", TransactionsController.update_transaction);
router.delete("/transactions", TransactionsController.delete_transactions);

router.get("/budgets", BudgetsController.list_budgets);
router.post("/budgets", BudgetsController.create_budget);
router.post("/budgets/create-temp", BudgetsController.create_budget_temp);
router.put("/budgets/:_id", BudgetsController.update_budget);
router.delete("/budgets", BudgetsController.delete_budgets);
router.delete("/budgets/:_id", BudgetsController.delete_budget);

router.get("/budgetCategories", BudgetsCategoryController.list_budget_categories);
router.post("/budgetCategories", BudgetsCategoryController.create_budget_category);
router.put("/budgetCategories/:_id", BudgetsCategoryController.update_budget_category);
router.delete("/budgetCategories", BudgetsCategoryController.delete_budget_categories);

module.exports = router;
