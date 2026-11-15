<script setup>
import { computed } from 'vue'
import { formatDate, formatTime } from '@/mosh/format.js'
import { useMosh } from '@/mosh/useMosh.js'

const { countdownStatus, pending } = useMosh()

const STATUS = {
  stopped: { text: '⏹ STOPPED', class: 'ruby' },
  running: { text: '⏵ RUNNING', class: 'cathode-green' },
  paused: { text: '⏸ PAUSED', class: 'amber blink-1s' },
}

const clock = computed(
  () => `${formatDate(pending.value.time)} ${formatTime(pending.value.time)} GMT`,
)
const status = computed(() => STATUS[countdownStatus.value])
</script>

<template>
  <!-- Aligned like the Headline above it: centred, then left-aligned from 1024px. -->
  <div class="flex w-full flex-col gap-2 text-center lg:text-left">
    <span>{{ clock }}</span>
    <span :class="status.class">{{ status.text }}</span>
  </div>
</template>
