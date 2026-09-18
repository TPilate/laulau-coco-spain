<template>
  <div class="app-shell">
    <OfflineBanner />
    <main class="app-contenu">
      <slot />
    </main>
    <BottomNav />
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.app-contenu {
  position: relative;
  flex: 1;
}
</style>
