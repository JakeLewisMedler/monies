<template>
  <div class="index">
    <b-col>
      <b-col class="px-5 mt-3">
        <b-row align-h="between"> <h1>Cashflow</h1></b-row>
        <b-row class="mt-3">
          <b-table
            class="table"
            sticky-header="800px"
            :no-border-collapse="true"
            striped
            small
            bordered
            responsive
            :items="items"
            :fields="fields"
            :tbody-tr-class="rowClass"
          >
            <template #head()="scope">
              <div class="text-nowrap">{{ scope.label }}</div>
            </template>
          </b-table></b-row
        ></b-col
      >
    </b-col>
  </div>
</template>

<script>
export default {
  computed: {
    fields() {
      let { format } = this.$dateFns;
      let fields = [{ key: "Budget", stickyColumn: true, variant: "secondary", thStyle: "min-width:300px" }];
      let dateFields = this.dates.map((d) => {
        return {
          key: format(d, "MMM yy"),
          thStyle: "min-width:100px;text-align:center"
        };
      });

      fields.push(...dateFields);
      return fields;
    },
    items() {
      let rows = [];
      for (let budgetCategory of this.budgetCategories) {
        rows.push({ type: "break" });
        let row = { Budget: budgetCategory.name, type: "budgetCategory" };
        rows.push(row);
        for (let budget of this.budgets.filter((b) => b.category == budgetCategory._id)) {
          row = { Budget: budget.name, type: "budget" };
          rows.push(row);
        }
      }
      return rows;
    },
    dates() {
      let { startOfMonth, eachMonthOfInterval, addMonths } = this.$dateFns;
      let monthStart = startOfMonth(new Date());
      return eachMonthOfInterval({
        start: monthStart,
        end: addMonths(monthStart, this.numberOfPeriods - 1)
      });
    }
  },

  mounted() {
    this.getData();
  },
  data() {
    return { view: "monthly", numberOfPeriods: 52, budgetCategories: [], budgets: [] };
  },
  methods: {
    rowClass(item, type) {
      if (!item || type !== "row") return;
      else if (item.type === "budgetCategory") return "header table-secondary";
      else if (item.type === "break") return "table-info";
    },
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
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  .table {
    .header {
      font-weight: bold;
    }
  }
}
</style>
