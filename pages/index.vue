<template>
  <div class="cashflow">
    <b-col>
      <b-col class="px-5 mt-3">
        <b-row align-h="between">
          <h1>Cashflow</h1>
        </b-row>

        <b-card no-body>
          <b-card-body class="p-0">
            <b-col>
              <b-row class="table__container">
                <table v-if="forecast">
                  <tr class="header">
                    <th class="sticky">&nbsp;</th>
                    <th v-for="period in forecast?.periods" :key="`date${period.date}`" colspan="3">
                      {{ $dateFns.format(period.date, "MMM yy") }}
                    </th>
                  </tr>
                  <tr class="subheader">
                    <th class="sticky"></th>
                    <template v-for="period in forecast?.periods">
                      <th class="text-center w-50">Estimated</th>
                      <th class="text-center w-50">Actual</th>
                      <th class="text-center w-50">Diff</th></template
                    >
                  </tr>
                  <template v-for="budgetCategory in forecast.budgetCategories">
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
                        <span> {{ budgetCategory.name }}</span>
                        <img
                          v-if="budgetCategory.show"
                          class="hide"
                          src="~/assets/icons/hide.svg"
                          @click="show('budgetCategories', budgetCategory._id, false)"
                        />
                        <img
                          v-else
                          class="show"
                          src="~/assets/icons/show.svg"
                          @click="show('budgetCategories', budgetCategory._id, true)"
                        />
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

                    <template v-if="budgetCategory.show" v-for="budget in getBudgets(budgetCategory)">
                      <tr class="break small">
                        <td class="sticky break"></td>
                        <template v-for="i in forecast?.periods.length">
                          <td class="thick__border"></td>
                          <td></td>
                          <td></td>
                        </template>
                      </tr>
                      <tr class="budget">
                        <td class="budget__name sticky">
                          <span> {{ budget.name }}</span>
                          <img
                            v-if="budget.show"
                            class="hide"
                            src="~/assets/icons/hide.svg"
                            @click="show('budgets', budget._id, false)"
                          />
                          <img
                            v-else
                            class="show"
                            src="~/assets/icons/show.svg"
                            @click="show('budgets', budget._id, true)"
                          />
                        </td>
                        <template v-for="period in forecast?.periods">
                          <td v-if="!getPeriodBudget(period, budget).estimate" class="thick__border budget__value">
                            {{ formatCurrency(getPeriodBudget(period, budget).estimatedTotal) }}
                          </td>
                          <td
                            v-else
                            class="thick__border budget__value"
                            :class="{ fixed__value: !getPeriodBudget(period, budget).automatedAmount }"
                          >
                            <b-input-group size="sm" prepend="£">
                              <b-form-input
                                type="number"
                                v-model="getPeriodBudget(period, budget).estimatedTotal"
                                @change="setBudgetEstimate($event, period, budget)"
                              ></b-form-input>
                            </b-input-group>
                          </td>
                          <td
                            v-if="getPeriodBudget(period, budget).actualTransactionIds.length == 0"
                            class="budget__value"
                          >
                            -
                          </td>

                          <td
                            v-else
                            class="budget__value"
                            :class="{
                              warning:
                                getPeriodBudget(period, budget).estimate &&
                                getPeriodBudget(period, budget).actualTotal <
                                  getPeriodBudget(period, budget).estimatedTotal
                            }"
                          >
                            {{ formatCurrency(getPeriodBudget(period, budget).actualTotal) }}
                          </td>
                          <td
                            class="budget__value"
                            :class="{
                              warning: getPeriodBudget(period, budget).totalDiff < 0
                            }"
                          >
                            {{ formatCurrency(getPeriodBudget(period, budget).totalDiff) }}
                          </td>
                        </template>
                      </tr>

                      <tr v-if="budget.show" v-for="flow in getFlows(budget)" :key="flow._id" class="flow">
                        <td class="flow__name sticky">
                          {{ flow.name }}
                        </td>
                        <template v-for="period in forecast?.periods">
                          <td v-if="!getPeriodFlow(period, flow).estimate" class="thick__border flow__value"></td>
                          <td
                            v-else
                            class="thick__border flow__value"
                            :class="{ fixed__value: !getPeriodFlow(period, flow).automatedAmount }"
                          >
                            <b-input-group size="sm" prepend="£">
                              <b-form-input
                                type="number"
                                v-model="getPeriodFlow(period, flow).estimatedTotal"
                                @change="setFlowEstimate($event, period, flow)"
                              ></b-form-input>
                            </b-input-group>
                          </td>
                          <td v-if="getPeriodFlow(period, flow).actualTransactionIds.length == 0" class="flow__value">
                            -
                          </td>
                          <td
                            v-else
                            class="flow__value"
                            :class="{
                              warning:
                                getPeriodFlow(period, flow).estimate &&
                                getPeriodFlow(period, flow).actualTotal < getPeriodFlow(period, flow).estimatedTotal
                            }"
                          >
                            <a :href="getTransactionsPath(period, flow)">
                              {{ formatCurrency(getPeriodFlow(period, flow).actualTotal) }}</a
                            >
                          </td>
                          <td class="flow__value">
                            {{ formatCurrency(getPeriodFlow(period, flow).totalDiff) }}
                          </td>
                        </template>
                      </tr>
                    </template>
                  </template>

                  <tr class="break">
                    <td v-for="i in forecast?.periods.length * 3 + 1" :key="i">&nbsp;</td>
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
          </b-card-body>
        </b-card>
      </b-col>
    </b-col>
  </div>
