<script lang="ts" setup>
const img = useImage();

const links = [
  {
    label: "Husarö",
    to: "/husarö",
    image: "/husarö.jpg",
  },
  {
    label: "Portraits",
    to: "/portraits",
    image: "/portraits.jpg",
  },
  {
    label: "Landscapes",
    to: "/landscapes",
    image: "/landscapes.jpg",
  },
  {
    label: "Norrköping",
    to: "/norrköping",
    image: "/norrköping.jpg",
  },
];

useSeoMeta({
  title: "FB - Home",
  ogTitle: "Fredrik Burmester",
  description: "Photographer",
  ogDescription: "Photographer",
  ogImage: `https://cdn.fredrik.studio/albums/home/thumbs/2.jpg`,
});
</script>

<template>
  <div>
    <div
      class="grid md:hidden overflow-hidden grid-rows-[auto_1fr] justify-items-start relative z-0 pt-20 h-[100svh]"
    >
      <div
        class="px-4 md:px-8 flex flex-col gap-4 md:gap-8 text-left py-4 md:my-20"
      >
        <div>
          <h1 class="text-6xl md:text-7xl capitalize mb-2 font-bold">
            Fredrik Burmester
          </h1>
          <p class="uppercase text-xl md:text-2xl text-gray-500">
            photographer
          </p>
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
              :src="img(l.image, { height: 600, quality: 70 })"
              class="absolute top-0 left-0 shrink-0 min-w-full z-0 brightness-50 min-h-full object-cover"
            />
          </nuxt-link>
        </div>
      </div>
    </div>
    <UContainer :ui="{ constrained: '' }">
      <div class="hidden md:grid grid-cols-2 pt-24">
        <div class="md:fixed md:top-[calc(50vh-100px)] h-100 pl-[5vw]">
          <h1 class="text-6xl md:text-7xl capitalize mb-2 font-bold">
            Fredrik<br />Burmester
          </h1>
          <p class="uppercase text-xl md:text-2xl text-gray-500">
            photographer
          </p>
        </div>
        <div class="gap-8 w-full grow col-start-2 pb-4">
          <div class="grid grid-cols-2 gap-4 md:gap-8">
            <nuxt-link
              v-for="l in links"
              :to="l.to"
              class="snap-center hover:opacity-90 group transition-all shadow-lg rounded-lg w-full self-end h-[50vh] overflow-hidden flex items-end relative"
            >
              <p class="font-bold z-10 m-4 md:m-8 text-white text-4xl">
                {{ l.label }}
              </p>
              <img
                :src="img(l.image, { height: 600, quality: 70 })"
                class="absolute top-0 left-0 shrink-0 min-w-full z-0 brightness-50 min-h-full object-cover"
                alt="gallery cover"
              />
            </nuxt-link>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>
