// Lettre « Pour toi » : tout le contenu de la page /pour-toi.
// `source` = fichier original dans assets/laura/ (non commité),
// `fichier` = WebP généré dans public/laura/ par `npm run photos-laura`.

export interface PhotoLettre {
  source: string
  fichier: string
  date: string
  alt: string
  texte: string
}

export interface Lettre {
  titre: string
  ouverture: string
  photos: PhotoLettre[]
  sommet: PhotoLettre
  fin: string[]
  signature: string
}

export const lettre: Lettre = {
  titre: 'Pour toi, Laura',
  ouverture:
    "Laura, tu m'as dit que tu n'aimais pas te voir en photo. Alors j'ai rassemblé celles que je préfère. Pas pour te dire que tu as tort, juste pour te montrer ce que moi je vois quand je te regarde.",
  photos: [
    {
      source: 'IMG_3590.HEIC',
      fichier: '01.webp',
      date: 'juin 2026',
      alt: 'Laura, un cocktail à la main, qui montre son biceps',
      texte:
        "Un cocktail, un biceps et ce petit air de défi. Tu es comme ça : jamais là où on t'attend. Et moi je craque à chaque fois.",
    },
    {
      source: '05A1561F-C672-4788-8F17-1581AE499D19.JPG',
      fichier: '02.webp',
      date: 'juin 2026',
      alt: 'Laura et Tom en selfie dans un miroir',
      texte:
        "Nous deux dans un miroir. Regarde comme tu souris. C'est ce sourire-là que je vois quand je ferme les yeux.",
    },
    {
      source: 'IMG_3860.HEIC',
      fichier: '03.webp',
      date: 'août 2026',
      alt: 'Laura qui boit un café',
      texte: 'Juste un café. Et pourtant ce regard par-dessus la tasse me fait encore quelque chose.',
    },
    {
      source: 'IMG_3869.HEIC',
      fichier: '04.webp',
      date: 'août 2026',
      alt: 'Laura à la salle de sport',
      texte: 'Tu es forte, Laura. Pas seulement là, sur cette machine. Partout.',
    },
    {
      source: 'IMG_3884.HEIC',
      fichier: '05.webp',
      date: 'août 2026',
      alt: 'Laura qui lit un menu au restaurant',
      texte:
        'Tu lis le menu avec un sérieux absolu. Je pourrais te regarder choisir ton plat pendant des heures.',
    },
    {
      source: 'IMG_3900.HEIC',
      fichier: '06.webp',
      date: 'août 2026',
      alt: "Laura et Tom dans le miroir d'un couloir d'hôtel",
      texte:
        "Un vieux miroir d'hôtel, et moi qui essaie d'avoir l'air cool à côté de toi. Perdu d'avance.",
    },
    {
      source: 'IMG_3957.HEIC',
      fichier: '07.webp',
      date: 'août 2026',
      alt: "Laura qui se retourne devant un grand aquarium",
      texte:
        "Des milliers de poissons derrière toi, et c'est toi que tout le monde aurait dû regarder.",
    },
    {
      source: 'IMG_4039.HEIC',
      fichier: '08.webp',
      date: 'août 2026',
      alt: "Laura qui sourit dans la lumière bleue d'un aquarium",
      texte:
        "Cette lumière bleue, ce rouge à lèvres, ce sourire en coin. Tu n'as aucune idée de l'effet que tu fais.",
    },
    {
      source: 'IMG_4070.HEIC',
      fichier: '09.webp',
      date: 'août 2026',
      alt: 'Laura qui rit, la tête contre Tom',
      texte: 'Ma photo préférée de nous deux. Ton rire est la plus belle chose que je connaisse.',
    },
    {
      source: 'IMG_4073.HEIC',
      fichier: '10.webp',
      date: 'août 2026',
      alt: 'Laura et Tom qui font des grimaces',
      texte:
        'Et celle-là aussi, parce que tu es la seule personne avec qui je suis aussi bête et aussi heureux.',
    },
    {
      source: '9CC28D5F-B103-4332-8559-03FCD322A630.JPG',
      fichier: '11.webp',
      date: 'août 2026',
      alt: 'Laura avec un bouquet de fleurs',
      texte: 'Des fleurs dans les bras et les yeux qui brillent. Tu mérites des bouquets tous les jours.',
    },
    {
      source: 'IMG_4163.HEIC',
      fichier: '12.webp',
      date: 'septembre 2026',
      alt: 'Laura au soleil, sous un grand ciel bleu',
      texte: 'Le soleil, le ciel bleu, et toi qui brilles encore plus fort.',
    },
    {
      source: 'IMG_4286.HEIC',
      fichier: '13.webp',
      date: 'septembre 2026',
      alt: 'Laura de profil, un verre de vin à la main',
      texte: 'Un verre de vin, une lumière douce, ton profil. Je ne me lasse pas de ton visage.',
    },
    {
      source: 'IMG_4407.HEIC',
      fichier: '14.webp',
      date: 'septembre 2026',
      alt: 'Laura qui rit, la main devant la bouche',
      texte:
        "Tu caches ton rire derrière ta main, mais tes yeux te trahissent. C'est ça que j'aime : quand tu es toi, sans filtre.",
    },
  ],
  sommet: {
    source: 'lauraajd.jpg',
    fichier: '15.webp',
    date: "aujourd'hui",
    alt: "Laura de dos sur un balcon de la Plaza de España, à Séville",
    texte:
      "Et puis aujourd'hui, j'ai vu ta story. Toi, face à Séville, les cheveux dans le soleil. À 1300 km, j'ai eu le souffle coupé. Séville a bien de la chance de t'avoir.",
  },
  fin: [
    "Tu vois ce que je vois, maintenant ? Une fille drôle, forte, lumineuse, qui rit trop fort et qui fait des grimaces dans mes selfies. Une fille que je trouve belle sur chaque photo, même celles que tu voudrais effacer. Surtout celles-là, parce que c'est toi, pour de vrai.",
    'Il y a 1300 km entre nous ce soir, mais pas une minute où je ne pense pas à toi.',
    "Je t'aime.",
  ],
  signature: 'Tom',
}