</template>

<script>
export default {
  async mounted() {
    await this.getForecast();
  },
  data() {
    return { forecast: null };
  },
  methods: {
    show(type, id, show) {
      let item = this.forecast[type].find((i) => i._id == id);
      if (item) this.$set(item, "show", show);
      console.log(item);
    },
    getBudgets(budgetCategory) {
      return this.forecast.budgets.filter((b) => b.category == budgetCategory._id);
    },
    getFlows(budget) {
      return this.forecast.flows.filter((f) => f.budget == budget._id);
    },
    gotoTransactions(period, flow) {
      this.$router.push(`/transactions?flow=${flow._id}&month=${period.date}`);
    },
    getTransactionsPath(period, flow) {
      if (flow) return `/transactions?flow=${flow._id}&month=${period.date}`;
      else return `/transactions?oneoff=true&month=${period.date}`;
    },
    async getForecast() {
      let { data: forecast } = await this.$axios.get(`/forecast`);
      forecast.budgetCategories = forecast.budgetCategories.map((b) => {
        return { ...b, show: false };
      });
      forecast.budgets = forecast.budgets.map((b) => {
        return { ...b, show: false };
      });
      this.forecast = forecast;
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
  a {
    color: #000;
  }
  .table__container {
    max-height: calc(100vh - 200px);
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

      .show {
        width: 18px;
        cursor: pointer;
      }
      .hide {
        width: 18px;
        cursor: pointer;
      }
      .header {
        position: relative;
        z-index: 2;
        th {
          position: sticky;
          top: 0;
          background-color: #f9f8f8;
        }
      }
      .subheader {
        position: relative;
        z-index: 2;

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
        &.small {
          height: 2px;
        }
      }
      .budget__category {
        .budget__category__name {
          padding: 0 20px 0 20px;
          border: 1px solid #aaa;
          font-size: 22px;
          display: flex;
          justify-content: space-between;
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
          padding: 0 20px 0 20px;
          border: 1px solid #aaa;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          max-width: 300px;
          display: flex;
          justify-content: space-between;
        }
        font-weight: bold;

        .budget__value {
          text-align: center;
          border: 1px solid #aaa;

          &.warning {
            color: #f00;
          }
          &.fixed__value {
            border: 2px solid #00f;
          }
        }
      }
      .flow {
        .flow__name {
          padding-left: 20px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          max-width: 300px;
        }
        .flow__value {
          text-align: center;
          border: 1px solid #aaa;
          a {
            color: inherit;
          }
          cursor: pointer;
          &.warning {
            color: #f00;
          }
          &.fixed__value {
            border: 2px solid #00f;
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
