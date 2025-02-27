<template>
  <b-nav pills fill>
    <template v-for="item in items">
      <b-nav-item v-if="item.type == 'page'" :to="item.link" exact exact-active-class="active">{{
        item.label
      }}</b-nav-item>
      <b-nav-item-dropdown v-else-if="item.type == 'submenu'" :text="item.label">
        <b-dropdown-item
          v-for="page in item.items"
          :key="page.label"
          :to="page.link"
          exact
          exact-active-class="active"
          >{{ page.label }}</b-dropdown-item
        >
      </b-nav-item-dropdown>
      <b-button v-else-if="item.type == 'action'" @click="triggerAction(item.action)">{{ item.label }}</b-button>
    </template>
  </b-nav>
</template>
<script>
export default {
  data() {
    return {
      items: [
        { type: "page", label: "Cashflow", link: "/" },
        {
          type: "submenu",
          label: "Setup",
          items: [
            { label: "Flows", link: "/flows" },
            { label: "Transactions", link: "/transactions" },
            { label: "Budget Categories", link: "/budget-categories" },
            { label: "Budgets", link: "/budgets" },
            { label: "Periods", link: "/periods" },
            { label: "Reconcile", link: "/reconcile" },
            { label: "Upload", link: "/upload" },
            { label: "Testing", link: "/testing" }
          ]
        },
        { type: "action", label: "Logout", action: "logout" }
      ]
    };
  },
  methods: {
    navigate(item) {
      this.$router.push(item.link);
    },
    async triggerAction(action) {
      if (action == "logout") {
        await this.$firebase.logout();
        this.$router.push("/login");
      }
    }
  }
};
</script>
<style lang="scss">
// .nav {
//   height: 50px;
//   min-height: 50px;
//   padding: 0 100px;
//   background: #40c9db;
//   display: flex;
//   align-items: center;
//   justify-content: space-between;

//   .item {
//     cursor: pointer;
//     color: #fff;
//     &.highlight {
//       font-weight: bolder;
//     }
//   }
// }
</style>
