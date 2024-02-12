<template>
  <b-modal ref="modal" :title="title" size="lg" ok-title="Submit" @ok="submitFlow" @hide="hide">
    <template v-if="flows">
      <b-form-input ref="search" autofocus v-model="searchFilter" placeholder="Search" class="mb-3"></b-form-input>
      <b-card ref="flowSelect" class="flow__select">
        <b-form-group>
          <b-form-radio v-model="selectedFlow" :name="'Create New'" :value="null" @change="flowSelected"
            >Create New</b-form-radio
          >
          <b-form-radio v-if="selectedFlow" v-model="selectedFlow" :value="selectedFlow" @change="flowSelected">{{
            flows.find((f) => f._id == selectedFlow)?.name
          }}</b-form-radio>

          <b-form-radio
            v-for="flow in sortedFlows"
            :key="flow._id"
            v-model="selectedFlow"
            :name="flow.name"
            :value="flow._id"
            @change="flowSelected"
            >{{ flow.name }}</b-form-radio
          >
        </b-form-group>
      </b-card>
    </template>
  </b-modal>
</template>

<script>
export default {
  props: ["flows", "budgets", "budgetCategories"],
  computed: {
    sortedFlows() {
      let flows = this.flows.filter((f) => f._id != this.selectedFlow);
      if (!!this.searchFilter)
        flows = flows.filter(
          (f) =>
            f.name.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
            this.searchFilter.toLowerCase().includes(f.name.toLowerCase())
        );
      return flows;
    }
  },
  data() {
    return {
      title: "",
      selectedFlow: null,
      searchFilter: "",
      transaction: null
    };
  },
  async mounted() {},
  methods: {
    flowSelected() {
      let flowSelect = this.$refs.flowSelect;
      if (!flowSelect) return;
      flowSelect.scrollTop = 0;
    },
    submitFlow() {
      this.$emit("selected", { flowId: this.selectedFlow, transaction: this.transaction });
    },
    async show({ title, transaction }) {
      this.title = title;
      this.transaction = transaction;
      this.selectedFlow = null;
      this.$refs.modal.show();
      this.showing = true;
      if (transaction?.flow) {
        this.selectedFlow = transaction.flow;
      }
    },

    hide() {
      this.showing = false;
      this.$refs.modal.hide();
    }
  }
};
</script>
<style lang="scss">
.flow__select {
  max-height: 300px;
  overflow: scroll;
}
</style>
