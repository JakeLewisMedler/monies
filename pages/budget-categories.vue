<template>
  <div class="budget__categories">
    <b-container class="mt-3">
      <b-col>
        <b-col>
          <b-row align-h="between">
            <h1>Budget Categories ({{ budgetCategories.length }})</h1>
            <b-button variant="primary" @click="addBudgetCategory">Add +</b-button>
          </b-row></b-col
        >
        <b-form-input v-model="budgetCategoriesFilter" placeholder="Search" debounce="500" class="mt-3"></b-form-input>

        <b-card>
          <b-table
            ref="budgetCategoriesTable"
            :items="budgetCategoriesProvider"
            :fields="budgetCategoryFields"
            :filter="budgetCategoriesFilter"
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
            </template></b-table
          ></b-card
        ></b-col
      >
    </b-container>
    <BudgetCategoryModal ref="budgetCategoryModal" @created="createBudgetCategory" @edited="editBudgetCategory" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      budgetCategoryFields: [{ key: "name", sortable: true }],
      budgetCategoriesFilter: "",
      budgetCategories: []
    };
  },
  methods: {
    addBudgetCategory() {
      this.$refs.budgetCategoryModal.show({ title: "Create Budget Category" });
    },
    formatDate(date) {
      return `${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}`;
    },
    async budgetCategoriesProvider(ctx, callback) {
      let query = `?filter=${ctx.filter}&sortBy=${ctx.sortBy}&sortDesc=${ctx.sortDesc}`;
      let { data } = await this.$axios.get("/budget-categories" + query);
      this.budgetCategories = data;
      return data;
    },
    async createBudgetCategory(budgetCategory) {
      await this.$axios.post("/budget-categories", budgetCategory);
      this.$refs.budgetCategoriesTable.refresh();
    },
    async editBudgetCategory(budgetCategory) {
      await this.$axios.put(`/flows-categories/${budgetCategory._id}`, budgetCategory);
      this.$refs.budgetCategoriesTable.refresh();
    }
  }
};
</script>

<style lang="scss">
.budget__categories {
}
</style>
