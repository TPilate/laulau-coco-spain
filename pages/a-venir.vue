<script setup lang="ts">
import { evenements, lieux, messages } from '~/data/content'

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

    <div v-if="prochain" class="hero-evenement verre-forte">
      <div class="sheen" />
      <div class="hero-contenu">
        <span class="hero-statut">{{ decrireStatutEvenement(prochain, maintenant) }}</span>
        <h2 class="hero-titre">{{ prochain.titre }}</h2>
        <p class="hero-lieu">{{ nomLieu(prochain.lieuId) }} · {{ formatteurHeure.format(new Date(prochain.debut)) }}</p>
        <p v-if="prochain.details" class="hero-details">{{ prochain.details }}</p>
        <button type="button" class="bouton-plein hero-bouton" @click="voirSurCarte(prochain.lieuId)">
          Voir sur la carte
        </button>
      </div>
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
          class="evenement verre"
          :class="statutCouleur(evenement)"
        >
          <span class="evenement-point" />
          <div class="evenement-tete">
            <p class="evenement-statut">{{ decrireStatutEvenement(evenement, maintenant) }}</p>
            <span class="evenement-heure">{{ formatteurHeure.format(new Date(evenement.debut)) }}</span>
          </div>
          <p class="evenement-titre">{{ evenement.titre }}</p>
          <p class="evenement-lieu">{{ nomLieu(evenement.lieuId) }}</p>
          <p v-if="evenement.details" class="evenement-details">{{ evenement.details }}</p>
          <button type="button" class="bouton-verre" @click="voirSurCarte(evenement.lieuId)">
            Voir sur la carte
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.hero-evenement {
  position: relative;
  overflow: hidden;
  padding: 22px;
  background: linear-gradient(140deg, rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0.44));
}

.sheen {
  position: absolute;
  top: 0;
  left: 0;
  width: 60%;
  height: 100%;
  background: linear-gradient(100deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0));
  animation: sheen 6.5s ease-in-out infinite;
}

.hero-contenu {
  position: relative;
}

.hero-statut {
  display: inline-block;
  padding: 7px 12px;
  border-radius: 12px;
  background: var(--lilac);
  font: 700 10.5px/1 var(--font-sans);
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--lilac-deep);
}

.hero-titre {
  display: block;
  margin: 14px 0 0;
  font: 400 26px/1.12 var(--font-serif);
  letter-spacing: normal;
  color: var(--ink);
  text-transform: none;
}

.hero-lieu {
  margin: 9px 0 0;
  font: 400 13.5px/1.45 var(--font-sans);
  color: var(--ink-soft);
}

.hero-details {
  margin: 6px 0 0;
  font: 400 13px/1.45 var(--font-sans);
  color: var(--text);
  text-wrap: pretty;
}

.hero-bouton {
  display: block;
  margin-top: 18px;
  width: 100%;
  border: none;
}

.carte-message {
  margin-top: 14px;
  padding: 19px;
  border-radius: 28px;
  background: linear-gradient(150deg, rgba(235, 210, 242, 0.85), rgba(248, 235, 252, 0.6));
  backdrop-filter: blur(24px) saturate(185%);
  -webkit-backdrop-filter: blur(24px) saturate(185%);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 14px 36px -14px rgba(120, 80, 140, 0.3), inset 0 1px 0 rgba(255, 255, 255, 1);
}

.message-titre {
  margin: 9px 0 0;
  font: italic 400 21px/1.2 var(--font-serif);
  color: var(--ink);
}

.message-texte {
  margin: 8px 0 0;
  font: 400 13.5px/1.5 var(--font-sans);
  color: var(--ink-soft);
  text-wrap: pretty;
}

.message-file {
  margin: 12px 0 0;
  font: 500 10.5px/1 var(--font-mono);
  color: var(--text);
}

.ligne-temps {
  position: relative;
  padding-left: 22px;
  margin-top: 12px;
}

.ligne-temps-trait {
  position: absolute;
  left: 5px;
  top: 6px;
  bottom: 10px;
  width: 2px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--lilac), var(--blue), var(--green));
}

.ligne-temps-liste {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.evenement {
  position: relative;
  padding: 16px 17px;
}

.evenement.passe {
  background: rgba(255, 255, 255, 0.34);
}

.evenement-point {
  position: absolute;
  left: -21px;
  top: 23px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--lilac);
  box-shadow: 0 0 0 3px rgba(253, 247, 243, 0.95);
}

.evenement.maintenant .evenement-point {
  background: var(--accent);
}

.evenement.passe .evenement-point {
  background: rgba(58, 43, 38, 0.25);
}

.evenement-tete {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.evenement-statut {
  margin: 0;
  font: 500 10.5px/1 var(--font-mono);
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--lilac-deep);
}

.evenement.maintenant .evenement-statut {
  color: var(--accent);
}

.evenement.passe .evenement-statut {
  color: #7a6a62;
}

.evenement-heure {
  flex: none;
  font: 500 11px/1 var(--font-mono);
  color: var(--text);
}

.evenement-titre {
  margin: 8px 0 0;
  font: 600 15.5px/1.25 var(--font-sans);
  color: var(--ink);
}

.evenement-lieu {
  margin: 5px 0 0;
  font: 400 12.5px/1.4 var(--font-sans);
  color: var(--text);
}

.evenement-details {
  margin: 5px 0 0;
  font: 400 12.5px/1.4 var(--font-sans);
  color: var(--text);
  text-wrap: pretty;
}

.evenement .bouton-verre {
  margin-top: 13px;
}
</style>
