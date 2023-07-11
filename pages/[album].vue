<script lang="ts" setup>
const route = useRoute();
import { useWindowScroll } from "@vueuse/core";
import { useWindowSize } from "@vueuse/core";
import { ReturnItem, ReturnType } from "../types";

const { y } = useWindowScroll();
const { width } = useWindowSize();

const { data, pending, error } = useFetch<ReturnType>(
  () => "/api/images?album=" + route.params.album.toString().toLowerCase()
);

const title = ref();
const index = ref();
const isOpen = ref(false);

const openImage = (image: ReturnItem) => {
  if(!data.value) return;
  const i = data.value.findIndex((item) => item.name === image.name);

  if(i > -1) {
    index.value = i;
    isOpen.value = true;
  } 
};

const selectedImage = computed(() => {
  if (index.value === null || index.value === undefined || !data.value) return null;
  return data.value[index.value].name;
});

const album = computed(() => {
  return route.params.album.toString().toLowerCase() as string;
});

const capitalizedAlbum = computed(() => {
  return album.value[0].toUpperCase() + album.value.slice(1);
});

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

const seoImage = computed(() => {
  if (data.value && data.value.length > 0) {
    return (
      "https://cdn.fredrik.studio/albums/" + album.value + "/thumbs/" + data.value[0].name
    );
  }
  return "";
});

watch(
  () => y.value,
  () => {
    if (width.value > 767) return;
    let scale = 1;
    scale = 1 - y.value / 400;
    if (scale < 0.5) scale = 0.5;
    if (title.value) {
      title.value.style.transform = `scale(${scale})`;
    }
  }
);

useSeoMeta({
  title: "FB - " + capitalizedAlbum.value,
  ogTitle: "Fredrik Burmester",
  description: capitalizedAlbum,
  ogDescription: capitalizedAlbum,
  ogImage: seoImage.value,
});
</script>

<template>
  <UContainer :ui="{ constrained: '' }" class="pb-4 grid md:grid-cols-2 pt-24">
    <div class="md:fixed md:top-[calc(50vh-100px)] w-full md:pl-[5vw] pb-4">
      <UButton label="Home" color="amber" class="mb-4" to="/">
        <template #leading>
          <UIcon name="i-heroicons-arrow-left-20-solid" />
        </template>
      </UButton>
      <h1
        ref="title"
        :class="[
          'text-6xl md:text-[5vw] font-bold capitalize mb-2 origin-bottom-left',
        ]"
      >
        {{ $route.params.album }}
      </h1>
      <div v-if="data">
        <UBadge color="amber">{{ data.length }} images</UBadge>
      </div>
    </div>
    <div class="md:col-start-2 z-10">
      <Pending v-if="pending" />
      <NotFound v-else-if="error" />
      <GalleryGrid v-if="data" :images="data" @open="openImage" />
    </div>

    <Lightbox
      v-if="selectedImage"
      @next="nextImage"
      @previous="prevImage"
      :is-open="isOpen"
      @close="isOpen = false"
      :image="selectedImage"
      :album="album"
    />
  </UContainer>
</template>
