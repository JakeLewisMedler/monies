const Flow = require("../models/Flow");
const Budget = require("../models/Budget");
const BudgetCategory = require("../models/BudgetCategory");
const Transaction = require("../models/Transaction");

const { startOfMonth, eachMonthOfInterval, addMonths, subMonths, subMinutes, endOfMonth } = require("date-fns");

const generate_forecast = async (req, res) => {
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
              estimate: false,
              estimatedTotal: 0
            };
            if (!budget.estimate) {
              periodFlow.estimate = true;
              periodFlow.estimatedTotal = flow.estimateAmount;
            }

            flowEstimateSum += periodFlow.estimatedTotal;
            flowActualSum += actual;
            period.flows.push(periodFlow);
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

module.exports = {
  generate_forecast
};
