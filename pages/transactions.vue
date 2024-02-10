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
    async transactionsProvider(ctx, callback) {
      let query = `?filter=${ctx.filter}`;
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
