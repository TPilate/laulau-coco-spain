import { usePersistedRef } from './usePersistedRef'

export function estDeverrouille(message: { unlockAt: string }, maintenant: Date): boolean {
  return maintenant.getTime() >= new Date(message.unlockAt).getTime()
}

export function formatCompteARebours(unlockAt: string, maintenant: Date): string {
  const diffMs = new Date(unlockAt).getTime() - maintenant.getTime()
  if (diffMs <= 0) return '0j 0h 0min'

  const totalMinutes = Math.floor(diffMs / 60000)
  const jours = Math.floor(totalMinutes / (60 * 24))
  const heures = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  return `${jours}j ${heures}h ${minutes}min`
}

export function useMessages() {
  const idsLus = usePersistedRef<string[]>('messages:lus', [])

  function estLu(id: string): boolean {
    return idsLus.value.includes(id)
  }

  function marquerCommeLu(id: string): void {
    if (!idsLus.value.includes(id)) {
      idsLus.value = [...idsLus.value, id]
    }
  }

  return { idsLus, estLu, marquerCommeLu }
}
