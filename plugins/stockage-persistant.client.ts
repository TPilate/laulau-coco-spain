export default defineNuxtPlugin(() => {
  void demanderStockagePersistant().catch(() => undefined)
})
