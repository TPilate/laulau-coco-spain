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
  padding: 13px 16px;
  border-radius: 999px;
  background: #fff;
  border: none;
  box-shadow: var(--card-shadow);
  font: 700 12.5px/1 var(--font-display);
  color: var(--ink);
}

.hero-112 {
  padding: 22px;
  border-radius: 22px;
  text-align: center;
  background: var(--peach);
}

.hero-texte {
  margin: 0;
  font: 400 13px/1.4 var(--font-sans);
  color: var(--peach-deep);
}

.hero-numero {
  margin: 10px 0 14px;
  font: 700 56px/1 var(--font-display);
  letter-spacing: -0.03em;
  color: var(--accent);
}

.hero-appel {
  display: block;
  padding: 17px;
  border-radius: 14px;
  background: var(--accent);
  color: #fff;
  font: 700 14px/1 var(--font-display);
  text-decoration: none;
}

.hero-appel:hover {
  background: var(--accent-hover);
  color: #fff;
}

.liste-urgences {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-top: 14px;
}

.carte-urgence {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px;
  background: #fff;
  border-radius: 16px;
  box-shadow: none;
}

.carte-urgence-texte {
  min-width: 0;
}

.service {
  margin: 0;
  font: 700 15px/1.2 var(--font-display);
  color: var(--ink);
}

.usage {
  margin: 3px 0 0;
  font: 400 12px/1.35 var(--font-sans);
  color: var(--text);
  text-wrap: pretty;
}

.numero {
  flex: none;
  padding: 13px 14px;
  border-radius: 11px;
  background: var(--ink);
  color: #fff;
  font: 500 13px/1 var(--font-mono);
  text-decoration: none;
  white-space: nowrap;
}
</style>
