export async function demanderStockagePersistant(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) {
    return false
  }
  return navigator.storage.persist()
}
