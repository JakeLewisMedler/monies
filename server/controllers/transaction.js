const Transaction = require("../models/Transaction");
const Flow = require("../models/Flow");
const { parse } = require("date-fns");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const { endOfMonth } = require("date-fns");

const createTransaction = async (data) => {
  let { id, date, name, amount, description } = data;
  let transaction = await Transaction.create({ monzoId: id, date, name, amount, description });
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
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }
    let uploadedFile = req.files.csv;
    let fileName = String(Date.now()) + ".csv";
    tempPath = path.resolve(__dirname, "../uploads/" + fileName);
    await uploadedFile.mv(tempPath);

    let entries = [];
    await new Promise((r) => {
      fs.createReadStream(tempPath)
        .pipe(csv())
        .on("data", (data) => {
          let {
            "Transaction ID": id,
            Date: date,
            Time: time,
            Name: name,
            Amount: amount,
            Description: description
          } = data;
          let dateTime = parse(`${date} ${time}`, "dd/MM/yyyy HH:mm:ss", new Date());
          let entry = { monzoId: id, date: dateTime, name, amount, description };
          entries.push(entry);
        })
        .on("end", () => {
          r();
        });
    });

    let results = await handle_uploaded_transactions(entries);
    return res.send(results);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
const upload_monzo = async (req, res) => {
  try {
    let entries = req.body;
    let results = await handle_uploaded_transactions(entries);
    return res.send(results);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const handle_uploaded_transactions = async (entries) => {
  let createdCount = 0;
  let skippedCount = 0;
  for (let entry of entries) {
    let transaction = await Transaction.findOne({ monzoId: entry.id });
    if (!transaction) {
      await createTransaction(entry);
      createdCount++;
    } else {
      console.log(`Skipping transaction ${entry.id}`);
      skippedCount++;
    }
  }
  return { createdCount, skippedCount };
};

const list_transactions = async (req, res) => {
  try {
    let query = {};
    let { filter, sortBy, sortDesc, flow, oneoff, month, archived, populate } = req.query;
    if (filter)
      isNaN(filter)
        ? (query.$or = [{ $text: { $search: `\"${filter}\"` } }])
        : (query.$or = [{ $text: { $search: `\"${filter}\"` } }, { amount: filter }]);
    if (!!flow && flow != "") query.flow = flow;
    if (!!oneoff && oneoff != "") query.oneoff = oneoff == "true";

    if (!!archived) query.archived = archived == "true" ? true : false;
    if (!!month) {
      query.date = {
        $gte: new Date(month),
        $lt: endOfMonth(new Date(month))
      };
    }
    let sort = { name: 1 };
    if (sortBy) sort = { [sortBy]: sortDesc == "true" ? -1 : 1 };

    let transactions = await Transaction.find(query).sort(sort).populate(populate);
    return res.send(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const list_unallocated_transactions = async (req, res) => {
  try {
    let query = { flow: null };
    let { filter, sortBy, sortDesc, archived, oneoff } = req.query;
    if (filter)
      isNaN(filter)
        ? (query.$or = [{ $text: { $search: `\"${filter}\"` } }])
        : (query.$or = [{ $text: { $search: `\"${filter}\"` } }, { amount: filter }]);

    if (archived != undefined) query.archived = archived == "true" ? true : false;
    if (oneoff != undefined) query.oneoff = oneoff == "true" ? true : false;
    let sort = { name: 1 };
    if (sortBy) sort = { [sortBy]: sortDesc == "true" ? -1 : 1 };
    let transactions = await Transaction.find(query).sort(sort);

    let transactionsWithFlow = [];
    let transactionsWithoutFlow = [];

    for (let transaction of transactions) {
      let flow = await findMatchingFlow(transaction);
      if (flow) {
        transaction.flow = flow.id;
        transactionsWithFlow.push(transaction);
      } else {
        transactionsWithoutFlow.push(transaction);
      }
    }

    let allTransactions = [...transactionsWithFlow, ...transactionsWithoutFlow];
    return res.send(allTransactions);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const update_transaction = async (req, res) => {
  try {
    let { _id } = req.params;
    let transaction = await Transaction.findByIdAndUpdate(_id, req.body);
    return res.send(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const delete_transactions = async (req, res) => {
  try {
    await Transaction.deleteMany({});
    return res.send();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

module.exports = {
  upload_csv,
  upload_monzo,
  list_transactions,
  list_unallocated_transactions,
  update_transaction,
  delete_transactions
};
