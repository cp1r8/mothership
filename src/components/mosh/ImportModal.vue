<script setup>
import { ref, watch } from 'vue'
import { useMosh } from '@/mosh/useMosh.js'
import MoshModal from './MoshModal.vue'

const { closeImportModal, importModalOpen, importZones } = useMosh()

const text = ref('')
const error = ref('')
const status = ref('')

watch(importModalOpen, (open) => {
  if (open) {
    text.value = ''
    error.value = ''
    status.value = ''
  }
})

async function onFile(event) {
  const file = event.target.files?.[0]

  if (!file) return

  try {
    text.value = await file.text()
    error.value = ''
  } catch {
    error.value = 'Could not read file.'
  }

  // Allow re-selecting the same file.
  event.target.value = ''
}

function confirm() {
  if (!text.value.trim()) {
    error.value = 'Choose a file or paste JSON.'
    return
  }

  try {
    const count = importZones(text.value)
    status.value = `Merged ${count} zone${count === 1 ? '' : 's'}.`
    error.value = ''
    closeImportModal()
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <MoshModal :open="importModalOpen" @cancel="closeImportModal" @confirm="confirm">
    <template #header>
      <span class="text-lg font-semibold">IMPORT ZONES</span>
    </template>

    <div class="flex items-center gap-2">
      <label for="import-file">FILE:</label>
      <input id="import-file" accept=".json,application/json" type="file" @change="onFile" />
    </div>

    <label for="import-text">OR PASTE JSON:</label>
    <textarea
      id="import-text"
      v-model="text"
      class="h-48 w-full font-mono"
      spellcheck="false"
    ></textarea>

    <p v-if="error" class="ruby" role="alert">{{ error }}</p>

    <template #footer>
      <button type="button" @click="closeImportModal">CANCEL</button>
      <button type="submit">IMPORT</button>
    </template>
  </MoshModal>
</template>
