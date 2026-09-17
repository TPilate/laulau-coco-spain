export type Categorie = 'a-voir' | 'resto' | 'cafe' | 'plage' | 'autre'

export interface Lieu {
  id: string
  nom: string
  categorie: Categorie
  lat: number
  lng: number
  mot?: string
}

export interface Evenement {
  id: string
  debut: string // ISO avec décalage, ex. '2026-10-03T19:30:00+02:00'
  fin?: string
  lieuId: string
  titre: string
  details?: string
}

export interface Message {
  id: string
  unlockAt: string // ISO avec décalage
  titre: string
  texte: string
}

export interface Phrase {
  theme: string
  fr: string
  es: string
  prononciation: string
}

export const lieux: Lieu[] = [
  {
    id: 'ciutat-arts',
    nom: 'Ciutat de les Arts i les Ciències',
    categorie: 'a-voir',
    lat: 39.4539,
    lng: -0.3483,
    mot: 'Le complexe futuriste de Calatrava, magnifique au coucher du soleil.',
  },
  {
    id: 'lonja-seda',
    nom: 'La Lonja de la Seda',
    categorie: 'a-voir',
    lat: 39.4744,
    lng: -0.3814,
    mot: "L'ancienne bourse de soie, classée à l'UNESCO. Ne rate pas la salle des colonnes torsadées.",
  },
  {
    id: 'torres-serranos',
    nom: 'Torres de Serranos',
    categorie: 'a-voir',
    lat: 39.4807,
    lng: -0.3774,
    mot: 'On monte tout en haut pour la vue sur la vieille ville, promis ça vaut le coup.',
  },
  {
    id: 'mercado-central',
    nom: 'Mercado Central',
    categorie: 'autre',
    lat: 39.4746,
    lng: -0.3798,
    mot: 'Marché couvert Art nouveau. Parfait pour goûter des fruits et du jambon local.',
  },
  {
    id: 'casa-montana',
    nom: 'Casa Montaña',
    categorie: 'resto',
    lat: 39.4656,
    lng: -0.326,
    mot: 'Bodega historique du Cabanyal, tapas et bon vin. On réserve si on veut une table.',
  },
  {
    id: 'horchateria-santa-catalina',
    nom: 'Horchatería Santa Catalina',
    categorie: 'cafe',
    lat: 39.4759,
    lng: -0.3757,
    mot: 'La meilleure horchata du centre, avec les fartons pour tremper dedans.',
  },
  {
    id: 'playa-malvarrosa',
    nom: 'Playa de la Malvarrosa',
    categorie: 'plage',
    lat: 39.4756,
    lng: -0.3277,
    mot: 'Grande plage de sable, parfaite pour un bain en fin de journée.',
  },
]

export const evenements: Evenement[] = [
  {
    id: 'arrivee-hotel',
    debut: '2026-10-03T16:00:00+02:00',
    lieuId: 'mercado-central',
    titre: "Arrivée et installation à l'hôtel",
    details: 'Dépose des valises, on part ensuite explorer le centre à pied.',
  },
  {
    id: 'diner-casa-montana',
    debut: '2026-10-03T20:30:00+02:00',
    fin: '2026-10-03T22:30:00+02:00',
    lieuId: 'casa-montana',
    titre: 'Dîner tapas à Casa Montaña',
  },
  {
    id: 'visite-ciutat-arts',
    debut: '2026-10-04T10:00:00+02:00',
    fin: '2026-10-04T13:00:00+02:00',
    lieuId: 'ciutat-arts',
    titre: 'Visite de la Ciutat de les Arts i les Ciències',
  },
  {
    id: 'apres-midi-plage',
    debut: '2026-10-05T15:00:00+02:00',
    fin: '2026-10-05T18:30:00+02:00',
    lieuId: 'playa-malvarrosa',
    titre: 'Après-midi à la Malvarrosa',
    details: 'Serviettes et crème solaire !',
  },
  {
    id: 'visite-lonja',
    debut: '2026-10-06T11:00:00+02:00',
    fin: '2026-10-06T12:30:00+02:00',
    lieuId: 'lonja-seda',
    titre: 'Visite de la Lonja de la Seda',
  },
]

