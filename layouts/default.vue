<template>
  <div class="app-shell">
    <main class="app-contenu">
      <slot />
    </main>
    <BottomNav />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-contenu {
  flex: 1;
  padding-bottom: 72px;
}
</style>
