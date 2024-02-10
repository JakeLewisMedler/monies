const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

const list_budgets = async (req, res) => {
  let query = {};
  let { filter, recurring, sortBy, sortDesc } = req.query;
  if (filter) query.$text = { $search: `\"${filter}\"` };
  let sort = { name: 1 };
  if (sortBy) sort = { [sortBy]: sortDesc == "true" ? -1 : 1 };
  if (recurring == "true") query.recurring = true;
  let budgets = await Budget.find(query).sort(sort);
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

const create_budget_temp = async (req, res) => {
  let { transaction } = req.body;
  let tempBudget = {
    name: transaction.name,
    recurring: false,
    recurringType: "monthly",
    recurringFrequency: 1,
    date: transaction.date
  };
  return res.send(tempBudget);
};

const delete_budget = async (req, res) => {
  let { _id } = req.params;
  let budget = await Budget.findByIdAndDelete(_id);
  if (budget) {
    await Transaction.updateMany({ budget: budget._id }, { budget: null });
  }
  return res.send(budget);
};

const delete_budgets = async (req, res) => {
  await Budget.deleteMany({});
  return res.send();
};

module.exports = {
  list_budgets,
  create_budget,
  update_budget,
  create_budget_temp,
  delete_budget,
  delete_budgets
};
