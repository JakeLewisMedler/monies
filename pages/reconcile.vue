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

              <template #cell(flow)="row">
                <b-form-select v-model="row.item.flow" value-field="_id" text-field="name" :options="flows">
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
    <FlowModal ref="flowModal" @created="createFlow" />
  </div>
</template>

<script>
export default {
  computed: {
    relevantFlows() {
      return this.flows.filter((b) => this.unallocatedTransactions.find((t) => t.flow == b._id));
    }
  },
  data() {
    return {
      flows: [],
      unallocatedTransactions: [],
      transactionFields: [
        { key: "date", sortable: true },
        { key: "name", sortable: true },
        { key: "amount", sortable: true },
        { key: "description", sortable: true },
        { key: "flow", sortable: false, thStyle: "min-width:200px;" },
        { key: "actions", sortable: true, thStyle: "min-width:150px;" }
      ],
      unallocatedTransactionsFilter: ""
    };
  },
  mounted() {
    this.getFlows();
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
    async getFlows() {
      let { data: flows } = await this.$axios.get("/flows");
      this.flows = flows;
    },
    async transactionsProvider(ctx, callback) {
      let query = `?archived=false&filter=${ctx.filter}&sortBy=${ctx.sortBy}&sortDesc=${ctx.sortDesc}`;
      let { data: transactions } = await this.$axios.get("/transactions/unallocated" + query);
      this.unallocatedTransactions = transactions;
      return transactions;
    },
    async reconcile(transaction) {
      let { flow } = transaction;
      if (flow) {
        await this.$axios.put(`/transactions/${transaction._id}`, { flow });
        this.$refs.unallocatedTransactionsTable.refresh();
        await this.getFlows();
      } else {
        await this.createFlowModal(transaction);
      }
    },
    async createFlow(flow, transaction) {
      let { data } = await this.$axios.post("/flows", flow);
      if (transaction) await this.$axios.put(`/transactions/${transaction._id}`, { flow: data._id });
      this.$refs.unallocatedTransactionsTable.refresh();
      await this.getFlows();
    },
    async createFlowModal(transaction) {
      let { data: flow } = await this.$axios.post("/flows/create-temp", {
        transaction
      });
      this.$refs.flowModal.show({ title: "Create Flow", flow, transaction });
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
