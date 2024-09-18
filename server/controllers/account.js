const Account = require("../models/Account");

const list_accounts = async (req, res) => {
  try {
    let query = {};
    let { filter, sortBy, sortDesc } = req.query;
    if (filter) query.$text = { $search: `\"${filter}\"` };
    let sort = { name: 1 };
    if (sortBy) sort = { [sortBy]: sortDesc == "true" ? -1 : 1 };
    let accounts = await Account.find(query).sort(sort);
    return res.send(accounts);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const create_account = async (req, res) => {
  try {
    let account = req.body;
    account = await Account.create(account);
    return res.send(account);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const update_account = async (req, res) => {
  try {
    let account = req.body;
    let { _id } = req.params;
    account = await Account.findByIdAndUpdate(_id, account);
    return res.send(account);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const move_account = async (req, res) => {
  try {
    let { _id } = req.params;
    let { direction } = req.body;
    let account = await Account.findById(_id);
    if (!account) throw "Couldn't find Account";
    await Account.updateMany({ order: account.order + direction }, { order: account.order });
    account.order += direction;
    await account.save();
    return res.send();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const delete_accounts = async (req, res) => {
  try {
    await Account.deleteMany({});
    return res.send();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const delete_account = async (req, res) => {
  try {
    let { _id } = req.params;
    let account = await Account.findByIdAndDelete(_id);
    return res.send(account);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

module.exports = {
  list_accounts,
  create_account,
  update_account,
  move_account,
  delete_accounts,
  delete_account
};
