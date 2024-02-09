<template>
  <div class="index">
    <b-container class="mt-3">
      <b-col>
        <h1>Budgets ({{ budgets.length }})</h1>

        <b-form-input
          v-model="budgetsFilter"
          placeholder="Search"
          debounce="500"
        ></b-form-input>

        <b-card no-body>
          <b-table
            ref="budgetsTable"
            :items="budgetsProvider"
            :fields="budgetFields"
            :filter="budgetsFilter"
            responsive
          >
            <template #cell(date)="row">
              {{ formatDate(row.item.date) }}
            </template>
            <template #cell(actions)="row">
              <b-button
                size="sm"
                @click="showBudgetTransactions(row)"
                class="mr-2"
              >
                {{ row.detailsShowing ? "Hide" : "Show" }} Transactions
              </b-button>
            </template>
            <template #row-details="row">
              <b-card>
                <b-table
                  :items="budgetTransactions(row.item)"
                  :fields="transactionFields"
                >
                  <template #cell(date)="row">
                    {{ formatDate(row.item.date) }}
                  </template></b-table
                >
              </b-card>
            </template>
          </b-table></b-card
        ></b-col
      ></b-container
    >
  </div>
</template>

<script>
export default {
  data() {
    return {
      budgetFields: ["date", "name", "recurring", "recurringType", "actions"],
      transactionFields: ["date", "name", "description"],
      budgetsFilter: "",
      budgets: [],
      transactions: [],
    };
  },
  methods: {
    formatDate(date) {
      return `${new Date(date).toLocaleDateString()} ${new Date(
        date
      ).toLocaleTimeString()}`;
    },
    budgetTransactions(budget) {
      return this.transactions.filter((t) => t.budget == budget._id);
    },
    async showBudgetTransactions(row) {
      let budget = row.item;
      let query = `?budget=${budget._id}`;
      let { data: transactions } = await this.$axios.get(
        "/transactions" + query
      );
      for (let transaction of transactions) {
        if (!this.transactions.find((t) => t._id == transaction._id))
          this.transactions.push(transaction);
      }
      row.toggleDetails();
    },

    async budgetsProvider(ctx, callback) {
      let query = `?filter=${ctx.filter}`;
      let { data: budgets } = await this.$axios.get("/budgets" + query);
      this.budgets = budgets;
      return budgets;
    },
  },
};
</script>

<style lang="scss">
.index {
}
</style>
