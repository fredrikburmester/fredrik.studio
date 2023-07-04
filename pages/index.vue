<script lang="ts" setup>
const links = [{
  label: 'Home',
  to: '/'
}, {
  label: 'Portraits',
  to: '/portraits'
}, {
  label: 'Landscapes',
  to: '/landscapes'
}, {
  label: 'Husarö',
  to: '/husarö'
}]

</script>

<template>
  <div class="bg w-[100svw] h-[100svh] bg-gray-100 overflow-hidden flex flex-col justify-end relative">
    <div class="ml-4 mb-16 md:m-16 z-10">
      <h1 class="text-6xl md:text-7xl font-bold capitalize text-white">
        Fredrik Burmester
      </h1>
      <p class="text-white">Photographer</p>
    </div>
    <img src="https://cdn.fredrik.studio/albums/husar%C3%B6/122.jpg" alt="" class="min-w-screen min-h-screen z-0 absolute">
  </div>
  <!-- <UContainer class="pb-4 flex flex-col py-4 md:py-8">
    <div class="flex flex-col gap-4 md:gap-8 md:flex-row md:items-center justify-center">
      <div class="md:rounded-full w-48 h-48 overflow-hidden">
        <img src="https://cdn.fredrik.studio/albums/home/2.jpg" alt="">
      </div>
      <div class="">
        <h1 class="text-6xl md:text-7xl font-bold capitalize">
          Fredrik Burmester
        </h1>
      </div>
    </div>
  </UContainer> -->
</template>

<style>
/* .bg {
  background: url('https://cdn.fredrik.studio/albums/husar%C3%B6/122.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: -1;

} */
</style>