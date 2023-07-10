<script setup lang="ts">
import { useWindowScroll } from "@vueuse/core";
import { useWindowSize } from "@vueuse/core";
const { width } = useWindowSize();
const { y } = useWindowScroll();
const route = useRoute();
const isOpen = ref(false);
const img = useImage();

const links = [
  {
    label: "Home",
    to: "/",
    click: () => {
      isOpen.value = false;
    },
  },
  {
    label: "Portraits",
    to: "/portraits",
  },
  {
    label: "Landscapes",
    to: "/landscapes",
  },
  {
    label: "Husarö",
    to: "/husarö",
    icon: "i-heroicons-heart",
    badge: "Location",
  },
  {
    label: "Norrköping",
    to: "/norrköping",
    icon: "i-heroicons-sparkles",
    badge: "Location",
  },
  {
    label: "Tanzania",
    to: "/tanzania",
    icon: "i-heroicons-globe-europe-africa",
    badge: "Location",
  },
  {
    label: "Berlin",
    to: "/berlin",
    icon: "i-heroicons-globe-europe-africa",
    badge: "Location",
  },
  {
    label: "Krug",
    to: "/krug",
    badge: "Wedding",
  },
  {
    label: "Fugelstad",
    to: "/fugelstad",
    badge: "Wedding",
  },
  {
    label: "Pets",
    to: "/pets",
  },
];

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
      <img 
        :src="img('https://cdn.fredrik.studio/albums/home/2.jpg', { width: 200, quality: 50 })"
        alt="profile picture" 
      />
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
        <nuxt-link @click="isOpen = false" class="" to="/contact"
          >Contact me</nuxt-link
        >
      </div>
    </USlideover>
  </div>
</template>
