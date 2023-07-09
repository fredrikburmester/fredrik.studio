<script lang="ts" setup>
import GalleryImage from './GalleryImage.vue';

const props = defineProps<{
  images: string[]
}>();

const odd = computed(() => {
  return props.images.filter((_, i) => i % 2 === 0);
});

const even = computed(() => {
  return props.images.filter((_, i) => i % 2 !== 0);
});

defineEmits(['open'])

</script>
<template>
  <div>
    <div class="hidden md:grid grid-cols-2 gap-4 md:gap-8">
      <div class="flex flex-col gap-4 md:gap-8">
        <GalleryImage v-for="image, index in odd" :key="index" :index="index" :image="image" @click="$emit('open', image)" />
      </div>
      <div class="flex flex-col gap-4 md:gap-8">
        <GalleryImage v-for="image, index in even" :key="index" :index="index" :image="image" @click="$emit('open', image)" />
      </div>
    </div>
    <div class="flex flex-col md:hidden gap-4 md:gap-8">
      <GalleryImage v-for="image, index in images" :key="index" :index="index" :image="image" @click="$emit('open', image)" />
    </div>
  </div>
</template>

<style>
.gallery {
  display: grid;
  align-items: center;
  /* grid-template-rows: masonry; */
  grid-auto-flow: dense; 
}

@media only screen and (max-width: 1000px) {
  .gallery {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
}
</style>