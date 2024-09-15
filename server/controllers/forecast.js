const Flow = require("../models/Flow");
const Budget = require("../models/Budget");
const BudgetCategory = require("../models/BudgetCategory");
const Transaction = require("../models/Transaction");
const Estimate = require("../models/Estimate");
const Settings = require("../models/Settings");

const {
  startOfMonth,
  eachMonthOfInterval,
  addMonths,
  subMonths,
  subMinutes,
  endOfMonth,
  isSameMonth
} = require("date-fns");

const round = (amount) => {
  return Math.round(amount * 100) / 100;
};

const generate_forecast = async (req, res) => {
  try {
    let allFlows = await Flow.find({});
    let allBudgets = await Budget.find({}).sort("order");
    let allBudgetCategories = await BudgetCategory.find({}).sort("order");

    let monthStart = subMonths(startOfMonth(new Date()), 3);
    let numberOfPeriods = 15;
    let dates = eachMonthOfInterval({
      start: monthStart,
      end: addMonths(monthStart, numberOfPeriods - 1)
    }).map((d) => subMinutes(d, d.getTimezoneOffset()));

    let periods = await Promise.all(
      dates.map(async (date, dateIndex, datesArray) => {
        let period = {
          date,
          flows: [],
          budgets: [],
          budgetCategories: [],
          actualTransactionsCount: 0,
          oneoffs: { actualTotal: 0 },
          totals: []
        };

        for (let budgetCategory of allBudgetCategories) {
          let budgets = allBudgets.filter((b) => String(budgetCategory._id) == String(b.category));

          let budgetEstimateSum = 0;
          let budgetActualSum = 0;

          for (let budget of budgets) {
            let flowEstimateSum = 0;
            let flowActualSum = 0;
            let actualTransactionIds = [];

            let flows = allFlows.filter((f) => String(budget._id) == String(f.budget));
            for (let flow of flows) {
              let transactions = await Transaction.find({
                flow: flow._id,
                oneoff: false,
                archived: false,
                date: {
                  $gte: new Date(date),
                  $lt: new Date(endOfMonth(date))
                }
              });
              let estimate = await Estimate.findOne({
                flow: flow._id,
                type: "flow",
                date: {
                  $lt: new Date(endOfMonth(date))
                }
              }).sort({ date: -1 });

              period.actualTransactionsCount += transactions.length;
              let transactionsSum = round(transactions.reduce((prev, curr) => prev + curr.amount, 0));
              let flowEstimate = round(estimate?.amount || 0);

              let periodFlow = {
                name: flow.name,
                _id: flow._id,
                automatedAmount: !isSameMonth(date, estimate?.date),
                actualTotal: transactionsSum,
                actualTransactionIds: transactions.map((t) => t._id),
                estimate: !budget.estimate,
                estimatedTotal: flowEstimate,
                totalDiff: transactionsSum - flowEstimate
              };

              flowActualSum += transactionsSum;
              flowEstimateSum += flowEstimate;
              actualTransactionIds.push(...periodFlow.actualTransactionIds);
              period.flows.push(periodFlow);
            }
            let estimate = await Estimate.findOne({
              budget: budget._id,
              type: "budget",
              date: {
                $lt: new Date(endOfMonth(date))
              }
            }).sort({ date: -1 });
            let budgetEstimate = round(budget.estimate ? estimate?.amount || 0 : flowEstimateSum);

            let periodBudget = {
              name: budget.name,
              _id: budget._id,
              automatedAmount: !isSameMonth(date, estimate?.date),
              actualTotal: round(flowActualSum),
              estimate: budget.estimate,
              estimatedTotal: budgetEstimate,
              totalDiff: round(flowActualSum - budgetEstimate),
              actualTransactionIds
            };
            budgetEstimateSum += periodBudget.estimatedTotal;
            budgetActualSum += periodBudget.actualTotal;
            period.budgets.push(periodBudget);
          }
          let periodBudgetCategory = {
            name: budgetCategory.name,
            _id: budgetCategory._id,
            actualTotal: budgetActualSum,
            estimatedTotal: budgetEstimateSum
          };
          periodBudgetCategory.totalDiff = periodBudgetCategory.actualTotal - periodBudgetCategory.estimatedTotal;

          period.budgetCategories.push(periodBudgetCategory);
        }
        let oneoffTransactions = await Transaction.find({
          oneoff: true,
          archived: false,
          date: {
            $gte: new Date(date),
            $lt: new Date(endOfMonth(date))
          }
        });
        period.oneoffs.actualTotal =
          Math.round(oneoffTransactions.reduce((prev, curr) => prev + curr.amount, 0) * 100) / 100;

        let diffEstimated =
          Math.round(period.budgetCategories.reduce((prev, curr) => prev + curr.estimatedTotal, 0) * 100) / 100;
        let diffActual =
          Math.round(
            (period.oneoffs.actualTotal + period.budgetCategories.reduce((prev, curr) => prev + curr.actualTotal, 0)) *
              100
          ) / 100;

        period.totals = { diffEstimated, diffActual };
        return period;
      })
    );

    let openingBalance = (await Settings.findOne({})).openingBalance;
    for (let i in periods) {
      if (i == 0) periods[i].totals.openingBalance = openingBalance;
      else
        periods[i].totals.openingBalance =
          periods[i - 1].actualTransactionsCount > 0
            ? periods[i - 1].totals.closingActual
            : periods[i - 1].totals.closingEstimated || 0;

      periods[i].totals.closingEstimated =
        periods[i].totals.openingBalance + Math.round(periods[i].totals.diffEstimated * 100) / 100;
      periods[i].totals.closingActual =
        periods[i].totals.openingBalance + Math.round(periods[i].totals.diffActual * 100) / 100;
      periods[i].totals.closingDiff = periods[i].totals.closingActual - periods[i].totals.closingEstimated;
    }
    return res.send({ periods, budgetCategories: allBudgetCategories, budgets: allBudgets, flows: allFlows });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
module.exports = { generate_forecast };
