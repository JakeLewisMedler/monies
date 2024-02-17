const { Router } = require("express");
const router = Router();
const MonzoApi = require("monzo-api");
const fs = require("fs");
const path = require("path");
const { subMonths } = require("date-fns");
const Transaction = require("./models/Transaction");

const clientId = process.env.MONZO_CLIENT_ID;
const clientSecret = process.env.MONZO_CLIENT_SECRET;
const monzoApi = new MonzoApi(clientId, clientSecret);
monzoApi.redirectUrl = "http://localhost:3000/monzo";

let accessToken = "";

const setToken = (token) => {
  accessToken = token;
  fs.writeFileSync(path.resolve(__dirname, "../bankData/monzo.token"), JSON.stringify(token), "utf8");
};
const getToken = () => {
  try {
    let json = fs.readFileSync(path.resolve(__dirname, "../bankData/monzo.token"), "utf8");
    let token = JSON.parse(json);
    if (token) accessToken = token;
  } catch (error) {
    console.error(error);
  }
};
getToken();

router.post("/monzo/login", (req, res) => {
  try {
    return res.send({ authorizationUrl: monzoApi.authorizationUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.post("/monzo/authenticate", async (req, res) => {
  try {
    let { code, state } = req.body;
    let result = await monzoApi.authenticate(code, state);
    setToken(result.access_token);
    return res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.get("/monzo/accounts", async (req, res) => {
  try {
    let { accounts } = await monzoApi.accounts(accessToken);
    accounts = accounts.map((a) => {
      let typeDict = { uk_retail_joint: "Joint", uk_retail: "Personal" };
      let type = typeDict[a.type] || "Other";
      return { id: a.id, account_number: a.account_number, type };
    });
    return res.send(accounts);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

const getTransactions = async (accountId, lastTransaction) => {
  let allTransactions = [];
  let limit = 100;
  let query = { limit };
  if (lastTransaction) query.since = lastTransaction;

  let { transactions } = await monzoApi.transactions(accountId, true, query, accessToken);
  allTransactions.push(...transactions);
  if (transactions.length == limit) {
    let newTransactions = await getTransactions(accountId, transactions[transactions.length - 1].id);
    allTransactions.push(...newTransactions);
  }
  return allTransactions;
};

router.get("/monzo/transactions", async (req, res) => {
  try {
    let { accountId } = req.query;
    let latestTransaction = await Transaction.findOne({}).sort({ date: -1 });

    let transactions = await getTransactions(accountId, latestTransaction?.monzoId);
    transactions = transactions.map((t) => {
      let { id, settled, merchant, scheme, amount, counterparty, description } = t;
      let name = "";
      if (counterparty?.name) name = counterparty.name;
      else if (!!merchant) name = merchant.name;
      else if (scheme.includes("pot")) name = "Savings Pot";

      return { id, date: settled, name, amount: amount / 100, description };
    });
    return res.send(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

module.exports = router;
