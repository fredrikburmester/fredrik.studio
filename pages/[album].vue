<script lang="ts" setup>
const route = useRoute();
import { useWindowScroll } from "@vueuse/core";
import { useWindowSize } from "@vueuse/core";

const { y } = useWindowScroll();
const { width } = useWindowSize();

const { data, pending } = await useFetch<string[]>(
  () => "/api/albums?album=" + route.params.album.toString().toLowerCase(),
  {
    server: false,
  }
);

const index = ref();
const isOpen = ref(false);

const openImage = (e: Event, image: string) => {
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
    if(width.value > 767) return
    let scale = 1;
    scale = 1 - y.value / 400;
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
  <UContainer :ui="{ constrained: '' }" class="pb-4 grid md:grid-cols-2 pt-24">
    <div class="pb-8 md:fixed md:top-[calc(50vh-100px)] w-full md:pl-[5vw]">
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
      <div>
        <UBadge color="amber">{{ data?.length }} images</UBadge>
      </div>
    </div>
    <div class="md:col-start-2">
      <div
        v-if="false"
        class="items-center justify-center flex"
      >
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl" />
      </div>
      <div v-else-if="!pending" class="gallery gap-4 md:gap-8">
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
            @click="openImage($event, image)"
          />
        </div>
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
