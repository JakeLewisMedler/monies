<template>
  <div class="cashflow__sidebar">
    <div class="field empty"></div>
    <div class="field empty"></div>
    <div class="budget__categories">
      <div v-for="budgetCategory in $forecast.budgetCategories" :key="budgetCategory._id" class="budget__category">
        <div class="field blank"></div>
        <div class="field tall large bold button" @click="$set(budgetCategory, 'show', !budgetCategory.show)">
          {{ budgetCategory.name }}
        </div>
        <div v-if="budgetCategory.show" class="budgets">
          <div v-for="budget in getBudgets(budgetCategory)" :key="budget._id" class="budget">
            <div class="field bold button" @click="$set(budget, 'show', !budget.show)">{{ budget.name }}</div>
            <div v-if="budget.show" class="flows">
              <div v-for="flow in getFlows(budget)" :key="flow._id" class="flow">
                <div class="field">{{ flow.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="field blank"></div>
    <div class="field bold">One Offs</div>
    <div class="field blank"></div>
    <div class="field bold">Opening Balance</div>
    <div class="field bold">Net cash in/out</div>
    <div class="field bold">Closing Balance</div>
    <div class="field blank"></div>
    <div v-for="account in $forecast.accounts.filter((a) => !a.main)" :key="account._id" class="field bold">
      {{ account.name }} Balance
    </div>
  </div>
</template>
<script>
export default {
  methods: {
    getBudgets(budgetCategory) {
      return this.$forecast.budgets.filter((b) => b.category == budgetCategory._id);
    },
    getFlows(budget) {
      return this.$forecast.flows.filter((f) => f.budget == budget._id);
    }
  }
};
</script>
<style lang="scss">
.cashflow__sidebar {
  width: 300px;
  background: #ddd;
  .budget {
    border-top: 2px solid #888;
  }
}
</style>
