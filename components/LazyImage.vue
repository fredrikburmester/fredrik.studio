<template>
  <div>
    <nuxt-img
      v-if="!loading"
      id="image"
      ref="picture"
      :data-iesrc="image"
      class="lazy-image"
    >
    </nuxt-img>
  </div>
</template>

<script>
import lozad from "lozad";

export default {
  name: "LazyImage",
  props: {
    image: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      loading: true,
    };
  },
  computed: {
    aspectRatio() {
      if (!this.width || !this.height) return 100;
      return (this.height / this.width) * 100;
    },
  },
  mounted() {},
};
</script>

<style>
.lazy-image {
  display: block;
  width: 100%;
  height: 0;
  background-size: cover;
  background-repeat: no-repeat;
}

.lazy-image.__wrapper {
  position: relative;
  z-index: 200;
}

.lazy-image > img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
