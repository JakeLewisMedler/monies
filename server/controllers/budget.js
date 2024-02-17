const Budget = require("../models/Budget");
const Flow = require("../models/Flow");

const list_budgets = async (req, res) => {
  try {
    let query = {};
    let { filter, sortBy, sortDesc, populate, budgetCategory } = req.query;
    if (filter) query.$text = { $search: `\"${filter}\"` };
    if (budgetCategory) query.category = budgetCategory;

    let sort = { name: 1 };
    if (sortBy) sort = { [sortBy]: sortDesc == "true" ? -1 : 1 };

    let budgets = await Budget.find(query).populate(populate).sort(sort);
    return res.send(budgets);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const create_budget = async (req, res) => {
  try {
    let budget = req.body;
    budget = await Budget.create(budget);
    return res.send(budget);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const update_budget = async (req, res) => {
  try {
    let budget = req.body;
    let { _id } = req.params;
    budget = await Budget.findByIdAndUpdate(_id, budget);
    return res.send(budget);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const update_budget_estimate = async (req, res) => {
  try {
    let budget = req.body;
    let { _id } = req.params;
    budget = await Budget.findByIdAndUpdate(_id, budget);
    return res.send(budget);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
const delete_budgets = async (req, res) => {
  try {
    await Budget.deleteMany({});
    return res.send();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const delete_budget = async (req, res) => {
  try {
    let { _id } = req.params;
    let budget = await Budget.findByIdAndDelete(_id);
    await Flow.updateMany({ budget: _id }, { budget: null });
    return res.send(budget);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

module.exports = {
  list_budgets,
  create_budget,
  update_budget,
  update_budget_estimate,
  delete_budgets,
  delete_budget
};
