<template>
  <b-modal ref="modal" :title="title" size="lg" ok-title="Submit" @ok="submitBudgetSubCategory" @hide="hide">
    <template v-if="budgetSubCategory">
      <label for="name">Name:</label>
      <b-form-input
        id="name"
        v-model="budgetSubCategory.name"
        placeholder="Budget Sub Category name"
        class="mb-3"
      ></b-form-input
      ><b-form-group label="Category:">
        <b-form-select
          v-model="budgetSubCategory.category"
          value-field="_id"
          text-field="name"
          :options="budgetCategories"
        >
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
      budgetSubCategory: null,
      budgetCategories: [],
      showing: false
    };
  },
  async mounted() {
    this.hide();
    await this.getBudgetCategories();
    document.addEventListener("keyup", (e) => {
      if (e.code == "Enter" && this.showing) {
        this.submitBudgetSubCategory();
        this.hide();
      }
    });
  },
  methods: {
    async getBudgetCategories() {
      let { data } = await this.$axios.get("/budget-categories");
      this.budgetCategories = data;
    },
    submitBudgetSubCategory() {
      if (this.budgetSubCategory?._id) this.$emit("edited", this.budgetSubCategory);
      else this.$emit("created", this.budgetSubCategory);
    },
    show({ title, budgetSubCategory }) {
      this.title = title;
      this.budgetSubCategory = {
        _id: null,
        name: "",
        category: null
      };
      if (budgetSubCategory) Object.assign(this.budgetSubCategory, budgetSubCategory);
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
