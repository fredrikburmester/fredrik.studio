<script setup lang="ts">
import { useWindowScroll } from "@vueuse/core";
import { useWindowSize } from "@vueuse/core";
import type { AlbumCollection } from "@/types";
const { width } = useWindowSize();
const { y } = useWindowScroll();
const route = useRoute();
const isOpen = ref(false);
const img = useImage();

const { data: albums } = await useFetch<AlbumCollection>("/api/albums");

const links = computed(() => {
  const albumLinks = (albums.value || []).map((album) => ({
    label: album.title,
    to: `/${album.slug}`,
    badge: album.description ? album.description : undefined,
  }));

  return [
    {
      label: "Home",
      to: "/",
      click: () => {
        isOpen.value = false;
      },
    },
    ...albumLinks,
  ];
});

const title = ref();

watch(
  () => route.params.album,
  (album) => {
    isOpen.value = false;
  }
);

watch(
  () => y.value,
  () => {
    if (width.value > 767) return;
    let opacity = 0;
    if (y.value > 50) {
      opacity = (y.value - 50) / 100;
    }
    if (opacity > 1) opacity = 1;
    if (title.value) title.value.style.opacity = opacity;
  }
);
</script>

<template>
  <div
    :class="[
      'fixed w-screen top-0 flex flex-row py-4 px-4 md:px-8 transition-all bg-white items-center z-20',
      y > 25 && ' shadow-sm bg-white',
    ]"
  >
    <UIcon
      name="i-heroicons-bars-3"
      :class="['cursor-pointer text-3xl', 'text-black']"
      @click="isOpen = true"
    />
    <p
      ref="title"
      :class="[
        'capitalize text-xl font-bold ml-4 md:ml-6 opacity-0 text-black',
      ]"
    >
      {{ $route.params.album }}
    </p>
    <NuxtLink
      to="/contact"
      class="ml-auto rounded-full w-8 h-8 md:w-12 md:h-12 overflow-hidden"
    >
      <img src="/pp-lq.jpg" alt="profile picture" />
    </NuxtLink>

    <USlideover v-model="isOpen" side="left">
      <div class="flex flex-col mx-4 md:mx-8 my-6">
        <div class="flex flex-row justify-between mb-4 px-0">
          <p class="text-2xl font-bold">Albums</p>
          <UIcon
            name="i-heroicons-x-mark"
            class="cursor-pointer text-2xl"
            @click="isOpen = false"
          />
        </div>
        <UVerticalNavigation
          :links="links"
          :ui="{
            ring: 'ring-0',
            base: 'group relative flex items-center gap-2 focus:outline-none focus-visible:outline-none dark:focus-visible:outline-none before:absolute before:inset-px before:rounded-md disabled:cursor-not-allowed disabled:opacity-75',
            active:
              'text-gray-900 underline decoration-4 underline-offset-2 decoration-yellow-400 dark:before:bg-gray-800',
            size: 'text-2xl',
            padding: 'py-1.5 px-0',
          }"
        />
        <hr class="my-8" />
        <NuxtLink @click="isOpen = false" class="" to="/contact"
          >Contact me</NuxtLink
        >
      </div>
    </USlideover>
  </div>
</template>
