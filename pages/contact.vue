<script lang="ts" setup></script>
<template>
  <div class="px-4 md:px-8 pt-24 md:ml-[5vw]">
    <div class="md:fixed md:top-[calc(50vh-100px)] h-100">
      <UButton label="Home" color="amber" class="mb-4" to="/">
        <template #leading>
          <UIcon name="i-heroicons-arrow-left-20-solid" />
        </template>
      </UButton>
      <h1 class="text-6xl md:text-7xl font-bold capitalize mb-2 ">Contact me</h1>
      <p class="max-w-[60ch]">
        Hey, thanks for stopping by! 😄 I hope you liked some of the
        photographs. If you want to contact me just send me an
        <a
          href="mailto:fredrik.burmester@gmail.com"
          class="underline decoration-yellow-500 decoration-2 hover:opacity-80"
          >email</a
        >.
      </p>
    </div>
  </div>
</template>
