<template>
  <div class="index">
    <b-col>
      <b-col class="px-5 mt-3">
        <b-row align-h="between"> <h1>Cashflow</h1></b-row>
        <b-row class="table__container mt-3">
          <table v-if="cashflow">
            <tr class="header">
              <th class="sticky">Budget</th>
              <th v-for="period in cashflow?.periods" :key="`date${period.date}`" colspan="2">
                {{ $dateFns.format(period.date, "MMM yy") }}
              </th>
            </tr>
            <tr class="subheader">
              <th class="sticky"></th>
              <template v-for="period in cashflow?.periods">
                <th class="text-center w-50">Estimated</th>
                <th class="text-center w-50">Actual</th></template
              >
            </tr>
            <tbody v-for="budgetCategory in budgetCategories" :key="budgetCategory._id">
              <tr class="break">
                <td v-for="i in cashflow?.periods.length * 2 + 1" :key="i">&nbsp;</td>
              </tr>
              <tr class="budget__category">
                <td class="budget__name sticky">{{ budgetCategory.name }}</td>
                <template v-for="period in cashflow?.periods">
                  <td class="budget__value">
                    {{ getPeriodBudgetCategoryTotals(period, budgetCategory).estimatedTotal }}
                  </td>
                  <td class="budget__value">
                    {{ getPeriodBudgetCategoryTotals(period, budgetCategory).actualTotal }}
                  </td></template
                >
              </tr>
              <tr
                v-for="budget in budgets.filter((b) => b.category == budgetCategory._id)"
                :key="budget._id"
                class="budget"
              >
                <td class="budget__name sticky">
                  {{ budget.name }}
                </td>
                <template v-for="period in cashflow?.periods">
                  <td class="budget__value">
                    {{ getPeriodBudgetTotals(period, budget).estimatedTotal }}
                  </td>
                  <td class="budget__value">
                    {{ getPeriodBudgetTotals(period, budget).actualTotal }}
                  </td></template
                >
              </tr>
            </tbody>
          </table>
        </b-row></b-col
      >
    </b-col>
  </div>
</template>

<script>
export default {
  mounted() {
    this.getData();
  },
  data() {
    return { budgetCategories: [], budgets: [], cashflow: null };
  },
  methods: {
    getPeriodBudgetTotals(period, budget) {
      console.log(period, budget);
      let periodBudget = period.budgets.find((b) => b._id == budget._id);
      let estimatedTotal = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP"
      }).format(periodBudget.estimatedTotal);
      let actualTotal = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP"
      }).format(periodBudget.actualTotal);

      return { estimatedTotal, actualTotal };
    },
    getPeriodBudgetCategoryTotals(period, budgetCategory) {
      let periodBudgetCategory = period.budgetCategories.find((b) => b._id == budgetCategory._id);
      let estimatedTotal = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP"
      }).format(periodBudgetCategory.estimatedTotal);
      let actualTotal = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP"
      }).format(periodBudgetCategory.actualTotal);

      return { estimatedTotal, actualTotal };
    },
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

      let { data: cashflow } = await this.$axios.get("/cashflow");
      this.cashflow = cashflow;
    }
  }
};
</script>

<style lang="scss">
.index {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  .table__container {
    max-height: 800px;
    overflow: scroll;
    box-shadow: inset 0 0 2px #000;

    table {
      position: relative;
      .sticky {
        position: sticky;
        left: 0;
        background-color: #ddd;
        border-right: 1px solid black;
        z-index: 1;
      }
      .header {
        th {
          position: sticky;
          top: 0;
          background-color: #f9f8f8;
        }
      }
      .subheader {
        th {
          position: sticky;
          top: 26px;
          background-color: #f9f8f8;
          border-bottom: 1px solid #000;
        }
      }
      th {
        font-weight: bold;
        min-width: 200px;
        border: 1px solid black;
        text-align: center;
      }
      .break {
        background: #888;
      }

      .budget__category {
        .budget__name {
          padding-left: 20px;
          border: 1px solid black;
        }
        font-weight: bold;

        .budget__value {
          text-align: center;
          border: 1px solid black;
        }
      }
      .budget {
        .budget__name {
          padding-left: 20px;
        }
        .budget__value {
          text-align: center;
          border: 1px solid black;
        }
      }
    }
  }
}
</style>
