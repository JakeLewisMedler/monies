const Budget = require("../models/Budget");
const BudgetCategory = require("../models/BudgetCategory");
const Flow = require("../models/Flow");
const Transaction = require("../models/Transaction");

const { startOfMonth, eachMonthOfInterval, addMonths, subMonths, subMinutes } = require("date-fns");

const generate_cashflow = async (req, res) => {
  let monthStart = subMonths(startOfMonth(new Date()), 3);
  let numberOfPeriods = 15;
  let budgetCategories = await BudgetCategory.find({});
  let budgets = await Budget.find({});
  let flows = await Flow.find({ budget: { $in: budgets.map((b) => b._id) } });

  let dates = eachMonthOfInterval({
    start: monthStart,
    end: addMonths(monthStart, numberOfPeriods - 1)
  }).map((d) => subMinutes(d, d.getTimezoneOffset()));

  let periods = await Promise.all(
    dates.map(async (date) => {
      let period = { date, budgets: [], budgetCategories: [], totals: {} };

      for (let budget of budgets) {
        let flowEstimateSum = 0;
        let flowActualSum = 0;
        let actualTransactionIds = [];

        for (let flow of flows.filter((f) => String(f.budget) == String(budget._id))) {
          let transactions = await Transaction.find({
            flow: flow._id,
            date: {
              $gte: new Date(date),
              $lt: new Date(endOfMonth(date))
            }
          });
          let sum = transactions.reduce((prev, curr) => prev + curr.amount, 0);
          let actual = Math.round(sum * 100) / 100;

          let periodFlow = {
            name: flow.name,
            _id: flow._id,
            actualTotal: actual,
            actualTransactionIds: transactions.map((t) => t._id),
            estimate: false,
            estimatedTotal: 0
          };
          if (!budget.estimate) {
            periodFlow.estimate = true;
            periodFlow.estimatedTotal = flow.estimateAmount;
          }
          flowEstimateSum += periodFlow.estimatedTotal;
          flowActualSum += actual;
          actualTransactionIds.push(...periodFlow.actualTransactionIds);
          period.flows.push(periodFlow);
        }
        let periodBudget = {
          name: budget.name,
          _id: budget._id,
          actualTotal: flowActualSum,
          estimate: false,
          estimatedTotal: flowEstimateSum,
          actualTransactionIds
        };
        if (budget.estimate) {
          periodBudget.estimate = true;
          periodBudget.estimatedTotal = budget.estimateAmount;
        }

        period.budgets.push(periodBudget);
      }
      return period;
    })
  );

  // let periods = dates.map((date) => {
  //   let period = { date, budgets: [], budgetCategories: [], totals: {} };

  //   for (let budgetCategory of budgetCategories) {
  //     let budgetCategoryEstimatedTotal = 0;
  //     let budgetCategoryActualTotal = 0;
  //     for (let budget of budgets.filter((b) => String(b.category) == String(budgetCategory._id))) {
  //       let estimated = 0;
  //       let actual = 0;
  //       budgetCategoryEstimatedTotal += estimated;
  //       budgetCategoryActualTotal += actual;
  //       period.budgets.push({ name: budget.name, _id: budget._id, estimatedTotal: estimated, actualTotal: actual });
  //     }
  //     period.budgetCategories.push({
  //       name: budgetCategory.name,
  //       _id: budgetCategory._id,
  //       estimatedTotal: budgetCategoryEstimatedTotal,
  //       actualTotal: budgetCategoryActualTotal
  //     });
  //   }
  //   let openingBalance = 0;
  //   let diffEstimated = Math.round(period.budgets.reduce((prev, curr) => prev + curr.estimatedTotal, 0) * 100) / 100;
  //   let diffActual = Math.round(period.budgets.reduce((prev, curr) => prev + curr.actualTotal, 0) * 100) / 100;
  //   let closingEstimated = Math.round((openingBalance + diffEstimated) * 100) / 100;
  //   let closingActual = Math.round((openingBalance + diffActual) * 100) / 100;

  //   period.totals = { openingBalance, diffEstimated, diffActual, closingEstimated, closingActual };
  //   return period;
  // });
  return res.send({ periods });
};

module.exports = {
  generate_cashflow
};
