<script setup>
import { computed, nextTick, reactive, useTemplateRef, watch } from 'vue'
import { options } from '@/mosh/constants.js'
import { useMosh } from '@/mosh/useMosh.js'
import MoshModal from './MoshModal.vue'

const {
  closeZoneModal,
  encounterRate,
  environment,
  pending,
  saveZone,
  zoneDefaults,
  zoneModalOpen,
} = useMosh()

const form = reactive({})
const zoneInput = useTemplateRef('zoneInput')
const titleInput = useTemplateRef('titleInput')

// The zone ID can only be typed when creating the first zone (or entering an
// unmapped one, where it is already known).
const zoneLocked = computed(() => Boolean(pending.value.zone))

watch(zoneModalOpen, async (open) => {
  if (!open) return

  // An undescribed zone (e.g. one reached through a new exit) starts from the
  // defaults, which takeExit sets to the settings of the zone just left.
  const env = environment.value.atmosphere
    ? environment.value
    : { ...zoneDefaults.value, title: environment.value.title }

  Object.assign(form, {
    zone: pending.value.zone ?? '',
    title: env.title ?? '',
    atmosphere: env.atmosphere ?? 'breathable',
    gravity: env.gravity ?? 'standard',
    light: env.light ?? 'bright',
    radiation: env.radiation ?? '',
    space: env.space ?? 'normal',
    rate: encounterRate.value ?? 0.1,
  })

  await nextTick()
  ;(form.zone ? titleInput : zoneInput).value?.focus()
})

function confirm() {
  const zone = form.zone.trim().toLocaleUpperCase()

  if (!zone) {
    zoneInput.value?.focus()
    return
  }

  saveZone({ ...form, zone, title: form.title.trim(), rate: Number(form.rate) })
}
</script>

<template>
  <MoshModal :open="zoneModalOpen" @cancel="closeZoneModal" @confirm="confirm">
    <template #header>
      <label class="text-lg font-semibold" for="zone-input">ZONE:</label>
      <input
        id="zone-input"
        ref="zoneInput"
        v-model="form.zone"
        class="w-16"
        :disabled="zoneLocked"
        maxlength="4"
      />
      <input ref="titleInput" v-model="form.title" class="w-full" aria-label="Zone title" />
    </template>

    <div class="flex items-center">
      <label class="mr-2" for="zone-atmosphere">AIR:</label>
      <select id="zone-atmosphere" v-model="form.atmosphere" class="p-4 text-center">
        <option v-for="(label, value) in options.atmosphere" :key="value" :value="value">
          {{ label }}
        </option>
      </select>

      <label class="mr-2 ml-4" for="zone-space">SPACE:</label>
      <select id="zone-space" v-model="form.space" class="p-4 text-center">
        <option v-for="(label, value) in options.space" :key="value" :value="value">
          {{ label }}
        </option>
      </select>
    </div>

    <div class="flex items-center">
      <label class="mr-2" for="zone-gravity">GRAVITY:</label>
      <select id="zone-gravity" v-model="form.gravity" class="p-4 text-center">
        <option v-for="(label, value) in options.gravity" :key="value" :value="value">
          {{ label }}
        </option>
      </select>

      <label class="mr-2 ml-4" for="zone-light">LIGHT:</label>
      <select id="zone-light" v-model="form.light" class="p-4 text-center">
        <option v-for="(label, value) in options.light" :key="value" :value="value">
          {{ label }}
        </option>
      </select>
    </div>

    <!-- Hidden in the prototype too; kept for when radiation is enabled. -->
    <div class="flex hidden items-center">
      <label class="mr-2" for="zone-radiation">RADIATION:</label>
      <select id="zone-radiation" v-model="form.radiation" class="p-4 text-center">
        <option v-for="(label, value) in options.radiation" :key="value" :value="value">
          {{ label }}
        </option>
      </select>
    </div>

    <div class="flex items-center">
      <label class="mr-2" for="zone-encounter-rate">%ENC:</label>
      <input
        id="zone-encounter-rate"
        v-model.number="form.rate"
        class="w-full"
        max="1.0"
        min="0.0"
        step="0.05"
        type="range"
      />
    </div>
  </MoshModal>
</template>
