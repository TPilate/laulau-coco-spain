<script setup lang="ts">
import { emergencyInformations } from '~/data/content'

const router = useRouter()
const urgencePrincipale = emergencyInformations.find((u) => u.numero === '112')
const autresUrgences = emergencyInformations.filter((u) => u.numero !== '112')

function retour(): void {
  router.back()
}
</script>

<template>
  <div class="page">
    <button type="button" class="bouton-retour" @click="retour">← Retour</button>

    <p class="page-eyebrow" style="color: var(--accent)">Disponible hors connexion</p>
    <h1>Urgences</h1>

    <div v-if="urgencePrincipale" class="hero-112">
      <p class="hero-texte">{{ urgencePrincipale.usage }}</p>
      <p class="hero-numero">{{ urgencePrincipale.numero }}</p>
      <a class="hero-appel" :href="'tel:' + urgencePrincipale.numero">Appeler maintenant</a>
    </div>

    <ul class="liste-urgences">
      <li v-for="urgence in autresUrgences" :key="urgence.id" class="carte-urgence verre">
        <div class="carte-urgence-texte">
          <p class="service">{{ urgence.service }}</p>
          <p class="usage">{{ urgence.usage }}</p>
        </div>
        <a class="numero" :href="'tel:' + urgence.numero.replace(/\s/g, '')">{{ urgence.numero }}</a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.bouton-retour {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  padding: 10px 15px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.85);
  font: 600 12.5px/1 var(--font-sans);
  color: var(--ink);
}

.hero-112 {
  padding: 24px;
  border-radius: 32px;
  text-align: center;
  background: linear-gradient(150deg, rgba(255, 214, 199, 0.92), rgba(255, 237, 229, 0.66));
  backdrop-filter: blur(24px) saturate(185%);
  -webkit-backdrop-filter: blur(24px) saturate(185%);
  border: 1px solid rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 40px -14px rgba(168, 58, 24, 0.35), inset 0 1px 0 rgba(255, 255, 255, 1);
}

.hero-texte {
  margin: 0;
  font: 400 13px/1.45 var(--font-sans);
  color: var(--ink-soft);
}

.hero-numero {
  margin: 10px 0 0;
  font: 400 62px/1 var(--font-serif);
  color: var(--accent);
}

.hero-appel {
  display: block;
  margin-top: 18px;
  padding: 17px;
  border-radius: 22px;
  background: var(--accent);
  color: #fff3ec;
  font: 700 15px/1 var(--font-sans);
  text-decoration: none;
}

.hero-appel:hover {
  background: var(--accent-hover);
  color: #fff3ec;
}

.liste-urgences {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
}

.carte-urgence {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
}

.carte-urgence-texte {
  min-width: 0;
}

.service {
  margin: 0;
  font: 600 14.5px/1.25 var(--font-sans);
  color: var(--ink);
}

.usage {
  margin: 5px 0 0;
  font: 400 12px/1.4 var(--font-sans);
  color: var(--text);
  text-wrap: pretty;
}

.numero {
  flex: none;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(58, 43, 38, 0.88);
  color: #fdf6f1;
  font: 600 12.5px/1 var(--font-mono);
  text-decoration: none;
  white-space: nowrap;
}
</style>
