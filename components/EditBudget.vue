<template>
  <div class="edit__budget">
    <label for="name">Name:</label>
    <b-form-input
      id="name"
      v-model="budget.name"
      placeholder="Budget name"
      class="mb-3"
    ></b-form-input>
    <b-row>
      <b-col cols="2">
        <label for="name">Recurring:</label>
        <b-form-checkbox
          v-model="budget.recurring"
          name="recurring"
          switch
          class="mb-3"
        >
        </b-form-checkbox
      ></b-col>
      <b-col v-if="budget.recurring" cols="8">
        <b-form-group label="Recurring Type:">
          <b-form-radio-group
            v-model="budget.recurringType"
            :options="recurringTypeOptions"
          ></b-form-radio-group>
        </b-form-group>
      </b-col>
      <b-col v-if="budget.recurring" cols="2">
        <label for="name">Frequency:</label>
        <b-form-input v-model="budget.recurringFrequency"></b-form-input>
      </b-col>
    </b-row>

    <b-row v-if="budget.recurring">
      <b-col>
        <label for="date">Date:</label>
        <b-form-datepicker
          id="date"
          v-model="budget.date"
        ></b-form-datepicker></b-col
    ></b-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      budget: {
        name: "",
        recurring: false,
        recurringType: "monthly",
        recurringFrequency: 0,
        date: new Date(),
      },
    };
  },
  mounted() {},
  methods: {},
};
</script>

<style lang="scss">
.edit__budget {
}
</style>
