<script setup>
/*
 * A character's photo in black and white, cut at `threshold` brightness
 * (0–255) like the sheet's canvas threshold, then lit like the
 * cathode-green text (see PhosphorFilter), or "NO PHOTO". Done with filters,
 * so no pixel access is needed.
 */
import { computed } from 'vue'
import { photoSrc } from '@/personnel/photos.js'

const props = defineProps({
  character: { type: Object, default: null },
  threshold: { type: Number, default: 128 },
  revealed: { type: Boolean, default: false },
})

const src = computed(() => photoSrc(props.character))

const style = computed(() =>
  props.revealed
    ? null
    : {
        filter: `grayscale(1) brightness(${127.5 / Math.max(1, props.threshold)}) contrast(100) url(#phosphor-glow)`,
      },
)
</script>

<template>
  <img v-if="src" :src="src" :style="style" alt="" class="size-full object-cover" />
  <div v-else class="flex size-full items-center justify-center text-sm opacity-60">NO PHOTO</div>
</template>
