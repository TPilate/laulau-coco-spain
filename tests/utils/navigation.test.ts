import { describe, it, expect } from 'vitest'
import { estOngletActif } from '../../utils/navigation'

describe('estOngletActif', () => {
  it('est actif sur une correspondance exacte', () => {
    expect(estOngletActif('/carte', '/carte')).toBe(true)
  })

  it('est actif sur un sous-chemin', () => {
    expect(estOngletActif('/carte/detail', '/carte')).toBe(true)
  })

  it("n'est pas actif sur un autre onglet", () => {
    expect(estOngletActif('/guide', '/carte')).toBe(false)
  })
})
