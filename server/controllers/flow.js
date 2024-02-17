const Transaction = require("../models/Transaction");
const Flow = require("../models/Flow");
const Budget = require("../models/Budget");

const list_flows = async (req, res) => {
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

    let flows = await Flow.find(query).sort(sort);
    return res.send(flows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const create_flow = async (req, res) => {
  try {
    let flow = req.body;
    flow = await Flow.create(flow);
    return res.send(flow);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const update_flow = async (req, res) => {
  try {
    let flow = req.body;
    let { _id } = req.params;

    flow = await Flow.findByIdAndUpdate(_id, flow);
    return res.send(flow);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const create_flow_temp = async (req, res) => {
  try {
    let { transaction } = req.body;
    let tempFlow = {
      name: transaction.name,
      estimate: false,
      date: transaction.date
    };
    return res.send(tempFlow);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const delete_flow = async (req, res) => {
  try {
    let { _id } = req.params;
    let flow = await Flow.findByIdAndDelete(_id);
    if (flow) {
      await Transaction.updateMany({ flow: flow._id }, { flow: null });
    }
    return res.send(flow);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const delete_flows = async (req, res) => {
  try {
    await Flow.deleteMany({});
    await Transaction.updateMany({}, { flow: null });
    return res.send();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

module.exports = {
  list_flows,
  create_flow,
  update_flow,
  create_flow_temp,
  delete_flow,
  delete_flows
};
