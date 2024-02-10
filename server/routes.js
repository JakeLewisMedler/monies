const { Router } = require("express");
const router = Router();

let TransactionsController = require("./controllers/transaction");
let BudgetsController = require("./controllers/budget");
let BudgetsCategoryController = require("./controllers/budgetCategory");
let BudgetsSubCategoryController = require("./controllers/budgetSubCategory");

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

router.get("/budget-categories", BudgetsCategoryController.list_budget_categories);
router.post("/budget-categories", BudgetsCategoryController.create_budget_category);
router.put("/budget-categories/:_id", BudgetsCategoryController.update_budget_category);
router.delete("/budget-categories", BudgetsCategoryController.delete_budget_categories);
router.delete("/budget-categories/:_id", BudgetsCategoryController.delete_budget_category);

router.get("/budget-sub-categories", BudgetsSubCategoryController.list_budget_sub_categories);
router.post("/budget-sub-categories", BudgetsSubCategoryController.create_budget_sub_category);
router.put("/budget-sub-categories/:_id", BudgetsSubCategoryController.update_budget_sub_category);
router.delete("/budget-sub-categories", BudgetsSubCategoryController.delete_budget_sub_categories);
router.delete("/budget-sub-categories/:_id", BudgetsSubCategoryController.delete_budget_sub_category);

module.exports = router;
