<script lang="ts" setup>
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

const emit = defineEmits(['close', 'next', 'previous'])
const props = defineProps<{
  isOpen: boolean
  image: string
  album: string
}>()

const url = computed(() => {
  return `https://cdn.fredrik.studio/albums/${props.album}/${props.image}`
})

async function downloadImage() {
  // Go to url 
  window.open(url.value, '_blank')
}

const loadingDownload = ref(false)

const loaded = ref(false)

watch(() => props.image, () => {
  loaded.value = false
})

watch(() => props.isOpen, () => {
  if(props.isOpen) {
    disableBodyScroll(document.body)
  } else {
    enableBodyScroll(document.body)
  }
})

// Add event listners for left and right arrow keys
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowLeft') {
      emit('previous')
    } else if(e.key === 'ArrowRight') {
      emit('next')
    } else if (e.key === 'Escape') {
      emit('close')
    }
  })
})

</script>

<template>
  <div v-if="isOpen" class="fixed top-0 left-0 backdrop-brightness-[0.5] backdrop-blur-xl w-screen h-screen grid place-items-center z-50">
    <UIcon @click="$emit('close')" name="i-heroicons-x-mark" class="cursor-pointer text-2xl fixed top-0 right-0 m-4 md:m-8 text-white" />
    <img v-show="loaded" :src="url" alt="" class="max-w-[90vw] max-h-[90vh]" @load="loaded = true">
    <UIcon v-show="!loaded" name="i-heroicons-arrow-path" class="animate-spin text-2xl text-white" />
    <div @click="downloadImage" class="fixed bottom-0 left-0 m-4 md:m-8 text-black bg-white shadow-md rounded-full px-4 py-2 cursor-pointer hover:opacity-75 transition-all">
      <UIcon v-if="loadingDownload" name="i-heroicons-arrow-path" class="animate-spin" />
      <span v-else>Download</span>
    </div>
    <div class="flex flex-row fixed bottom-0 right-0 m-4 md:m-8 gap-2">
      <div @click="$emit('previous')" class=" text-black bg-white shadow-md rounded-full w-10 h-10 cursor-pointer hover:opacity-75 transition-all grid place-items-center">
        <UIcon name="i-heroicons-arrow-left" class="" />
      </div>
      <div @click="$emit('next')" class=" text-black bg-white shadow-md rounded-full w-10 h-10 cursor-pointer hover:opacity-75 transition-all grid place-items-center">
        <UIcon name="i-heroicons-arrow-right" class="" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>