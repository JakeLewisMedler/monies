<template>
  <div class="index">
    <b-col>
      <b-col class="px-5 mt-3">
        <b-row align-h="between">
          <h1>Cashflow Overview</h1>
          <b-button variant="primary" @click="collapseExpandBudgets">{{
            collapseBudgets ? "Expand" : "Collapse"
          }}</b-button>
        </b-row>

        <b-row class="table__container mt-3">
          <table v-if="forecast">
            <tr class="header">
              <th class="sticky">Budget</th>
              <th v-for="period in forecast?.periods" :key="`date${period.date}`" colspan="2">
                {{ $dateFns.format(period.date, "MMM yy") }}
              </th>
            </tr>
            <tr class="subheader">
              <th class="sticky"></th>
              <template v-for="period in forecast?.periods">
                <th class="text-center w-50">Estimated</th>
                <th class="text-center w-50">Actual</th></template
              >
            </tr>
            <tbody v-for="budgetCategory in budgetCategories" :key="budgetCategory._id">
              <tr class="break">
                <td v-for="i in forecast?.periods.length * 2 + 1" :key="i">&nbsp;</td>
              </tr>
              <tr class="budget__category">
                <td class="budget__category__name sticky">{{ budgetCategory.name }}</td>
                <template v-for="period in forecast?.periods">
                  <td class="budget__category__value">
                    {{ getPeriodBudgetCategoryTotals(period, budgetCategory).estimatedTotal }}
                  </td>
                  <td
                    class="budget__category__value"
                    :class="{
                      warning:
                        getPeriodBudgetCategoryTotals(period, budgetCategory).actualTotal >
                        getPeriodBudgetCategoryTotals(period, budgetCategory).estimatedTotal
                    }"
                  >
                    {{ getPeriodBudgetCategoryTotals(period, budgetCategory).actualTotal }}
                  </td></template
                >
              </tr>
              <tr
                v-if="!collapseBudgets"
                v-for="budget in budgets.filter((b) => b.category == budgetCategory._id)"
                :key="budget._id"
                class="budget"
              >
                <td class="budget__name sticky">
                  {{ budget.name }}
                </td>
                <template v-for="period in forecast?.periods">
                  <td class="budget__value">
                    {{ getPeriodBudgetTotals(period, budget).estimatedTotal }}
                  </td>
                  <td
                    class="budget__value"
                    :class="{
                      warning:
                        getPeriodBudgetTotals(period, budget).actualTotal >
                        getPeriodBudgetTotals(period, budget).estimatedTotal
                    }"
                  >
                    {{ getPeriodBudgetTotals(period, budget).actualTotal }}
                  </td></template
                >
              </tr>
            </tbody>
            <tr class="break">
              <td v-for="i in forecast?.periods.length * 2 + 1" :key="i">&nbsp;</td>
            </tr>
            <tr class="oneoffs">
              <td class="oneoffs__name sticky">One Offs</td>
              <template v-for="period in forecast?.periods">
                <td class="oneoff__value"></td>
                <td class="oneoff__value">
                  {{ formatCurrency(period.oneoffs.actualTotal) }}
                </td></template
              >
            </tr>

            <tbody class="totals">
              <tr class="break">
                <td v-for="i in forecast?.periods.length * 2 + 1" :key="i">&nbsp;</td>
              </tr>
              <tr class="total">
                <td class="total__name sticky">Opening Balance</td>
                <template v-for="period in forecast?.periods">
                  <td class="total__value">{{ formatCurrency(period.totals.openingBalance) }}</td>
                  <td class="total__value">{{ formatCurrency(period.totals.openingBalance) }}</td></template
                >
              </tr>
              <tr class="total">
                <td class="total__name sticky">Net cash in/out</td>
                <template v-for="period in forecast?.periods">
                  <td class="total__value">{{ formatCurrency(period.totals.diffEstimated) }}</td>
                  <td class="total__value" :class="{ warning: period.totals.diffActual > period.totals.diffEstimated }">
                    {{ formatCurrency(period.totals.diffActual) }}
                  </td></template
                >
              </tr>
              <tr class="total">
                <td class="total__name sticky">Closing Balance</td>
                <template v-for="period in forecast?.periods">
                  <td class="total__value">{{ formatCurrency(period.totals.closingEstimated) }}</td>
                  <td
                    class="total__value"
                    :class="{ warning: period.totals.closingActual > period.totals.closingEstimated }"
                  >
                    {{ formatCurrency(period.totals.closingActual) }}
                  </td></template
                >
              </tr>
            </tbody>
            <tr class="break">
              <td v-for="i in forecast?.periods.length * 2 + 1" :key="i">&nbsp;</td>
            </tr>
          </table>
        </b-row></b-col
      >
    </b-col>
  </div>
