<template>
  <div class="upload">
    <b-container class="mt-3">
      <b-col>
        <h1>Upload Transactions</h1>
        <b-card class="mt-3">
          <!-- <b-form-select class="mb-3" v-model="account" :options="accounts" text-field="name" value-field="_id">
          </b-form-select> -->
          <b-form-file
            v-model="file"
            :state="Boolean(file)"
            placeholder="Choose a file or drop it here..."
            drop-placeholder="Drop file here..."
          ></b-form-file>
          <b-button class="mt-2" @click="upload">Upload</b-button>
        </b-card>
      </b-col></b-container
    >
  </div>
</template>

<script>
export default {
  data() {
    return {
      file: null,
      accounts: [],
      account: null
    };
  },
  mounted() {
    this.getAccounts();
  },
  methods: {
    async getAccounts() {
      let { data: accounts } = await this.$axios.get("/accounts");
      this.accounts = accounts;
      this.account = this.accounts.find((a) => a.main)?._id;
    },
    async upload() {
      var formData = new FormData();
      formData.append("csv", this.file);
      let { data } = await this.$axios.post("/transactions/upload-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      let { createdCount, skippedCount } = data;
      await this.$swal.fire({
        title: "CSV Uploaded",
        icon: "info",
        html: `${createdCount} Transactions Created<br>${skippedCount} Transactions Skipped`
      });
      this.$router.push("/reconcile");
    }
  }
};
</script>

<style lang="scss">
.upload {
}
</style>
