<template>
  <div class="default__layout">
    <b-card no-body class="flex-grow-1">
      <b-card-header header-tag="nav"> <NavBar /></b-card-header>
      <b-card-body class="flex-grow-1"> <Nuxt /></b-card-body>
    </b-card>
  </div>
</template>
<script>
export default { middleware: ["checkUser"] };
</script>
<style lang="scss">
.default__layout {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
}
</style>
