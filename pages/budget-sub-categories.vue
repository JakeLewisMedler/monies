<template>
  <div class="budget__sub__categories">
    <b-container class="mt-3">
      <b-col>
        <b-col>
          <b-row align-h="between">
            <h1>Budget Sub Categories ({{ budgetSubCategories.length }})</h1>
            <b-button variant="primary" @click="addBudgetSubCategory">Add +</b-button>
          </b-row></b-col
        >
        <b-form-input
          v-model="budgetSubCategoriesFilter"
          placeholder="Search"
          debounce="500"
          class="mt-3"
        ></b-form-input>

        <b-card>
          <b-table
            ref="budgetSubCategoriesTable"
            :items="budgetSubCategoriesProvider"
            :fields="budgetSubCategoryFields"
            :filter="budgetSubCategoriesFilter"
            :sort-by="'name'"
            :sort-desc="false"
            responsive
          >
            <template #cell(category)="row">
              {{ row.item.category.name }}
            </template>
            <template #cell(actions)="row">
              <b-button @click="editBudgetSubCategoryModal(row.item)" variant="success">Edit</b-button>
              <b-button @click="deleteBudgetSubCategory(row.item)" variant="danger">Delete</b-button>
            </template></b-table
          ></b-card
        ></b-col
      >
    </b-container>
    <BudgetSubCategoryModal
      ref="budgetSubCategoryModal"
      @created="createBudgetSubCategory"
      @edited="editBudgetSubCategory"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      budgetSubCategoryFields: [
        { key: "name", sortable: true },
        { key: "category", sortable: false },
        { key: "actions", sortable: false }
      ],
      budgetSubCategoriesFilter: "",
      budgetSubCategories: []
    };
  },
  methods: {
    addBudgetSubCategory() {
      this.$refs.budgetSubCategoryModal.show({ title: "Create Budget Sub Category" });
    },
    editBudgetSubCategoryModal(budgetSubCategory) {
      let data = { ...budgetSubCategory };
      data.category = budgetSubCategory.category._id;
      this.$refs.budgetSubCategoryModal.show({ title: "Edit  Budget Sub Category", budgetSubCategory: data });
    },

    formatDate(date) {
      return `${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}`;
    },
    async budgetSubCategoriesProvider(ctx, callback) {
      let query = `?populate=category&filter=${ctx.filter}&sortBy=${ctx.sortBy}&sortDesc=${ctx.sortDesc}`;
      let { data } = await this.$axios.get("/budget-sub-categories" + query);
      this.budgetSubCategories = data;
      return data;
    },
    async createBudgetSubCategory(budgetSubCategory) {
      await this.$axios.post("/budget-sub-categories", budgetSubCategory);
      this.$refs.budgetSubCategoriesTable.refresh();
    },
    async editBudgetSubCategory(budgetSubCategory) {
      await this.$axios.put(`/budget-sub-categories/${budgetSubCategory._id}`, budgetSubCategory);
      this.$refs.budgetSubCategoriesTable.refresh();
    },

    async deleteBudgetSubCategory(budgetSubCategory) {
      let result = await this.$swal.fire({
        title: "Delete Budget Sub Category?",
        text: "Are you sure?",
        icon: "warning",
        showCancelButton: true
      });
      if (!result.isConfirmed) return;

      await this.$axios.delete(`/budget-sub-categories/${budgetSubCategory._id}`);
      this.$refs.budgetSubCategoriesTable.refresh();
      this.$swal.fire({
        title: "Budget Sub Category Deleted",
        icon: "info"
      });
    }
  }
};
</script>

<style lang="scss">
.budget__sub__categories {
}
</style>