export const messages: Message[] = [
  {
    id: 'message-1',
    unlockAt: '2026-10-03T08:00:00+02:00',
    titre: 'Bon voyage !',
    texte: "On y est enfin. J'ai hâte de découvrir Valence avec toi. Bisous depuis avant le départ.",
  },
  {
    id: 'message-2',
    unlockAt: '2026-10-05T09:00:00+02:00',
    titre: 'Mi-séjour',
    texte: "Déjà la moitié du voyage ! Profite bien de la plage cet après-midi, je pense fort à toi.",
  },
  {
    id: 'message-3',
    unlockAt: '2026-10-07T07:00:00+02:00',
    titre: 'Dernier jour',
    texte: 'Dernier jour à Valence. Merci pour ce super voyage, on en refait un vite.',
  },
]

export const phrases: Phrase[] = [
  { theme: 'Salutations', fr: 'Bonjour', es: 'Buenos días', prononciation: 'bou-é-nos di-as' },
  { theme: 'Salutations', fr: 'Bonsoir', es: 'Buenas tardes', prononciation: 'bou-é-nas tar-dès' },
  { theme: 'Salutations', fr: 'Merci beaucoup', es: 'Muchas gracias', prononciation: 'mou-tchas gra-cias' },
  { theme: 'Salutations', fr: "S'il vous plaît", es: 'Por favor', prononciation: 'por fa-vor' },
  {
    theme: 'Restaurant',
    fr: "Une table pour deux, s'il vous plaît",
    es: 'Una mesa para dos, por favor',
    prononciation: 'ou-na mé-sa pa-ra dos, por fa-vor',
  },
  {
    theme: 'Restaurant',
    fr: "L'addition, s'il vous plaît",
    es: 'La cuenta, por favor',
    prononciation: 'la couenn-ta, por fa-vor',
  },
  { theme: 'Restaurant', fr: 'Sans gluten', es: 'Sin gluten', prononciation: 'sinn glou-tenn' },
  {
    theme: 'Restaurant',
    fr: "Qu'est-ce que vous recommandez ?",
    es: '¿Qué nos recomienda?',
    prononciation: 'ké nos ré-co-mien-da',
  },
  {
    theme: 'Transport',
    fr: 'Où est la station de métro ?',
    es: '¿Dónde está el metro?',
    prononciation: 'donn-dé es-ta el mé-tro',
  },
  {
    theme: 'Transport',
    fr: 'Un billet pour le centre-ville',
    es: 'Un billete para el centro',
    prononciation: 'oun bi-yé-té pa-ra el cenn-tro',
  },
  {
    theme: 'Transport',
    fr: "C'est loin d'ici ?",
    es: '¿Está lejos de aquí?',
    prononciation: 'es-ta lé-Ros dé a-ki',
  },
  {
    theme: 'Transport',
    fr: 'À quelle heure part le bus ?',
    es: '¿A qué hora sale el autobús?',
    prononciation: 'a ké o-ra sa-lé el aou-to-bous',
  },
  { theme: 'Urgences', fr: "À l'aide !", es: '¡Ayuda!', prononciation: 'a-you-da' },
  {
    theme: 'Urgences',
    fr: "J'ai besoin d'un médecin",
    es: 'Necesito un médico',
    prononciation: 'né-cé-si-to oun mé-di-co',
  },
  {
    theme: 'Urgences',
    fr: 'Où est la pharmacie la plus proche ?',
    es: '¿Dónde está la farmacia más cercana?',
    prononciation: 'donn-dé es-ta la far-ma-cia mas cer-ca-na',
  },
  {
    theme: 'Urgences',
    fr: "J'ai perdu mon passeport",
    es: 'He perdido mi pasaporte',
    prononciation: 'é pèr-di-do mi pa-sa-por-té',
  },
]
