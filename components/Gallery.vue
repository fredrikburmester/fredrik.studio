<template>
  <div>
    <div v-if="!loading" id="gallery" class="gallery">
      <div
        v-for="(image, index) in imageArray"
        :key="image"
        class="gallery-image-container"
      >
        <img
          @click="openLightbox(image)"
          width="300"
          height="500"
          class="gallery-image"
          style="opacity: 0"
          @load="onImgLoad"
          @error="onImgError"
          :src="`https://imagedelivery.net/FYZsbuLae8g9R3ZwqoyBKQ/${image}/${imageFormat}`"
          :style="index < 5 ? 'opcaity: 1' : 'opacity: 0'"
          loading="lazy"
        />
      </div>
      <Lightbox
        @close="closeLightbox"
        @wheel.prevent
        @touchmove.prevent
        @scroll.prevent
        v-if="lightboxOpen"
        :image="selectedImage"
      />
    </div>
  </div>
</template>

<script>
import Lightbox from "~/components/Lightbox.vue";

export default {
  name: "Gallery",
  components: {
    Lightbox,
  },
  props: {
    album: {
      type: String,
      required: false,
    },
    imageArray: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      loading: true,
      width: screen.width,
      imageFormat: "thumb",
      lightboxOpen: false,
      selectedImage: "",
    };
  },
  async mounted() {
    if (this.width > 500) {
      this.imageFormat = "small";
    } else {
      this.imageFormat = "thumb";
    }
    this.loading = false;
  },
  methods: {
    openLightbox(image) {
      this.selectedImage = image;
      this.lightboxOpen = true;
    },
    closeLightbox() {
      this.lightboxOpen = false;
      this.selectedImage = "";
    },
    onImgLoad(e) {
      let image = e.target;
      let parent = image.parentElement;
      let format = image.width / image.height;
      if (format > 1 || this.album == "Home") {
        parent.classList.add("wide");
      } else {
        parent.classList.add("tall");
      }
      image.style.opacity = 1;
    },
    onImgError(e) {
      this.$store.commit("error", "Image not found");
    },
  },
};
</script>

<style>
img {
  transition: opacity 1000ms, transform 200ms;
}
.page-container .gallery {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 50px;
  align-items: center;
  grid-auto-flow: dense;
  margin: 2rem 2rem 5rem 0;
  min-height: 50vh;
}
.gallery-image-container {
  position: relative;
  display: inline-block;
  overflow: hidden;
  margin: 0;
}

.gallery-image-container img {
  height: auto;
  width: 100%;
  object-fit: contain;
  max-height: 90vh;
}

.gallery .tall {
  grid-row: span 1;
}

.gallery .wide {
  grid-column: span 2;
}

@media only screen and (max-width: 1000px) {
  .page-container .gallery {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    margin: 2rem 2rem 10rem 2rem;
  }

  .gallery .tall {
    grid-column: span 1;
  }

  .gallery .wide {
    grid-column: span 1;
  }
}
@media only screen and (max-width: 450px) {
  .page-container .gallery {
    margin: 2rem 1rem 10rem 1rem;
  }
}
</style>
