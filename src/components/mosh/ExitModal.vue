<script setup>
import { nextTick, reactive, useTemplateRef, watch } from 'vue'
import { directions, icons, options } from '@/mosh/constants.js'
import { useMosh } from '@/mosh/useMosh.js'
import MoshModal from './MoshModal.vue'

const { closeExitModal, environment, exitModalOpen, pending, saveExit } = useMosh()

const directionKeys = Object.keys(directions)
const inverseKeys = directionKeys.map((direction) => directions[direction].inverse)

const form = reactive({})
const fromSelect = useTemplateRef('fromSelect')
const toSelect = useTemplateRef('toSelect')
const zoneInput = useTemplateRef('zoneInput')

watch(exitModalOpen, async (open) => {
  if (!open) return

  Object.assign(form, { fromDirection: '', toDirection: '', toZone: '', title: '', type: '' })

  await nextTick()
  fromSelect.value?.focus()
})

// Choosing a direction loads the existing exit, or suggests the opposite side.
function onFromChange() {
  const exit = environment.value.exits?.[form.fromDirection]

  if (exit) {
    Object.assign(form, {
      toZone: exit.zone ?? '',
      title: exit.title ?? '',
      toDirection: exit.join ?? '',
      type: exit.type ?? '',
    })
  } else {
    form.toDirection = directions[form.fromDirection].inverse
  }
}

function confirm() {
  const toZone = form.toZone.trim().toLocaleUpperCase()

  if (!form.fromDirection) {
    fromSelect.value?.focus()
    return
  }

  if (!form.toDirection) {
    toSelect.value?.focus()
    return
  }

  if (!toZone || toZone === pending.value.zone) {
    zoneInput.value?.focus()
    return
  }

  saveExit({
    fromDirection: form.fromDirection,
    toDirection: form.toDirection,
    toZone,
    title: form.title.trim(),
    type: form.type,
  })
}
</script>

<template>
  <MoshModal :open="exitModalOpen" @cancel="closeExitModal" @confirm="confirm">
    <template #header>
      <label class="text-lg font-semibold" for="exit-from">EXIT:</label>
      <select
        id="exit-from"
        ref="fromSelect"
        v-model="form.fromDirection"
        class="w-16 p-4 text-center"
        @change="onFromChange"
      >
        <option disabled value="">…</option>
        <option v-for="direction in directionKeys" :key="direction" :value="direction">
          {{ icons.direction[direction] }}
        </option>
      </select>

      <label class="text-lg font-semibold" for="exit-to">&gt;</label>
      <select id="exit-to" ref="toSelect" v-model="form.toDirection" class="w-16 p-4 text-center">
        <option disabled value="">…</option>
        <option v-for="direction in inverseKeys" :key="direction" :value="direction">
          {{ icons.direction[direction] }}
        </option>
      </select>

      <input
        ref="zoneInput"
        v-model="form.toZone"
        class="w-16"
        aria-label="Destination zone"
        maxlength="4"
      />

      <select v-model="form.type" class="p-4 text-center" aria-label="Exit type">
        <option v-for="(label, value) in options.exit" :key="value" :value="value">
          {{ label }}
        </option>
      </select>
    </template>

    <div class="flex items-center gap-2">
      <input v-model="form.title" class="w-full" aria-label="Exit title" />
    </div>
  </MoshModal>
</template>
