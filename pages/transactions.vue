<template>
  <div class="index">
    <b-container class="mt-3">
      <b-col>
        <h1>Transactions ({{ transactions.length }})</h1>
        <b-form-input v-model="transactionsFilter" placeholder="Search" debounce="500"></b-form-input>

        <b-card>
          <b-table
            ref="transactionsTable"
            :items="transactionsProvider"
            :fields="transactionFields"
            :filter="transactionsFilter"
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
              {{ row.item.budget?.name }}
            </template>
            <template #cell(actions)="row">
              <b-button @click="unlinkBudget(row.item)" variant="danger">Unlink Budget</b-button>
            </template></b-table
          ></b-card
        ></b-col
      >
    </b-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      transactionFields: [
        { key: "date", sortable: true },
        { key: "name", sortable: true },
        { key: "amount", sortable: true },
        { key: "description", sortable: true },
        { key: "budget", sortable: true },
        { key: "archived", sortable: true },
        { key: "actions", sortable: true }
      ],
      transactionsFilter: "",
      transactions: []
    };
  },
  methods: {
    formatDate(date) {
      return `${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}`;
    },
    async unlinkBudget(transaction) {
      let result = await this.$swal.fire({
        title: "Unlink Budget?",
        text: "Are you sure?",
        icon: "warning",
        showCancelButton: true
      });
      if (!result.isConfirmed) return;
      await this.$axios.put(`/transactions/${transaction._id}`, { budget: null });
      this.$refs.transactionsTable.refresh();
      this.$swal.fire({
        title: "Budget Unlinked",
        icon: "info"
      });
    },

    async transactionsProvider(ctx, callback) {
      let query = `?populate=budget&filter=${ctx.filter}&sortBy=${ctx.sortBy}&sortDesc=${ctx.sortDesc}`;
      let { data } = await this.$axios.get("/transactions" + query);
      this.transactions = data;
      return data;
    }
  }
};
</script>

<style lang="scss">
.transactions {
}
</style>
