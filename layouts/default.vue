<template>
  <div class="default">
    <b-card title="Card Title" no-body>
      <b-card-header header-tag="nav"> <NavBar /></b-card-header>
      <b-card-body> <Nuxt /></b-card-body>
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
