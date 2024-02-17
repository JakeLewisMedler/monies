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
              <th class="thick__border" v-for="period in forecast?.periods" :key="`date${period.date}`" colspan="3">
                {{ $dateFns.format(period.date, "MMM yy") }}
              </th>
            </tr>
            <tr class="subheader">
              <th class="sticky"></th>
              <template v-for="period in forecast?.periods">
                <th class="thick__border text-center w-50">Estimated</th>
                <th class="text-center w-50">Actual</th>
                <th class="text-center w-50">Diff</th></template
              >
            </tr>
            <tbody v-for="budgetCategory in budgetCategories" :key="budgetCategory._id">
              <tr class="break">
                <td class="sticky break">&nbsp;</td>
                <template v-for="i in forecast?.periods.length">
                  <td class="thick__border">&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </template>
              </tr>
              <tr class="budget__category">
                <td class="budget__category__name sticky">
                  <a :href="`/forecasting?budgetCategory=${budgetCategory._id}`"> {{ budgetCategory.name }}</a>
                </td>
                <template v-for="period in forecast?.periods">
                  <td class="thick__border budget__category__value">
                    {{ formatCurrency(getPeriodBudgetCategoryTotals(period, budgetCategory).estimatedTotal) }}
                  </td>
                  <td class="budget__category__value">
                    {{ formatCurrency(getPeriodBudgetCategoryTotals(period, budgetCategory).actualTotal) }}
                  </td>
                  <td
                    class="budget__category__value"
                    :class="{
                      warning: getPeriodBudgetCategoryTotals(period, budgetCategory).totalDiff < 0
                    }"
                  >
                    {{ formatCurrency(getPeriodBudgetCategoryTotals(period, budgetCategory).totalDiff) }}
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
                  <td class="thick__border budget__value">
                    {{ formatCurrency(getPeriodBudgetTotals(period, budget).estimatedTotal) }}
                  </td>
                  <td class="budget__value">
                    {{ formatCurrency(getPeriodBudgetTotals(period, budget).actualTotal) }}
                  </td>
                  <td
                    class="budget__value"
                    :class="{
                      warning: getPeriodBudgetTotals(period, budget).totalDiff < 0
                    }"
                  >
                    {{ formatCurrency(getPeriodBudgetTotals(period, budget).totalDiff) }}
                  </td></template
                >
              </tr>
            </tbody>
            <tr class="break">
              <td class="sticky break">&nbsp;</td>
              <template v-for="i in forecast?.periods.length">
                <td class="thick__border">&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </template>
            </tr>
            <tr class="oneoffs">
              <td class="oneoffs__name sticky">One Offs</td>
              <template v-for="period in forecast?.periods">
                <td class="thick__border oneoff__value"></td>
                <td class="oneoff__value">
                  <a :href="getTransactionsPath(period)"> {{ formatCurrency(period.oneoffs.actualTotal) }}</a>
                </td>
                <td class="oneoff__value"></td>
              </template>
            </tr>

            <tbody class="totals">
              <tr class="break">
                <td class="sticky break">&nbsp;</td>
                <template v-for="i in forecast?.periods.length">
                  <td class="thick__border">&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </template>
              </tr>
              <tr class="total">
                <td class="total__name sticky">Opening Balance</td>
                <template v-for="period in forecast?.periods">
                  <td colspan="2" class="thick__border total__value">
                    {{ formatCurrency(period.totals.openingBalance) }}
                  </td>
                  <td></td>
                </template>
              </tr>
              <tr class="total">
                <td class="total__name sticky">Net cash in/out</td>
                <template v-for="period in forecast?.periods">
                  <td class="thick__border total__value">{{ formatCurrency(period.totals.diffEstimated) }}</td>
                  <td class="total__value">
                    {{ formatCurrency(period.totals.diffActual) }}
                  </td>
                  <td></td>
                </template>
              </tr>
              <tr class="total">
                <td class="total__name sticky">Closing Balance</td>
                <template v-for="period in forecast?.periods">
                  <td class="thick__border total__value">{{ formatCurrency(period.totals.closingEstimated) }}</td>
                  <td class="total__value">
                    {{ formatCurrency(period.totals.closingActual) }}
                  </td>
                  <td
                    class="total__value"
                    :class="{
                      warning: period.totals.closingDiff < 0
                    }"
                  >
                    {{ formatCurrency(period.totals.closingDiff) }}
                  </td>
                </template>
              </tr>
            </tbody>
            <tr class="break">
              <td class="sticky break">&nbsp;</td>
              <template v-for="i in forecast?.periods.length">
                <td class="thick__border">&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </template>
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
    getTransactionsPath(period) {
      return `/transactions?oneoff=true&month=${period.date}`;
    },
    collapseExpandBudgets() {
      this.collapseBudgets = !this.collapseBudgets;
    },
    getPeriodBudgetTotals(period, budget) {
      let periodBudget = period.budgets.find((b) => b._id == budget._id);
      return periodBudget;
    },
    getPeriodBudgetCategoryTotals(period, budgetCategory) {
      let periodBudgetCategory = period.budgetCategories.find((b) => b._id == budgetCategory._id);
      return periodBudgetCategory;
    },
    formatCurrency(amount) {
      if (amount === undefined) return null;
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP"
      }).format(amount);
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
  a {
    color: #000;
  }
  .table__container {
    max-height: calc(100vh - 300px);
    overflow: scroll;
    box-shadow: inset 0 0 2px #000;

    .thick__border {
      border-left: 2px solid black !important;
    }
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
        .sticky {
          z-index: 2;
        }
        th {
          position: sticky;
          top: 0;
          background-color: #f9f8f8;
        }
      }
      .subheader {
        .sticky {
          z-index: 2;
        }
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
          a {
            color: inherit;
          }
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
