<template>
  <div class="budgets">
    <b-container class="mt-3">
      <b-col>
        <b-col>
          <b-row align-h="between">
            <h1>Budgets({{ budgets.length }})</h1>
            <b-button variant="primary" @click="addBudget">Add +</b-button>
          </b-row></b-col
        >
        <b-form-input v-model="budgetsFilter" placeholder="Search" debounce="500" class="mt-3"></b-form-input>

        <b-card>
          <b-table
            ref="budgetsTable"
            :items="budgetsProvider"
            :fields="budgetFields"
            :filter="budgetsFilter"
            :sort-by="'name'"
            :sort-desc="false"
            responsive
          >
            <template #cell(category)="row">
              {{ row.item.category.name }}
            </template>
            <template #cell(estimate)="row">
              <div v-if="row.item.estimate" class="tick__container">
                <div class="tick">√</div>
              </div>
            </template>
            <template #cell(actions)="row">
              <b-button @click="editBudgetModal(row.item)" variant="success">Edit</b-button>
              <b-button @click="deleteBudget(row.item)" variant="danger">Delete</b-button>
            </template></b-table
          ></b-card
        ></b-col
      >
    </b-container>
    <BudgetModal ref="budgetModal" @created="createBudget" @edited="editBudget" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      budgetFields: [
        { key: "name", sortable: true },
        { key: "estimate", sortable: false },
        { key: "category", sortable: false },
        { key: "actions", sortable: false }
      ],
      budgetsFilter: "",
      budgets: []
    };
  },
  methods: {
    addBudget() {
      this.$refs.budgetModal.show({ title: "Create Budget" });
    },
    editBudgetModal(budget) {
      let data = { ...budget };
      data.category = budget.category._id;
      this.$refs.budgetModal.show({ title: "Edit Budget", budget: data });
    },

    formatDate(date) {
      return `${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}`;
    },
    async budgetsProvider(ctx, callback) {
      let query = `?populate=category&filter=${ctx.filter}&sortBy=${ctx.sortBy}&sortDesc=${ctx.sortDesc}`;
      let { data } = await this.$axios.get("/budgets" + query);
      this.budgets = data;
      return data;
    },
    async createBudget(budget) {
      await this.$axios.post("/budgets", budget);
      this.$refs.budgetsTable.refresh();
    },
    async editBudget(budget) {
      await this.$axios.put(`/budgets/${budget._id}`, budget);
      this.$refs.budgetsTable.refresh();
    },

    async deleteBudget(budget) {
      let result = await this.$swal.fire({
        title: "Delete Budget?",
        text: "Are you sure?",
        icon: "warning",
        showCancelButton: true
      });
      if (!result.isConfirmed) return;

      await this.$axios.delete(`/budgets/${budget._id}`);
      this.$refs.budgetsTable.refresh();
      this.$swal.fire({
        title: "Budget Deleted",
        icon: "info"
      });
    }
  }
};
</script>

<style lang="scss">
.budgets {
  .tick__container {
    width: 36px;
    height: 36px;
    background: #5c9b5c;
    text-align: center;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    .tick {
      font-size: 14px;
      font-weight: bold;
      color: #fff;
    }
  }
}
</style>
