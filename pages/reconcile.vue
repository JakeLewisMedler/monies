<template>
  <div class="reconcile">
    <b-container class="mt-3">
      <b-col>
        <h1>Reconcile</h1>
        <b-card>
          <b-col>
            <h2>Unallocated Transactions ({{ unallocatedTransactions.length }})</h2>
            <b-form-input v-model="unallocatedTransactionsFilter" placeholder="Search" debounce="200"></b-form-input>
            <b-table
              ref="unallocatedTransactionsTable"
              :items="transactionsProvider"
              :fields="transactionFields"
              :filter="unallocatedTransactionsFilter"
              :sort-by="'name'"
              :sort-desc="false"
              responsive
            >
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
              </template>

              <template #cell(budget)="row">
                <b-form-select v-model="row.item.budget" value-field="_id" text-field="name" :options="budgets">
                  <b-form-select-option :value="null">Create New</b-form-select-option>
                </b-form-select>
              </template>
              <template #cell(actions)="row">
                <b-button variant="primary" @click="reconcile(row.item)">√</b-button>
                <b-button variant="danger" @click="archiveTransaction(row.item)"
                  ><img class="icon" src="~/assets/icons/bin.svg" alt=""
                /></b-button> </template
            ></b-table>
          </b-col>
        </b-card> </b-col
    ></b-container>
    <BudgetModal ref="budgetModal" @created="createBudget" />
  </div>
</template>

<script>
export default {
  computed: {
    relevantBudgets() {
      return this.budgets.filter((b) => this.unallocatedTransactions.find((t) => t.budget == b._id));
    }
  },
  data() {
    return {
      budgets: [],
      unallocatedTransactions: [],
      budgetFields: [
        { key: "date", sortable: true },
        { key: "name", sortable: true },
        { key: "recurring", sortable: true },
        { key: "recurringType", sortable: true }
      ],
      budgetsFilter: "",
      transactionFields: [
        { key: "date", sortable: true },
        { key: "name", sortable: true },
        { key: "amount", sortable: true },
        { key: "description", sortable: true },
        { key: "budget", sortable: false, thStyle: "min-width:200px;" },
        { key: "actions", sortable: true, thStyle: "min-width:150px;" }
      ],
      unallocatedTransactionsFilter: ""
    };
  },
  mounted() {
    this.getBudgets();
  },
  methods: {
    async archiveTransaction(transaction) {
      let result = await this.$swal.fire({
        title: "Archive Transaction?",
        text: "Are you sure?",
        icon: "warning",
        showCancelButton: true
      });
      if (!result.isConfirmed) return;
      await this.$axios.put(`/transactions/${transaction._id}`, { archived: true });
      this.$refs.unallocatedTransactionsTable.refresh();
      this.$swal.fire({
        title: "Transaction Archived",
        icon: "info"
      });
    },
    async getBudgets() {
      let { data: budgets } = await this.$axios.get("/budgets?recurring=true");
      this.budgets = budgets;
    },
    async transactionsProvider(ctx, callback) {
      let query = `?archived=false&filter=${ctx.filter}&sortBy=${ctx.sortBy}&sortDesc=${ctx.sortDesc}`;
      let { data: transactions } = await this.$axios.get("/transactions/unallocated" + query);
      this.unallocatedTransactions = transactions;
      return transactions;
    },
    async reconcile(transaction) {
      let { budget } = transaction;
      if (budget) {
        await this.$axios.put(`/transactions/${transaction._id}`, { budget });
        this.$refs.unallocatedTransactionsTable.refresh();
        await this.getBudgets();
      } else {
        await this.createBudgetModal(transaction);
      }
    },
    async createBudget(budget, transaction) {
      await this.$axios.post("/budgets", {
        budget,
        transaction
      });
      this.$refs.unallocatedTransactionsTable.refresh();
      await this.getBudgets();
    },
    async createBudgetModal(transaction) {
      let { data: budget } = await this.$axios.post("/budgets/create-temp", {
        transaction
      });
      this.$refs.budgetModal.show("Create Budget", budget, transaction);
    },
    formatDate(date) {
      return `${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}`;
    }
  }
};
</script>

<style lang="scss">
.reconcile {
  .icon {
    width: 24px;
  }
}
</style>
