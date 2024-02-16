<template>
  <div class="forecasting">
    <b-col>
      <b-col class="px-5 mt-3">
        <b-row align-h="between">
          <h1>Forecasting</h1>
        </b-row>

        <b-card no-body>
          <b-card-header header-tag="nav">
            <b-nav card-header tabs>
              <b-nav-item
                v-for="budgetCategory in budgetCategories"
                :key="budgetCategory._id"
                :active="selectedBudgetCategory == budgetCategory._id"
                @click="selectBudgetCategory(budgetCategory._id)"
                >{{ budgetCategory.name }}</b-nav-item
              >
            </b-nav>
          </b-card-header>
          <b-card-body class="p-0">
            <b-col>
              <b-row class="table__container">
                <table v-if="forecast">
                  <tr class="header">
                    <th class="sticky">Flow</th>
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
                  <tbody v-for="budget in budgets" :key="budget._id">
                    <tr class="break">
                      <td v-for="i in forecast?.periods.length * 2 + 1" :key="i">&nbsp;</td>
                    </tr>
                    <tr class="budget">
                      <td class="budget__name sticky">{{ budget.name }}</td>
                      <template v-for="period in forecast?.periods">
                        <td v-if="!getPeriodBudget(period, budget).estimate" class="budget__value">
                          {{ formatCurrency(getPeriodBudget(period, budget).estimatedTotal) }}
                        </td>
                        <td
                          v-else
                          class="budget__value"
                          :class="{ automated: getPeriodBudget(period, budget).automatedAmount }"
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
                      </template>
                    </tr>

                    <tr v-for="flow in flows.filter((f) => f.budget == budget._id)" :key="flow._id" class="flow">
                      <td class="flow__name sticky">
                        {{ flow.name }}
                      </td>
                      <template v-for="period in forecast?.periods">
                        <td v-if="!getPeriodFlow(period, flow).estimate" class="flow__value"></td>
                        <td
                          v-else
                          class="flow__value"
                          :class="{ automated: getPeriodFlow(period, flow).automatedAmount }"
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
          </b-card-body>
        </b-card>
      </b-col>
    </b-col>
  </div>
</template>

<script>
export default {
  async mounted() {
    await this.getData();
    if (this.$route.query.budgetCategory) await this.selectBudgetCategory(this.$route.query.budgetCategory);
    else if (this.budgetCategories.length > 0) await this.selectBudgetCategory(this.budgetCategories[0]._id);
  },
  data() {
    return { budgetCategories: [], budgets: [], flows: [], forecast: null, selectedBudgetCategory: null };
  },
  methods: {
    gotoTransactions(period, flow) {
      this.$router.push(`/transactions?flow=${flow._id}&month=${period.date}`);
    },
    getTransactionsPath(period, flow) {
      return `/transactions?flow=${flow._id}&month=${period.date}`;
    },
    async selectBudgetCategory(budgetCategoryId) {
      this.$router.push({ query: { budgetCategory: String(budgetCategoryId) } });
      this.forecast = null;
      this.selectedBudgetCategory = budgetCategoryId;
      let { data: budgets } = await this.$axios.get(`/budgets?budgetCategory=${budgetCategoryId}`);
      this.budgets = budgets;
      let { data: flows } = await this.$axios.get(`/flows?budgetCategory=${budgetCategoryId}`);
      this.flows = flows;
      await this.getForecast();
    },
    async getForecast() {
      let { data: forecast } = await this.$axios.get(
        `/forecast/budget-category?budgetCategory=${this.selectedBudgetCategory}`
      );
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

    async getData() {
      let { data: budgetCategories } = await this.$axios.get("/budget-categories");
      this.budgetCategories = budgetCategories;
    }
  }
};
</script>

<style lang="scss">
.forecasting {
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
      }

      .budget {
        .budget__name {
          padding-left: 20px;
          border: 1px solid #aaa;
          padding-left: 20px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          max-width: 300px;
        }
        font-weight: bold;

        .budget__value {
          text-align: center;
          border: 1px solid #aaa;

          &.warning {
            color: #f00;
          }
          &.automated {
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
          &.automated {
            border: 2px solid #00f;
          }
        }
      }
    }
  }
}
</style>
