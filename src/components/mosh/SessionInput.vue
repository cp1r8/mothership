<script setup>
import { useMosh } from '@/mosh/useMosh.js'

// `inputEl` is filled by the template ref so the session can focus the input.
const { input, inputEl, submitInput } = useMosh()
</script>

<template>
  <footer class="flex-none">
    <input
      ref="inputEl"
      v-model="input"
      class="w-full"
      placeholder=">_"
      @keydown.enter="submitInput"
      @keydown.esc="input = ''"
    />
  </footer>
</template>
