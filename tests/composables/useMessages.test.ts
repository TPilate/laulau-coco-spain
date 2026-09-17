import { describe, it, expect, beforeEach } from 'vitest'
import { estDeverrouille, formatCompteARebours, useMessages } from '../../composables/useMessages'

describe('estDeverrouille', () => {
  it('est verrouillé avant unlockAt', () => {
    const verrouille = estDeverrouille(
      { unlockAt: '2026-10-05T09:00:00+02:00' },
      new Date('2026-10-05T08:59:00+02:00'),
    )
    expect(verrouille).toBe(false)
  })

  it('est déverrouillé à partir de unlockAt', () => {
    const deverrouille = estDeverrouille(
      { unlockAt: '2026-10-05T09:00:00+02:00' },
      new Date('2026-10-05T09:00:00+02:00'),
    )
    expect(deverrouille).toBe(true)
  })
})

describe('formatCompteARebours', () => {
  it('formate jours, heures et minutes restantes', () => {
    const maintenant = new Date('2026-10-03T10:00:00+02:00')
    expect(formatCompteARebours('2026-10-05T14:30:00+02:00', maintenant)).toBe('2j 4h 30min')
  })

  it('retourne zéro une fois la cible atteinte', () => {
    const maintenant = new Date('2026-10-05T14:30:00+02:00')
    expect(formatCompteARebours('2026-10-05T14:30:00+02:00', maintenant)).toBe('0j 0h 0min')
  })
})

describe('useMessages', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("n'est pas lu par défaut", () => {
    const { estLu } = useMessages()
    expect(estLu('msg-1')).toBe(false)
  })

  it('marque un message comme lu et le persiste', () => {
    const { estLu, marquerCommeLu } = useMessages()
    marquerCommeLu('msg-1')
    expect(estLu('msg-1')).toBe(true)

    const { estLu: estLuNouvelleInstance } = useMessages()
    expect(estLuNouvelleInstance('msg-1')).toBe(true)
  })
})
