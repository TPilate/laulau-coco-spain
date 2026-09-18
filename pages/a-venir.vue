<script setup lang="ts">
import { evenements, lieux, messages } from '~/data/content'
import { CATEGORIES } from '~/data/categories'

const { demanderFocus } = useMapFocus()
const { marquerCommeLu } = useMessages()

const evenementsTries = [...evenements].sort(
  (a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime(),
)

const maintenant = ref(new Date())
let intervalle: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  intervalle = setInterval(() => {
    maintenant.value = new Date()
  }, 60_000)
})

onUnmounted(() => {
  if (intervalle) clearInterval(intervalle)
})

function nomLieu(lieuId: string): string {
  return lieux.find((lieu) => lieu.id === lieuId)?.nom ?? lieuId
}

function infosCategorieLieu(lieuId: string) {
  const categorie = lieux.find((lieu) => lieu.id === lieuId)?.categorie ?? 'autre'
  return CATEGORIES[categorie]
}

async function voirSurCarte(lieuId: string): Promise<void> {
  demanderFocus(lieuId)
  await navigateTo('/carte')
}

const prochain = computed(() => {
  return (
    evenementsTries.find((e) => new Date(e.fin ?? e.debut) >= maintenant.value) ??
    evenementsTries[evenementsTries.length - 1]
  )
})

const messagesDeverrouilles = computed(() =>
  messages.filter((m) => new Date(m.unlockAt) <= maintenant.value),
)
const messageActuel = computed(
  () => messagesDeverrouilles.value[messagesDeverrouilles.value.length - 1],
)
const messagesEnAttente = computed(() => messages.length - messagesDeverrouilles.value.length)

watch(
  messageActuel,
  (message: (typeof messages)[number] | undefined) => {
    if (message) marquerCommeLu(message.id)
  },
  { immediate: true },
)

const formatteurJour = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const formatteurHeure = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Madrid',
})

function statutCouleur(evenement: (typeof evenements)[number]): string {
  const statut = decrireStatutEvenement(evenement, maintenant.value)
  if (statut === 'Maintenant') return 'maintenant'
  if (statut === 'Passé') return 'passe'
  return ''
}
</script>

<template>
  <div class="page">
    <p class="page-eyebrow">{{ formatteurJour.format(maintenant) }}</p>
    <h1>À venir</h1>

    <div v-if="prochain" class="hero-evenement">
      <span class="hero-statut">{{ decrireStatutEvenement(prochain, maintenant) }}</span>
      <h2 class="hero-titre">{{ prochain.titre }}</h2>
      <p class="hero-lieu">{{ nomLieu(prochain.lieuId) }} · {{ formatteurHeure.format(new Date(prochain.debut)) }}</p>
      <p v-if="prochain.details" class="hero-details">{{ prochain.details }}</p>
      <button type="button" class="bouton-plein hero-bouton" @click="voirSurCarte(prochain.lieuId)">
        Voir sur la carte
      </button>
    </div>

    <div v-if="messageActuel" class="carte-message">
      <p class="page-eyebrow" style="color: var(--lilac-deep)">Message débloqué</p>
      <h3 class="message-titre">{{ messageActuel.titre }}</h3>
      <p class="message-texte">{{ messageActuel.texte }}</p>
      <p class="message-file">
        {{
          messagesEnAttente > 0
            ? `${messagesEnAttente} ${messagesEnAttente > 1 ? 'messages encore verrouillés' : 'message encore verrouillé'}`
            : 'Tous les messages sont ouverts'
        }}
      </p>
    </div>

    <p class="page-eyebrow" style="margin-top: 26px">Programme du séjour</p>
    <div class="ligne-temps">
      <div class="ligne-temps-trait" />
      <ul class="ligne-temps-liste">
        <li
          v-for="evenement in evenementsTries"
          :key="evenement.id"
          class="evenement"
          :class="statutCouleur(evenement)"
        >
          <span class="evenement-point" />
          <div class="evenement-carte">
            <div class="evenement-tete">
              <span class="evenement-heure">{{ formatteurHeure.format(new Date(evenement.debut)) }}</span>
              <span
                class="evenement-tag"
                :style="{
                  background: infosCategorieLieu(evenement.lieuId).tint,
                  color: infosCategorieLieu(evenement.lieuId).teinte,
                }"
              >{{ infosCategorieLieu(evenement.lieuId).tag }}</span>
            </div>
            <p class="evenement-titre">{{ evenement.titre }}</p>
            <p class="evenement-lieu">{{ nomLieu(evenement.lieuId) }}</p>
            <p v-if="evenement.details" class="evenement-details">{{ evenement.details }}</p>
            <div class="evenement-pied">
              <button type="button" class="bouton-plein evenement-bouton" @click="voirSurCarte(evenement.lieuId)">
                Voir sur la carte
              </button>
              <span class="evenement-statut">{{ decrireStatutEvenement(evenement, maintenant) }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.hero-evenement {
  padding: 22px;
  border-radius: 22px;
  background: var(--ink);
  color: #fff;
}

.hero-statut {
  display: inline-block;
  padding: 7px 12px;
  border-radius: 8px;
  background: var(--lilac-chip);
  font: 700 10.5px/1 var(--font-display);
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--lilac-deep);
}

