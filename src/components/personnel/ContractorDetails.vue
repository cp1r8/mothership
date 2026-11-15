<script setup>
/** A contractor's combat, instinct, wounds, salary and loadout. */
import { computed } from 'vue'

const props = defineProps({ character: { type: Object, required: true } })

const loadout = computed(() => {
  const c = props.character
  return [c.attire, c.patch, ...(c.weapons ?? []), ...(c.equipment ?? [])]
    .filter(Boolean)
    .join(', ')
})
</script>

<template>
  <div class="flex justify-between gap-4">
    <p>C:{{ character.combat }} I:{{ character.instinct }} W:{{ character.wounds }}</p>
    <p class="text-right whitespace-nowrap">{{ (character.salary ?? 0).toLocaleString() }}␍ PCM</p>
  </div>
  <p class="text-sm">{{ loadout }}</p>
</template>
