<script lang="ts" setup>
import { useWindowScroll } from '@vueuse/core'
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

const { y } = useWindowScroll()

</script>

<template>
  <Transition name="fade" mode="out-in">
    <div v-if="y > 200" class="fixed bottom-0 right-0 m-6 z-40 cursor-pointer  rounded-full bg-white w-12 h-12 grid place-items-center shadow-md" @click="scrollToTop">
      <UIcon name="i-heroicons-arrow-up" class="text-2xl" @click="scrollToTop" />
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>