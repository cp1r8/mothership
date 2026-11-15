<script setup>
defineProps({
  open: { type: Boolean, required: true },
  // Wider dialog, for content such as the character generators.
  wide: { type: Boolean, default: false },
})

const emit = defineEmits(['cancel', 'confirm'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="mosh cathode-green fixed inset-0 z-50 flex items-center justify-center bg-gray-700/50 p-4"
      @keydown.esc="emit('cancel')"
    >
      <form
        class="mx-auto max-h-full w-full overflow-y-auto rounded-lg bg-phosphor-900 shadow-xl"
        :class="wide ? 'max-w-3xl' : 'max-w-md'"
        @submit.prevent="emit('confirm')"
      >
        <div v-if="$slots.header" class="flex flex-col gap-4 border-b border-phosphor-200 p-4">
          <div class="flex items-center gap-2">
            <slot name="header" />
          </div>
        </div>

        <div class="flex flex-col gap-4 p-6">
          <slot />
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2 border-t border-phosphor-200 p-4">
          <slot name="footer">
            <button type="button" @click="emit('cancel')">CANCEL</button>
            <button type="submit">CONFIRM</button>
          </slot>
        </div>
      </form>
    </div>
  </Teleport>
</template>
