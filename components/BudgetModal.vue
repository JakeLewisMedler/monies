<template>
  <b-modal ref="modal" :title="title" size="lg" ok-title="Submit" @ok="submitBudget" @hide="hide">
    <template v-if="budget">
      <label for="name">Name:</label>
      <b-form-input id="name" v-model="budget.name" placeholder="Budget name" class="mb-3"></b-form-input>
      <label for="name">Estimate:</label>
      <b-form-checkbox v-model="budget.estimate" name="estimate" switch class="mb-3"> </b-form-checkbox>

      <b-form-group label="Category:">
        <b-form-select v-model="budget.category" value-field="_id" text-field="name" :options="budgetCategories">
          <b-form-select-option :value="null">Select a Category</b-form-select-option>
        </b-form-select>
      </b-form-group>
    </template>
  </b-modal>
</template>

<script>
export default {
  data() {
    return {
      _id: null,
      title: "",
      budget: null,
      budgetCategories: [],
      showing: false
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
      this.budgetCategories = await this.$axios.get("/budget-categories");
    },
    submitBudget() {
      if (this.budget?._id) this.$emit("edited", this.budget);
      else this.$emit("created", this.budget);
    },
    show({ title, budget }) {
      this.title = title;
      this.budget = {
        _id: null,
        name: "",
        estimate: false,
        category: null
      };
      if (budget) Object.assign(this.budget, budget);
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
