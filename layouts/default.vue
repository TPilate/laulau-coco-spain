<template>
  <div class="app-shell">
    <div class="fond-liquide" aria-hidden="true">
      <span class="tache tache-1" />
      <span class="tache tache-2" />
      <span class="tache tache-3" />
    </div>
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
  z-index: 1;
}

.fond-liquide {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.tache {
  position: absolute;
  border-radius: 50%;
  filter: blur(30px);
  animation: drift 22s ease-in-out infinite;
}

.tache-1 {
  top: -120px;
  left: -90px;
  width: 340px;
  height: 340px;
  background: radial-gradient(circle, #ebd2f2 0%, rgba(235, 210, 242, 0) 70%);
}

.tache-2 {
  top: 220px;
  right: -140px;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, #bfd6f2 0%, rgba(191, 214, 242, 0) 70%);
  animation-direction: reverse;
  animation-duration: 28s;
}

.tache-3 {
  bottom: -100px;
  left: 10%;
  width: 360px;
  height: 300px;
  background: radial-gradient(circle, #f8dac6 0%, rgba(248, 218, 198, 0) 72%);
  animation-duration: 25s;
}
</style>
