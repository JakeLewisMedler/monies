<template>
  <div class="reconcile">
    <b-col class="px-5 mt-3">
      <h1>Reconcile</h1>
      <b-card class="mt-3">
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
              <b-form-select v-model="row.item.flow" value-field="_id" text-field="name" :options="renamedFlows">
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
      </b-card>
    </b-col>
    <FlowModal ref="flowModal" @created="createFlow" />
  </div>
</template>

<script>
export default {
  computed: {
    relevantFlows() {
      return this.flows.filter((b) => this.unallocatedTransactions.find((t) => t.flow == b._id));
    },
    renamedFlows() {
      let flows = this.flows;
      for (let flow of flows) {
        let budget = this.budgets.find((b) => b._id == flow.budget);
        let budgetCategory = this.budgetCategories.find((b) => b._id == flow.category);
        if (budget && budgetCategory) {
          flow.name += ` (${budgetCategory.name} - ${budget.name})`;
        }
      }
      return this.flows;
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
        { key: "flow", sortable: false, thStyle: "min-width:300px;" },
        { key: "actions", sortable: true, thStyle: "min-width:150px;" }
      ],
      unallocatedTransactionsFilter: ""
    };
  },
  async mounted() {
    await this.getBudgets();
    await this.getFlows();
  },
  methods: {
    async archiveTransaction(transaction) {
      await this.$axios.put(`/transactions/${transaction._id}`, { archived: true });
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
