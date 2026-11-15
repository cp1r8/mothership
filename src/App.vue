<script setup>
import Headline from './components/Headline.vue'
import CountdownPanel from './components/mosh/CountdownPanel.vue'
import EncounterPanel from './components/mosh/EncounterPanel.vue'
import MoshApp from './components/mosh/MoshApp.vue'
import StatusBar from './components/mosh/StatusBar.vue'
import ZonePanel from './components/mosh/ZonePanel.vue'
import { provideMosh } from './mosh/useMosh.js'

// The MOSH session is shared by the header, the panels and MoshApp.
const { encounterActive } = provideMosh()
</script>

<template>
  <!-- Left column on wide screens: the header with the countdown and zone panels below. -->
  <div class="side">
    <header class="cathode-green">
      <img alt="Monarch logo" class="logo" src="./assets/logo.svg" width="148" height="148" />

      <div class="wrapper">
        <Headline title="Cloudbank®" subtitle="Synthetic Production Facility" />
        <StatusBar />
      </div>
    </header>

    <!-- .mosh supplies the MOSH button and select styles. -->
    <div class="countdown mosh cathode-green">
      <CountdownPanel />
    </div>

    <!-- The zone panel is full width, or shares the row with an active encounter. -->
    <div class="panels mosh cathode-green">
      <ZonePanel />
      <EncounterPanel v-if="encounterActive" />
    </div>
  </div>

  <main>
    <MoshApp />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

/* Desktop only (shown in the media query below). */
.logo {
  display: none;
}

.countdown {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.panels {
  display: flex;
  gap: 1rem;
  margin-block: 1rem 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .side {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  /*
   * Cathode glow to match .cathode-green text. drop-shadow() filters stack on
   * each other, so the radii are smaller than the text-shadow ones.
   */
  .logo {
    display: block;
    margin: 0 2rem 0 0;
    filter: drop-shadow(0 0 2px var(--color-phosphor-200))
      drop-shadow(0 0 6px var(--color-phosphor-500)) drop-shadow(0 0 12px var(--color-phosphor-500));
  }

  /* Same right padding as the header, so the panels match its width. */
  .countdown,
  .panels {
    padding-right: calc(var(--section-gap) / 2);
  }

  .countdown {
    justify-content: flex-start;
  }

  .panels {
    margin-bottom: 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
