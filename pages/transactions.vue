<template>
  <div class="transactions">
    <b-col class="px-5 mt-3">
      <h1>Transactions ({{ transactions.length }})</h1>
      <b-form-input v-model="transactionsFilter" placeholder="Search" debounce="500" class="mt-3"></b-form-input>

      <b-row class="my-2">
        <b-col>
          <b-form-select
            v-model="flowFilter"
            :options="flows"
            value-field="_id"
            text-field="name"
            @change="filterUpdated"
          >
            <template #first> <b-form-select-option :value="null">Flow Filter</b-form-select-option></template>
          </b-form-select>
        </b-col>
        <b-col cols="1">
          <b-button variant="primary" :disabled="flowFilter == null" @click="flowFilter = null">Clear Filter</b-button>
        </b-col>
      </b-row>
      <b-row class="my-2">
        <b-col>
          <b-form-select v-model="oneoffFilter" value-field="_id" text-field="name" @change="filterUpdated">
            <template #first> <b-form-select-option :value="null">Oneoff Filter</b-form-select-option></template>
            <b-form-select-option :value="true">Yes</b-form-select-option>
            <b-form-select-option :value="false">No</b-form-select-option>
          </b-form-select>
        </b-col>
        <b-col cols="1">
          <b-button variant="primary" :disabled="oneoffFilter == null" @click="oneoffFilter = null"
            >Clear Filter</b-button
          >
        </b-col>
      </b-row>
      <b-card class="my-2">
        <b-row>
          <b-col>Total: {{ formatCurrency(transactionsSum) }}</b-col></b-row
        ></b-card
      >

      <b-card>
        <b-table
          ref="transactionsTable"
          :items="transactionsProvider"
          :fields="transactionFields"
          :filter="transactionsFilter"
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
          <template #cell(notes)="row">
            <b-form-textarea v-model="row.item.notes" @change="updateNotes(row.item)"></b-form-textarea>
          </template>
          <template #cell(flow)="row">
            {{ row.item.flow?.name }}
          </template>
          <template #cell(actions)="row">
            <b-button
              @click="unreconcile(row.item)"
              variant="danger"
              :disabled="!row.item.archived && !row.item.oneoff && !row.item.flow"
              >Unreconcile</b-button
            >
          </template></b-table
        ></b-card
      ></b-col
    >
  </div>
</template>

<script>
export default {
  watch: {
    flowFilter() {
      if (this.flowFilter)
        this.$router.push({ query: { flow: this.flowFilter, oneoff: this.oneoffFilter, month: this.monthFilter } });
    },
    oneoffFilter() {
      if (this.oneoffFilter)
        this.$router.push({ query: { flow: this.flowFilter, oneoff: this.oneoffFilter, month: this.monthFilter } });
    }
  },
  computed: {
    transactionsSum() {
      return this.transactions.reduce((prev, curr) => prev + curr.amount, 0);
    }
  },
  data() {
    return {
      transactionFields: [
        { key: "date", sortable: true },
        { key: "name", sortable: true },
        { key: "amount", sortable: true },
        { key: "description", sortable: true },
        { key: "notes", sortable: true },
        { key: "flow", sortable: true },
        { key: "archived", sortable: true },
        { key: "oneoff", sortable: true },
        { key: "actions", sortable: true }
      ],
      transactionsFilter: "",
      transactions: [],
      flows: [],
      flowFilter: null,
      monthFilter: null,
      oneoffFilter: null
    };
  },
  created() {
    let { flow, month, oneoff } = this.$route.query;
    if (flow) this.flowFilter = flow;
    if (month) this.monthFilter = month;
    if (oneoff) this.oneoffFilter = oneoff == "true";
  },
  async mounted() {
    await this.getFlows();
  },
  methods: {
    filterUpdated() {
      this.$refs.transactionsTable.refresh();
    },
    async getFlows() {
      this.flows = await this.$axios.get("/flows");
    },
    formatDate(date) {
      return `${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}`;
    },
    formatCurrency(amount) {
      if (amount === undefined) return null;
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP"
      }).format(amount);
    },
    async updateNotes(transaction) {
      let { notes } = transaction;
      await this.$axios.put(`/transactions/${transaction._id}`, { notes });
    },
    async unreconcile(transaction) {
      let result = await this.$swal.fire({
        title: "Unreconcile Transaction?",
        text: "Are you sure?",
        icon: "warning",
        showCancelButton: true
      });
      if (!result.isConfirmed) return;
      await this.$axios.put(`/transactions/${transaction._id}`, { flow: null, oneoff: false, archived: false });
      this.$refs.transactionsTable.refresh();
      this.$swal.fire({
        title: "Transaction Unreconciled",
        icon: "info"
      });
    },

    async transactionsProvider(ctx, callback) {
      let query = `?populate=flow&filter=${ctx.filter}&sortBy=${ctx.sortBy}&sortDesc=${ctx.sortDesc}`;
      if (this.flowFilter != null) query += `&flow=${this.flowFilter}`;
      if (this.monthFilter != null) query += `&month=${this.monthFilter}`;
      if (this.oneoffFilter != null) query += `&oneoff=${this.oneoffFilter}`;

      this.transactions = await this.$axios.get("/transactions" + query);
      return this.transactions;
    }
  }
};
</script>

<style lang="scss">
.transactions {
}
</style>
