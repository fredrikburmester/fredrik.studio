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

const groupedAlbums = computed(() => {
  const list = albums.value || [];
  const groups = new Map<string, typeof list>();
  for (const album of list) {
    const key = album.type?.trim() || "";
    const bucket = groups.get(key) ?? [];
    bucket.push(album);
    groups.set(key, bucket);
  }

  const typed = [...groups.entries()]
    .filter(([key]) => key !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, items]) => ({ type, items }));

  const untyped = groups.get("") ?? [];
  if (untyped.length) typed.push({ type: "", items: untyped });
  return typed;
});

const currentAlbumTitle = computed(() => {
  const slug = route.params.album?.toString().toLowerCase();
  if (!slug) return "";
  const match = (albums.value || []).find((a) => a.slug === slug);
  return match?.title ?? slug;
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
        'text-xl font-bold ml-4 md:ml-6 opacity-0 text-black',
      ]"
    >
      {{ currentAlbumTitle }}
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
          <nav class="flex flex-col text-black">
            <NuxtLink
              to="/"
              class="text-2xl py-1.5 hover:underline decoration-4 decoration-yellow-400 underline-offset-2"
              exact-active-class="font-bold underline decoration-4 decoration-yellow-400 underline-offset-2"
              @click="isOpen = false"
            >
              Home
            </NuxtLink>
            <template v-for="group in groupedAlbums" :key="group.type || '_untyped'">
              <p
                v-if="group.type"
                class="text-2xl py-1.5"
              >
                {{ group.type }}
              </p>
              <NuxtLink
                v-for="album in group.items"
                :key="album.slug"
                :to="`/${album.slug}`"
                :class="[
                  'text-2xl py-1.5 hover:underline decoration-4 decoration-yellow-400 underline-offset-2',
                  group.type ? 'pl-4' : '',
                ]"
                active-class="font-bold underline decoration-4 decoration-yellow-400 underline-offset-2"
                @click="isOpen = false"
              >
                {{ album.title }}
              </NuxtLink>
            </template>
          </nav>
          <hr class="my-8 border-gray-200" />
          <NuxtLink @click="isOpen = false" to="/contact" class="text-black">Contact me</NuxtLink>
        </div>
      </template>
    </USlideover>
  </div>
</template>
