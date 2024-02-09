<template>
  <div class="upload">
    <b-container class="mt-3">
      <b-col>
        <h1>Reconcile</h1>
        <b-card no-body>
          <b-col>
            <!-- <h2>Auto Allocated Budgets</h2>
            <b-table
              :items="relevantBudgets"
              :fields="budgetFields"
              :filter="budgetsFilter"
              responsive
            >
              <template #cell(date)="row">
                {{ formatDate(row.item.date) }}
              </template></b-table
            > -->
            <h2>
              Unallocated Transactions ({{ unallocatedTransactions.length }})
            </h2>
            <b-form-input
              ref="unallocatedTransactionsTable"
              v-model="unallocatedTransactionsFilter"
              placeholder="Search"
              debounce="500"
            ></b-form-input>
            <b-table
              :items="transactionsProvider"
              :fields="transactionFields"
              :filter="unallocatedTransactionsFilter"
              responsive
            >
              <template #cell(date)="row">
                {{ formatDate(row.item.date) }}
              </template>
              <template #cell(budget)="row">
                <b-form-select
                  v-model="row.item.budget"
                  value-field="_id"
                  text-field="name"
                  :options="budgets"
                >
                  <b-form-select-option :value="null"
                    >Create New</b-form-select-option
                  >
                </b-form-select>
              </template>
              <template #cell(actions)="row">
                <b-button variant="primary" @click="reconcile(row.item)"
                  >√</b-button
                >
              </template></b-table
            >
          </b-col>
        </b-card>
      </b-col></b-container
    >
    <b-modal
      ref="createBudgetModal"
      title="Create Budget"
      size="lg"
      ok-title="Submit"
      @ok="submitBudget"
    >
      <EditBudget />
    </b-modal>
  </div>
</template>

<script>
export default {
  computed: {
    relevantBudgets() {
      return this.budgets.filter((b) =>
        this.unallocatedTransactions.find((t) => t.budget == b._id)
      );
    },
  },
  data() {
    return {
      budgets: [],
      unallocatedTransactions: [],
      budgetFields: ["date", "name", "recurring", "recurringType"],
      budgetsFilter: "",
      transactionFields: ["date", "name", "description", "budget", "actions"],
      unallocatedTransactionsFilter: "",
      modal: {
        budget: null,
        transaction: null,
      },
      recurringTypeOptions: ["weekly", "monthly", "annually", "custom"],
    };
  },
  mounted() {
    this.getBudgets();
  },
  methods: {
    async getBudgets() {
      let { data: budgets } = await this.$axios.get("/budgets");
      this.budgets = budgets;
    },
    async transactionsProvider(ctx, callback) {
      let query = `?filter=${ctx.filter}`;
      let { data } = await this.$axios.get("/transactions/unallocated" + query);
      this.unallocatedTransactions = data;
      return data;
    },
    async reconcile(transaction) {
      let { budget } = transaction;
      if (budget) {
        await this.$axios.put(`/transactions/${transaction._id}`, { budget });
        this.$refs.unallocatedTransactionsTable.refresh();
      } else {
        await this.createBudgetModal(transaction);
      }
    },
    async submitBudget() {
      await this.$axios.post("/budgets", {
        budget: this.modal.budget,
        transaction: this.modal.transaction,
      });
      this.$refs.unallocatedTransactionsTable.refresh();
    },
    async createBudgetModal(transaction) {
      let { data: budget } = await this.$axios.post("/budgets/create-temp", {
        transaction,
      });
      this.modal.budget = budget;
      this.modal.transaction = transaction;
      this.$refs.createBudgetModal.show();
    },
    formatDate(date) {
      return `${new Date(date).toLocaleDateString()} ${new Date(
        date
      ).toLocaleTimeString()}`;
    },
  },
};
</script>

<style lang="scss">
.reconcile {
}
</style>
