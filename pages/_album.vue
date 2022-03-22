<template>
    <div v-if="!loading">
        <NavBar />
        <div class="page-container">
			<Content :album="album" />
            <Gallery :album="album" />
        </div>
    </div>
</template>

<script>
import Gallery from "~/components/Gallery.vue"
import NavBar from "~/components/NavBar.vue"
import Content from "~/components/Content.vue"

export default {
    name: 'IndexPage',
    components: {
        Gallery,
        NavBar,
        Content
    },
    data () {
        return {
            albums: this.$store.state.albums,
            loading: true,
        }
    },
    beforeMount() {
        let found = false
        let album = this.$route.params.album
        for (let a of this.albums) {
            if (a === album) {
                this.album = a
                found = true
                this.loading = false
                break
            }
        } 
        if(!found) {
            this.$router.push('/404');
        }
    },
}
</script>

<style>
.page-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

@media only screen and (max-width: 1000px) {
  .page-container {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto;
  }
}



</style>