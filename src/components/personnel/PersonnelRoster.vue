<script setup>
/*
 * The saved crew members and contractors as centered cards. A card opens the
 * character's full details. The generators are opened by the /crew and /npc
 * session commands.
 */
import { computed, ref } from 'vue'
import { useMosh } from '@/mosh/useMosh.js'
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

const { closeGenerator, generatorDialog } = useMosh()
const viewing = ref(null)
</script>

<template>
  <section v-if="cards.length">
    <ul class="flex flex-wrap justify-center gap-3">
      <li v-for="card in cards" :key="`${card.kind}:${card.record.id}`" class="w-72 max-w-full rounded-xl bg-phosphor-600/25">
        <button
          type="button"
          class="card flex w-full items-center gap-3 border-none bg-transparent text-left"
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
    </ul>
  </section>

  <!-- Outside the section, which is hidden until there are cards. -->
  <PhosphorFilter />
  <NewCrewMember :open="generatorDialog === 'crew'" @close="closeGenerator" />
  <NewContractor :open="generatorDialog === 'contractor'" @close="closeGenerator" />
  <PersonnelDossier :entry="viewing" @close="viewing = null" />
</template>

<style scoped>
.card {
  padding: 0.5rem;
}
</style>
