<template>
  <div class="budget__categories">
    <b-container class="mt-3">
      <b-col>
        <b-col>
          <b-row align-h="between">
            <h1>Budget Categories ({{ budgetCategories.length }})</h1>
            <b-button variant="primary">Add +</b-button>
          </b-row></b-col
        >
        <b-form-input v-model="budgetCategoriesFilter" placeholder="Search" debounce="500" class="mt-3"></b-form-input>

        <b-card>
          <b-table
            ref="budgetCategoriesTable"
            :items="budgetCategoriesProvider"
            :fields="budgetCategoryFields"
            :filter="budgetCategoriesFilter"
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
            </template></b-table
          ></b-card
        ></b-col
      >
    </b-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      budgetCategoryFields: [
        { key: "date", sortable: true },
        { key: "name", sortable: true },
        { key: "amount", sortable: true },
        { key: "description", sortable: true },
        { key: "budget", sortable: true },
        { key: "archived", sortable: true },
        { key: "actions", sortable: true }
      ],
      budgetCategoriesFilter: "",
      budgetCategories: []
    };
  },
  methods: {
    formatDate(date) {
      return `${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}`;
    },
    async budgetCategoriesProvider(ctx, callback) {
      let query = `?filter=${ctx.filter}&sortBy=${ctx.sortBy}&sortDesc=${ctx.sortDesc}`;
      let { data } = await this.$axios.get("/budgetCategories" + query);
      this.budgetCategories = data;
      return data;
    }
  }
};
</script>

<style lang="scss">
.budgetCategories {
}
</style>
