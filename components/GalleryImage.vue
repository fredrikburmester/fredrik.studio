<script lang="ts" setup>
const props = defineProps<{
  image: string
  index: number
}>()

const route = useRoute();
const loaded = ref(false)

const containerRef = ref<HTMLDivElement | null>(null);

const src = computed(() => {
  const album = route.params.album.toString().toLowerCase() as string;
  return 'https://cdn.fredrik.studio/albums/' + album + '/thumbs/' + props.image;
});

const imageLoaded = (e: Event) => {
  let image = e.target as HTMLImageElement;
  let format = image.width / image.height;
  let parent = image.parentElement as HTMLDivElement;

  if (format > 1) {
    parent.classList.add("wide");
  } else {
    parent.classList.add("tall");
  }

  loaded.value = true;
};
</script>
<template>
  <div
  ref="containerRef"
  :class="[
    'relative image-container overflow-hidden hover:brightness-90 duration-500',
  ]"
  >
    <ClientOnly>
      <img
        @load="imageLoaded"
        width="500"
        height="500"
        loading="lazy"
        :class="[
          'cursor-pointer w-full object-cover transition-all duration-500 ease-in-out',
        ]"
        :src="src"
        alt=""
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