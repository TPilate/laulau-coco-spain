import { describe, it, expect } from 'vitest'
import { decrireStatutEvenement } from '../../utils/evenements'

describe('decrireStatutEvenement', () => {
  it('indique le délai avant un événement futur, en heures', () => {
    const maintenant = new Date('2026-10-03T17:30:00+02:00')
    const evenement = { debut: '2026-10-03T19:30:00+02:00' }
    expect(decrireStatutEvenement(evenement, maintenant)).toBe('Dans 2 heures')
  })

  it('indique "Maintenant" pendant la fenêtre debut-fin', () => {
    const maintenant = new Date('2026-10-03T20:00:00+02:00')
    const evenement = { debut: '2026-10-03T19:30:00+02:00', fin: '2026-10-03T21:00:00+02:00' }
    expect(decrireStatutEvenement(evenement, maintenant)).toBe('Maintenant')
  })

  it('indique "Maintenant" à l’instant du début sans fin définie', () => {
    const maintenant = new Date('2026-10-03T19:30:00+02:00')
    const evenement = { debut: '2026-10-03T19:30:00+02:00' }
    expect(decrireStatutEvenement(evenement, maintenant)).toBe('Maintenant')
  })

  it('indique "Passé" après la fin', () => {
    const maintenant = new Date('2026-10-03T22:00:00+02:00')
    const evenement = { debut: '2026-10-03T19:30:00+02:00', fin: '2026-10-03T21:00:00+02:00' }
    expect(decrireStatutEvenement(evenement, maintenant)).toBe('Passé')
  })
})
