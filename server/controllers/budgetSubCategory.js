const BudgetSubCategory = require("../models/BudgetSubCategory");

const list_budget_sub_categories = async (req, res) => {
  let query = {};
  let { filter, sortBy, sortDesc, populate } = req.query;
  if (filter) query.$text = { $search: `\"${filter}\"` };
  let sort = { name: 1 };
  if (sortBy) sort = { [sortBy]: sortDesc == "true" ? -1 : 1 };

  let budgetSubCategories = await BudgetSubCategory.find(query).populate(populate).sort(sort);
  return res.send(budgetSubCategories);
};

const create_budget_sub_category = async (req, res) => {
  let budgetSubCategory = req.body;
  budgetSubCategory = await BudgetSubCategory.create(budgetSubCategory);
  return res.send(budgetSubCategory);
};

const update_budget_sub_category = async (req, res) => {
  let budgetSubCategory = req.body;
  let { _id } = req.params;
  budgetSubCategory = await BudgetSubCategory.findByIdAndUpdate(_id, budgetSubCategory);
  return res.send(budgetSubCategory);
};

const delete_budget_sub_categories = async (req, res) => {
  await BudgetSubCategory.deleteMany({});
  return res.send();
};

const delete_budget_sub_category = async (req, res) => {
  let { _id } = req.params;
  let budgetSubCategory = await BudgetSubCategory.findByIdAndDelete(_id);
  return res.send(budgetSubCategory);
};

module.exports = {
  list_budget_sub_categories,
  create_budget_sub_category,
  update_budget_sub_category,
  delete_budget_sub_categories,
  delete_budget_sub_category
};
