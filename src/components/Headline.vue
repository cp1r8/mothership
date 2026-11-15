<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: false,
  },
})
</script>

<template>
  <div class="headline">
    <h1>{{ title }}</h1>
    <h3 v-if="subtitle">{{ subtitle }}</h3>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.4rem;
  /* font-size: 2.6rem; */
  /* position: relative; */
  /* top: -10px; */
  text-transform: uppercase;
}

h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.headline h1,
.headline h3,
.headline p {
  text-align: center;
}

@media (min-width: 1024px) {
  .headline h1,
  .headline h3,
  .headline p {
    text-align: left;
  }
}
</style>
