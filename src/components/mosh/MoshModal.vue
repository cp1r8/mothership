<script setup>
defineProps({
  open: { type: Boolean, required: true },
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
        class="mx-auto w-full max-w-md overflow-hidden rounded-lg bg-phosphor-900 shadow-xl"
        @submit.prevent="emit('confirm')"
      >
        <div class="flex flex-col gap-4 border-b border-phosphor-200 p-4">
          <div class="flex items-center gap-2">
            <slot name="header" />
          </div>
        </div>

        <div class="flex flex-col gap-4 p-6">
          <slot />
        </div>

        <div class="flex items-center justify-end space-x-2 border-t border-phosphor-200 p-4">
          <button type="button" @click="emit('cancel')">CANCEL</button>
          <button type="submit">CONFIRM</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
