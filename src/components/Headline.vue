<script setup>
import { computed } from 'vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: false,
  },
})

const CLOCK_EPOCH_OFFSET = 12_622_780_800_000 // 400 years (skip 3 leap days)
const CLOCK_INTERVAL = 600_000 // 10 minutes

const now = computed(
  () => new Date(Math.floor((Date.now() + CLOCK_EPOCH_OFFSET) / CLOCK_INTERVAL) * CLOCK_INTERVAL),
)

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'short',
    timeZone: 'UTC',
  }).format(value)
}

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(value)
}
</script>

<template>
  <div class="headline">
    <h1>{{ title }}</h1>
    <h3 v-if="subtitle">{{ subtitle }}</h3>
    <time datetime="{{ now.toISOString() }}">{{ formatDate(now) }} {{ formatTime(now) }} GMT</time>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.4rem;
  /* font-size: 2.6rem; */
  /* position: relative; */
  /* top: -10px; */
  text-transform: uppercase;
}

h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.headline h1,
.headline h3,
.headline p {
  text-align: center;
}

@media (min-width: 1024px) {
  .headline h1,
  .headline h3,
  .headline p {
    text-align: left;
  }
}
</style>
