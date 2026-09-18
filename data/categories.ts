import type { Categorie } from '~/data/content'

export interface InfosCategorie {
  label: string
  tag: string
  tint: string
  teinte: string
}

export const CATEGORIES: Record<Categorie, InfosCategorie> = {
  'a-voir': { label: 'À voir', tag: 'AVO', tint: '#efe7fb', teinte: '#3c2f55' },
  barrio: { label: 'Quartiers', tag: 'QUA', tint: '#dfe6f7', teinte: '#2b3a63' },
  resto: { label: 'Restos', tag: 'RES', tint: '#fbe2d3', teinte: '#7d3b22' },
  cafe: { label: 'Cafés', tag: 'CAF', tint: '#fdf1d2', teinte: '#5f4a15' },
  autre: { label: 'Autres', tag: 'AUT', tint: '#d8eadf', teinte: '#24483a' },
  plage: { label: 'Plages', tag: 'PLA', tint: '#d7eef0', teinte: '#1f5560' },
  aeroport: { label: 'Aéroport', tag: 'AER', tint: '#e6e4ee', teinte: '#40405c' },
}
