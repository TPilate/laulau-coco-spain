<template>
  <div class="layout-lettre">
    <slot />
  </div>
</template>

<style scoped>
/* Layout de la page « Pour toi » : sans BottomNav ni OfflineBanner, pour que la
   lettre ait son propre univers. */
.layout-lettre {
  min-height: 100vh;
  min-height: 100dvh;
  background: #fbf6f1;
  overflow-x: hidden;
}
</style>
