<template>
  <div class="cashflow__period">
    <div class="field bold center header sticky">{{ formatDate(period.date) }}</div>
    <div class="columns">
      <div v-if="view == 'All' || view == 'Estimated'" class="column">
        <div class="field bold center header subheader sticky">Estimated</div>
        <div class="budget__categories">
          <div v-for="budgetCategory in period.budgetCategories" :key="budgetCategory._id" class="budget__category">
            <div class="field blank"></div>
            <div class="field tall center bold">
              {{ formatCurrency(budgetCategory.estimatedTotal) }}
            </div>
            <div v-if="showBudgets(budgetCategory)" class="budgets">
              <div
                v-for="budget in getBudgets(budgetCategory)"
                :key="budget._id"
                class="budget"
                :class="{ estimated: !!budget.estimateId }"
              >
                <div v-if="!budget.estimate" class="field center bold">{{ formatCurrency(budget.estimatedTotal) }}</div>
                <b-input-group v-else class="field center bold" prepend="£">
                  <b-form-input
                    type="number"
                    number
                    v-model="budget.estimatedTotal"
                    @change="setEstimate('budget', budget, $event)"
                  ></b-form-input>
                </b-input-group>
                <div v-if="showFlows(budget)" class="flows">
                  <div
                    v-for="flow in getFlows(budget)"
                    :key="flow._id"
                    class="flow"
                    :class="{ estimated: !!flow.estimateId }"
                  >
                    <div v-if="!flow.estimate" class="field center">{{ formatCurrency(flow.estimatedTotal) }}</div>
                    <b-input-group v-else class="field center bold" prepend="£">
                      <b-form-input
                        type="number"
                        number
                        v-model="flow.estimatedTotal"
                        @change="setEstimate('flow', flow, $event)"
                      ></b-form-input>
                    </b-input-group>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="field blank"></div>
        <div class="field"></div>
        <div class="field blank"></div>
        <div class="field center" :class="{ 'columns-2': view == 'All' }">
          {{ formatCurrency(period.totals.openingBalance) }}
        </div>
        <div class="field center">{{ formatCurrency(period.totals.netEstimated) }}</div>
        <div class="field center">{{ formatCurrency(period.totals.closingEstimated) }}</div>
        <div class="field blank"></div>
      </div>
      <div v-if="view == 'All' || view == 'Actual'" class="column">
        <div class="field bold center header subheader sticky">Actual</div>
        <div class="budget__categories">
          <div v-for="budgetCategory in period.budgetCategories" :key="budgetCategory._id" class="budget__category">
            <div class="field blank"></div>
            <div class="field tall center bold">
              {{ formatCurrency(budgetCategory.actualTotal) }}
            </div>
            <div v-if="showBudgets(budgetCategory)" class="budgets">
              <div v-for="budget in getBudgets(budgetCategory)" :key="budget._id" class="budget">
                <div class="field center bold">{{ formatCurrency(budget.actualTotal) }}</div>
                <div v-if="showFlows(budget)" class="flows">
                  <div v-for="flow in getFlows(budget)" :key="flow._id" class="flow">
                    <div class="field center">
                      <a :href="getTransactionsPath(flow)"> {{ formatCurrency(flow.actualTotal) }}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="field blank"></div>
        <div class="field center bold">{{ formatCurrency(period.oneoffs.actualTotal) }}</div>
        <div class="field blank"></div>
        <div v-if="view == 'Actual'" class="field center">
          {{ formatCurrency(period.totals.openingBalance) }}
        </div>
        <div v-else class="field spacer"></div>
        <div class="field center">
          {{ period.actualTransactionsCount > 0 ? formatCurrency(period.totals.netActual) : "" }}
        </div>
        <div class="field center">
          {{ period.actualTransactionsCount > 0 ? formatCurrency(period.totals.closingActual) : "" }}
        </div>
        <div class="field blank"></div>
      </div>
      <div v-if="view == 'All'" class="column">
        <div class="field bold center header subheader sticky">Diff</div>
        <div class="budget__categories">
          <div v-for="budgetCategory in period.budgetCategories" :key="budgetCategory._id" class="budget__category">
            <div class="field blank"></div>
            <div class="field tall center bold" :class="{ warning: budgetCategory.totalDiff != 0 }">
              {{ formatCurrency(budgetCategory.totalDiff) }}
            </div>
            <div v-if="showBudgets(budgetCategory)" class="budgets">
              <div v-for="budget in getBudgets(budgetCategory)" :key="budget._id" class="budget">
                <div class="field center bold" :class="{ warning: budget.totalDiff != 0 }">
                  {{ formatCurrency(budget.totalDiff) }}
                </div>
                <div v-if="showFlows(budget)" class="flows">
                  <div v-for="flow in getFlows(budget)" :key="flow._id" class="flow">
                    <div class="field center">{{ formatCurrency(flow.totalDiff) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="field blank"></div>
        <div class="field"></div>
        <div class="field blank"></div>
        <div class="field spacer"></div>
        <div class="field spacer"></div>
        <div class="field center">{{ formatCurrency(period.totals.closingDiff) }}</div>
        <div class="field blank"></div>
      </div>
    </div>
  </div>
</template>
<script>
const { format } = require("date-fns");

export default {
  props: ["period", "view"],
  methods: {
    async setEstimate(type, item, amount) {
      if (amount == "" && item.estimateId) {
        await this.$axios.delete(`/estimates/${item.estimateId}`);
      } else if (amount != "" && item.estimateId) {
        await this.$axios.put(`/estimates/${item.estimateId}`, { amount: Number(amount) });
      } else if (amount != "" && !item.estimateId) {
        let estimate = await this.$axios.post(`/estimates`, {
          [type]: item._id,
          type,
          amount: Number(amount),
          date: this.period.date
        });
      }

      await this.$forecast.generate();
    },
    showBudgets(budgetCategory) {
      return this.$forecast.budgetCategories.find((b) => b._id == budgetCategory._id)?.show;
    },
    showFlows(budget) {
      return this.$forecast.budgets.find((b) => b._id == budget._id)?.show;
    },
    getBudgets(budgetCategory) {
      return this.period.budgets.filter((b) => b.category == budgetCategory._id);
    },
    getFlows(budget) {
      return this.period.flows.filter((f) => f.budget == budget._id);
    },
    getTransactionsPath(flow) {
      if (flow) return `/transactions?filterType=flow&filterValue=${flow._id}&month=${this.period.date}`;
      else return `/transactions?filterType=oneoff&filterValue=true&month=${this.period.date}`;
    },
    formatDate(date) {
      return format(new Date(date), "MMM yy");
    },
    formatCurrency(amount) {
      if (amount === undefined) return null;
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP"
      }).format(amount);
    }
  }
};
</script>
<style lang="scss">
.cashflow__period {
  background: #fff;
  border-left: 2px #333 solid;
  z-index: 1;
  .columns {
    display: flex;
    .column {
      width: 200px;
    }
    .field {
      &.columns-2 {
        width: 400px;
        position: relative;
        z-index: 2;
      }
    }
  }
  a {
    color: #000;
  }
  .budget {
    border-top: 2px solid #888;
  }
  .estimated {
    z-index: 1;
    position: relative;
    input {
      background: #5252d7;
      color: #fff;
    }
  }
}
</style>
