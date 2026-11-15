<script setup>
import { computed, reactive, watch } from 'vue'
import {
  ETHNICITIES,
  createNewCrewMember,
  enumerateCrewMemberClasses,
  hydrateCrewMember,
  outfitCrewMember,
} from '@/personnel/characters.js'
import { usageTypes } from '@/personnel/names.js'
import { useGenerator } from '@/personnel/useGenerator.js'
import CrewMemberDetails from './CrewMemberDetails.vue'
import GeneratorDialog from './GeneratorDialog.vue'

const props = defineProps({ open: { type: Boolean, required: true } })
const emit = defineEmits(['close', 'saved'])

const { busy, character, edit, rename, rephoto, restart, save } = useGenerator({
  kind: 'crew',
  create: createNewCrewMember,
  hydrate: hydrateCrewMember,
})

const classes = enumerateCrewMemberClasses()
const form = reactive({ class: '', bodyType: '', ethnicity: '', usage: '' })

// Keep the options in step with the character shown (without regenerating).
watch(character, (c) => {
  if (!c) return
  form.class = c.class
  form.bodyType = c.class === 'Android' ? '' : c.bodyType
  form.ethnicity = c.ethnicity ?? ''
})

// A fresh random crew member each time the dialog opens.
watch(
  () => props.open,
  (open) => {
    if (open) restart({})
  },
)

function options() {
  return {
    class: form.class,
    ...(form.class !== 'Android' && form.bodyType ? { bodyType: form.bodyType } : {}),
    ethnicity: form.ethnicity || null,
    usage: form.usage || null,
  }
}

const ageRange = computed(() =>
  form.class === 'Android' ? [1, 40] : form.class === 'Urchin' ? [6, 15] : [21, 60],
)

const actions = [
  { id: 'rename', label: 'RENAME' },
  { id: 'reoutfit', label: 'REOUTFIT' },
  { id: 'reskill', label: 'RESKILL' },
  { id: 'restart', label: 'RESTART' },
]

function onAction(id) {
  if (id === 'rename') rename({ usage: form.usage || null })
  if (id === 'reoutfit') edit((copy) => outfitCrewMember(copy))
  if (id === 'reskill') edit((copy) => (copy.skills = copy.constructor.randomSkills(copy)))
  if (id === 'restart') restart({})
}

function onSave() {
  emit('saved', save())
  emit('close')
}
</script>

<template>
  <GeneratorDialog
    v-model:character="character"
    :open="open"
    title="NEW CREW MEMBER"
    :busy="busy"
    :actions="actions"
    :age-range="ageRange"
    @action="onAction"
    @apply="restart"
    @cancel="emit('close')"
    @rephoto="rephoto"
    @save="onSave"
  >
    <template #details>
      <CrewMemberDetails :character="character" />
    </template>

    <template #options>
      <select v-model="form.class" class="grow" aria-label="Class" @change="restart(options())">
        <option v-for="name in classes" :key="name">{{ name }}</option>
      </select>
      <select
        v-if="form.class !== 'Android'"
        v-model="form.bodyType"
        class="grow"
        aria-label="Body type"
        @change="restart(options())"
      >
        <option>Male</option>
        <option>Female</option>
      </select>
      <select
        v-model="form.ethnicity"
        class="grow"
        aria-label="Ethnicity"
        @change="restart(options())"
      >
        <option value="">Any ethnicity</option>
        <option v-for="name in ETHNICITIES" :key="name">{{ name }}</option>
      </select>
      <select
        v-model="form.usage"
        class="grow"
        aria-label="Name culture"
        @change="rename({ usage: form.usage || null })"
      >
        <option value="">Any culture</option>
        <option v-for="(label, code) in usageTypes" :key="code" :value="code">{{ label }}</option>
      </select>
    </template>
  </GeneratorDialog>
</template>
