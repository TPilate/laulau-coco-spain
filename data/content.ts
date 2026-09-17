export type Categorie = 'a-voir' | 'resto' | 'cafe' | 'plage' | 'autre' | 'barrio' | 'aeroport'

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
    id: 'plaza-espana',
    nom: 'Plaza de España',
    categorie: 'a-voir',
    lat: 37.3772,
    lng: -5.9869,
    mot: 'Un décor monumental au cœur du parc de María Luisa. Prévoir une vraie balade.',
  },
  {
    id: 'real-alcazar',
    nom: 'Real Alcázar de Sevilla',
    categorie: 'a-voir',
    lat: 37.3831,
    lng: -5.992,
    mot: 'Palais aux jardins extraordinaires. On prend le temps de se perdre dans les patios.',
  },
  {
    id: 'catedral-sevilla',
    nom: 'Cathédrale de Séville',
    categorie: 'a-voir',
    lat: 37.3861,
    lng: -5.9926,
    mot: 'La Giralda domine toute la ville. Monter en haut vaut largement l’effort.',
  },
  {
    id: 'setas-sevilla',
    nom: 'Setas de Sevilla',
    categorie: 'autre',
    lat: 37.3932,
    lng: -5.9914,
    mot: 'Le grand belvédère en bois au-dessus de la vieille ville, surtout beau au coucher du soleil.',
  },
  {
    id: 'mercado-triana',
    nom: 'Mercado de Triana',
    categorie: 'resto',
    lat: 37.3863,
    lng: -6.0027,
    mot: 'Un marché animé pour goûter aux spécialités locales et traverser le pont juste après.',
  },
  {
    id: 'la-brunilda',
    nom: 'La Brunilda',
    categorie: 'cafe',
    lat: 37.3887,
    lng: -5.9965,
    mot: 'Une adresse parfaite pour partager des tapas créatives, avec une file qui vaut la peine.',
  },
  {
    id: 'parque-maria-luisa',
    nom: 'Parque de María Luisa',
    categorie: 'autre',
    lat: 37.3757,
    lng: -5.9874,
    mot: 'Le coin idéal pour ralentir entre deux visites, sous les orangers et les palmiers.',
  },
  {
    id: 'torre-del-oro',
    nom: 'Torre del Oro',
    categorie: 'a-voir',
    lat: 37.3828,
    lng: -5.9958,
    mot: 'La tour dorée au bord du Guadalquivir, parfaite pour une pause en admirant le fleuve.',
  },
  {
    id: 'barrio-triana',
    nom: 'Barrio de Triana',
    categorie: 'barrio',
    lat: 37.3838,
    lng: -6.0031,
    mot: 'Le quartier des céramiques et du flamenco, juste de l’autre côté du pont.',
  },
  {
    id: 'barrio-santa-cruz',
    nom: 'Barrio de Santa Cruz',
    categorie: 'barrio',
    lat: 37.385,
    lng: -5.9895,
    mot: 'Un dédale de ruelles blanches et de patios fleuris juste derrière la cathédrale.',
  },
  {
    id: 'alameda-de-hercules',
    nom: 'Alameda de Hércules',
    categorie: 'barrio',
    lat: 37.3971,
    lng: -5.9944,
    mot: 'La place animée du soir, entre bars, terrasses et ambiance locale.',
  },
  {
    id: 'aeropuerto-sevilla',
    nom: 'Aeropuerto de Sevilla (SVQ)',
    categorie: 'aeroport',
    lat: 37.418,
    lng: -5.8931,
    mot: 'Aéroport de San Pablo, à environ 10 km du centre-ville.',
  },
]

export const evenements: Evenement[] = [
  {
    id: 'arrivee-hotel',
    debut: '2026-09-21T16:00:00+02:00',
    lieuId: 'mercado-triana',
    titre: "Arrivée et installation à l'hôtel",
    details: 'Dépose des valises, on part ensuite explorer le centre à pied.',
  },
  {
    id: 'diner-la-brunilda',
    debut: '2026-09-21T20:30:00+02:00',
    fin: '2026-09-21T22:30:00+02:00',
    lieuId: 'la-brunilda',
    titre: 'Dîner tapas à La Brunilda',
  },
  {
    id: 'visite-plaza-espana',
    debut: '2026-09-22T10:00:00+02:00',
    fin: '2026-09-22T13:00:00+02:00',
    lieuId: 'plaza-espana',
    titre: 'Visite de la Plaza de España',
  },
  {
    id: 'apres-midi-plage',
    debut: '2026-09-23T15:00:00+02:00',
    fin: '2026-09-23T18:30:00+02:00',
    lieuId: 'parque-maria-luisa',
    titre: 'Après-midi au Parque de María Luisa',
    details: 'Chaussures confortables et bouteille d’eau !',
  },
  {
    id: 'visite-alcazar',
    debut: '2026-09-24T11:00:00+02:00',
    fin: '2026-09-24T12:30:00+02:00',
    lieuId: 'real-alcazar',
    titre: 'Visite du Real Alcázar de Sevilla',
  },
]

export const messages: Message[] = [
  {
    id: 'message-1',
    unlockAt: '2026-09-21T08:00:00+02:00',
    titre: 'Bon voyage !',
    texte: "On y est enfin. J'ai hâte de découvrir Séville avec toi. Bisous depuis avant le départ.",
  },
  {
    id: 'message-2',
    unlockAt: '2026-09-23T09:00:00+02:00',
    titre: 'Mi-séjour',
    texte: 'Déjà la moitié du voyage ! Profite bien de la plage cet après-midi, je pense fort à toi.',
  },
  {
    id: 'message-3',
    unlockAt: '2026-09-25T07:00:00+02:00',
    titre: 'Dernier jour',
    texte: 'Dernier jour à Séville. Merci pour ce super voyage, on en refait un vite.',
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

export const emergencyInformations = [
  {
    id: '1',
    service: 'Urgences Générales (Européen)',
    numero: '112',
    usage: 'Toute urgence (médicale, police, pompiers)',
  },
  {
    id: '2',
    service: 'Ambulance (SAMU)',
    numero: '061',
    usage: 'Urgence médicale nécessitant une intervention rapide',
  },
  {
    id: '3',
    service: 'Police Nationale',
    numero: '091',
    usage: 'Vols, agressions ou délits au sein de la ville',
  },
  {
    id: '4',
    service: 'Police Locale',
    numero: '092',
    usage: 'Accidents de la route urbains et problèmes de circulation',
  },
  {
    id: '5',
    service: 'Garde Civile',
    numero: '062',
    usage: 'Problèmes hors agglomération (grandes routes, parcs naturels)',
  },
  {
    id: '6',
    service: 'Pompiers',
    numero: '080',
    usage: 'Incendies et sauvetages',
  },
  {
    id: '7',
    service: 'Ligne France Consulaire (Séville)',
    numero: '+34 85 45 08 001',
    usage: 'Lundi au vendredi, de 9h à 17h',
  },
  {
    id: '8',
    service: 'Agence locale à Séville',
    numero: '+34 954 293 200',
    usage: 'Assistance de proximité',
  },
  {
    id: '9',
    service: 'Consulat Général à Madrid',
    numero: '+34 912 15 91 00',
    usage: 'Supervise la région et gère les urgences consulaires graves',
  },
]