.hero-titre {
  display: block;
  margin: 14px 0 0;
  font: 700 26px/1.15 var(--font-display);
  letter-spacing: -0.02em;
  text-transform: none;
  color: #fff;
}

.hero-lieu {
  margin: 9px 0 0;
  font: 400 13.5px/1.45 var(--font-sans);
  color: #d6d3e2;
}

.hero-details {
  margin: 6px 0 0;
  font: 400 13px/1.45 var(--font-sans);
  color: #c3bfd2;
  text-wrap: pretty;
}

.hero-bouton {
  display: block;
  margin-top: 18px;
  width: 100%;
  border: none;
  background: #fff;
  color: var(--ink);
}

.hero-bouton:hover {
  background: #fff;
  filter: brightness(0.96);
}

.carte-message {
  margin-top: 14px;
  padding: 19px;
  border-radius: 22px;
  background: var(--lilac);
}

.message-titre {
  margin: 9px 0 0;
  font: 700 20px/1.2 var(--font-display);
  color: var(--ink);
}

.message-texte {
  margin: 8px 0 0;
  font: 400 13.5px/1.5 var(--font-sans);
  color: var(--text-body);
  text-wrap: pretty;
}

.message-file {
  margin: 12px 0 0;
  font: 500 10.5px/1 var(--font-mono);
  color: var(--lilac-deep);
}

.ligne-temps {
  position: relative;
  padding-left: 26px;
  margin-top: 14px;
}

.ligne-temps-trait {
  position: absolute;
  left: 7px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background: linear-gradient(var(--lilac-chip), var(--peach));
}

.ligne-temps-liste {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.evenement {
  position: relative;
}

.evenement-carte {
  background: #fff;
  border-radius: 18px;
  padding: 16px;
  box-shadow: var(--card-shadow);
}

.evenement.passe .evenement-carte {
  box-shadow: none;
  background: rgba(255, 255, 255, 0.6);
}

.evenement-point {
  position: absolute;
  left: -26px;
  top: 16px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid var(--lilac-chip);
  box-sizing: border-box;
}

.evenement.maintenant .evenement-point {
  background: var(--ink);
  border-color: var(--bg);
}

.evenement.passe .evenement-point {
  background: #fff;
  border-color: rgba(27, 27, 31, 0.15);
}

.evenement-tete {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.evenement-heure {
  font: 500 11px/1 var(--font-mono);
  color: var(--text);
}

.evenement-tag {
  flex: none;
  font: 700 9.5px/1 var(--font-display);
  letter-spacing: 0.08em;
  padding: 7px 9px;
  border-radius: 7px;
}

.evenement-titre {
  margin: 9px 0 0;
  font: 700 17px/1.2 var(--font-display);
  letter-spacing: -0.01em;
  color: var(--ink);
}

.evenement-lieu {
  margin: 4px 0 0;
  font: 400 12.5px/1.4 var(--font-sans);
  color: var(--text);
}

.evenement-details {
  margin: 6px 0 0;
  font: 400 13px/1.45 var(--font-sans);
  color: var(--text-body);
  text-wrap: pretty;
}

.evenement-pied {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 14px;
}

.evenement-bouton {
  padding: 13px 15px;
  border-radius: 11px;
}

.evenement-statut {
  font: 500 10.5px/1 var(--font-mono);
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--text);
}

.evenement.maintenant .evenement-statut {
  color: var(--accent);
}
</style>
