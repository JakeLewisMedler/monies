<template>
  <div class="reconcile">
    <b-col class="px-5 mt-3">
      <b-row align-h="between">
        <h1>Reconcile</h1>
        <b-button variant="warning" :disabled="undoHistory.length == 0" @click="undo">Undo</b-button>
      </b-row>
      <b-card class="mt-3">
        <b-col>
          <h2>Unallocated Transactions ({{ unallocatedTransactions.length }})</h2>
          <b-form-input v-model="unallocatedTransactionsFilter" placeholder="Search" debounce="200"></b-form-input>
          <b-table
            v-if="flows"
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
              <b-button :variant="getFlowButtonData(row.item).variant" @click="flowButtonClicked(row.item)">{{
                getFlowButtonData(row.item).label
              }}</b-button></template
            >

            <template #cell(actions)="row">
              <b-button variant="primary" :disabled="!row.item.flow" @click="reconcile(row.item)">√</b-button>
              <b-button variant="danger" @click="archiveTransaction(row.item)"
                ><img class="icon" src="~/assets/icons/bin.svg" alt=""
              /></b-button> </template
          ></b-table>
        </b-col>
      </b-card>
    </b-col>
    <FlowModal ref="flowModal" @created="createFlow" />
    <FlowSelectModal
      ref="flowSelectModal"
      :flows="flows"
      :budgets="budgets"
      :budgetCategories="budgetCategories"
      @selected="flowSelected"
    />
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
      budgetCategories: [],
      budgets: [],
      unallocatedTransactions: [],
      transactionFields: [
        { key: "date", sortable: true },
        { key: "name", sortable: true },
        { key: "amount", sortable: true },
        { key: "description", sortable: true },
        { key: "flow", sortable: false, thStyle: "min-width:400px;" },
        { key: "actions", sortable: true, thStyle: "min-width:150px;" }
      ],
      unallocatedTransactionsFilter: "",
      undoHistory: []
    };
  },
  async mounted() {
    await this.getBudgets();
    await this.getFlows();
  },
  methods: {
    flowSelected({ flowId, transaction }) {
      if (!flowId) this.createFlowModal(transaction);
      else transaction.flow = flowId;
    },
    flowButtonClicked(transaction) {
      this.$refs.flowSelectModal.show({ title: "Flow Select", transaction });
    },
    getFlowButtonData(transaction) {
      let variant, label;
      if (transaction.flow) {
        let flow = this.flows.find((f) => f._id == transaction.flow);
        label = flow?.name;
        variant = "secondary";
      } else {
        label = "Search";
        variant = "primary";
      }
      return { variant, label };
    },
    async undo() {
      if (this.undoHistory.length == 0) return;
      let historyItem = this.undoHistory.pop();
      let { action, transactionId } = historyItem;
      if (action == "reconcile") await this.$axios.put(`/transactions/${transactionId}`, { flow: null });
      if (action == "archive") await this.$axios.put(`/transactions/${transactionId}`, { archived: false });
      this.$refs.unallocatedTransactionsTable.refresh();
    },
    async archiveTransaction(transaction) {
      await this.$axios.put(`/transactions/${transaction._id}`, { archived: true });
      this.undoHistory.push({ action: "archive", transactionId: transaction._id });

      this.$refs.unallocatedTransactionsTable.refresh();
    },
    async getBudgets() {
      let { data: budgetCategories } = await this.$axios.get("/budget-categories");
      this.budgetCategories = budgetCategories;
      let { data: budgets } = await this.$axios.get("/budgets");
      this.budgets = budgets;
    },
    async getFlows() {
      let { data: flows } = await this.$axios.get("/flows");
      for (let flow of flows) {
        let budget = this.budgets.find((b) => b._id == flow.budget);
        let budgetCategory = this.budgetCategories.find((b) => b._id == flow.category);
        if (budget && budgetCategory) {
          flow.name += ` (${budgetCategory.name} - ${budget.name})`;
        }
      }
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
      if (!flow) return;
      await this.$axios.put(`/transactions/${transaction._id}`, { flow });
      this.undoHistory.push({ action: "reconcile", transactionId: transaction._id });
      this.$refs.unallocatedTransactionsTable.refresh();
      await this.getFlows();
    },
    async createFlow(flow, transaction) {
      let { data } = await this.$axios.post("/flows", flow);
      await this.getFlows();
      transaction.flow = data._id;
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
