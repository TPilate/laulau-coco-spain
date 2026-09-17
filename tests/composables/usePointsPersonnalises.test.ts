import { describe, it, expect, beforeEach } from 'vitest'
import { usePointsPersonnalises } from '../../composables/usePointsPersonnalises'

describe('usePointsPersonnalises', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('démarre sans aucun point', () => {
    const { points } = usePointsPersonnalises()
    expect(points.value).toEqual([])
  })

  it('ajoute un point avec son type, son nom et ses coordonnées', () => {
    const { points, ajouterPoint } = usePointsPersonnalises()
    ajouterPoint('maison', 'Notre maison', 37.38, -5.99)
    expect(points.value).toHaveLength(1)
    expect(points.value[0]).toMatchObject({
      type: 'maison',
      label: 'Notre maison',
      lat: 37.38,
      lng: -5.99,
    })
  })

  it('ignore un nom vide ou uniquement des espaces', () => {
    const { points, ajouterPoint } = usePointsPersonnalises()
    ajouterPoint('autre', '   ', 37.38, -5.99)
    expect(points.value).toEqual([])
  })

  it('supprime un point', () => {
    const { points, ajouterPoint, supprimerPoint } = usePointsPersonnalises()
    ajouterPoint('maison', 'Notre maison', 37.38, -5.99)
    const id = points.value[0].id

    supprimerPoint(id)
    expect(points.value).toEqual([])
  })

  it('modifie le type et le nom d’un point sans toucher à ses coordonnées', () => {
    const { points, ajouterPoint, modifierPoint } = usePointsPersonnalises()
    ajouterPoint('maison', 'Notre maison', 37.38, -5.99)
    const id = points.value[0].id

    modifierPoint(id, 'autre', 'Notre appart')
    expect(points.value).toHaveLength(1)
    expect(points.value[0]).toMatchObject({
      id,
      type: 'autre',
      label: 'Notre appart',
      lat: 37.38,
      lng: -5.99,
    })
  })

  it('ignore une modification vers un nom vide', () => {
    const { points, ajouterPoint, modifierPoint } = usePointsPersonnalises()
    ajouterPoint('maison', 'Notre maison', 37.38, -5.99)
    const id = points.value[0].id

    modifierPoint(id, 'autre', '   ')
    expect(points.value[0]).toMatchObject({ type: 'maison', label: 'Notre maison' })
  })

  it('persiste les points dans localStorage', () => {
    const { ajouterPoint } = usePointsPersonnalises()
    ajouterPoint('maison', 'Notre maison', 37.38, -5.99)

    const { points: pointsNouvelleInstance } = usePointsPersonnalises()
    expect(pointsNouvelleInstance.value).toHaveLength(1)
    expect(pointsNouvelleInstance.value[0].label).toBe('Notre maison')
  })
})
