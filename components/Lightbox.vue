<template>
    <div>
        <div class="background">
            <div id="line1" class="line"></div>
            <div id="line2" class="line"></div>
            <div @click="closeLightbox" class="close"></div>
            <img v-show="!loading" @load="loading = false" :src="`https://imagedelivery.net/FYZsbuLae8g9R3ZwqoyBKQ/${image}/public`" alt="" class="image">
            <button v-if="loading" class="btn btn-ghost loading btn-lg text-white"></button>
        </div>
    </div>
</template>
<script>
export default {
    name: 'Lightbox',
    props: {
        image: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            loading: true,
        }
    },
    mounted() {
        console.log(this.image)
    },
    methods: {
        closeLightbox() {
            this.$emit('close')
        }
    }
}
</script>

<style scoped>
.line {
    position: fixed;
    background-color: white;
    top: 40px;
    right: 40px;
}
#line1 {
    transform: rotate(45deg);
    height: 2px;
    width: 30px;

}
#line2 {
    transform: rotate(-45deg);
    height: 2px;
    width: 30px;
}
.close {
    position: fixed;
    top: 20px;
    right: 30px;
    width: 50px;
    height: 50px;
    z-index: 99;
}

.background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    z-index: 3;
    display: flex;
    justify-content: center;
    align-items: center;
}
.image {
    z-index: 4;
    max-width: 98vw;
    max-height: 90vh;
}
</style>