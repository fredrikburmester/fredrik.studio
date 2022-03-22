<template>
    <div>
        
    </div>
</template>
<script>
import { db } from "~/plugins/firebase.js"
import { doc, setDoc, getDoc, collection, collectionGroup, getDocs, onSnapshot } from 'firebase/firestore'
import * as firebase from 'firebase/app'

export default {
    name: 'Index',
    created() {
        this.getFromFirestore()
        $nuxt.$router.push("/Home")
    },
    mounted: (to, from, next) => {
        // $nuxt.$router.push("/Home")
    },
    methods: {
        async getFromFirestore() {
            var albums = []
            const snapshot = await collection(db, "album")
            const dd = await getDocs(snapshot)
            dd.forEach(d => {
                albums.push(d.id)
            });
            this.$store.commit("setAlbums", albums)
        },
    }
}
</script>