<template>
  <div class="upload">
    <b-container class="mt-3">
      <b-col>
        <b-button @click="clearTransactions" variant="danger">Clear Transactions</b-button>
        <b-button @click="clearUnallocatedTransactions" variant="danger">Clear Unallocated Transactions</b-button>
        <b-button @click="clearFlows" variant="danger">Clear Flows</b-button>

        <b-button @click="backup" variant="danger">Store Backups</b-button>
        <b-button @click="restore" variant="danger">Restore Backups</b-button>
      </b-col>
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
    async clearUnallocatedTransactions() {
      let result = await this.$swal.fire({
        title: "Clear Unallocated Transactions?",
        text: "Are you sure?",
        icon: "warning",
        showCancelButton: true
      });
      if (!result.isConfirmed) return;
      await this.$axios.delete("/transactions?unallocated=true");
      this.$swal.fire({
        title: "Unallocated Transactions Cleared",
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
    },
    async backup() {
      let result = await this.$swal.fire({
        title: "Backup DB?",
        text: "Are you sure?",
        icon: "warning",
        showCancelButton: true
      });
      if (!result.isConfirmed) return;
      await this.$axios.post("/backup");
      this.$swal.fire({
        title: "DB Backed up",
        icon: "info"
      });
    },
    async restore() {
      let result = await this.$swal.fire({
        title: "Restore DB?",
        text: "Are you sure?",
        icon: "warning",
        showCancelButton: true
      });
      if (!result.isConfirmed) return;
      await this.$axios.post("/restore");
      this.$swal.fire({
        title: "DB Restored",
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
