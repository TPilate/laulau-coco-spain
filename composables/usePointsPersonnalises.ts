import { usePersistedRef } from './usePersistedRef'

export type TypePointPersonnalise = 'maison' | 'autre'

export interface PointPersonnalise {
  id: string
  type: TypePointPersonnalise
  label: string
  lat: number
  lng: number
}

export function usePointsPersonnalises() {
  const points = usePersistedRef<PointPersonnalise[]>('points-personnalises', [])

  function ajouterPoint(type: TypePointPersonnalise, label: string, lat: number, lng: number): void {
    const labelNettoye = label.trim()
    if (!labelNettoye) return
    points.value = [...points.value, { id: crypto.randomUUID(), type, label: labelNettoye, lat, lng }]
  }

  function modifierPoint(id: string, type: TypePointPersonnalise, label: string): void {
    const labelNettoye = label.trim()
    if (!labelNettoye) return
    points.value = points.value.map((point) =>
      point.id === id ? { ...point, type, label: labelNettoye } : point,
    )
  }

  function supprimerPoint(id: string): void {
    points.value = points.value.filter((point) => point.id !== id)
  }

  return { points, ajouterPoint, modifierPoint, supprimerPoint }
}
