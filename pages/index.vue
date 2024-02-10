<template>
  <div class="index">
    <b-container class="mt-3">
      <b-col>
        <h1>Budgets ({{ budgets.length }})</h1>

        <b-form-input v-model="budgetsFilter" placeholder="Search" debounce="500"></b-form-input>

        <b-card>
          <b-table
            ref="budgetsTable"
            :items="budgetsProvider"
            :fields="budgetFields"
            :filter="budgetsFilter"
            :sort-by="'recurring'"
            :sort-desc="true"
            responsive
          >
            <template #cell(date)="row">
              {{ formatDate(row.item.date) }}
            </template>
            <template #cell(recurringType)="row">
              {{ row.item.recurring ? row.item.recurringType : null }}
            </template>
            <template #cell(actions)="row">
              <b-button @click="showBudgetTransactions(row)" class="mr-2" variant="primary">
                {{ row.detailsShowing ? "Hide" : "Show" }} Transactions
              </b-button>
              <b-button @click="editBudgetModal(row.item)" variant="success">Edit</b-button>
            </template>
            <template #row-details="row">
              <b-card>
                <b-table :items="budgetTransactions(row.item)" :fields="transactionFields">
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
    <BudgetModal ref="budgetModal" @edited="editBudget" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      budgetFields: [
        { key: "date", sortable: true },
        { key: "name", sortable: true },
        { key: "recurring", sortable: true },
        { key: "recurringType", sortable: true },
        { key: "actions", sortable: false }
      ],
      transactionFields: [
        { key: "date", sortable: true },
        { key: "name", sortable: true },
        { key: "amount", sortable: true },
        { key: "description", sortable: true },
        { key: "budget", sortable: true },
        { key: "actions", sortable: false }
      ],
      budgetsFilter: "",
      budgets: [],
      transactions: []
    };
  },
  methods: {
    editBudgetModal(budget) {
      this.$refs.budgetModal.show("Edit Budget", budget);
    },
    async editBudget(budget) {
      await this.$axios.put(`/budgets/${budget._id}`, budget);
      this.$refs.budgetsTable.refresh();
    },
    formatDate(date) {
      return `${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}`;
    },
    budgetTransactions(budget) {
      return this.transactions.filter((t) => t.budget == budget._id);
    },
    async showBudgetTransactions(row) {
      let budget = row.item;
      let query = `?budget=${budget._id}`;
      let { data: transactions } = await this.$axios.get("/transactions" + query);
      for (let transaction of transactions) {
        if (!this.transactions.find((t) => t._id == transaction._id)) this.transactions.push(transaction);
      }
      row.toggleDetails();
    },

    async budgetsProvider(ctx, callback) {
      let query = `?filter=${ctx.filter}&sortBy=${ctx.sortBy}&sortDesc=${ctx.sortDesc}`;
      let { data: budgets } = await this.$axios.get("/budgets" + query);
      this.budgets = budgets;
      return budgets;
    }
  }
};
</script>

<style lang="scss">
.index {
}
</style>
