<template>
  <div class="default">
    <b-card no-body class="flex-grow-1">
      <b-card-header header-tag="nav"> <NavBar /></b-card-header>
      <b-card-body class="flex-grow-1"> <Nuxt /></b-card-body>
    </b-card>
  </div>
</template>
<style lang="scss">
.default {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
}
</style>
