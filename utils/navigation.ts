export function estOngletActif(cheminActuel: string, cheminOnglet: string): boolean {
  return cheminActuel === cheminOnglet || cheminActuel.startsWith(`${cheminOnglet}/`)
}
