const BudgetCategory = require("../models/BudgetCategory");

const list_budget_categories = async (req, res) => {
  let query = {};
  let { filter, sortBy, sortDesc } = req.query;
  if (filter) query.$text = { $search: `\"${filter}\"` };
  let sort = { name: 1 };
  if (sortBy) sort = { [sortBy]: sortDesc == "true" ? -1 : 1 };
  let budgetCategories = await BudgetCategory.find(query).sort(sort);
  return res.send(budgetCategories);
};

const create_budget_category = async (req, res) => {
  let budgetCategory = req.body;
  budgetCategory = await BudgetCategory.create(budgetCategory);
  return res.send(budgetCategory);
};

const update_budget_category = async (req, res) => {
  let budgetCategory = req.body;
  let { _id } = req.params;
  budgetCategory = await BudgetCategory.findByIdAndUpdate(_id, budgetCategory);
  return res.send(budgetCategory);
};

const delete_budget_categories = async (req, res) => {
  await BudgetCategory.deleteMany({});
  return res.send();
};

const delete_budget_category = async (req, res) => {
  let { _id } = req.params;
  let budgetCategory = await BudgetCategory.findByIdAndDelete(_id);
  return res.send(budgetCategory);
};

module.exports = {
  list_budget_categories,
  create_budget_category,
  update_budget_category,
  delete_budget_categories,
  delete_budget_category
};
