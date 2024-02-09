const Transaction = require("./models/Transaction");
const Budget = require("./models/Budget");
const { parse, differenceInDays } = require("date-fns");

const createTransaction = async (data) => {
  let {
    "Transaction ID": id,
    Date: date,
    Time: time,
    Type: type,
    Name: name,
    Amount: amount,
    Description: description,
  } = data;
  let dateTime = parse(`${date} ${time}`, "dd/MM/yyyy HH:mm:ss", new Date());
  let transaction = await Transaction.findOneAndUpdate(
    { monzoId: id },
    { monzoId: id, date: dateTime, type, name, amount, description },
    { upsert: true, new: true }
  );
  return transaction;
};

const findMatchingBudget = async (transaction) => {
  let { name } = transaction;
  let budget = await Budget.findOne({ name }); //Find matching budget
  return budget;
};

const upload_csv = async (req, res) => {
  try {
    let entries = req.body;
    if (!entries) throw "No entries";
    for (let entry of entries) {
      await createTransaction(entry);
    }
    res.send();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const list_transactions = async (req, res) => {
  let query = {};
  let { filter, budget } = req.query;
  if (filter) query.$text = { $search: `\"${filter}\"` };
  if (budget) query.budget = budget;
  let transactions = await Transaction.find(query).sort({ name: 1 });
  return res.send(transactions);
};

const list_unallocated_transactions = async (req, res) => {
  let query = { budget: null };
  let { filter } = req.query;
  if (filter) query.$text = { $search: `\"${filter}\"` };
  let transactions = await Transaction.find(query).sort({ name: 1 });
  for (let transaction of transactions) {
    let budget = await findMatchingBudget(transaction);
    transaction.budget = (budget && budget._id) || null;
  }
  return res.send(transactions);
};

const update_transactions = async (req, res) => {
  let { _id } = req.params;
  let transaction = await Transaction.findByIdAndUpdate(_id, req.body);
  return res.send(transaction);
};
const list_budgets = async (req, res) => {
  let query = {};
  let { filter } = req.query;
  if (filter) query.$text = { $search: `\"${filter}\"` };
  let budgets = await Budget.find(query).sort({ name: 1 });
  return res.send(budgets);
};

const create_budget = async (req, res) => {
  let { budget, transaction } = req.body;
  budget = await Budget.create(budget);
  await Transaction.findByIdAndUpdate(transaction._id, {
    budget: budget._id,
  });

  return res.send();
};

const create_budget_temp = async (req, res) => {
  let { transaction } = req.body;
  let tempBudget = {
    name: transaction.name,
    recurring: false,
    date: transaction.date,
  };
  return res.send(tempBudget);
};

const delete_transactions = async (req, res) => {
  await Transaction.deleteMany({});
  return res.send();
};

const delete_budgets = async (req, res) => {
  await Budget.deleteMany({});
  return res.send();
};

module.exports = {
  upload_csv,
  list_transactions,
  list_unallocated_transactions,
  update_transactions,
  list_budgets,
  create_budget,
  create_budget_temp,
  delete_transactions,
  delete_budgets,
};
