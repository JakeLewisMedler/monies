<template>
  <div class="periods">
    <b-container class="mt-3">
      <b-col>
        <b-col>
          <b-row align-h="between">
            <h1>Periods({{ periods.length }})</h1>
            <b-button variant="primary" @click="addPeriod">Add +</b-button>
          </b-row></b-col
        >
        <b-form-input v-model="periodsFilter" placeholder="Search" debounce="500" class="mt-3"></b-form-input>

        <b-card>
          <b-table
            ref="periodsTable"
            :items="periodsProvider"
            :fields="periodFields"
            :filter="periodsFilter"
            :sort-by="'name'"
            :sort-desc="false"
            responsive
          >
            <template #cell(starting)="row">
              {{ formatDate(row.item.starting) }}
            </template>
            <template #cell(ending)="row">
              {{ formatDate(row.item.ending) }}
            </template>
            <template #cell(openingBalanceOffset)="row">
              {{
                new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
                  row.item.openingBalanceOffset
                )
              }}
            </template>
            <template #cell(status)="row"
              ><span v-if="row.item.status == 'incomplete'">Incomplete</span>
              <span v-else-if="row.item.status == 'complete'">Complete</span>
            </template>
            <template #cell(actions)="row">
              <b-button @click="editPeriodModal(row.item)" variant="success">Edit</b-button>
              <b-button @click="deletePeriod(row.item)" variant="danger">Delete</b-button>
            </template></b-table
          ></b-card
        ></b-col
      >
    </b-container>
    <PeriodModal ref="periodModal" @created="createPeriod" @edited="editPeriod" />
  </div>
</template>

<script>
const { format } = require("date-fns");

export default {
  data() {
    return {
      periodFields: [
        "name",
        { key: "starting", sortable: true },
        { key: "ending", sortable: true },
        "openingBalanceOffset",
        "status",
        "actions"
      ],
      periodsFilter: "",
      periods: []
    };
  },
  methods: {
    addPeriod() {
      this.$refs.periodModal.show({ title: "Create Period" });
    },
    editPeriodModal(period) {
      let data = { ...period };
      this.$refs.periodModal.show({ title: "Edit Period", period: data });
    },

    formatDate(date) {
      if (!date) return;
      return format(new Date(date), "do MMM yy");
    },
    async periodsProvider(ctx, callback) {
      let query = `?populate=category&filter=${ctx.filter}&sortBy=${ctx.sortBy}&sortDesc=${ctx.sortDesc}`;
      this.periods = await this.$axios.get("/periods" + query);
      return this.periods;
    },
    async createPeriod(period) {
      await this.$axios.post("/periods", period);
      this.$refs.periodsTable.refresh();
    },
    async editPeriod(period) {
      await this.$axios.put(`/periods/${period._id}`, period);
      this.$refs.periodsTable.refresh();
    },

    async deletePeriod(period) {
      let result = await this.$swal.fire({
        title: "Delete Period?",
        text: "Are you sure?",
        icon: "warning",
        showCancelButton: true
      });
      if (!result.isConfirmed) return;

      await this.$axios.delete(`/periods/${period._id}`);
      this.$refs.periodsTable.refresh();
      this.$swal.fire({
        title: "Period Deleted",
        icon: "info"
      });
    }
  }
};
</script>

<style lang="scss">
.periods {
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
