<script setup>
import { computed, reactive, watch } from 'vue'
import {
  ETHNICITIES,
  createNewContractor,
  enumerateContractorTemplates,
  hydrateContractor,
  outfitContractor,
} from '@/personnel/characters.js'
import { usageTypes } from '@/personnel/names.js'
import { useGenerator } from '@/personnel/useGenerator.js'
import ContractorDetails from './ContractorDetails.vue'
import GeneratorDialog from './GeneratorDialog.vue'

const props = defineProps({ open: { type: Boolean, required: true } })
const emit = defineEmits(['close', 'saved'])

const { busy, character, edit, rename, rephoto, restart, save } = useGenerator({
  kind: 'contractors',
  create: createNewContractor,
  hydrate: hydrateContractor,
})

const occupations = enumerateContractorTemplates()
const form = reactive({ occupation: '', bodyType: '', ethnicity: '', usage: '' })

watch(character, (c) => {
  if (!c) return
  form.occupation = c.occupation
  form.bodyType = c.occupation === 'Android' ? '' : c.bodyType
  form.ethnicity = c.ethnicity ?? ''
})

watch(
  () => props.open,
  (open) => {
    if (open) restart({})
  },
)

function options() {
  return {
    occupation: form.occupation,
    ...(form.occupation !== 'Android' && form.bodyType ? { bodyType: form.bodyType } : {}),
    ethnicity: form.ethnicity || null,
    usage: form.usage || null,
  }
}

const ageRange = computed(() =>
  form.occupation === 'Android' ? [1, 40] : form.occupation === 'Void Urchin' ? [6, 15] : [21, 60],
)

const actions = [
  { id: 'rename', label: 'RENAME' },
  { id: 'reoutfit', label: 'REOUTFIT' },
  { id: 'restart', label: 'RESTART' },
]

function onAction(id) {
  if (id === 'rename') rename({ usage: form.usage || null })
  if (id === 'reoutfit') edit((copy) => outfitContractor(copy))
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
    title="NEW CONTRACTOR"
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
      <ContractorDetails :character="character" />
    </template>

    <template #options>
      <select
        v-model="form.occupation"
        class="grow"
        aria-label="Occupation"
        @change="restart(options())"
      >
        <option v-for="name in occupations" :key="name">{{ name }}</option>
      </select>
      <select
        v-if="form.occupation !== 'Android'"
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
