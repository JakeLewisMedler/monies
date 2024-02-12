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
      <b-form-input id="name" v-model="flow.name" autofocus placeholder="Flow name" class="mb-3"></b-form-input>
      <label for="name">Estimate:</label>
      <b-form-checkbox v-model="flow.estimate" name="estimate" switch class="mb-3"> </b-form-checkbox>
      <b-form-group label="Category:">
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
    show({ title, flow, transaction, name }) {
      this.title = title;
      this.flow = {
        name: "",
        estimate: false,
        date: new Date(),
        category: null,
        budget: null
      };
      if (flow) Object.assign(this.flow, flow);
      if (name) this.flow.name = name;
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
