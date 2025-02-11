<template>
  <div class="upload">
    <b-container class="mt-3">
      <b-col>
        <h1>Upload Transactions</h1>
        <b-card class="mt-3">
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
      file: null
    };
  },
  mounted() {},
  methods: {
    async upload() {
      var formData = new FormData();
      formData.append("csv", this.file);
      let { createdCount, skippedCount } = await this.$axios.post("/transactions/upload-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
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
