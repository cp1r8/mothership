<script setup>
/** A saved crew member's or contractor's full details, as in the generator. */
import { computed, ref, watch } from 'vue'
import MoshModal from '@/components/mosh/MoshModal.vue'
import ContractorDetails from './ContractorDetails.vue'
import CrewMemberDetails from './CrewMemberDetails.vue'
import PersonnelPhoto from './PersonnelPhoto.vue'

const props = defineProps({
  // { kind: 'crew'|'contractors', record } or null when closed.
  entry: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const revealed = ref(false)

// e.g. "Marine · 30 · he/him · EGPR-MBV6VC"
const summary = computed(() => {
  const r = props.entry?.record ?? {}
  return [props.entry?.kind === 'crew' ? r.class : r.occupation, r.age, r.pronouns, r.id]
    .filter(Boolean)
    .join(' · ')
})

watch(
  () => props.entry,
  () => (revealed.value = false),
)
</script>

<template>
  <MoshModal :open="!!entry" wide @cancel="emit('close')" @confirm="emit('close')">
    <template v-if="entry">
      <h2 class="text-xl">{{ entry.record.name || entry.record.id }}</h2>

      <div class="flex flex-col gap-4 sm:flex-row">
        <div class="photo relative mx-auto size-48 shrink-0 overflow-hidden rounded-lg bg-cathode">
          <PersonnelPhoto :character="entry.record" :revealed="revealed" />
          <button
            v-if="entry.record.photo"
            type="button"
            class="absolute top-1 left-1"
            :title="revealed ? 'Show monochrome' : 'Show original'"
            @click="revealed = !revealed"
          >
            <i>👁</i>
          </button>
        </div>

        <div class="flex min-w-0 grow flex-col gap-2">
          <p>{{ summary }}</p>
          <CrewMemberDetails v-if="entry.kind === 'crew'" :character="entry.record" />
          <ContractorDetails v-else :character="entry.record" />
        </div>
      </div>
    </template>

    <template #footer>
      <button type="submit">CLOSE</button>
    </template>
  </MoshModal>
</template>

<style scoped>
.photo button {
  border: none;
  background: rgb(0 0 0 / 0.5);
  padding: 0.125rem 0.375rem;
}
</style>
