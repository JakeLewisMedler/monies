<template>
  <div class="nav">
    <div v-for="item in items" :key="item.label" class="item" @click="navigate(item)">
      {{ item.label }}
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      items: [
        { label: "Cashflow", link: "/" },
        { label: "Flows", link: "/flows" },
        { label: "Transactions", link: "/transactions" },
        { label: "Reconcile", link: "/reconcile" },
        { label: "Upload", link: "/upload" },
        { label: "Budget Categories", link: "/budget-categories" },
        { label: "Budgets", link: "/budgets" },
        { label: "Testing", link: "/testing" }
      ]
    };
  },
  methods: {
    navigate(item) {
      this.$router.push(item.link);
    }
  }
};
</script>
<style lang="scss">
.nav {
  height: 50px;
  padding: 0 100px;
  background: #40c9db;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .item {
    cursor: pointer;
    color: #fff;
    &.highlight {
      font-weight: bolder;
    }
  }
}
</style>
