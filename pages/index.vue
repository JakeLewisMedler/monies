<template>
  <div class="index">
    <b-container class="mt-3">
      <b-col>
        <b-col>
          <b-row align-h="between">
            <h1>Budgets ({{ budgets.length }})</h1>
            <b-button variant="primary" @click="addBudget">Add +</b-button>
          </b-row></b-col
        >
        <b-form-input v-model="budgetsFilter" placeholder="Search" debounce="500" class="mt-3"></b-form-input>

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
              <b-button @click="deleteBudget(row.item)" variant="danger">Delete</b-button>
            </template>
            <template #row-details="row">
              <b-card>
                <b-table :items="budgetTransactions(row.item)" :fields="transactionFields">
                  <template #cell(date)="row">
                    {{ formatDate(row.item.date) }}
                  </template>
                  <template #cell(amount)="row">
                    {{
                      new Intl.NumberFormat("en-GB", {
                        style: "currency",
                        currency: "GBP"
                      }).format(row.item.amount)
                    }}
                  </template></b-table
                >
              </b-card>
            </template>
          </b-table></b-card
        ></b-col
      ></b-container
    >
    <BudgetModal ref="budgetModal" @created="createBudget" @edited="editBudget" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      budgetFields: [
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
    addBudget() {
      this.$refs.budgetModal.show({ title: "Create Budget" });
    },
    editBudgetModal(budget) {
      this.$refs.budgetModal.show({ title: "Edit Budget", budget });
    },
    async createBudget(budget) {
      await this.$axios.post("/budgets", budget);
      this.$refs.budgetsTable.refresh();
    },
    async editBudget(budget) {
      await this.$axios.put(`/budgets/${budget._id}`, budget);
      this.$refs.budgetsTable.refresh();
    },
    async deleteBudget(budget) {
      let result = await this.$swal.fire({
        title: "Delete Budget?",
        text: "Are you sure?",
        icon: "warning",
        showCancelButton: true
      });
      if (!result.isConfirmed) return;

      await this.$axios.delete(`/budgets/${budget._id}`);
      this.$refs.budgetsTable.refresh();
      this.$swal.fire({
        title: "Budget Deleted",
        icon: "info"
      });
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
