<script setup>
import { useMosh } from '@/mosh/useMosh.js'

const { output } = useMosh()
</script>

<template>
  <section class="min-h-1/6 grow overflow-y-auto">
    <div class="flex flex-col-reverse gap-1 whitespace-nowrap">
      <p v-for="line in output" :key="line.id" :class="line.classes">{{ line.text }}</p>
    </div>
  </section>
</template>
