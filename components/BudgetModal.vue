<template>
  <b-modal
    ref="modal"
    :title="title"
    size="lg"
    ok-title="Submit"
    @ok="submitBudget"
    @hide="hide"
    :ok-disabled="okDisabled"
  >
    <template v-if="budget">
      <label for="name">Name:</label>
      <b-form-input id="name" v-model="budget.name" placeholder="Budget name" class="mb-3"></b-form-input>
      <b-row>
        <b-col cols="2">
          <label for="name">Recurring:</label>
          <b-form-checkbox v-model="budget.recurring" name="recurring" switch class="mb-3"> </b-form-checkbox
        ></b-col>
        <b-col v-if="budget.recurring" cols="7">
          <b-form-group label="Recurring Type:">
            <b-form-radio-group v-model="budget.recurringType" :options="recurringTypeOptions"></b-form-radio-group>
          </b-form-group>
        </b-col>
        <b-col v-if="budget.recurring" cols="3">
          <label for="name">Frequency ({{ frequencyString }}):</label>
          <b-form-input v-model="budget.recurringFrequency"></b-form-input>
        </b-col>
      </b-row>

      <b-row v-if="budget.recurring">
        <b-col>
          <label for="date">Date:</label>
          <b-form-datepicker id="date" :start-weekday="1" v-model="budget.date"></b-form-datepicker></b-col
      ></b-row>
      <b-form-group label="Category:" class="mt-3">
        <b-form-select
          v-model="budget.category"
          value-field="_id"
          text-field="name"
          :options="budgetCategories"
          @change="budget.subCategory = null"
        >
          <b-form-select-option :value="null">Select a Category</b-form-select-option>
        </b-form-select> </b-form-group
      ><b-form-group label="Sub Category:">
        <b-form-select
          :disabled="!budget.category"
          v-model="budget.subCategory"
          value-field="_id"
          text-field="name"
          :options="budgetSubCategoriesFiltered"
        >
          <b-form-select-option :value="null">Select a Sub Category</b-form-select-option>
        </b-form-select>
      </b-form-group>
    </template>
  </b-modal>
</template>

<script>
export default {
  computed: {
    frequencyString() {
      return this.budget && this.frequencyStrings[this.recurringTypeOptions.indexOf(this.budget.recurringType)];
    },
    budgetSubCategoriesFiltered() {
      return this.budget && this.budgetSubCategories.filter((c) => c.category == this.budget.category);
    },
    okDisabled() {
      return !(this.budget?.category && this.budget?.subCategory);
    }
  },
  data() {
    return {
      _id: null,
      title: "",
      budget: null,
      recurringTypeOptions: ["weekly", "monthly", "annually", "custom"],
      frequencyStrings: ["Weeks", "Months", "Years", "Days"],
      showing: false,
      transaction: null,
      budgetCategories: [],
      budgetSubCategories: []
    };
  },
  async mounted() {
    this.hide();
    await this.getBudgetCategories();
    document.addEventListener("keyup", (e) => {
      if (e.code == "Enter" && this.showing) {
        this.submitBudget();
        this.hide();
      }
    });
  },
  methods: {
    async getBudgetCategories() {
      let { data: budgetCategories } = await this.$axios.get("/budget-categories");
      this.budgetCategories = budgetCategories;
      let { data: budgetSubCategories } = await this.$axios.get("/budget-sub-categories");
      this.budgetSubCategories = budgetSubCategories;
    },
    submitBudget() {
      if (this.budget?._id) this.$emit("edited", this.budget);
      else this.$emit("created", this.budget, this.transaction);
    },
    show({ title, budget, transaction }) {
      this.title = title;
      this.budget = {
        _id: null,
        name: "",
        recurring: false,
        recurringType: "monthly",
        recurringFrequency: 0,
        date: new Date(),
        category: null,
        subCategory: null
      };
      if (budget) Object.assign(this.budget, budget);
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
