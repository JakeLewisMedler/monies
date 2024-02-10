const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const { parse } = require("date-fns");

const createUpdateTransaction = async (data) => {
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
      await createUpdateTransaction(entry);
    }
    res.send();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const list_transactions = async (req, res) => {
  let query = {};
  let { filter, sortBy, sortDesc, budget, archived } = req.query;
  if (filter)
    isNaN(filter)
      ? (query.$or = [{ $text: { $search: `\"${filter}\"` } }])
      : (query.$or = [{ $text: { $search: `\"${filter}\"` } }, { amount: filter }]);

  if (budget) query.budget = budget;
  if (!!archived) query.archived = archived == "true" ? true : false;

  let sort = { name: 1 };
  if (sortBy) sort = { [sortBy]: sortDesc == "true" ? -1 : 1 };

  let transactions = await Transaction.find(query).sort(sort);
  return res.send(transactions);
};

const list_unallocated_transactions = async (req, res) => {
  let query = { budget: null };
  let { filter, sortBy, sortDesc, archived } = req.query;
  if (filter)
    isNaN(filter)
      ? (query.$or = [{ $text: { $search: `\"${filter}\"` } }])
      : (query.$or = [{ $text: { $search: `\"${filter}\"` } }, { amount: filter }]);

  if (!!archived) query.archived = archived == "true" ? true : false;

  let sort = { name: 1 };
  if (sortBy) sort = { [sortBy]: sortDesc == "true" ? -1 : 1 };
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
  console.log("update transaction", _id, req.body);
  let transaction = await Transaction.findByIdAndUpdate(_id, req.body);
  return res.send(transaction);
};

const delete_transactions = async (req, res) => {
  await Transaction.deleteMany({});
  return res.send();
};

module.exports = {
  upload_csv,
  list_transactions,
  list_unallocated_transactions,
  update_transaction,
  delete_transactions
};
