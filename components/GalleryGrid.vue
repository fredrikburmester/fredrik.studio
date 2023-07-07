<script lang="ts" setup>
import GalleryImage from './GalleryImage.vue';

defineProps<{
  images: string[]
}>();

defineEmits(['open'])

</script>
<template>
  <div class="gallery gap-4 md:gap-8">
    <GalleryImage v-for="image, index in images" :key="index" :index="index" :image="image" @click="$emit('open', image)" />
  </div>
</template>

<style>
.gallery {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  grid-auto-flow: dense;
}

@media only screen and (max-width: 1000px) {
  .gallery {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
}
</style>