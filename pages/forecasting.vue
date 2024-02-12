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
                @click="selectBudgetCategory(budgetCategory)"
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
                        <td class="budget__value">{{ getPeriodBudgetTotals(period, budget).estimatedTotal }}</td>
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

                    <tr v-for="flow in flows.filter((f) => f.budget == budget._id)" :key="flow._id" class="flow">
                      <td class="flow__name sticky">
                        {{ flow.name }}
                      </td>
                      <template v-for="period in forecast?.periods">
                        <td class="flow__value">{{ getPeriodFlowTotals(period, flow).estimatedTotal }}</td>
                        <td
                          class="flow__value"
                          :class="{
                            warning:
                              getPeriodFlowTotals(period, flow).actualTotal >
                              getPeriodFlowTotals(period, flow).estimatedTotal
                          }"
                        >
                          {{ getPeriodFlowTotals(period, flow).actualTotal }}
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
    if (this.budgetCategories.length > 0) await this.selectBudgetCategory(this.budgetCategories[0]);
  },
  data() {
    return { budgetCategories: [], budgets: [], flows: [], forecast: null, selectedBudgetCategory: null };
  },
  methods: {
    async selectBudgetCategory(budgetCategory) {
      this.forecast = null;
      this.selectedBudgetCategory = budgetCategory._id;
      let { data: budgets } = await this.$axios.get(`/budgets?budgetCategory=${budgetCategory._id}`);
      this.budgets = budgets;
      let { data: flows } = await this.$axios.get(`/flows?budgetCategory=${budgetCategory._id}`);
      this.flows = flows;

      let { data: forecast } = await this.$axios.get(`/forecast?budgetCategory=${budgetCategory._id}`);
      this.forecast = forecast;
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP"
      }).format(amount);
    },
    getPeriodBudgetTotals(period, budget) {
      let periodBudget = period.budgets.find((b) => b._id == budget._id);
      let estimatedTotal = this.formatCurrency(periodBudget.estimatedTotal);
      let actualTotal = this.formatCurrency(periodBudget.actualTotal);
      return { estimatedTotal, actualTotal };
    },
    getPeriodFlowTotals(period, flow) {
      let periodFlow = period.flows.find((b) => b._id == flow._id);
      let estimatedTotal = this.formatCurrency(periodFlow.estimatedTotal);
      let actualTotal = this.formatCurrency(periodFlow.actualTotal);
      return { estimatedTotal, actualTotal };
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
    max-height: 800px;
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

      .budget {
        .budget__name {
          padding-left: 20px;
          border: 1px solid #aaa;
        }
        font-weight: bold;

        .budget__value {
          text-align: center;
          border: 1px solid #aaa;
          &.warning {
            color: #f00;
          }
        }
      }
      .flow {
        .flow__name {
          padding-left: 20px;
        }
        .flow__value {
          text-align: center;
          border: 1px solid #aaa;
          &.warning {
            color: #f00;
          }
        }
      }
    }
  }
}
</style>
