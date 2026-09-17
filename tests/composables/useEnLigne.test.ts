import { describe, it, expect } from 'vitest'
import { effectScope } from 'vue'
import { useEnLigne } from '../../composables/useEnLigne'

describe('useEnLigne', () => {
  it('reflète navigator.onLine au départ', () => {
    const { enLigne } = useEnLigne()
    expect(enLigne.value).toBe(navigator.onLine)
  })

  it('passe à false sur l\'événement offline puis à true sur online', () => {
    const { enLigne } = useEnLigne()
    window.dispatchEvent(new Event('offline'))
    expect(enLigne.value).toBe(false)
    window.dispatchEvent(new Event('online'))
    expect(enLigne.value).toBe(true)
  })

  it('n\'écoute plus après la destruction du scope', () => {
    const portee = effectScope()
    const { enLigne } = portee.run(() => useEnLigne())!
    portee.stop()
    window.dispatchEvent(new Event('offline'))
    expect(enLigne.value).toBe(true)
  })
})
