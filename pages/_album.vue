<template>
  <NavBar />
  <div class="bg-base-100">
    <div class="page-container bg-base-100">
      <Content v-if="found" :album="album" />
      <Gallery v-if="!loading" :album="album" :imageArray="images" />
    </div>
  </div>
</template>

<script>
import Gallery from "~/components/Gallery.vue";
import NavBar from "~/components/NavBar.vue";
import Content from "~/components/Content.vue";

export default {
  name: "IndexPage",
  components: {
    Gallery,
    NavBar,
    Content,
  },
  data() {
    return {
      albums: this.$store.state.albums,
      loading: true,
      found: false,
      images: [],
    };
  },
  async beforeMount() {
    for (let a of this.albums) {
      if (a === this.$route.params.album) {
        this.album = a;
        this.found = true;
        break;
      }
    }

    if (!this.found) {
      this.$router.push("/404");
    } else {
      const images = await this.getImagesArray();

      if (images.length === 0) {
        this.$router.push("/404");
      } else {
        this.images = images;
        this.loading = false;
      }
    }
  },
  methods: {
    async getImagesArray() {
      let a = [];
      await this.$axios
        .$get(
          `https://super-grass-573a.fredrik-burmester7317.workers.dev/${this.album}`
        )
        .then((data) => {
          a = data.split(",");
        })
        .catch((error) => {
          this.$store.commit("setError", "No images in this album yet!");
        });
      return a;
    },
  },
};
</script>

<style>
.page-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  transition: all 1s linear;
}

@media only screen and (max-width: 1000px) {
  .page-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }
}
</style>
