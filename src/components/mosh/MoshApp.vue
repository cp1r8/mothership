<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useMosh } from '@/mosh/useMosh.js'
import ExitModal from './ExitModal.vue'
import ExitNav from './ExitNav.vue'
import ImportModal from './ImportModal.vue'
import SessionInput from './SessionInput.vue'
import SessionLog from './SessionLog.vue'
import ZoneModal from './ZoneModal.vue'

const { load, stop } = useMosh()

onMounted(load)
onBeforeUnmount(stop)
</script>

<template>
  <div class="mosh cathode-green bg-cathode flex h-[80vh] flex-col gap-2 rounded-xl p-4">
    <ExitNav />

    <SessionLog />
    <SessionInput />

    <ZoneModal />
    <ExitModal />
    <ImportModal />
  </div>
</template>
