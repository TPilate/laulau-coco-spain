export function decrireStatutEvenement(
  evenement: { debut: string; fin?: string },
  maintenant: Date,
): string {
  const debut = new Date(evenement.debut)
  const fin = evenement.fin ? new Date(evenement.fin) : debut

  if (maintenant < debut) {
    return formatDelaiAvant(debut, maintenant)
  }
  if (maintenant >= debut && maintenant <= fin) {
    return 'Maintenant'
  }
  return 'Passé'
}

function formatDelaiAvant(debut: Date, maintenant: Date): string {
  const diffMinutes = Math.round((debut.getTime() - maintenant.getTime()) / 60000)
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })

  if (diffMinutes < 60) {
    return capitaliser(rtf.format(diffMinutes, 'minute'))
  }
  const diffHeures = Math.round(diffMinutes / 60)
  if (diffHeures < 24) {
    return capitaliser(rtf.format(diffHeures, 'hour'))
  }
  const diffJours = Math.round(diffHeures / 24)
  return capitaliser(rtf.format(diffJours, 'day'))
}

function capitaliser(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1)
}
