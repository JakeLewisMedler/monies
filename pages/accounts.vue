<template>
  <div class="accounts">
    <b-container class="mt-3">
      <b-col>
        <b-col>
          <b-row align-h="between">
            <h1>Accounts ({{ accounts.length }})</h1>
            <b-button variant="primary" @click="addAccount">Add +</b-button>
          </b-row></b-col
        >
        <b-form-input v-model="accountsFilter" placeholder="Search" debounce="500" class="mt-3"></b-form-input>

        <b-card>
          <b-table
            ref="accountsTable"
            :items="accountsProvider"
            :fields="accountFields"
            :filter="accountsFilter"
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
            <template #cell(actions)="row">
              <b-button @click="editAccountModal(row.item)" variant="success">Edit</b-button>
              <b-button @click="deleteAccount(row.item)" variant="danger">Delete</b-button>
            </template></b-table
          ></b-card
        ></b-col
      >
    </b-container>
    <AccountModal ref="accountModal" @created="createAccount" @edited="editAccount" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      accountFields: [
        { key: "name", sortable: true },
        { key: "actions", sortable: false }
      ],
      accountsFilter: "",
      accounts: []
    };
  },
  methods: {
    addAccount() {
      this.$refs.accountModal.show({ title: "Create Account" });
    },
    formatDate(date) {
      return `${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}`;
    },
    async accountsProvider(ctx, callback) {
      let query = `?filter=${ctx.filter}&sortBy=${ctx.sortBy}&sortDesc=${ctx.sortDesc}`;
      this.accounts = await this.$axios.get("/accounts" + query);
      return this.accounts;
    },
    async createAccount(account) {
      await this.$axios.post("/accounts", account);
      this.$refs.accountsTable.refresh();
    },
    async editAccount(account) {
      await this.$axios.put(`/flows-categories/${account._id}`, account);
      this.$refs.accountsTable.refresh();
    },
    editAccountModal(account) {
      let data = { ...account };
      this.$refs.accountModal.show({ title: "Edit Account", account: data });
    },
    async editAccount(account) {
      await this.$axios.put(`/accounts/${account._id}`, account);
      this.$refs.accountsTable.refresh();
    },

    async deleteAccount(account) {
      let result = await this.$swal.fire({
        title: "Delete Account?",
        text: "Are you sure?",
        icon: "warning",
        showCancelButton: true
      });
      if (!result.isConfirmed) return;

      await this.$axios.delete(`/accounts/${account._id}`);
      this.$refs.accountsTable.refresh();
      this.$swal.fire({
        title: "Account Deleted",
        icon: "info"
      });
    }
  }
};
</script>

<style lang="scss">
.accounts {
}
</style>
