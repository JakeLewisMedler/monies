const BudgetCategory = require("../models/BudgetCategory");

const list_budget_categories = async (req, res) => {
  try {
    let query = {};
    let { filter, sortBy, sortDesc } = req.query;
    if (filter) query.$text = { $search: `\"${filter}\"` };
    let sort = { name: 1 };
    if (sortBy) sort = { [sortBy]: sortDesc == "true" ? -1 : 1 };
    let budgetCategories = await BudgetCategory.find(query).sort(sort);
    return res.send(budgetCategories);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const create_budget_category = async (req, res) => {
  try {
    let budgetCategory = req.body;
    budgetCategory = await BudgetCategory.create(budgetCategory);
    return res.send(budgetCategory);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const update_budget_category = async (req, res) => {
  try {
    let budgetCategory = req.body;
    let { _id } = req.params;
    budgetCategory = await BudgetCategory.findByIdAndUpdate(_id, budgetCategory);
    return res.send(budgetCategory);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const delete_budget_categories = async (req, res) => {
  try {
    await BudgetCategory.deleteMany({});
    return res.send();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const delete_budget_category = async (req, res) => {
  try {
    let { _id } = req.params;
    let budgetCategory = await BudgetCategory.findByIdAndDelete(_id);
    return res.send(budgetCategory);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

module.exports = {
  list_budget_categories,
  create_budget_category,
  update_budget_category,
  delete_budget_categories,
  delete_budget_category
};
