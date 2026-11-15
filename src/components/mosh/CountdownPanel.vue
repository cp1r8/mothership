<script setup>
import { computed } from 'vue'
import {
  COUNTDOWN_WARNING_CRITICAL,
  COUNTDOWN_WARNING_THRESHOLD,
  options,
} from '@/mosh/constants.js'
import { pad2 } from '@/mosh/format.js'
import { useMosh } from '@/mosh/useMosh.js'

const {
  countdownSpeed,
  countdownStatus,
  countdownValue,
  encounterActive,
  environment,
  expireCountdown,
  ready,
  showEncounter,
  sound,
  toggleCountdown,
  toggleSound,
} = useMosh()

const header = computed(() =>
  ready.value ? environment.value.title?.toLocaleUpperCase() || ' ' : '-?-',
)

const display = computed(() => {
  const minutes = Math.floor(countdownValue.value / 60_000)
  const seconds = Math.floor((countdownValue.value % 60_000) / 1000)
  return `${pad2(minutes)}:${pad2(seconds)}`
})

const displayClass = computed(() => {
  const value = countdownValue.value
  if (value <= 0) return 'ruby'
  if (value <= COUNTDOWN_WARNING_CRITICAL) return 'amber blink'
  if (value <= COUNTDOWN_WARNING_THRESHOLD) return 'amber'
  return null
})

const pauseLabel = computed(
  () => ({ stopped: '▶', running: '⏸', paused: '⏵' })[countdownStatus.value],
)

const controlsDisabled = computed(() => !ready.value || encounterActive.value)
</script>

<template>
  <!-- A size container, so the clock digits scale with the panel's width (cqw). -->
  <div class="@container w-full rounded-xl bg-phosphor-600/25 pb-3">
    <div class="text-center">
      <div class="border-b border-gray-900 px-4 py-2 text-xl">
        <h3>{{ header }}</h3>
      </div>

      <div class="py-2 text-[clamp(3rem,27cqw,8rem)] leading-none">
        <span :class="displayClass">{{ display }}</span>
      </div>
    </div>

    <div class="flex flex-wrap justify-center gap-3 px-3 pt-1 text-2xl">
      <select v-model="countdownSpeed" class="w-16 text-sm" title="Countdown speed">
        <option v-for="speed in options.speed" :key="speed" :value="speed">
          {{ speed }}&times;
        </option>
      </select>

      <button
        class="w-16"
        :disabled="controlsDisabled"
        title="Pause/resume"
        @click="toggleCountdown"
      >
        {{ pauseLabel }}
      </button>
      <button class="w-16" :disabled="controlsDisabled" title="Skip" @click="expireCountdown">
        ⏭︎
      </button>
      <button class="w-16" :disabled="controlsDisabled" title="Encounter" @click="showEncounter">
        ⏹
      </button>

      <button class="w-16" :title="sound ? 'Mute' : 'Unmute'" @click="toggleSound">
        <i :class="sound ? 'cathode-green' : 'ruby'">{{ sound ? '🔔' : '🔕' }}</i>
      </button>
    </div>
  </div>
</template>
