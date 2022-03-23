<template>
    <div>
        <div class="not-found px-8 grid place-content-center text-start md:text-center">
            <h1 v-if="error.statusCode === 404" class="text-4xl font-bold  mt-auto mb-auto">404 | Not found</h1>
            <h1 v-else class="text-4xl font-bold  mt-auto mb-auto">An error occurred - {{ error.statusCode }} </h1>
            <p class="pt-4">Hey, this page doesn't exist! 🌮 </p>
            <nuxt-link to="/" class="btn btn-outline mt-8">Go home</nuxt-link>
        </div>
    </div>
</template>
<script>
export default {
    name: 'error',
    props: ['error'],
    layout: 'error',
}
</script>

<style>
.not-found {
    height: calc(100vh - 90px);
}
</style>