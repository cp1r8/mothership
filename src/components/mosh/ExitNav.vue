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
  <nav class="flex h-8 flex-none overflow-x-auto">
    <!-- auto margins centre the buttons but still let them scroll when they overflow. -->
    <div class="mx-auto flex gap-1">
      <button
        v-for="exit in exits"
        :key="exit.direction"
        :title="describe(exit)"
        @click="takeExit(exit)"
      >
        <code>{{ icons.exit[exit.type ?? ''] }}{{ icons.direction[exit.direction] }}</code>
        <span>{{ exit.zone }}</span>
      </button>
      <button :disabled="!ready" title="Add exit" @click="openExitModal">
        <i>➕</i>
      </button>
    </div>
  </nav>
</template>
