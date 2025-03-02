<template>
  <b-modal ref="modal" :title="title" size="lg" ok-title="Submit" @ok="submitPeriod" @hide="hide">
    <template v-if="period">
      <label for="name">Name:</label>
      <b-form-input v-model="period.name" class="mb-3"> </b-form-input>
      <label for="name">Starting:</label>
      <b-form-datepicker v-model="period.starting" class="mb-3"> </b-form-datepicker>
      <label for="name">Ending:</label>
      <b-form-datepicker v-model="period.ending" class="mb-3"> </b-form-datepicker>
      <label for="name">Opening Balance Offset:</label>
      <b-input-group prepend="£" class="mb-3">
        <b-form-input
          v-model="period.openingBalanceOffset"
          type="number"
          number
          placeholder="Opening Balance Offset"
        ></b-form-input
      ></b-input-group>
      <label>Status:</label>
      <b-form-select v-model="period.status">
        <b-form-select-option value="incomplete">Incomplete</b-form-select-option
        ><b-form-select-option value="complete">Complete</b-form-select-option>
      </b-form-select>
    </template>
  </b-modal>
</template>

<script>
export default {
  data() {
    return {
      _id: null,
      title: "",
      period: null,
      showing: false
    };
  },
  async mounted() {
    this.hide();
    document.addEventListener("keyup", (e) => {
      if (e.code == "Enter" && this.showing) {
        this.submitPeriod();
        this.hide();
      }
    });
  },
  methods: {
    submitPeriod() {
      if (this.period?._id) this.$emit("edited", this.period);
      else this.$emit("created", this.period);
    },
    show({ title, period }) {
      this.title = title;
      this.period = {
        _id: null,
        starting: null,
        ending: null,
        openingBalanceOffset: 0
      };
      if (period) Object.assign(this.period, period);
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
