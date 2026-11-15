<script setup>
import { computed } from 'vue'
import { icons } from '@/mosh/constants.js'
import { useMosh } from '@/mosh/useMosh.js'

const { environment, openZoneModal, pending } = useMosh()

function icon([text, ...classes] = []) {
  return { text, classes }
}

// Until the zone has been described, show placeholder icons.
const described = computed(() => Boolean(environment.value.atmosphere))

const atmosphere = computed(() =>
  described.value
    ? icon([
        ...icons.atmosphere[environment.value.atmosphere],
        ...(icons.space[environment.value.space] ?? icons.space.normal),
      ])
    : icon(['🌐', 'text-7xl']),
)

const gravity = computed(() =>
  icon(described.value ? icons.gravity[environment.value.gravity] : ['⚓']),
)

const radiation = computed(() =>
  icon(described.value ? icons.radiation[environment.value.radiation ?? ''] : ['☢', 'opacity-50']),
)

const light = computed(() => icon(described.value ? icons.light[environment.value.light] : ['🔅']))
</script>

<template>
  <!-- Fills its share of the row; a size container so the circle can shrink. -->
  <div class="@container min-w-0 flex-1 rounded-xl bg-phosphor-600/25">
    <div class="flex flex-col text-center">
      <h3 class="border-b border-gray-900 py-2 text-xl">{{ pending.zone ?? '-?-' }}</h3>

      <div
        class="mx-auto my-2 size-24 rounded-full border-3 border-dotted border-phosphor-200 @[10rem]:size-32"
      >
        <button
          class="flex size-full items-center justify-center border-none"
          title="Edit zone"
          @click="openZoneModal"
        >
          <i :class="atmosphere.classes">{{ atmosphere.text }}</i>
        </button>
      </div>
    </div>

    <div class="m-2 flex justify-evenly gap-2 py-1 text-2xl">
      <i :class="gravity.classes" title="Gravity">{{ gravity.text }}</i>
      <i :class="radiation.classes" title="Radiation">{{ radiation.text }}</i>
      <i :class="light.classes" title="Light">{{ light.text }}</i>
    </div>
  </div>
</template>
