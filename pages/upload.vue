<template>
  <NavBar />
  <div class="px-8">
    <h1 class="title text-3xl font-bold max-w-sm">Upload photos</h1>
    <p class="text-md">Don't do this if you're not Fredrik 😆</p>
    <div class="form-control flex flex-col gap-4">
      <div>
        <label class="label">
          <span class="label-text">Token</span>
        </label>
        <input
          v-model="token"
          type="password"
          placeholder="Type here"
          class="input input-bordered w-full max-w-xs"
        />
      </div>
      <div>
        <label class="label">
          <span class="label-text">Choose photo</span>
        </label>
        <input
          type="file"
          name="photo"
          id="photo"
          @change="updatePhoto"
          multiple="true"
        />
      </div>
      <div>
        <label class="label">
          <span class="label-text">Select album</span>
        </label>
        <select v-model="album" class="select w-full max-w-xs select-accent">
          <option disabled>Select album...</option>
          <option :value="a" v-for="a in albums">{{ a }}</option>
        </select>
      </div>
      <button v-if="!uploading" class="btn btn-success w-24" @click="upload">
        Upload
      </button>
      <button v-else class="btn btn-success loading w-24"></button>
      <p class="text-primary" v-if="uploading">{{ done }} uploaded...</p>
      <p class="text-error" v-if="error">{{ error }}</p>
      <p class="text-success" v-if="success">{{ success }}</p>
    </div>
  </div>
</template>
<script>
import NavBar from "~/components/NavBar.vue";

export default {
  name: "Upload",
  components: {
    NavBar,
  },
  asyncData() {
    return {};
  },
  data() {
    return {
      albums: this.$store.state.albums,
      album: "Select album...",
      uploading: false,
      deleting: false,
      fileName: "",
      photos: [],
      token: "",
      error: "",
      success: "",
      done: 0,
    };
  },
  methods: {
    async uploadToKV() {
      let data = `${this.token};`;
      for (var i = 0; i < this.photos.length; i++) {
        let id = await this.uploadImageToCloudflare(this.photos[i]);
        this.done = i + 1;
        data += id;
        if (i < this.photos.length - 1) {
          data += ",";
        }
      }

      await fetch(
        `https://super-grass-573a.fredrik-burmester7317.workers.dev/${this.album.toLowerCase()}`,
        {
          method: "POST",
          body: data,
        }
      )
        .then((data) => {
          console.log(data);
          this.uploading = false;
          this.success = "Uploaded!";
          return;
        })
        .catch((error) => {
          console.log(error);
          this.uploading = false;
          this.error = error;
          return;
        });
    },
    async uploadImageToCloudflare(photo) {
      var id;
      let formData = new FormData();
      formData.append("file", photo);

      await this.$axios
        .$post("/api", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then((response) => {
          id = response.result.id;
        })
        .catch((error) => {
          this.error = "Wrong token";
          console.log(error);
          return null;
        });

      return id;
    },
    async updatePhoto(event) {
      this.photos = event.target.files;
    },
    async upload() {
      if (!this.album) return;
      this.error = "";
      this.success = "";
      this.done = 0;
      this.uploading = true;
      await this.uploadToKV();

      if (this.done === this.photos.length) {
        this.success = "All photos uploaded";
      } else {
        this.error = "One or more photos failed to upload";
      }
      this.uploading = false;
    },
  },
  components: { NavBar },
};
</script>

<style>
.title {
  border-bottom: solid 4px rgb(253, 187, 24);
}
</style>
