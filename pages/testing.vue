<template>
  <div class="upload">
    <b-container class="mt-3">
      <b-col>
        <b-button @click="clearTransactions" variant="danger">Clear Transactions</b-button>
        <b-button @click="clearFlows" variant="danger">Clear Flows</b-button></b-col
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
    async clearFlows() {
      let result = await this.$swal.fire({
        title: "Clear Flows?",
        text: "Are you sure?",
        icon: "warning",
        showCancelButton: true
      });
      if (!result.isConfirmed) return;
      await this.$axios.delete("/flows");
      this.$swal.fire({
        title: "Flows Cleared",
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
