<script setup lang="ts">
import '@fontsource/cormorant-garamond/latin-400.css'
import '@fontsource/cormorant-garamond/latin-ext-400.css'
import '@fontsource/cormorant-garamond/latin-400-italic.css'
import '@fontsource/cormorant-garamond/latin-ext-400-italic.css'
import { lettre } from '~/data/pour-toi'

definePageMeta({ layout: 'lettre' })
useHead({ title: lettre.titre, bodyAttrs: { class: 'fond-lettre' } })

const ouverte = ref(false)
const racine = ref<HTMLElement | null>(null)
let observateur: IntersectionObserver | undefined

// Chaque bloc .apparait reçoit .visible quand il entre à l'écran, une seule fois.
async function ouvrir(): Promise<void> {
  ouverte.value = true
  await nextTick()
  window.scrollTo({ top: 0 })
  observateur = new IntersectionObserver(
    (entrees) => {
      for (const entree of entrees) {
        if (!entree.isIntersecting) continue
        entree.target.classList.add('visible')
        observateur?.unobserve(entree.target)
      }
    },
    { threshold: 0.15 },
  )
  racine.value?.querySelectorAll('.apparait').forEach((el: Element) => observateur?.observe(el))
}

onUnmounted(() => observateur?.disconnect())
</script>

<template>
  <div ref="racine" class="lettre">
    <div class="coeurs" aria-hidden="true">
      <span v-for="n in 12" :key="n" class="coeur" :style="{ '--i': n }">♥</span>
    </div>

    <Transition name="enveloppe">
      <section v-if="!ouverte" class="enveloppe">
        <p class="enveloppe-sur-titre">Une lettre</p>
        <h1 class="enveloppe-titre">{{ lettre.titre }}</h1>
        <button type="button" class="enveloppe-bouton" @click="ouvrir">Ouvrir</button>
      </section>
    </Transition>

    <article v-if="ouverte" class="contenu">
      <p class="ouverture apparait">{{ lettre.ouverture }}</p>

      <figure v-for="photo in lettre.photos" :key="photo.fichier" class="photo apparait">
        <img :src="`/laura/${photo.fichier}`" :alt="photo.alt" loading="lazy" decoding="async">
        <figcaption>
          <span class="photo-date">{{ photo.date }}</span>
          <span class="photo-texte">{{ photo.texte }}</span>
        </figcaption>
      </figure>

      <figure class="sommet apparait">
        <img
          :src="`/laura/${lettre.sommet.fichier}`"
          :alt="lettre.sommet.alt"
          loading="lazy"
          decoding="async"
        >
        <figcaption>
          <span class="photo-date">{{ lettre.sommet.date }}</span>
          <span class="sommet-texte">{{ lettre.sommet.texte }}</span>
        </figcaption>
      </figure>

      <section class="fin apparait">
        <p v-for="(paragraphe, index) in lettre.fin" :key="index">{{ paragraphe }}</p>
        <p class="signature">{{ lettre.signature }}</p>
      </section>
    </article>
  </div>
</template>

<style>
/* Évite le lavande de l'app pendant le rebond de défilement iOS. */
body.fond-lettre {
  background: #fbf6f1;
}
</style>

<style scoped>
.lettre {
  --creme: #fbf6f1;
  --poudre: #f4dcd8;
  --bordeaux: #5a2a31;
  --or: #b8865b;
  --serif: 'Cormorant Garamond', Georgia, serif;
  position: relative;
  min-height: 100dvh;
  color: var(--bordeaux);
  background: radial-gradient(120% 60% at 50% 0%, var(--poudre) 0%, var(--creme) 60%);
  overflow-x: hidden;
}

/* Cœurs flottants */
.coeurs {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.coeur {
  position: absolute;
  bottom: -40px;
  left: calc(var(--i) * 8% - 4%);
  font-size: calc(10px + var(--i) * 1.2px);
  color: var(--or);
  opacity: 0;
  animation: monter 16s linear infinite;
  animation-delay: calc(var(--i) * -1.4s);
}

@keyframes monter {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.25; }
  90% { opacity: 0.2; }
  100% { transform: translateY(-110vh) rotate(25deg); opacity: 0; }
}

/* Enveloppe */
.enveloppe {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  text-align: center;
}

.enveloppe-sur-titre {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--or);
}

.enveloppe-titre {
  margin: 0;
  font-family: var(--serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(44px, 12vw, 72px);
  line-height: 1.05;
}

.enveloppe-bouton {
  margin-top: 24px;
  padding: 14px 40px;
  border: 1px solid var(--bordeaux);
  border-radius: 999px;
  background: transparent;
  color: var(--bordeaux);
  font-family: var(--serif);
  font-size: 22px;
  font-style: italic;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
}

.enveloppe-bouton:hover,
.enveloppe-bouton:focus-visible {
  background: var(--bordeaux);
  color: var(--creme);
}

.enveloppe-leave-active {
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.enveloppe-leave-to {
  opacity: 0;
  transform: scale(1.04);
}

/* Contenu */
.contenu {
  position: relative;
  z-index: 1;
  max-width: 560px;
  margin: 0 auto;
  padding: 72px 20px 96px;
  display: flex;
  flex-direction: column;
  gap: 72px;
  animation: entree 1.2s ease both;
}

@keyframes entree {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ouverture,
.photo-texte,
.sommet-texte,
.fin p {
  font-family: var(--serif);
  font-style: italic;
}

.ouverture {
  margin: 0;
  font-size: 26px;
  line-height: 1.4;
  text-align: center;
}

.photo,
.sommet {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.photo img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 18px;
  box-shadow: 0 12px 32px rgba(90, 42, 49, 0.14);
  background: var(--poudre);
}

.photo figcaption,
.sommet figcaption {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
}

.photo-date {
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--or);
}

.photo-texte {
  font-size: 22px;
  line-height: 1.4;
}

/* Sommet : la photo de la story, en pleine largeur */
.sommet img {
  display: block;
  width: 100vw;
  max-width: 720px;
  height: auto;
  margin-left: 50%;
  transform: translateX(-50%);
}

.sommet-texte {
  font-size: 26px;
  line-height: 1.4;
}

/* Lettre de fin */
.fin {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-top: 24px;
  border-top: 1px solid rgba(184, 134, 91, 0.4);
}

.fin p {
  margin: 0;
  font-size: 22px;
  line-height: 1.5;
}

.fin .signature {
  margin-top: 12px;
  font-size: 30px;
  text-align: right;
}

/* Apparition au défilement */
.apparait {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 1s ease, transform 1s ease;
}

.apparait.visible {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .coeurs {
    display: none;
  }

  .contenu {
    animation: none;
  }

  .apparait {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .enveloppe-leave-active {
    transition: none;
  }
}
</style>
