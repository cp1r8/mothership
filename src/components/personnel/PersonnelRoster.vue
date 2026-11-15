<script setup>
/*
 * The saved crew members and contractors as cards (one to three a row), with
 * buttons to generate new ones. A card opens the character's full details.
 */
import { computed, ref } from 'vue'
import { shortName } from '@/personnel/names.js'
import { useRecords } from '@/personnel/records.js'
import NewContractor from './NewContractor.vue'
import NewCrewMember from './NewCrewMember.vue'
import PersonnelDossier from './PersonnelDossier.vue'
import PersonnelPhoto from './PersonnelPhoto.vue'
import PhosphorFilter from './PhosphorFilter.vue'

const crew = useRecords('crew')
const contractors = useRecords('contractors')

const cards = computed(() => [
  ...crew.value.map((record) => ({ kind: 'crew', record, role: record.class })),
  ...contractors.value.map((record) => ({ kind: 'contractors', record, role: record.occupation })),
])

// Which generator is open: 'crew', 'contractor' or null.
const dialog = ref(null)
const viewing = ref(null)
</script>

<template>
  <section class="@container rounded-xl bg-phosphor-600/25">
    <PhosphorFilter />

    <h3 class="border-b border-gray-900 py-2 text-center text-xl">PERSONNEL</h3>

    <ul class="grid grid-cols-1 gap-2 p-3 @md:grid-cols-2 @2xl:grid-cols-3">
      <li v-for="card in cards" :key="`${card.kind}:${card.record.id}`">
        <button
          type="button"
          class="card flex w-full items-center gap-3 text-left"
          :title="card.record.name"
          @click="viewing = card"
        >
          <span class="size-14 shrink-0 overflow-hidden rounded bg-cathode">
            <PersonnelPhoto :character="card.record" />
          </span>
          <span class="flex min-w-0 flex-col">
            <span class="cathode-green break-words">{{
              shortName(card.record.name) || card.record.id
            }}</span>
            <span class="truncate text-sm opacity-75">{{ card.role }}</span>
          </span>
        </button>
      </li>

      <li>
        <button type="button" class="add size-full" @click="dialog = 'crew'">+ CREW MEMBER</button>
      </li>
      <li>
        <button type="button" class="add size-full" @click="dialog = 'contractor'">
          + CONTRACTOR
        </button>
      </li>
    </ul>

    <NewCrewMember :open="dialog === 'crew'" @close="dialog = null" />
    <NewContractor :open="dialog === 'contractor'" @close="dialog = null" />
    <PersonnelDossier :entry="viewing" @close="viewing = null" />
  </section>
</template>

<style scoped>
.card {
  padding: 0.375rem;
}

.add {
  min-height: 4.25rem;
  border-style: dashed;
}
</style>
