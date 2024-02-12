const Transaction = require("../models/Transaction");
const Flow = require("../models/Flow");
const Budget = require("../models/Budget");

const list_flows = async (req, res) => {
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
};

const create_flow = async (req, res) => {
  let flow = req.body;
  flow = await Flow.create(flow);
  return res.send(flow);
};

const update_flow = async (req, res) => {
  let flow = req.body;
  let { _id } = req.params;

  flow = await Flow.findByIdAndUpdate(_id, flow);
  return res.send(flow);
};

const create_flow_temp = async (req, res) => {
  let { transaction } = req.body;
  let tempFlow = {
    name: transaction.name,
    estimate: false,
    date: transaction.date
  };
  return res.send(tempFlow);
};

const delete_flow = async (req, res) => {
  let { _id } = req.params;
  let flow = await Flow.findByIdAndDelete(_id);
  if (flow) {
    await Transaction.updateMany({ flow: flow._id }, { flow: null });
  }
  return res.send(flow);
};

const delete_flows = async (req, res) => {
  await Flow.deleteMany({});
  await Transaction.updateMany({}, { flow: null });
  return res.send();
};

module.exports = {
  list_flows,
  create_flow,
  update_flow,
  create_flow_temp,
  delete_flow,
  delete_flows
};
