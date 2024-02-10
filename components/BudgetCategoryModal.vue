<template>
  <b-modal ref="modal" :title="title" size="lg" ok-title="Submit" @ok="submitBudgetCategory" @hide="hide">
    <template v-if="budgetCategory">
      <label for="name">Name:</label>
      <b-form-input
        id="name"
        v-model="budgetCategory.name"
        placeholder="Budget Category name"
        class="mb-3"
      ></b-form-input>
    </template>
  </b-modal>
</template>

<script>
export default {
  data() {
    return {
      _id: null,
      title: "",
      budgetCategory: null,
      showing: false
    };
  },
  mounted() {
    this.hide();
    document.addEventListener("keyup", (e) => {
      if (e.code == "Enter" && this.showing) {
        this.submitBudgetCategory();
        this.hide();
      }
    });
  },
  methods: {
    submitBudgetCategory() {
      if (this.budgetCategory?._id) this.$emit("edited", this.budgetCategory);
      else this.$emit("created", this.budgetCategory);
    },
    show({ title, budgetCategory }) {
      this.title = title;
      this.budgetCategory = {
        _id: null,
        name: "",
        type: null
      };
      if (budgetCategory) Object.assign(this.budgetCategory, budgetCategory);
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
