const Budget = require("../models/Budget");
const Flow = require("../models/Flow");

const list_budgets = async (req, res) => {
  let query = {};
  let { filter, sortBy, sortDesc, populate, budgetCategory } = req.query;
  if (filter) query.$text = { $search: `\"${filter}\"` };
  if (budgetCategory) query.category = budgetCategory;

  let sort = { name: 1 };
  if (sortBy) sort = { [sortBy]: sortDesc == "true" ? -1 : 1 };

  let budgets = await Budget.find(query).populate(populate).sort(sort);
  return res.send(budgets);
};

const create_budget = async (req, res) => {
  let budget = req.body;
  budget = await Budget.create(budget);
  return res.send(budget);
};

const update_budget = async (req, res) => {
  let budget = req.body;
  let { _id } = req.params;
  budget = await Budget.findByIdAndUpdate(_id, budget);
  return res.send(budget);
};

const delete_budgets = async (req, res) => {
  await Budget.deleteMany({});
  return res.send();
};

const delete_budget = async (req, res) => {
  let { _id } = req.params;
  let budget = await Budget.findByIdAndDelete(_id);
  await Flow.updateMany({ budget: _id }, { budget: null });
  return res.send(budget);
};

module.exports = {
  list_budgets,
  create_budget,
  update_budget,
  delete_budgets,
  delete_budget
};
