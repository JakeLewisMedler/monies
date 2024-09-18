<template>
  <b-modal ref="modal" :title="title" size="lg" ok-title="Submit" @ok="submitAccount" @hide="hide">
    <template v-if="account">
      <label for="name">Name:</label>
      <b-form-input id="name" v-model="account.name" placeholder="Account name" class="mb-3"></b-form-input>
      <label for="openingBalance">Opening Balance:</label>
      <b-input-group prepend="£" class="mb-3">
        <b-form-input
          id="openingBalance"
          type="number"
          v-model="account.openingBalance"
          placeholder="Opening Balance"
        ></b-form-input>
      </b-input-group>
      <label for="main">Is Main Account?:</label>
      <b-form-checkbox id="main" v-model="account.main" switch> </b-form-checkbox>
    </template>
  </b-modal>
</template>

<script>
export default {
  data() {
    return {
      _id: null,
      title: "",
      account: null,
      showing: false
    };
  },
  mounted() {
    this.hide();
    document.addEventListener("keyup", (e) => {
      if (e.code == "Enter" && this.showing) {
        this.submitAccount();
        this.hide();
      }
    });
  },
  methods: {
    submitAccount() {
      if (this.account?._id) this.$emit("edited", this.account);
      else this.$emit("created", this.account);
    },
    show({ title, account }) {
      this.title = title;
      this.account = {
        _id: null,
        name: "",
        openingBalance: 0,
        main: false
      };
      if (account) Object.assign(this.account, account);
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
