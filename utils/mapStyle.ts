import { layers, namedFlavor } from '@protomaps/basemaps'
import type { StyleSpecification } from 'maplibre-gl'

// Partagé avec MapaSeville.client.vue : la clé sous laquelle une source pmtiles est
// enregistrée dans le Protocol doit correspondre exactement à ce que le protocole extrait
// de l'URL `pmtiles://<clé>/{z}/{x}/{y}` du style, sans quoi il retombe sur une source
// distante par défaut au lieu de la source en mémoire.
export function cleSourceSeville(origin: string): string {
  return `${origin}/seville.pmtiles`
}

export function creerStyleSeville(origin: string): StyleSpecification {
  return {
    version: 8,
    glyphs: `${origin}/style/fonts/{fontstack}/{range}.pbf`,
    sprite: `${origin}/style/sprites/light`,
    sources: {
      protomaps: {
        type: 'vector',
        url: `pmtiles://${cleSourceSeville(origin)}`,
        attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
      },
    },
    layers: layers('protomaps', namedFlavor('light'), { lang: 'fr' }),
  }
}
