import Vue from "vue";

export default (ctx, inject) => {
  const fetch = async () => {
    console.time("Fetch Data");
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

      flows: [],
      budgetCategories: [],
      budgets: [],
      fetched: false
    })
  );
};
