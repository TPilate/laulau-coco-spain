import { ref, onScopeDispose } from 'vue'

export function useEnLigne() {
  const enLigne = ref(typeof navigator === 'undefined' ? true : navigator.onLine)

  function gererEnLigne(): void {
    enLigne.value = true
  }
  function gererHorsLigne(): void {
    enLigne.value = false
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('online', gererEnLigne)
    window.addEventListener('offline', gererHorsLigne)
    onScopeDispose(() => {
      window.removeEventListener('online', gererEnLigne)
      window.removeEventListener('offline', gererHorsLigne)
    })
  }

  return { enLigne }
}
