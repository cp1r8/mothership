<script setup>
import { useMosh } from '@/mosh/useMosh.js'

const { dismissEncounter, resolveEncounter } = useMosh()
</script>

<template>
  <div class="@container min-w-0 flex-1 rounded-xl bg-amber-600/25 pb-2">
    <div class="flex flex-col text-center">
      <h3 class="border-b border-gray-900 py-2 text-xl">ENCOUNTER</h3>

      <div class="my-2 flex h-32 items-center justify-center">
        <i class="amber text-7xl @[10rem]:text-8xl">✋</i>
      </div>
    </div>

    <div class="flex flex-wrap justify-center gap-2 px-2 text-2xl">
      <button class="w-16" title="Dismiss" @click="dismissEncounter">
        <i class="ruby">❌</i>
      </button>
      <button class="w-16" title="Resolve" @click="resolveEncounter">
        <i class="cathode-green">✔︎</i>
      </button>
    </div>
  </div>
</template>
