<template>
  <div>
    <div v-if="!loading" id="gallery" class="gallery">
      <div
        v-for="(image, index) in images"
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
          :src="`${imageUrl}/${album}/thumbs/${image.name}`"
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
    <div
      v-if="loading && !error"
      class="px-8 flex flex-col items-center justify-center h-full"
    >
      <div
        role="status"
        class="w-full h-96 rounded animate-pulse md:p-6 dark:border-gray-300 mb-4"
        v-for="i in 10"
      >
        <div
          class="flex justify-center items-center mb-4 h-96 bg-gray-300 rounded dark:bg-gray-300"
        >
          <svg
            class="w-12 h-12 text-gray-200 dark:text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 640 512"
          >
            <path
              d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z"
            />
          </svg>
        </div>
      </div>
    </div>
    <p
      v-if="error"
      class="px-4 flex flex-col text-center text-gray-500 h-full h-100 items-center justify-center"
    >
      I'm sorry but something went wrong. Maybe come back later?<br />
      <span class="opacity-50">
        If this keeps happening, please contact me.
      </span>
    </p>
  </div>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import { doc, setDoc, getDoc } from "firebase/firestore";
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
  },
  data() {
    return {
      loading: true,
      images: [],
      width: screen.width,
      imageFormat: "thumb",
      lightboxOpen: false,
      selectedImage: "",
      imageUrl: "https://cdn.fredrik.studio/images",
      error: false,
      firstImageLoaded: false,
    };
  },
  created() {
    // this.getFromFirestore();
    this.getImagesFromServer();
  },
  async mounted() {
    if (this.width > 500) {
      this.imageFormat = "small";
    } else {
      this.imageFormat = "thumb";
    }
  },
  methods: {
    openLightbox(image) {
      this.selectedImage = `${this.imageUrl}/${this.album}/${image.name}`;
      this.lightboxOpen = true;
    },
    closeLightbox() {
      this.lightboxOpen = false;
      this.selectedImage = "";
    },
    // async getFromFirestore() {
    //   const ref = doc(db, "album", this.album);

    //   try {
    //     const doc = await getDoc(ref);
    //     var images = doc.data().photos;
    //     images.reverse();
    //     this.images = images;
    //     this.loading = false;
    //   } catch (e) {
    //     console.log("[getFromFireStore]:", e);
    //   }
    // },
    async getImagesFromServer() {
      try {
        const res = await fetch(`${this.imageUrl}/${this.album}`);
        let data = await res.json();

        console.log(data);
        // filter data to only include files
        data = data.filter((item) => item.type === "file");

        // sort data by index
        console.log(
          data
            .sort(
              (a, b) =>
                parseInt(a.name.replace(".jpg", "")) -
                parseInt(b.name.replace(".jpg", ""))
            )
            .reverse()
        );

        this.images = data;
        this.loading = false;
      } catch (e) {
        console.log("[getImagesFromServer]:", e);
        this.error = true;
      }
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
