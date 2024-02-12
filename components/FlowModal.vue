<template>
  <b-modal
    ref="modal"
    :title="title"
    size="lg"
    ok-title="Submit"
    @ok="submitFlow"
    @hide="hide"
    :ok-disabled="okDisabled"
  >
    <template v-if="flow">
      <label for="name">Name:</label>
      <b-form-input id="name" v-model="flow.name" placeholder="Flow name" class="mb-3"></b-form-input>
      <b-row>
        <b-col cols="2">
          <label for="name">Recurring:</label>
          <b-form-checkbox v-model="flow.recurring" name="recurring" switch class="mb-3"> </b-form-checkbox
        ></b-col>
        <b-col v-if="flow.recurring" cols="7">
          <b-form-group label="Recurring Type:">
            <b-form-radio-group v-model="flow.recurringType" :options="recurringTypeOptions"></b-form-radio-group>
          </b-form-group>
        </b-col>
        <b-col v-if="flow.recurring" cols="3">
          <label for="name">Frequency ({{ frequencyString }}):</label>
          <b-form-input v-model="flow.recurringFrequency"></b-form-input>
        </b-col>
      </b-row>

      <b-row v-if="flow.recurring">
        <b-col>
          <label for="date">Date:</label>
          <b-form-datepicker id="date" :start-weekday="1" v-model="flow.date"></b-form-datepicker></b-col
      ></b-row>
      <b-form-group label="Category:" class="mt-3">
        <b-form-select
          v-model="flow.category"
          value-field="_id"
          text-field="name"
          :options="budgetCategories"
          @change="flow.budget = null"
        >
          <b-form-select-option :value="null">Select a Category</b-form-select-option>
        </b-form-select> </b-form-group
      ><b-form-group label="Budget:">
        <b-form-select
          :disabled="!flow.category"
          v-model="flow.budget"
          value-field="_id"
          text-field="name"
          :options="budgetsFiltered"
        >
          <b-form-select-option :value="null">Select a Budget</b-form-select-option>
        </b-form-select>
      </b-form-group>
    </template>
  </b-modal>
</template>

<script>
export default {
  computed: {
    frequencyString() {
      return this.flow && this.frequencyStrings[this.recurringTypeOptions.indexOf(this.flow.recurringType)];
    },
    budgetsFiltered() {
      return this.flow && this.budgets.filter((c) => c.category == this.flow.category);
    },
    okDisabled() {
      return !(this.flow?.category && this.flow?.budget);
    }
  },
  data() {
    return {
      _id: null,
      title: "",
      flow: null,
      recurringTypeOptions: ["weekly", "monthly", "annually", "custom"],
      frequencyStrings: ["Weeks", "Months", "Years", "Days"],
      showing: false,
      transaction: null,
      budgetCategories: [],
      budgets: []
    };
  },
  async mounted() {
    this.hide();
    await this.getBudgetCategories();
    document.addEventListener("keyup", (e) => {
      if (e.code == "Enter" && this.showing) {
        this.submitFlow();
        this.hide();
      }
    });
  },
  methods: {
    async getBudgetCategories() {
      let { data: budgetCategories } = await this.$axios.get("/budget-categories");
      this.budgetCategories = budgetCategories;
      let { data: budgets } = await this.$axios.get("/budgets");
      this.budgets = budgets;
    },
    submitFlow() {
      if (this.flow?._id) this.$emit("edited", this.flow);
      else this.$emit("created", this.flow, this.transaction);
    },
    show({ title, flow, transaction }) {
      this.title = title;
      this.flow = {
        name: "",
        recurring: false,
        recurringType: "monthly",
        recurringFrequency: 0,
        date: new Date(),
        category: null,
        budget: null
      };
      if (flow) Object.assign(this.flow, flow);
      if (transaction) this.transaction = transaction;
      this.$refs.modal.show();
      this.showing = true;
    },
    hide() {
      this.showing = false;
      this.$refs.modal.hide();
    }
  }
};
</script>
