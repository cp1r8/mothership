<script setup>
/*
 * The layout shared by the New Crew Member / Contractor / Creature dialogs
 * (the sheet's New*Dialog.html): photo, name and age, the raw data, the
 * generator's details and options, and its action buttons.
 */
import { computed, ref, watch } from 'vue'
import MoshModal from '@/components/mosh/MoshModal.vue'
import { isAvatar } from '@/personnel/photos.js'
import PersonnelPhoto from './PersonnelPhoto.vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  busy: { type: Boolean, default: false },
  // Extra buttons, e.g. [{ id: 'rename', label: 'RENAME' }].
  actions: { type: Array, default: () => [] },
  ageRange: { type: Array, default: () => [1, 99] },
})

const emit = defineEmits(['action', 'apply', 'cancel', 'rephoto', 'save'])

const character = defineModel('character', { type: Object, default: null })

// The photo's black-and-white threshold (0–255), or the original colours.
const threshold = ref(128)
const revealed = ref(false)

// A new photo starts monochrome at the default threshold again.
watch(
  () => character.value?.photo,
  () => {
    threshold.value = 128
    revealed.value = false
  },
)

// The raw data, which can be edited and applied (re-filling anything removed).
const showData = ref(false)
const dataText = ref('')
const dataError = ref('')

function toggleData() {
  if (!showData.value) {
    dataText.value = JSON.stringify(character.value, null, 2)
    dataError.value = ''
    showData.value = true
    return
  }

  try {
    const values = JSON.parse(dataText.value)
    showData.value = false
    emit('apply', values)
  } catch (error) {
    dataError.value = `Not valid JSON: ${error.message}`
  }
}

watch(
  () => props.open,
  (open) => {
    if (!open) showData.value = false
  },
)

const missingNameHint = computed(() =>
  character.value && !character.value.name
    ? 'No name generated (the name service may be unavailable): try RENAME.'
    : '',
)
</script>

<template>
  <MoshModal :open="open" wide @cancel="emit('cancel')" @confirm="emit('save')">
    <div class="relative flex flex-col gap-4">
      <h2 class="text-xl">{{ title }}</h2>

      <div
        v-if="busy"
        class="absolute inset-0 z-10 flex items-center justify-center bg-phosphor-900/80 text-2xl"
      >
        <span class="blink-1s">PROCESSING…</span>
      </div>

      <div v-if="character" class="flex flex-col gap-4 sm:flex-row">
        <div class="photo relative mx-auto size-48 shrink-0 overflow-hidden rounded-lg bg-cathode">
          <PersonnelPhoto :character="character" :threshold="threshold" :revealed="revealed" />

          <button
            v-if="character.photo"
            type="button"
            class="absolute top-1 left-1"
            :title="revealed ? 'Show monochrome' : 'Show original'"
            @click="revealed = !revealed"
          >
            <i>👁</i>
          </button>
          <button
            type="button"
            class="absolute top-1 right-1"
            title="New photo"
            :disabled="busy"
            @click="emit('rephoto')"
          >
            <i>🔄</i>
          </button>
          <input
            v-if="character.photo && !revealed && !isAvatar(character.photo)"
            v-model.number="threshold"
            class="absolute right-2 bottom-1 left-2"
            type="range"
            min="1"
            max="255"
            aria-label="Photo threshold"
          />
        </div>

        <div class="flex min-w-0 grow flex-col gap-2">
          <div class="flex gap-2">
            <input
              v-model="character.name"
              class="cathode-green min-w-0 grow"
              maxlength="50"
              placeholder="Name"
              aria-label="Name"
            />
            <input
              v-model.number="character.age"
              class="w-20"
              type="number"
              :min="ageRange[0]"
              :max="ageRange[1]"
              placeholder="Age"
              aria-label="Age"
            />
            <button
              type="button"
              :title="showData ? 'Apply data' : 'Edit data'"
              :disabled="busy"
              @click="toggleData"
            >
              <i>{{ showData ? '⏫' : '⏬' }}</i>
            </button>
          </div>

          <textarea
            v-if="showData"
            v-model="dataText"
            class="w-full text-xs"
            rows="6"
            aria-label="Character data (JSON)"
          ></textarea>
          <p v-if="dataError" class="ruby text-sm">{{ dataError }}</p>

          <slot name="details" />
        </div>
      </div>

      <!-- Disabled while busy, so a change can't be lost mid-request. -->
      <fieldset class="flex flex-wrap gap-2" :disabled="busy">
        <slot name="options" />
      </fieldset>

      <p v-if="missingNameHint" class="amber text-sm">{{ missingNameHint }}</p>
    </div>

    <template #footer>
      <button
        v-for="action in actions"
        :key="action.id"
        type="button"
        :disabled="busy || !character"
        @click="emit('action', action.id)"
      >
        {{ action.label }}
      </button>
      <button type="button" @click="emit('cancel')">CANCEL</button>
      <button type="submit" :disabled="busy || !character">SAVE</button>
    </template>
  </MoshModal>
</template>

<style scoped>
/* Small icon buttons over the photo. */
.photo button {
  border: none;
  background: rgb(0 0 0 / 0.5);
  padding: 0.125rem 0.375rem;
}
</style>
