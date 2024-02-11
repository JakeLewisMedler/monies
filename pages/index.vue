<template>
  <div class="index">
    <b-container class="mt-3">
      <b-col>
        <b-row align-h="between"> <h1>Cashflow</h1></b-row>
        <b-table
          :sticky-header="true"
          :no-border-collapse="true"
          striped
          small
          responsive
          :items="items"
          :fields="fields"
        >
          <template #head()="scope">
            <div class="text-nowrap">{{ scope.label }}</div>
          </template>
        </b-table>
      </b-col>
    </b-container>
  </div>
</template>

<script>
export default {
  computed: {
    fields() {
      let fields = [{ key: "Budget", stickyColumn: true, isRowHeader: true, variant: "primary" }];
      fields.push(...this.dates);
      return fields;
    },
    items() {
      let rows = [];
      for (let budgetCategory of this.budgetCategories) {
        let row = { Budget: budgetCategory.name };
        rows.push(row);
        for (let budget of this.budgets.filter((b) => b.category == budgetCategory._id)) {
          row = { Budget: budget.name };
          rows.push(row);
        }
      }
      return rows;
    },
    dates() {
      let { startOfMonth, eachMonthOfInterval, addMonths, format } = this.$dateFns;
      let monthStart = startOfMonth(new Date());
      return eachMonthOfInterval({
        start: monthStart,
        end: addMonths(monthStart, this.numberOfPeriods - 1)
      }).map((d) => format(d, "MMM yy"));
    }
  },

  mounted() {
    this.getData();
  },
  data() {
    return { view: "monthly", numberOfPeriods: 52, budgetCategories: [], budgets: [] };
  },
  methods: {
    async getData() {
      let { data: budgetCategories } = await this.$axios.get("/budget-categories");
      this.budgetCategories = budgetCategories;
      let { data: budgets } = await this.$axios.get("/budgets");
      this.budgets = budgets;
    }
  }
};
</script>

<style lang="scss">
.index {
}
</style>
