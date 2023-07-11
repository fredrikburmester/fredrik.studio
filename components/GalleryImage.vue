<script lang="ts" setup>
type ReturnItem = {
  name: string;
  width: number;
  height: number;
};

const props = defineProps<{
  image: ReturnItem;
}>();

const img = useImage();
const imageRef = ref();
const route = useRoute();
const containerRef = ref();

const width = computed(() => {
  return props.image.width < props.image.height ? 500 : 1000;
});

const src = computed(() => {
  const album = route.params.album.toString().toLowerCase() as string;
  return (
    "https://cdn.fredrik.studio/albums/" + album + "/thumbs/" + props.image.name
  );
});
</script>

<template>
  <div
    ref="containerRef"
    :class="[
      'relative image-container overflow-hidden hover:brightness-90 duration-500 cursor-pointer',
      image.width > image.height ? 'wide' : 'tall',
    ]"
  >
    <img
      loading="lazy"
      :width="image.width"
      :height="image.height"
      class="blur-xl z-0"
      :src="img(src, { width: 90, quality: 10 })"
      alt=""
    />
    <ClientOnly>
      <img
        loading="lazy"
        ref="imageRef"
        :width="image.width"
        :height="image.height"
        class="absolute top-0 left-0 object-cover opacity-0 z-10 transition-all duration-[1s]"
        :src="img(src, { width: width, quality: 70 })"
        alt=""
        @load="imageRef.classList.remove('opacity-0')"
      />
    </ClientOnly>
  </div>
</template>

<style scoped>
.image-container img {
  flex-shrink: 0;
  min-width: 100%;
  min-height: 100%;
}

.wide {
  grid-column: span 2;
  aspect-ratio: 4/3;
}

.tall {
  grid-row: span 1;
  aspect-ratio: 3/4;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media only screen and (max-width: 1000px) {
  .gallery {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  .tall {
    grid-column: span 1;
  }

  .wide {
    grid-column: span 1;
  }
}
</style>
