<script lang="ts" setup>
import Fuse from "fuse.js";

const { data: albums } = await useFetch<string[]>(() => "/api/allAlbums");

const route = useRoute();

function fuzzySearch(input: string, albumList: string[]) {
  var options = {
    keys: ["title"],
    includeScore: true,
  };
  var fuse = new Fuse(albumList, options);
  var result = fuse.search(input);

  // Return top match
  if (result.length > 0) {
    return result[0].item;
  } else {
    return "No similar album found";
  }
}

const similarAlbum = computed(() => {
  if (!albums.value) return null;
  let album = route.params.album.toString().toLowerCase();
  let similar = fuzzySearch(album, albums.value);
  if (similar != "No similar album found") {
    return similar;
  }

  return null;
});
</script>
<template>
  <div>
    <h2 class="font-bold text-3xl">404</h2>
    <p>Could not find this album.<br />Are you sure it exists?</p>
    <div v-if="similarAlbum" class="my-4">
      <h3 class="font-bold mb-2">Did you mean?</h3>
      <UButton
        :to="`/${similarAlbum}`"
        color="amber"
        trailing-icon="i-heroicons-arrow-right"
      >
        <span class="capitalize">{{ similarAlbum }}</span>
      </UButton>
    </div>
  </div>
</template>
