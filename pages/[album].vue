<script lang="ts" setup>
const route = useRoute();
import { useWindowScroll } from "@vueuse/core";

const { y } = useWindowScroll();

const { data, pending } = await useFetch<string[]>(
  () => "/api/albums?album=" + route.params.album,
  {
    server: false,
  }
);

const index = ref();
const isOpen = ref(false);

const openImage = (image: string) => {
  index.value = data.value?.indexOf(image);
  isOpen.value = true;
};

const image = computed(() => {
  if (index.value === null || !data.value) return "";
  return data.value[index.value];
});

const album = computed(() => {
  return route.params.album as string;
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

  parent.classList.remove("opacity-0");
};

const title = ref();
watch(
  () => y.value,
  () => {
    let scale = 1;
    scale = 1 - y.value / 500;
    if (scale < 0.5) scale = 0.5;
    if (title.value) {
      title.value.style.transform = `scale(${scale})`;
    }
  }
);

const nextImage = () => {
  if (index.value === null || !data.value) return;
  if (index.value === data.value.length - 1) {
    index.value = 0;
  } else {
    index.value++;
  }
};

const prevImage = () => {
  if (index.value === null || !data.value) return;
  if (index.value === 0) {
    index.value = data.value.length - 1;
  } else {
    index.value--;
  }
};
</script>

<template>
  <UContainer class="pb-4 grid pt-16">
    <div class="mb-8 md:mb-20 md:pt-12">
      <h1
        ref="title"
        :class="[
          'text-6xl md:text-8xl font-bold capitalize pt-8 mb-2 origin-bottom-left',
        ]"
      >
        {{ $route.params.album }}
      </h1>
      <div>
        <UBadge color="yellow">{{ data?.length }} images</UBadge>
      </div>
    </div>
    <div
      v-if="pending"
      class="place-self-center h-[50vh] grid place-items-center"
    >
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl" />
    </div>
    <div v-if="!pending" class="gallery gap-4 md:gap-8">
      <div
        v-for="(image, index) in data"
        :id="image"
        :class="[
          'gallery-container overflow-hidden flex justify-center items-center transition-all opacity-0 hover:brightness-90',
        ]"
        :key="index"
      >
        <img
          @load="imageLoaded"
          width="500"
          height="500"
          :loading="index < 2 ? 'eager' : 'lazy'"
          class="cursor-pointer w-full object-cover"
          :src="`https://cdn.fredrik.studio/albums/${album}/thumbs/${image}`"
          alt=""
          @click="openImage(image)"
        />
      </div>
    </div>
    <Lightbox
      @next="nextImage"
      @previous="prevImage"
      :is-open="isOpen"
      @close="isOpen = false"
      :image="image"
      :album="album"
    />
  </UContainer>
</template>

<style>
.gallery {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  grid-auto-flow: dense;
}

.gallery-container img {
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

@media only screen and (max-width: 1000px) {
  .gallery {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  .gallery .tall {
    grid-column: span 1;
  }

  .gallery .wide {
    grid-column: span 1;
  }
}
</style>
