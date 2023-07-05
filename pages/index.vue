<script lang="ts" setup>
const links = [
  {
    label: "Husarö",
    to: "/husarö",
    image: "https://cdn.fredrik.studio/albums/husarö/thumbs/194.jpg",
  },
  {
    label: "Portraits",
    to: "/portraits",
    image: "https://cdn.fredrik.studio/albums/portraits/thumbs/21.jpg",
  },
  {
    label: "Landscapes",
    to: "/landscapes",
    image: "https://cdn.fredrik.studio/albums/landscapes/thumbs/21.jpg",
  },
  {
    label: "Norrköping",
    to: "/norrköping",
    image: "https://cdn.fredrik.studio/albums/norrköping/thumbs/3.jpg",
  },
];
</script>

<template>
  <div
    class="w-[100svw] h-[100svh] overflow-hidden grid grid-rows-[auto_1fr] justify-items-start relative z-0 pt-20"
  >
    <div
      class="px-4 md:px-8 flex flex-col gap-4 md:gap-8 text-left py-4 md:my-20"
    >
      <div>
        <h1 class="text-6xl md:text-7xl capitalize mb-2 font-bold">
          Fredrik Burmester
        </h1>
        <p class="uppercase text-xl md:text-2xl text-gray-500">photographer</p>
      </div>
    </div>
    <div class="gap-8 w-screen py-4 md:py-8 h-full grow">
      <div
        class="flex flex-row gap-4 md:gap-8 overflow-x-scroll w-full shrink-0 px-4 md:px-8 snap-mandatory snap-x h-full"
      >
        <nuxt-link
          v-for="l in links"
          :to="l.to"
          class="snap-center hover:opacity-90 group transition-all shadow-lg rounded-lg w-[80vw] h-fill md:w-[30vw] overflow-hidden flex items-end relative shrink-0"
        >
          <p class="font-bold z-10 m-4 md:m-8 text-white text-4xl">
            {{ l.label }}
          </p>
          <img
            :src="l.image"
            class="absolute top-0 left-0 shrink-0 min-w-full z-0 brightness-50 min-h-full object-cover"
          />
        </nuxt-link>
      </div>
    </div>
  </div>
</template>
