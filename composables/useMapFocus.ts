import { ref } from 'vue'

export interface DemandeFocus {
  lieuId: string
}

const demandeFocus = ref<DemandeFocus | null>(null)

export function useMapFocus() {
  function demanderFocus(lieuId: string): void {
    demandeFocus.value = { lieuId }
  }

  function consommerFocus(): DemandeFocus | null {
    const valeur = demandeFocus.value
    demandeFocus.value = null
    return valeur
  }

  return { demandeFocus, demanderFocus, consommerFocus }
}
