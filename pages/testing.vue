<template>
  <div class="upload">
    <b-container class="mt-3">
      <b-col>
        <b-button @click="clearTransactions" variant="danger">Clear Transactions</b-button>
        <b-button @click="clearBudgets" variant="danger">Clear Budgets</b-button></b-col
      >
    </b-container>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    async clearTransactions() {
      let result = await this.$swal.fire({
        title: "Clear Transactions?",
        text: "Are you sure?",
        icon: "warning",
        showCancelButton: true
      });
      if (!result.isConfirmed) return;
      await this.$axios.delete("/transactions");
      this.$swal.fire({
        title: "Transactions Cleared",
        icon: "info"
      });
    },
    async clearBudgets() {
      let result = await this.$swal.fire({
        title: "Clear Budgets?",
        text: "Are you sure?",
        icon: "warning",
        showCancelButton: true
      });
      if (!result.isConfirmed) return;
      await this.$axios.delete("/budgets");
      this.$swal.fire({
        title: "Budgets Cleared",
        icon: "info"
      });
    }
  }
};
</script>

<style lang="scss">
.upload {
}
</style>
