<script setup lang="ts">
const isOpen = ref(false)

const links = [{
  label: 'Home',
  to: '/home'
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
  <div class="fixed top flex flex-row px-8 py-8">
    <UIcon name="i-heroicons-bars-2" class="cursor-pointer" @click="isOpen = true"/>
    <UIcon name="i-uil-facebook-f" size="48" />

    <USlideover v-model="isOpen" side="left">
      <div class="p-8">
        <UVerticalNavigation :links="links" />    
      </div>
    </USlideover>
  </div>
</template>

