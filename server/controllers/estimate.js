const Estimate = require("../models/Estimate");

const list_estimates = async (req, res) => {
  try {
    let query = {};
    let { filter, sortBy, sortDesc, budgetCategory } = req.query;
    if (filter) query.$text = { $search: `\"${filter}\"` };
    let sort = { name: 1 };
    if (sortBy) sort = { [sortBy]: sortDesc == "true" ? -1 : 1 };

    if (budgetCategory) {
      let budgets = await Budget.find({ category: budgetCategory });
      query.budget = { $in: budgets.map((b) => b._id) };
    }

    let estimates = await Estimate.find(query).sort(sort);
    return res.send(estimates);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const create_estimate = async (req, res) => {
  try {
    let { type, budget, flow, amount, date } = req.body;
    let query = { date };
    let update = { amount, date, type };
    if (type == "flow") {
      if (!flow) throw "No flow";
      query.flow = flow;
      update.flow = flow;
    } else if (type == "budget") {
      if (!budget) throw "No budget";
      query.budget = budget;
      update.budget = budget;
    }

    console.log(query, update);
    let estimate = await Estimate.findOneAndUpdate(query, update, { upsert: true, new: true });
    return res.send(estimate);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const update_estimate = async (req, res) => {
  try {
    let estimate = req.body;
    let { _id } = req.params;
    estimate = await Estimate.findByIdAndUpdate(_id, estimate);
    return res.send(estimate);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const delete_estimate = async (req, res) => {
  try {
    let { _id } = req.params;
    let estimate = await Estimate.findByIdAndDelete(_id);
    return res.send(estimate);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const delete_estimates = async (req, res) => {
  try {
    let { type, budget, flow, date } = req.body;
    console.log("delete", { type, budget, flow, date });
    let query = { date };

    if (type == "flow") {
      if (!flow) throw "No flow";
      query.flow = flow;
    } else if (type == "budget") {
      if (!budget) throw "No budget";
      query.budget = budget;
    }
    await Estimate.deleteMany(query);
    return res.send();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

module.exports = {
  list_estimates,
  create_estimate,
  update_estimate,
  delete_estimate,
  delete_estimates
};
