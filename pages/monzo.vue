<template>
  <div class="monzo">
    <b-button @click="login">Login to Monzo</b-button><b-button @click="getAccounts">Get Accounts</b-button>
    <b-form-select v-model="account" :options="accounts" value-field="id" text-field="account_number"></b-form-select
    ><b-button @click="getTransactions">Get Transactions</b-button
    ><b-button @click="uploadTransactions">Upload Transactions</b-button>
    <b-table :items="transactions">
      <template #cell(upload)="row"> <b-form-checkbox v-model="row.item.upload" switch /> </template
    ></b-table>
  </div>
</template>
<script>
export default {
  data() {
    return { accounts: [], account: null, transactions: [] };
  },
  async mounted() {
    let { code, state } = this.$route.query;
    this.$router.push({ query: {} });
    if (!!code && !!state) await this.$axios.post("/monzo/authenticate", { code, state });
  },
  methods: {
    async login() {
      try {
        let { data } = await this.$axios.post("/monzo/login", {});
        location.href = data.authorizationUrl;
      } catch (error) {
        console.error(error);
      }
    },
    async getAccounts() {
      try {
        let { data: accounts } = await this.$axios.get("/monzo/accounts");
        this.accounts = accounts;
      } catch (error) {
        console.error(error);
      }
    },
    async getTransactions() {
      try {
        let { data: transactions } = await this.$axios.get(`/monzo/transactions?accountId=${this.account}`);
        this.transactions = transactions.map((t) => {
          return { ...t, upload: true };
        });
        console.log(transactions);
      } catch (error) {
        console.error(error);
      }
    },
    async uploadTransactions() {
      let transactions = this.transactions.filter((t) => t.upload);
      await this.$axios.post(`/transactions/upload-monzo`, transactions);
    }
  }
};
</script>