</template>

<script>
export default {
  mounted() {
    this.getData();
  },
  data() {
    return { budgetCategories: [], budgets: [], forecast: null, collapseBudgets: true };
  },
  methods: {
    collapseExpandBudgets() {
      this.collapseBudgets = !this.collapseBudgets;
    },
    getPeriodBudgetTotals(period, budget) {
      let periodBudget = period.budgets.find((b) => b._id == budget._id);
      let estimatedTotal = this.formatCurrency(periodBudget.estimatedTotal);
      let actualTotal = this.formatCurrency(periodBudget.actualTotal);
      return { estimatedTotal, actualTotal };
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP"
      }).format(amount);
    },
    getPeriodBudgetCategoryTotals(period, budgetCategory) {
      let periodBudgetCategory = period.budgetCategories.find((b) => b._id == budgetCategory._id);
      let estimatedTotal = this.formatCurrency(periodBudgetCategory.estimatedTotal);
      let actualTotal = this.formatCurrency(periodBudgetCategory.actualTotal);
      return { estimatedTotal, actualTotal };
    },
    async getData() {
      let { data: budgetCategories } = await this.$axios.get("/budget-categories");
      this.budgetCategories = budgetCategories;
      let { data: budgets } = await this.$axios.get("/budgets");
      this.budgets = budgets;
      let { data: forecast } = await this.$axios.get("/forecast");
      this.forecast = forecast;
    }
  }
};
</script>

<style lang="scss">
.index {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  .table__container {
    max-height: calc(100vh - 300px);
    overflow: scroll;
    box-shadow: inset 0 0 2px #000;

    table {
      position: relative;
      .sticky {
        position: sticky;
        left: 0;
        background-color: #ddd;
        border-right: 1px solid #aaa;
        z-index: 1;
      }
      .header {
        th {
          position: sticky;
          top: 0;
          background-color: #f9f8f8;
        }
      }
      .subheader {
        th {
          position: sticky;
          top: 26px;
          background-color: #f9f8f8;
          border-bottom: 1px solid #aaa;
        }
      }
      th {
        font-weight: bold;
        min-width: 200px;
        border: 1px solid #aaa;
        text-align: center;
      }
      .break {
        background: #888;
      }

      .budget__category {
        .budget__category__name {
          padding-left: 20px;
          border: 1px solid #aaa;
        }
        font-weight: bold;

        .budget__category__value {
          text-align: center;
          border: 1px solid #aaa;
          &.warning {
            color: #f00;
          }
        }
      }
      .budget {
        .budget__name {
          padding-left: 20px;
        }
        .budget__value {
          text-align: center;
          border: 1px solid #aaa;
          &.warning {
            color: #f00;
          }
        }
      }

      .oneoffs {
        .oneoffs__name {
          padding-left: 20px;
          border: 1px solid #aaa;
        }
        font-weight: bold;

        .oneoff__value {
          text-align: center;
          border: 1px solid #aaa;
        }
      }

      .totals {
        .break {
          border-bottom: 3px solid #000;
        }
        .total {
          .total__name {
            padding-left: 20px;
            font-weight: bold;
          }
          .total__value {
            text-align: center;
            border: 1px solid black;
            &.warning {
              color: #f00;
            }
          }
        }
      }
    }
  }
}
</style>
