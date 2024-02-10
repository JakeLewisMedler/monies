<template>
  <b-modal ref="modal" :title="title" size="lg" ok-title="Submit" @ok="submitBudget">
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
          <b-form-datepicker id="date" :start-weekday="1" v-model="budget.date"></b-form-datepicker></b-col></b-row
    ></template>
  </b-modal>
</template>

<script>
export default {
  computed: {
    frequencyString() {
      return this.budget && this.frequencyStrings[this.recurringTypeOptions.indexOf(this.budget.recurringType)];
    }
  },
  data() {
    return {
      _id: null,
      title: "",
      budget: null,
      recurringTypeOptions: ["weekly", "monthly", "annually", "custom"],
      frequencyStrings: ["Weeks", "Months", "Years", "Days"],
      showing: false
    };
  },
  mounted() {
    this.hide();
    document.addEventListener("keyup", (e) => {
      if (e.code == "Enter" && this.showing) {
        this.submitBudget();
        this.hide();
      }
    });
  },
  methods: {
    submitBudget() {
      if (this.budget?._id) this.$emit("edited", this.budget);
      else this.$emit("created", this.budget, this.transaction);
    },
    show(title, budget, transaction) {
      this.title = title;
      this.budget = { ...budget };
      this.transaction = transaction;
      this.$refs.modal.show();
      this.showing = true;
    },
    hide() {
      this.showing = false;
      this.$refs.modal.hide();
      this.budget = {
        _id: null,
        name: "",
        recurring: false,
        recurringType: "monthly",
        recurringFrequency: 0,
        date: new Date()
      };
    }
  }
};
</script>

<style lang="scss">
.edit__budget {
}
</style>
