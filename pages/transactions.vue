<template>
  <div class="transactions">
    <b-col class="px-5 mt-3">
      <h1>Transactions ({{ transactions.length }})</h1>
      <b-button-group
        ><b-button :variant="filterType == 'budget' ? 'primary' : null" @click="setFilterType('budget')"
          >Budget</b-button
        ><b-button :variant="filterType == 'flow' ? 'primary' : null" @click="setFilterType('flow')">Flow</b-button
        ><b-button :variant="filterType == 'oneoff' ? 'primary' : null" @click="setFilterType('oneoff')"
          >One Off</b-button
        ></b-button-group
      >
      <b-row v-if="filterType == 'budget'" class="my-2">
        <b-col>
          <b-form-select v-model="filterValue" :options="budgets" value-field="_id" text-field="name">
            <template #first> <b-form-select-option :value="null">Budget Filter</b-form-select-option></template>
          </b-form-select>
        </b-col>
        <b-col cols="2">
          <b-button variant="primary" :disabled="filterValue == null" @click="filterValue = null"
            >Clear Filter</b-button
          >
        </b-col>
      </b-row>
      <b-row v-if="filterType == 'flow'" class="my-2">
        <b-col>
          <b-form-select v-model="filterValue" :options="flows" value-field="_id" text-field="name">
            <template #first> <b-form-select-option :value="null">Flow Filter</b-form-select-option></template>
          </b-form-select>
        </b-col>
        <b-col cols="2">
          <b-button variant="primary" :disabled="filterValue == null" @click="filterValue = null"
            >Clear Filter</b-button
          >
        </b-col>
      </b-row>
      <b-row v-if="filterType == 'oneoff'" class="my-2">
        <b-col>
          <b-form-select v-model="filterValue" value-field="_id" text-field="name">
            <template #first> <b-form-select-option :value="null">Oneoff Filter</b-form-select-option></template>
            <b-form-select-option :value="true">Yes</b-form-select-option>
            <b-form-select-option :value="false">No</b-form-select-option>
          </b-form-select>
        </b-col>
        <b-col cols="2">
          <b-button variant="primary" :disabled="filterValue == null" @click="filterValue = null"
            >Clear Filter</b-button
          >
        </b-col>
      </b-row>
      <b-row class="my-2">
        <b-col>
          <b-form-input v-model="searchFilter" placeholder="Search" debounce="500"></b-form-input>
        </b-col>
        <b-col cols="2">
          <b-button variant="primary" :disabled="searchFilter == ''" @click="setFilter('search', '')"
            >Clear Filter</b-button
          ></b-col
        ></b-row
      >

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
          :filter="{ filterValue, searchFilter }"
          sortBy="date"
          sortDesc="false"
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
    filterValue() {
      this.updateQuery();
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
      transactions: [],
      budgets: [],
      flows: [],
      filterType: "budget",
      filterValue: null,
      searchFilter: "",
      periodFilter: null
    };
  },
  created() {
    let { filterType, filterValue, period, oneoff } = this.$route.query;
    if (filterType) this.filterType = filterType;
    if (filterValue) this.filterValue = filterValue;
    if (period) this.periodFilter = period;
    if (oneoff) this.oneoffFilter = oneoff == "true";
  },
  async mounted() {
    await this.getBudgets();
    await this.getFlows();
  },
  methods: {
    setFilterType(type) {
      this.filterValue = null;
      this.filterType = type;
      this.updateQuery();
    },
    updateQuery() {
      this.$router.push({
        query: Object.fromEntries(
          Object.entries({
            filterValue: this.filterValue,
            filterType: this.filterType,
            period: this.periodFilter
          }).filter(([_, v]) => v != null)
        )
      });
    },
    filterUpdated() {
      this.$refs.transactionsTable.refresh();
    },
    async getBudgets() {
      this.budgets = await this.$axios.get("/budgets");
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
      let query = `?populate=flow&filter=${this.searchFilter}&sortBy=${ctx.sortBy}&sortDesc=${ctx.sortDesc}`;

      if (this.filterValue != null) query += `&${this.filterType}=${this.filterValue}`;
      if (this.periodFilter != null) query += `&period=${this.periodFilter}`;

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
