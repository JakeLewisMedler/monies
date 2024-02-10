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
    Description: description
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
  let budget = await Budget.findOne({ name, recurring: true }); //Find matching budget
  if (!budget) {
    let matchingTransaction = await Transaction.findOne({ name, archived: false }); //Find matching transaction
    if (matchingTransaction && !!matchingTransaction.budget) {
      budget = await Budget.findById(matchingTransaction.budget);
    }
  }
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
  let { filter, budget, archived } = req.query;
  if (filter) query.$or = [{ $text: { $search: `\"${filter}\"` } }, { amount: filter }];
  if (budget) query.budget = budget;
  if (!!archived) query.archived = archived == "true" ? true : false;
  let transactions = await Transaction.find(query).sort({ name: 1 });
  return res.send(transactions);
};

const list_unallocated_transactions = async (req, res) => {
  let query = { budget: null };
  let { filter, sortBy, sortDesc, archived } = req.query;
  if (filter) query.$or = [{ $text: { $search: `\"${filter}\"` } }, { amount: filter }];
  if (!!archived) query.archived = archived == "true" ? true : false;

  let sort = {};
  if (sortBy) sort[sortBy] = sortDesc == "true" ? -1 : 1;
  console.log(JSON.stringify(query));
  let transactions = await Transaction.find(query).sort(sort);

  let transactionsWithBudget = [];
  let transactionsWithoutBudget = [];

  for (let transaction of transactions) {
    let budget = await findMatchingBudget(transaction);
    if (budget) {
      transaction.budget = budget.id;
      transactionsWithBudget.push(transaction);
    } else {
      transactionsWithoutBudget.push(transaction);
    }
  }

  let allTransactions = [...transactionsWithBudget, ...transactionsWithoutBudget];
  return res.send(allTransactions);
};

const update_transaction = async (req, res) => {
  let { _id } = req.params;
  let transaction = await Transaction.findByIdAndUpdate(_id, req.body);
  return res.send(transaction);
};

const list_budgets = async (req, res) => {
  let query = {};
  let { filter, recurring, sortBy, sortDesc } = req.query;
  if (filter) query.$text = { $search: `\"${filter}\"` };
  let sort = {};
  if (sortBy) sort[sortBy] = sortDesc == "true" ? -1 : 1;
  if (recurring == "true") query.recurring = true;
  let budgets = await Budget.find(query).sort(sort);
  return res.send(budgets);
};

const create_budget = async (req, res) => {
  let { budget, transaction } = req.body;
  budget = await Budget.create(budget);
  await Transaction.findByIdAndUpdate(transaction._id, {
    budget: budget._id
  });

  return res.send();
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
  update_transaction,
  list_budgets,
  create_budget,
  update_budget,
  create_budget_temp,
  delete_transactions,
  delete_budgets
};
