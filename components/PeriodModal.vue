<template>
  <b-modal ref="modal" :title="title" size="lg" ok-title="Submit" @ok="submitPeriod" @hide="hide">
    <template v-if="period">
      <label for="name">Date:</label>
      <b-form-datepicker v-model="period.date" name="estimate" switch class="mb-3"> </b-form-datepicker>
      <label for="name">Opening Balance Offset:</label>

      <b-input-group prepend="£" class="mb-3">
        <b-form-input
          v-model="period.openingBalanceOffset"
          type="number"
          number
          placeholder="Opening Balance Offset"
        ></b-form-input
      ></b-input-group>
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
        date: null,
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
