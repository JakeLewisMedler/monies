const { Router } = require("express");
const router = Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Transaction = require("./models/Transaction");

var AUTH_URL = "https://auth.monzo.com/";
var API_URL = "https://api.monzo.com/";
const clientId = process.env.MONZO_CLIENT_ID;
const clientSecret = process.env.MONZO_CLIENT_SECRET;
const redirectUrl = "http://localhost:3000/monzo";

let store = { stateToken: null, code: null, accessToken: null, refreshToken: null };

const generateStateToken = () => {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "");
};

const storeToken = () => {
  if (!store.accessToken) return;
  fs.writeFileSync(path.resolve(__dirname, "../bankData/monzo.token"), JSON.stringify(store.accessToken), "utf8");
};

const getToken = () => {
  try {
    let json = fs.readFileSync(path.resolve(__dirname, "../bankData/monzo.token"), "utf8");
    let token = JSON.parse(json);
    if (token) store.accessToken = token;
  } catch (error) {
    console.error(error);
  }
};
getToken();

router.post("/monzo/login", (req, res) => {
  try {
    store.stateToken = generateStateToken();
    let authorizationUrl =
      AUTH_URL + `?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code&state=${store.stateToken}&`;
    return res.send({ authorizationUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.post("/monzo/authenticate", async (req, res) => {
  try {
    let { code, state } = req.body;
    if (store.stateToken !== state) {
      throw new Error("The provided stateToken differs from the original one.");
    }
    var data = {
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUrl,
      code: code
    };
    store.code = code;
    let { data: res } = await axios.post(`${API_URL}oauth2/token`, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
      }
    });
    if (res.access_token) {
      store.accessToken = res.access_token;
    }
    if (res.refresh_token) {
      store.refreshToken = res.refresh_token;
    }
    storeToken();
    return res.send();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.get("/monzo/accounts", async (req, res) => {
  try {
    if (!store.accessToken) throw "No access token";
    let {
      data: { accounts }
    } = await axios.get(`${API_URL}accounts`, {
      headers: { Authorization: `Bearer ${store.accessToken}` }
    });
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

const nextTransactionsPage = async (accountId, lastTransaction) => {
  let allTransactions = [];
  let limit = 100;
  let query = `?account_id=${accountId}&limit=${limit}&expand[]=merchant`;
  if (lastTransaction) query += `&since=${lastTransaction}`;

  let {
    data: { transactions }
  } = await axios.get(`${API_URL}transactions${query}`, {
    headers: { Authorization: `Bearer ${store.accessToken}` }
  });
  allTransactions.push(...transactions);
  if (transactions.length == limit) {
    let newTransactions = await nextTransactionsPage(accountId, transactions[transactions.length - 1].id);
    allTransactions.push(...newTransactions);
  }
  return allTransactions;
};

router.get("/monzo/transactions", async (req, res) => {
  try {
    if (!store.accessToken) throw "No access token";
    let { accountId } = req.query;
    let latestTransaction = await Transaction.findOne({}).sort({ date: -1 });

    let transactions = await nextTransactionsPage(accountId, latestTransaction?.monzoId);
    transactions = transactions
      .filter((t) => !!t.settled)
      .map((t) => {
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
