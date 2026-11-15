<script setup>
import { icons } from '@/mosh/constants.js'
import { useMosh } from '@/mosh/useMosh.js'

const { exits, openExitModal, ready, takeExit } = useMosh()

function describe(exit) {
  const detail = exit.title || exit.type
  return detail ? `${exit.direction} - ${detail}` : null
}
</script>

<template>
  <nav class="mb-2 flex h-8 flex-none gap-1 overflow-x-auto">
    <div class="flex gap-1">
      <button
        v-for="exit in exits"
        :key="exit.direction"
        :title="describe(exit)"
        @click="takeExit(exit)"
      >
        <code>{{ icons.exit[exit.type ?? ''] }}{{ icons.direction[exit.direction] }}</code>
        <span>{{ exit.zone }}</span>
      </button>
    </div>

    <button :disabled="!ready" title="Add exit" @click="openExitModal">
      <i>➕</i>
    </button>
  </nav>
</template>
