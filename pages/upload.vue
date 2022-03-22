<template>
    <div>
        <NavBar />
        <!-- Upload photo -->
        <div class="px-8">
            <h1 class="title text-3xl font-bold max-w-sm">Upload photos</h1>
            <p class="text-md">Don't do this if you're not Fredrik 😆</p>
            <div class="form-control flex flex-col gap-4">
                <div>
                    <label class="label">
                        <span class="label-text">Token</span>
                    </label>
                    <input v-model="token" type="password" placeholder="Type here" class="input input-bordered w-full max-w-xs">
                </div>
                <div>
                    <label class="label">
                        <span class="label-text">Choose photo</span>
                    </label>
                    <input type="file" name="photo" id="photo" @change="updatePhoto" multiple="true">
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
                <button v-if="!uploading" class="btn btn-success w-24" @click="upload">Upload</button>
                <button v-else class="btn btn-success loading w-24"></button>
                <p class="text-success" v-if="uploading">{{done}} uploaded...</p>
                <p class="text-error" v-if="error">{{error}}</p>
                <p class="text-success" v-if="success">{{success}}</p>
            </div>           
            <div class="form-control flex flex-col gap-4 py-4">
                <button v-if="!deleting" class="btn btn-error w-48" @click="deleteAlbum">Delete album</button>
                <button v-else class="btn btn-success loading w-48"></button>
                <p class="text-primary" v-if="deleting">{{done}} deleted...</p>
            </div>

        </div>

    </div>
</template>
<script>
import { db } from "~/plugins/firebase.js"
import { doc, setDoc, getDoc } from 'firebase/firestore'
import NavBar from "~/components/NavBar.vue"

export default {
    name: "Upload",
    components: {
        NavBar
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
        checkAlbum() {
            if (!this.album) {
                console.log("Album:", this.album);
                return false;
            }
            return true;
        },
        async uploadImageToCloudflare(photo) {
            var id;
            let formData = new FormData();
            formData.append("file", photo);

            await this.$axios.$post("/api", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${this.token}`
                }
            }).then(response => {
                id = response.result.id;
            }).catch(error => {
                this.error = "Wrong token";
                console.log(error);
                return null
            });

            return id;
        },
        async deleteAlbum() {
            this.deleting = true
            const photos = await this.getPhotosArray()
            for (let i = 0; i < photos.length; i++) {
                let id = photos[i];
                await this.deleteFromCloudFlare(id)
            }
            await this.deleteFromFirebase()
            this.deleting = false
        },
        async deleteFromCloudFlare(id) {
            await this.$axios.$delete(`/api/${id}`, {
                headers: {
                    "Authorization": `Bearer ${this.token}`
                }
            }).then(response => {
                console.log("Res:",response)
                this.done = this.done + 1;
            }).catch(error => {
                this.error = "Wrong token";
                console.log("Error:",error);
            });
        },
        async getPhotosArray() {
            const ref = doc(db, "album", this.album);
            try {
                const doc = await getDoc(ref);
                return doc.data().photos;
            }
            catch (e) {
                console.log(e);
                return [];
            }
        },
        async deleteFromFirebase() {
            const document = {
                photos: []
            };
            const ref = doc(db, "album", this.album);
            try {
                await setDoc(ref, document);
                this.success = 'Album deleted'
            }
            catch (e) {
                this.error = "Something went wrong";
                console.error(e);
            }
        },
        async uploadToFirebase(id) {
            var photos = await this.getPhotosArray();
            
            photos.push(id);
            const document = {
                photos: photos
            };
            const ref = doc(db, "album", this.album);
            try {
                await setDoc(ref, document);
                this.done += 1
            }
            catch (e) {
                this.error = "Something went wrong";
                console.error(e);
            }
        },
        async updatePhoto(event) {
            this.photos = event.target.files;

            for(var i = 0; i < this.photos.length; i++) {
                console.log(this.photos[i])
            }
        },
        async upload() {
            this.uploading = true;
            this.error = '';
            this.success = '';
            this.done = 0;

            if (!this.checkAlbum()) {
                return;
            }

            for (var i = 0; i < this.photos.length; i++) {
                const id = await this.uploadImageToCloudflare(this.photos[i]);
                if (id === null) {
                    return
                } else {
                    await this.uploadToFirebase(id);
                }
            }

            if(this.done === this.photos.length) {
                this.success = "All photos uploaded";
            }
            this.uploading = false;
        },
    },
    components: { NavBar }
}
</script>

<style>
    .title {
        border-bottom: solid 4px rgb(253, 187, 24);
    }
</style>