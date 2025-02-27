<template>
  <b-card class="cashflow">
    <b-button-group>
      <b-button v-for="v in views" :key="v" :variant="v == view ? 'primary' : ''" @click="changeView(v)">{{
        v
      }}</b-button>
    </b-button-group>
    <b-card class="mt-3 cashflow__container">
      <div v-if="$forecast.periods" class="scroller">
        <CashflowSidebar />
        <!-- <div v-for="period in $forecast.periods" :key="String(period.date)">{{ period.date }}</div> -->
        <CashflowPeriod
          v-for="period in $forecast.periods"
          :key="String(period.date)"
          :period="period"
          :view="view"
        /></div
    ></b-card>
  </b-card>
</template>

<script>
const { format } = require("date-fns");

export default {
  async mounted() {
    await this.getForecast();
  },
  data() {
    return { forecast: null, views: ["All", "Estimated", "Actual"], view: "All" };
  },
  methods: {
    formatDate(date) {
      return format(new Date(date), "MMM yy");
    },
    changeView(view) {
      this.view = view;
      // if(view!="All")
    },
    getPeriodOtherAccount(period, otherAccount) {
      return period.otherAccounts.find((a) => String(a._id) == String(otherAccount._id));
    },
    async move(type, id, direction) {
      if (type == "budgetCategories") await this.$axios.put(`/budget-categories/${id}/move`, { direction });
      await this.getForecast();
    },
    show(type, id) {
      let item = this.forecast[type].find((i) => i._id == id);
      if (item) this.$set(item, "show", !item.show);
      this.saveView();
    },
    saveView() {
      localStorage.setItem(
        "view",
        JSON.stringify({
          budgetCategories: this.forecast?.budgetCategories.map((bc) => {
            return { _id: bc._id, show: bc.show };
          }),
          budgets: this.forecast?.budgets.map((b) => {
            return { _id: b._id, show: b.show };
          })
        })
      );
    },
    getBudgets(budgetCategory) {
      return this.forecast.budgets.filter((b) => b.category == budgetCategory._id);
    },
    getFlows(budget) {
      return this.forecast.flows.filter((f) => f.budget == budget._id);
    },
    getTransactionsPath(period, flow) {
      if (flow) return `/transactions?filterType=flow&filterValue=${flow._id}&month=${period.date}`;
      else return `/transactions?filterType=oneoff&filterValue=true&month=${period.date}`;
    },
    async getForecast() {
      try {
        await this.$forecast.generate();
        console.log(this.$forecast);
      } catch (error) {
        console.error(error);
        this.$swal.fire({
          title: "Error getting Cashflow",
          type: "error",
          text: error?.response?.data || error.message || error
        });
      }
    },
    formatCurrency(amount) {
      if (amount === undefined) return null;
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP"
      }).format(amount);
    },
    async setBudgetEstimate(amount, period, budget) {
      if (amount == "")
        await this.$axios.post(`/estimates/delete`, { type: "budget", budget: budget._id, date: period.date });
      else await this.$axios.post(`/estimates`, { type: "budget", budget: budget._id, amount, date: period.date });
      await this.getForecast();
    },
    async setFlowEstimate(amount, period, flow) {
      if (amount == "")
        await this.$axios.post(`/estimates/delete`, { type: "flow", flow: flow._id, date: period.date });
      else await this.$axios.post(`/estimates`, { type: "flow", flow: flow._id, amount, date: period.date });
      await this.getForecast();
    },
    getPeriodBudget(period, budget) {
      return period.budgets.find((b) => b._id == budget._id);
    },
    getPeriodFlow(period, flow) {
      return period.flows.find((b) => b._id == flow._id);
    },
    getPeriodBudgetCategoryTotals(period, budgetCategory) {
      let periodBudgetCategory = period.budgetCategories.find((b) => b._id == budgetCategory._id);
      return periodBudgetCategory;
    }
  }
};
</script>

<style lang="scss">
.cashflow {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  .card-body {
    display: flex;
    flex-direction: column;
  }
  .cashflow__container {
    position: relative;
    flex-grow: 1;
    overflow: scroll;
    .scroller {
      position: absolute;
      display: flex;
    }
  }
  .field {
    border: 1px solid #ccc;
    overflow: hidden;
    white-space: nowrap;
    padding: 2px;
    height: 32px;
    display: flex;
    align-items: center;
    &.button {
      cursor: pointer;
    }
    div,
    input {
      height: 100%;
    }
    &.center {
      justify-content: center;
    }
    &.tall {
      height: 44px;
    }
    &.large {
      font-size: 1.5em;
    }
    &.bold {
      font-weight: bold;
    }
    &.blank {
      background: #777;
    }
    &.warning {
      color: #f00;
    }
    &.spacer {
      border: none;
    }
  }
}
</style>
