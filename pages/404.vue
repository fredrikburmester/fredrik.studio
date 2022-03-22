<template>
    <div>
        <NavBar /> 
        <div class="not-found px-8 grid place-content-center text-start md:text-center">
            <h1 class="text-4xl font-bold  mt-auto mb-auto">404 | Not found</h1>
            <p>Sorry, we couldn't find the page you were looking for...</p>
            <nuxt-link to="/" class="btn btn-success mt-8">Go home</nuxt-link>
        </div>
    </div>
</template>
<script>
import NavBar from "~/components/NavBar.vue"

export default {
    name: '404',
    components: {
        NavBar
    },
}
</script>

<style>
.not-found {
    height: calc(100vh - 180px);
}
</style>