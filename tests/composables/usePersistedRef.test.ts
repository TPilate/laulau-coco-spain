import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { usePersistedRef } from '../../composables/usePersistedRef'

describe('usePersistedRef', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('utilise la valeur par défaut si rien n\'est stocké', () => {
    const valeur = usePersistedRef('test:cle', 'defaut')
    expect(valeur.value).toBe('defaut')
  })

  it('relit la valeur précédemment stockée', () => {
    localStorage.setItem('test:cle', JSON.stringify('valeur-stockee'))
    const valeur = usePersistedRef('test:cle', 'defaut')
    expect(valeur.value).toBe('valeur-stockee')
  })

  it('persiste les changements dans localStorage', async () => {
    const valeur = usePersistedRef('test:cle', 'defaut')
    valeur.value = 'nouvelle-valeur'
    await nextTick()
    expect(localStorage.getItem('test:cle')).toBe(JSON.stringify('nouvelle-valeur'))
  })

  it('persiste les objets', async () => {
    const valeur = usePersistedRef('test:objet', { mode: 'gps' as const })
    valeur.value = { mode: 'manuel' as const }
    await nextTick()
    expect(JSON.parse(localStorage.getItem('test:objet')!)).toEqual({ mode: 'manuel' })
  })
})
