<template>
  <div class="flows">
    <b-container class="mt-3">
      <b-col>
        <b-col>
          <b-row align-h="between">
            <h1>Flows ({{ flows.length }})</h1>
            <b-button variant="primary" @click="addFlow">Add +</b-button>
          </b-row></b-col
        >
        <b-form-input v-model="flowsFilter" placeholder="Search" debounce="500" class="mt-3"></b-form-input>

        <b-card>
          <b-table
            ref="flowsTable"
            :items="flowsProvider"
            :fields="flowFields"
            :filter="flowsFilter"
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
              <b-button @click="showFlowTransactions(row.item, row)" class="mr-2" variant="primary">
                {{ row.detailsShowing ? "Hide" : "Show" }} Transactions
              </b-button>
              <b-button @click="editFlowModal(row.item)" variant="success">Edit</b-button>
              <b-button @click="deleteFlow(row.item)" variant="danger">Delete</b-button>
            </template>
            <template #row-details="row">
              <b-card>
                <b-table :items="flowTransactions(row.item)" :fields="transactionFields">
                  <template #cell(date)="subRow">
                    {{ formatDate(subRow.item.date) }}
                  </template>
                  <template #cell(amount)="subRow">
                    {{
                      new Intl.NumberFormat("en-GB", {
                        style: "currency",
                        currency: "GBP"
                      }).format(subRow.item.amount)
                    }}
                  </template>
                  <template #cell(actions)="subRow">
                    <b-button @click="unlinkTransaction(subRow.item, row.item)" variant="danger"
                      >Unlink Transaction</b-button
                    >
                  </template></b-table
                >
              </b-card>
            </template>
          </b-table></b-card
        ></b-col
      ></b-container
    >
    <FlowModal ref="flowModal" @created="createFlow" @edited="editFlow" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      flowFields: [
        { key: "name", sortable: true },
        { key: "recurring", sortable: true },
        { key: "recurringType", sortable: true },
        { key: "budget", sortable: true },
        { key: "actions", sortable: false }
      ],
      transactionFields: [
        { key: "date", sortable: true },
        { key: "name", sortable: true },
        { key: "amount", sortable: true },
        { key: "description", sortable: true },
        { key: "flow", sortable: true },
        { key: "actions", sortable: false }
      ],
      flowsFilter: "",
      flows: [],
      transactions: []
    };
  },
  methods: {
    addFlow() {
      this.$refs.flowModal.show({ title: "Create Flow" });
    },
    editFlowModal(flow) {
      this.$refs.flowModal.show({ title: "Edit Flow", flow });
    },
    async createFlow(flow) {
      await this.$axios.post("/flows", flow);
      this.$refs.flowsTable.refresh();
    },
    async editFlow(flow) {
      await this.$axios.put(`/flows/${flow._id}`, flow);
      this.$refs.flowsTable.refresh();
    },
    async unlinkTransaction(transaction) {
      let result = await this.$swal.fire({
        title: "Unlink Flow?",
        text: "Are you sure?",
        icon: "warning",
        showCancelButton: true
      });
      if (!result.isConfirmed) return;
      await this.$axios.put(`/transactions/${transaction._id}`, { flow: null });
      this.$set(transaction, "flow", null);
      this.$swal.fire({
        title: "Flow Unlinked",
        icon: "info"
      });
    },
    async deleteFlow(flow) {
      let result = await this.$swal.fire({
        title: "Delete Flow?",
        text: "Are you sure?",
        icon: "warning",
        showCancelButton: true
      });
      if (!result.isConfirmed) return;

      await this.$axios.delete(`/flows/${flow._id}`);
      this.$refs.flowsTable.refresh();
      this.$swal.fire({
        title: "Flow Deleted",
        icon: "info"
      });
    },

    formatDate(date) {
      return `${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}`;
    },
    flowTransactions(flow) {
      return this.transactions.filter((t) => t.flow == flow._id);
    },
    async showFlowTransactions(flow, row) {
      let query = `?flow=${flow._id}`;
      let { data: transactions } = await this.$axios.get("/transactions" + query);
      for (let transaction of transactions) {
        if (!this.transactions.find((t) => t._id == transaction._id)) this.transactions.push(transaction);
      }
      if (row) row.toggleDetails();
    },

    async flowsProvider(ctx, callback) {
      let query = `?filter=${ctx.filter}&sortBy=${ctx.sortBy}&sortDesc=${ctx.sortDesc}`;
      let { data: flows } = await this.$axios.get("/flows" + query);
      this.flows = flows;
      return flows;
    }
  }
};
</script>

<style lang="scss">
.flows {
}
</style>
