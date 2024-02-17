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
  fs.writeFileSync(path.resolve(__dirname, "../bankData/monzo.store"), JSON.stringify(store), "utf8");
};

const getToken = () => {
  try {
    let json = fs.readFileSync(path.resolve(__dirname, "../bankData/monzo.store"), "utf8");
    let _store = JSON.parse(json);
    if (_store) store = _store;
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

    let { access_token, refresh_token } = await makeRequest("post", "oauth2/token", data);
    if (access_token) {
      store.accessToken = access_token;
    }
    if (refresh_token) {
      store.refreshToken = refresh_token;
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
    let { accounts } = await makeRequest("get", "accounts");
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

  let { transactions } = await makeRequest("get", "transactions" + query);

  allTransactions.push(...transactions);
  if (transactions.length == limit) {
    let newTransactions = await nextTransactionsPage(accountId, transactions[transactions.length - 1].id);
    allTransactions.push(...newTransactions);
  }
  return allTransactions;
};

router.get("/monzo/transactions", async (req, res) => {
  try {
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

const makeRequest = async (type, endpoint, data) => {
  try {
    if (type == "get") {
      if (!store.accessToken) throw "No Access Token";
      let { data: res } = await axios.get(API_URL + endpoint, {
        headers: { Authorization: `Bearer ${store.accessToken}` }
      });
      return res;
    } else if (type == "post") {
      let { data: res } = await axios.post(API_URL + endpoint, data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
        }
      });
      return res;
    }
  } catch (error) {
    console.error(error);
    await refreshAccess();
    await makeRequest(type, endpoint, data);
  }
};

const refreshAccess = async () => {
  try {
    if (!store.refreshToken) throw "No refresh token";
    var data = {
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: store.refreshToken
    };
    let { access_token, refresh_token } = await axios.post(API_URL + "oauth2/token", data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
      }
    });
    if (access_token) {
      store.accessToken = access_token;
    }
    if (refresh_token) {
      store.refreshToken = refresh_token;
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = router;
