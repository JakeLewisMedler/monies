import Vue from "vue";

import { startOfMonth, eachMonthOfInterval, addMonths, subMonths, subMinutes, endOfMonth, isSameMonth } from "date-fns";
export default (ctx, inject) => {
  const fetch = async () => {
    console.time("Fetch Data");
    ctx.$forecast.accounts = await ctx.$axios.get("/accounts");
    ctx.$forecast.flows = await ctx.$axios.get("/flows");
    ctx.$forecast.budgetCategories = (await ctx.$axios.get("/budget-categories")).map((b) => {
      return { ...b, show: false };
    });
    ctx.$forecast.budgets = (await ctx.$axios.get("/budgets")).map((b) => {
      return { ...b, show: false };
    });
    ctx.$forecast.fetched = true;
    console.timeEnd("Fetch Data");
  };
  // const generate = async () => {
  //   try {
  //     if (!ctx.$forecast.data) await fetch();
  //     let {
  //       accounts: allAccounts,
  //       flows: allFlows,
  //       transactions: allTransactions,
  //       estimates: allEstimates,
  //       budgets: allBudgets,
  //       budgetCategories: allBudgetCategories
  //     } = ctx.$forecast.data;

  //     console.time("Generate Forecast");
  //     let firstTransaction = allTransactions.sort((a, b) => a.date - b.date)[0];
  //     let monthStart = startOfMonth(new Date(firstTransaction.date));
  //     let numberOfPeriods = 15;
  //     let dates = eachMonthOfInterval({
  //       start: monthStart,
  //       end: addMonths(monthStart, numberOfPeriods - 1)
  //     }).map((d) => subMinutes(d, d.getTimezoneOffset()));

  //     let periods = dates.map((date) => {
  //       let period = {
  //         date,
  //         flows: [],
  //         budgets: [],
  //         budgetCategories: [],
  //         actualTransactionsCount: 0,
  //         oneoffs: { actualTotal: 0 },
  //         totals: [],
  //         otherAccounts: allAccounts
  //           .filter((a) => !a.main)
  //           .map((a) => {
  //             return {
  //               _id: a._id,
  //               name: a.name,
  //               actualTransactionsCount: 0,
  //               totals: {
  //                 openingBalance: 0,
  //                 closingActual: 0,
  //                 closingEstimated: 0,
  //                 netActual: 0,
  //                 netEstimated: 0
  //               }
  //             };
  //           })
  //       };

  //       for (let budgetCategory of allBudgetCategories) {
  //         let budgets = allBudgets.filter((b) => String(budgetCategory._id) == String(b.category));

  //         let budgetEstimateSum = 0;
  //         let budgetActualSum = 0;

  //         for (let budget of budgets) {
  //           let flowEstimateSum = 0;
  //           let flowActualSum = 0;
  //           let actualTransactionIds = [];

  //           let flows = allFlows.filter((f) => String(budget._id) == String(f.budget));
  //           for (let flow of flows) {
  //             let transactions = allTransactions.filter(
  //               (t) =>
  //                 t.flow == flow._id &&
  //                 !t.oneoff &&
  //                 !t.archived &&
  //                 new Date(t.date) >= new Date(date) &&
  //                 new Date(t.date) < new Date(endOfMonth(date))
  //             );
  //             let estimate = allEstimates.find(
  //               (e) => e.flow == flow._id && e.type == "flow" && new Date(e.date) < new Date(endOfMonth(date))
  //             );

  //             period.actualTransactionsCount += transactions.length;
  //             let transactionsSum = round(transactions.reduce((prev, curr) => prev + curr.amount, 0));
  //             let flowEstimate = round(estimate?.amount || 0);

  //             let periodFlow = {
  //               name: flow.name,
  //               _id: flow._id,
  //               budget: budget._id,
  //               actualTotal: transactionsSum,
  //               actualTransactionIds: transactions.map((t) => t._id),
  //               estimate: !budget.estimate,
  //               estimatedTotal: flowEstimate,
  //               estimateId: isSameMonth(new Date(date), new Date(estimate?.date)) && estimate?._id,
  //               totalDiff: transactionsSum - flowEstimate
  //             };

  //             flowActualSum += transactionsSum;
  //             flowEstimateSum += flowEstimate;
  //             actualTransactionIds.push(...periodFlow.actualTransactionIds);
  //             period.flows.push(periodFlow);
  //           }

  //           let estimate = allEstimates.find(
  //             (e) => e.budget == budget._id && e.type == "budget" && new Date(e.date) < new Date(endOfMonth(date))
  //           );

  //           let budgetEstimate = round(budget.estimate ? estimate?.amount || 0 : flowEstimateSum);

  //           let periodBudget = {
  //             name: budget.name,
  //             _id: budget._id,
  //             category: budgetCategory._id,
  //             actualTotal: round(flowActualSum),
  //             estimate: budget.estimate,
  //             estimatedTotal: budgetEstimate,
  //             estimateId: isSameMonth(new Date(date), new Date(estimate?.date)) && estimate?._id,
  //             totalDiff: round(flowActualSum - budgetEstimate),
  //             actualTransactionIds
  //           };
  //           budgetEstimateSum += periodBudget.estimatedTotal;
  //           budgetActualSum += periodBudget.actualTotal;
  //           period.budgets.push(periodBudget);
  //         }
  //         let periodBudgetCategory = {
  //           name: budgetCategory.name,
  //           _id: budgetCategory._id,
  //           actualTotal: budgetActualSum,
  //           estimatedTotal: budgetEstimateSum
  //         };
  //         periodBudgetCategory.totalDiff = periodBudgetCategory.actualTotal - periodBudgetCategory.estimatedTotal;

  //         period.budgetCategories.push(periodBudgetCategory);
  //       }
  //       let oneoffTransactions = allTransactions.filter(
  //         (t) =>
  //           !!t.oneoff &&
  //           !t.archived &&
  //           new Date(t.date) >= new Date(date) &&
  //           new Date(t.date) < new Date(endOfMonth(date))
  //       );

  //       period.oneoffs.actualTotal =
  //         Math.round(oneoffTransactions.reduce((prev, curr) => prev + curr.amount, 0) * 100) / 100;

  //       let netEstimated =
  //         Math.round(period.budgetCategories.reduce((prev, curr) => prev + curr.estimatedTotal, 0) * 100) / 100;
  //       let netActual =
  //         Math.round(
  //           (period.oneoffs.actualTotal + period.budgetCategories.reduce((prev, curr) => prev + curr.actualTotal, 0)) *
  //             100
  //         ) / 100;

  //       period.totals = { netEstimated, netActual };
  //       return period;
  //     });

  //     for (let i in periods) {
  //       if (i == 0) {
  //         periods[i].totals.openingBalance = allAccounts.find((a) => a.main).openingBalance;
  //         periods[i].otherAccounts.forEach((a) => {
  //           let account = allAccounts.find((b) => String(a._id) == String(b._id));
  //           a.totals.openingBalance = account?.openingBalance || 0;
  //         });
  //       } else {
  //         periods[i].totals.openingBalance =
  //           periods[i - 1].actualTransactionsCount > 0
  //             ? periods[i - 1].totals.closingActual
  //             : periods[i - 1].totals.closingEstimated || 0;

  //         periods[i].otherAccounts.forEach((a) => {
  //           let otherAccountPreviousPeriod = periods[i - 1].otherAccounts.find((b) => String(b._id) == String(a._id));
  //           a.totals.openingBalance =
  //             otherAccountPreviousPeriod.actualTransactionsCount > 0
  //               ? otherAccountPreviousPeriod.totals.closingActual
  //               : otherAccountPreviousPeriod.totals.closingEstimated || 0;
  //         });
  //       }
  //       periods[i].totals.closingEstimated = round(periods[i].totals.openingBalance + periods[i].totals.netEstimated);
  //       periods[i].totals.closingActual = round(periods[i].totals.openingBalance + periods[i].totals.netActual);
  //       periods[i].totals.closingDiff = round(periods[i].totals.closingActual - periods[i].totals.closingEstimated);

  //       periods[i].otherAccounts.forEach((a) => {
  //         a.totals.closingEstimated = round(a.totals.openingBalance + a.totals.netEstimated);
  //         a.totals.closingActual = round(a.totals.openingBalance + a.totals.netActual);
  //         a.totals.closingDiff = round(a.totals.closingActual - a.totals.closingEstimated);
  //       });
  //     }
  //     console.timeEnd("Generate Forecast");

  //     ctx.$forecast.periods = periods;

  //     return ctx.$forecast.periods;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const generate = async () => {
    if (!ctx.$forecast.fetched) await fetch();
    ctx.$forecast.periods = await ctx.$axios.get("/forecast");
  };
  inject(
    "forecast",
    Vue.observable({
      fetch,
      generate,
      periods: [],
      accounts: [],
      flows: [],
      budgetCategories: [],
      budgets: [],
      fetched: false
    })
  );
};
