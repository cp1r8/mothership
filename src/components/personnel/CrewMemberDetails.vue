<script setup>
/** A crew member's stats, saves, funds, skills and loadout. */
import { computed } from 'vue'

const props = defineProps({ character: { type: Object, required: true } })

const loadout = computed(() => {
  const c = props.character
  return [c.attire, c.patch, ...(c.weapons ?? []), ...(c.equipment ?? []), c.trinket]
    .filter(Boolean)
    .join(', ')
})
</script>

<template>
  <div class="flex justify-between gap-4">
    <div>
      <p>
        ST:{{ character.strength }} SP:{{ character.speed }} IN:{{ character.intellect }} C:{{
          character.combat
        }}
      </p>
      <p>
        SA:{{ character.sanity }} FE:{{ character.fear }} BO:{{ character.body }} W:{{
          character.wounds
        }}({{ character.health }})
      </p>
    </div>
    <p v-if="character.funds > 0" class="text-right whitespace-nowrap">
      {{ character.funds.toLocaleString() }}␍ COH
    </p>
  </div>
  <p>{{ (character.skills ?? []).join(', ') }}</p>
  <p class="text-sm">{{ loadout }}</p>
</template>
