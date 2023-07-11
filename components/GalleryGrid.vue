<script lang="ts" setup>
import GalleryImage from "./GalleryImage.vue";
import { ReturnItem } from "../types";

defineProps<{
  images: ReturnItem[];
}>();

const emit = defineEmits(["open"]);

const open = (image: ReturnItem) => {
  console.log("open", image);
  emit("open", image);
};
</script>
<template>
  <div class="gallery gap-4 md:gap-8">
    <template v-for="(image, index) in images" :key="index">
      <GalleryImage v-if="image" :image="image" @click="open(image)" />
    </template>
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
