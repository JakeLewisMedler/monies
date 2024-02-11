<template>
  <div class="upload">
    <b-container class="mt-3">
      <b-col>
        <h1>Upload Transactions</h1>
        <b-card>
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
  methods: {
    async upload() {
      const input = this.file;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        let entries = await this.handleCSV(text);
        await this.$axios.post("/transactions/upload-csv", entries);
        this.$router.push("/reconcile");
      };
      reader.readAsText(input);
    },
    async handleCSV(data) {
      let entries = [];
      let headers = data.split("\n")[0].split(",");
      let lines = data
        .split("\n")
        .slice(1)
        .filter((l) => l.length > 0);

      for (let line of lines) {
        let entry = {};
        let cells = line.split(",");
        for (let cellId in cells) {
          entry[headers[cellId]] = cells[cellId];
        }
        entries.push(entry);
      }
      return entries;
    }
  }
};
</script>

<style lang="scss">
.upload {
}
</style>
