const Transaction = require("../models/Transaction");
const Flow = require("../models/Flow");
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

const findMatchingFlow = async (transaction) => {
  let { name } = transaction;
  let flow = await Flow.findOne({ name }); //Find matching flow
  if (!flow) {
    let matchingTransaction = await Transaction.findOne({ name, archived: false }); //Find matching transaction
    if (matchingTransaction && !!matchingTransaction.flow) {
      flow = await Flow.findById(matchingTransaction.flow);
    }
  }
  return flow;
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
  let { filter, sortBy, sortDesc, flow, archived, populate } = req.query;
  if (filter)
    isNaN(filter)
      ? (query.$or = [{ $text: { $search: `\"${filter}\"` } }])
      : (query.$or = [{ $text: { $search: `\"${filter}\"` } }, { amount: filter }]);

  if (flow) query.flow = flow;
  if (!!archived) query.archived = archived == "true" ? true : false;

  let sort = { name: 1 };
  if (sortBy) sort = { [sortBy]: sortDesc == "true" ? -1 : 1 };

  let transactions = await Transaction.find(query).sort(sort).populate(populate);
  return res.send(transactions);
};

const list_unallocated_transactions = async (req, res) => {
  let query = { flow: null };
  let { filter, sortBy, sortDesc, archived } = req.query;
  if (filter)
    isNaN(filter)
      ? (query.$or = [{ $text: { $search: `\"${filter}\"` } }])
      : (query.$or = [{ $text: { $search: `\"${filter}\"` } }, { amount: filter }]);

  if (!!archived) query.archived = archived == "true" ? true : false;

  let sort = { name: 1 };
  if (sortBy) sort = { [sortBy]: sortDesc == "true" ? -1 : 1 };
  let transactions = await Transaction.find(query).sort(sort);

  let transactionsWithFlow = [];
  let transactionsWithoutFlow = [];

  for (let transaction of transactions) {
    let flow = await findMatchingFlow(transaction);
    console.log(flow);
    if (flow) {
      transaction.flow = flow.id;
      transactionsWithFlow.push(transaction);
    } else {
      transactionsWithoutFlow.push(transaction);
    }
  }

  let allTransactions = [...transactionsWithFlow, ...transactionsWithoutFlow];
  return res.send(allTransactions);
};

const update_transaction = async (req, res) => {
  let { _id } = req.params;
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
