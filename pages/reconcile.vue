<template>
  <div class="reconcile">
    <b-col class="px-5 mt-3">
      <b-row align-h="between">
        <h1>Reconcile</h1>
        <b-button variant="warning" :disabled="undoHistory.length == 0" @click="undo">Undo</b-button>
      </b-row>
      <b-card class="mt-3">
        <b-col>
          <div class="header">
            <h2>Unallocated Transactions ({{ unallocatedTransactions.length }})</h2>
            <h2 v-if="!!selectedTransactions.length">Total: {{ selectedTransactionsSum }}</h2>
          </div>
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
            selectable
            select-mode="range"
            sticky-header="700px"
            @row-selected="updateSelected"
          >
            <template #cell(select)="{ rowSelected }">
              <span v-if="rowSelected">&check;</span>
            </template>
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
            <template #cell(notes)="row">
              <b-form-textarea v-model="row.item.notes" @change="updateNotes(row.item)"></b-form-textarea>
            </template>
            <template #cell(flow)="row">
              <b-button :variant="getFlowButtonData(row.item).variant" @click="flowButtonClicked(row.item)">{{
                getFlowButtonData(row.item).label
              }}</b-button></template
            >

            <template #cell(actions)="row">
              <b-button variant="primary" :disabled="!row.item.flow" @click="reconcile(row.item)">Reconcile</b-button>
              <b-button variant="success" @click="oneOffTransaction(row.item)">One Off</b-button>
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
    },
    selectedTransactionsSum() {
      return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
        this.selectedTransactions.reduce((sum, transaction) => (sum += transaction.amount || 0), 0)
      );
    }
  },
  data() {
    return {
      selectedTransactions: [],
      flows: [],
      budgetCategories: [],
      budgets: [],
      unallocatedTransactions: [],
      transactionFields: [
        { key: "select" },
        { key: "date", sortable: true },
        { key: "name", sortable: true },
        { key: "amount", sortable: true },
        { key: "description", sortable: true },
        { key: "notes", sortable: true },
        { key: "flow", sortable: false, thStyle: "min-width:300px;" },
        { key: "actions", sortable: true, thStyle: "min-width:300px;" }
      ],
      unallocatedTransactionsFilter: "",
      undoHistory: []
    };
  },
  async mounted() {
    await this.getBudgets();
    await this.getFlows();

    document.addEventListener("keyup", this.handleKey);
  },
  methods: {
    async handleKey(e) {
      if (e.shiftKey && e.code == "KeyR") {
        if (this.selectedTransactions.length == 0)
          new this.$swal({ icon: "error", title: "No transactions selected to reconcile" });
        else this.reconcile(this.selectedTransactions[0]);
      } else if (e.shiftKey && e.code == "KeyO") {
        if (this.selectedTransactions.length == 0)
          new this.$swal({ icon: "error", title: "No transactions selected to one off" });
        else this.oneOffTransaction(this.selectedTransactions[0]);
      }
    },
    updateSelected(selected = []) {
      this.selectedTransactions = selected;
    },
    flowSelected({ flowId, transaction, searchField }) {
      if (!flowId) this.createFlowModal({ transaction, name: searchField });
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
        variant = "primary";
      } else {
        label = "Search";
        variant = "secondary";
      }
      return { variant, label };
    },
    async undo() {
      if (this.undoHistory.length == 0) return;
      let historyItem = this.undoHistory.pop();
      let { action, transactionId, transactionIds } = historyItem;
      if (action == "reconcile") {
        await Promise.all(
          transactionIds.map(async (id) => {
            await this.$axios.put(`/transactions/${id}`, { flow: null });
          })
        );
      }
      if (action == "archive") await this.$axios.put(`/transactions/${transactionId}`, { archived: false });
      if (action == "oneoff") {
        await Promise.all(
          transactionIds.map(async (id) => {
            await this.$axios.put(`/transactions/${id}`, { oneoff: false });
          })
        );
      }
      this.$refs.unallocatedTransactionsTable.refresh();
    },

    async oneOffTransaction(transaction) {
      let transactionIds = [
        transaction._id,
        ...this.selectedTransactions.filter((t) => t._id != transaction._id).map((t) => t._id)
      ];
      await Promise.all(
        transactionIds.map(async (id) => {
          await this.$axios.put(`/transactions/${id}`, { oneoff: true });
        })
      );
      this.undoHistory.push({
        action: "oneoff",
        transactionIds
      });

      this.$refs.unallocatedTransactionsTable.refresh();
    },
    async archiveTransaction(transaction) {
      await this.$axios.put(`/transactions/${transaction._id}`, { archived: true });
      this.undoHistory.push({ action: "archive", transactionId: transaction._id });

      this.$refs.unallocatedTransactionsTable.refresh();
    },
    async getBudgets() {
      this.budgetCategories = await this.$axios.get("/budget-categories");
      this.budgets = await this.$axios.get("/budgets");
    },
    async getFlows() {
      let flows = await this.$axios.get("/flows");
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
      let query = `?archived=false&oneoff=false&filter=${ctx.filter}&sortBy=${ctx.sortBy}&sortDesc=${ctx.sortDesc}`;
      this.unallocatedTransactions = await this.$axios.get("/transactions/unallocated" + query);
      return this.unallocatedTransactions;
    },
    async updateNotes(transaction) {
      let { notes } = transaction;
      await this.$axios.put(`/transactions/${transaction._id}`, { notes });
    },
    async reconcile(transaction) {
      let { flow } = transaction;
      if (!flow)
        return this.$swal({
          icon: "error",
          title: "No flow selected on transaction to reconcile"
        });

      let transactionIds = [
        transaction._id,
        ...this.selectedTransactions.filter((t) => t._id != transaction._id).map((t) => t._id)
      ];
      await Promise.all(
        transactionIds.map(async (id) => {
          await this.$axios.put(`/transactions/${id}`, { flow });
        })
      );
      this.undoHistory.push({
        action: "reconcile",
        transactionIds
      });

      this.$refs.unallocatedTransactionsTable.refresh();
      await this.getFlows();
    },
    async createFlow(flow, transaction) {
      flow = await this.$axios.post("/flows", flow);
      await this.getFlows();
      transaction.flow = flow._id;
    },
    async createFlowModal({ transaction, name }) {
      let flow = await this.$axios.post("/flows/create-temp", {
        transaction
      });
      this.$refs.flowModal.show({ title: "Create Flow", flow, transaction, name });
    },
    formatDate(date) {
      return `${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}`;
    }
  }
};
</script>

<style lang="scss">
.reconcile {
  .header {
    display: flex;
    justify-content: space-between;
  }
  .icon {
    width: 24px;
  }
}
</style>
