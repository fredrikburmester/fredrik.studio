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

    <USlideover v-model:open="isOpen" side="left">
      <template #content>
        <div class="flex flex-col mx-4 md:mx-8 my-6">
          <div class="flex flex-row justify-between mb-4 px-0">
            <p class="text-2xl font-bold">Albums</p>
            <UIcon
              name="i-heroicons-x-mark"
              class="cursor-pointer text-2xl"
              @click="isOpen = false"
            />
          </div>
          <nav class="flex flex-col">
            <NuxtLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              class="text-2xl py-1.5 hover:underline decoration-4 decoration-yellow-400 underline-offset-2"
              active-class="underline decoration-4 decoration-yellow-400 underline-offset-2"
              @click="isOpen = false"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
          <hr class="my-8" />
          <NuxtLink @click="isOpen = false" to="/contact">Contact me</NuxtLink>
        </div>
      </template>
    </USlideover>
  </div>
</template>
