<script lang="ts" setup>
import { _width } from '#tailwind-config/theme';

const props = defineProps<{
  image: string
  index: number
}>()

const img = useImage()
const imageRef = ref();
const route = useRoute();
const containerRef = ref();

const src = computed(() => {
  const album = route.params.album.toString().toLowerCase() as string;
  return 'https://cdn.fredrik.studio/albums/' + album + '/thumbs/' + props.image;
});

const imageLoaded = (e: Event) => {
  // const el = e.target as HTMLImageElement;
  // const parent = el.parentElement as HTMLDivElement;

  // if(el.width > el.height) {
  //   parent.classList.add('wide')
  //   parent.classList.remove('aspect-[3/4]')
  // } else {
  //   parent.classList.remove('aspect-[3/4]')
  //   parent.classList.add('tall')
  // }
}

</script>

<template>
  <div
  ref="containerRef"
  :class="[
    'relative image-container overflow-hidden hover:brightness-90 duration-500',
    'w-full'
  ]"
  >
    <img 
    loading="lazy"
    width="1000"
    height="1000"
    class="blur-xl z-0 backdrop-brightness-75"
    :src="img(src, { width: 40, quality: 50 })" 
    alt=""
    />
    <ClientOnly>
      <img 
        loading="lazy"
        ref="imageRef" 
        width="1000"
        height="1000"
        class="absolute top-0 left-0 object-cover opacity-0 z-10 transition-all duration-[1s]" 
        :src="src" 
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