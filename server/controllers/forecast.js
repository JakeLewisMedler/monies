const Flow = require("../models/Flow");
const Budget = require("../models/Budget");
const BudgetCategory = require("../models/BudgetCategory");
const Transaction = require("../models/Transaction");
const Estimate = require("../models/Estimate");

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

const generate_budget_category_forecast = async (req, res) => {
  try {
    let { budgetCategory } = req.query;
    if (!budgetCategory) throw "No Budget Category";

    budgetCategory = await BudgetCategory.findById(budgetCategory);
    let budgets = await Budget.find({ category: budgetCategory._id });
    let flows = await Flow.find({ budget: { $in: budgets.map((b) => b._id) } });

    let monthStart = subMonths(startOfMonth(new Date()), 3);
    let numberOfPeriods = 15;
    let dates = eachMonthOfInterval({
      start: monthStart,
      end: addMonths(monthStart, numberOfPeriods - 1)
    }).map((d) => subMinutes(d, d.getTimezoneOffset()));

    let periods = await Promise.all(
      dates.map(async (date) => {
        let period = { date, budgets: [], flows: [] };

        for (let budget of budgets) {
          let flowEstimateSum = 0;
          let flowActualSum = 0;
          let actualTransactionIds = [];

          for (let flow of flows.filter((f) => String(f.budget) == String(budget._id))) {
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

          period.budgets.push(periodBudget);
        }
        return period;
      })
    );
    return res.send({ periods });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
const generate_forecast = async (req, res) => {
  try {
    let budgetCategories = await BudgetCategory.find({});

    let monthStart = subMonths(startOfMonth(new Date()), 3);
    let numberOfPeriods = 15;
    let dates = eachMonthOfInterval({
      start: monthStart,
      end: addMonths(monthStart, numberOfPeriods - 1)
    }).map((d) => subMinutes(d, d.getTimezoneOffset()));

    let periods = await Promise.all(
      dates.map(async (date) => {
        let period = { date, budgets: [], budgetCategories: [], oneoffs: { actualTotal: 0 }, totals: [] };

        for (let budgetCategory of budgetCategories) {
          let budgets = await Budget.find({ category: budgetCategory._id });

          let budgetEstimateSum = 0;
          let budgetActualSum = 0;

          for (let budget of budgets) {
            let flows = await Flow.find({ budget: budget._id });

            let flowEstimateSum = 0;
            let flowActualSum = 0;

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

              let actual = Math.round(transactions.reduce((prev, curr) => prev + curr.amount, 0) * 100) / 100;

              let periodFlow = {
                name: flow.name,
                _id: flow._id,
                actualTotal: actual,
                estimate: false,
                estimatedTotal: 0
              };
              if (!budget.estimate) {
                periodFlow.estimate = true;
                periodFlow.estimatedTotal = flow.estimateAmount;
              }
              periodFlow.totalDiff = periodFlow.actualTotal - periodFlow.estimatedTotal;

              flowEstimateSum += periodFlow.estimatedTotal;
              flowActualSum += actual;
            }
            let periodBudget = {
              name: budget.name,
              _id: budget._id,
              actualTotal: flowActualSum,
              estimate: false,
              estimatedTotal: flowEstimateSum
            };
            if (budget.estimate) {
              periodBudget.estimate = true;
              periodBudget.estimatedTotal = budget.estimateAmount;
            }
            periodBudget.totalDiff = periodBudget.actualTotal - periodBudget.estimatedTotal;

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
        let openingBalance = 0;
        let diffEstimated =
          Math.round(period.budgetCategories.reduce((prev, curr) => prev + curr.estimatedTotal, 0) * 100) / 100;
        let diffActual =
          Math.round(
            (period.oneoffs.actualTotal + period.budgetCategories.reduce((prev, curr) => prev + curr.actualTotal, 0)) *
              100
          ) / 100;
        let closingEstimated = Math.round((openingBalance + diffEstimated) * 100) / 100;
        let closingActual = Math.round((openingBalance + diffActual) * 100) / 100;

        let closingDiff = closingActual - closingEstimated;

        period.totals = { openingBalance, diffEstimated, diffActual, closingEstimated, closingActual, closingDiff };

        return period;
      })
    );
    return res.send({ periods });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
module.exports = { generate_budget_category_forecast, generate_forecast };
