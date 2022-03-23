<template>
    <div>
        <div class="background">
            <div @click="closeLightbox" class="close"></div>
            <div id="line1" class="line"></div>
            <div id="line2" class="line"></div>
            <img v-show="!loading" @load="loading = false" :src="`https://imagedelivery.net/FYZsbuLae8g9R3ZwqoyBKQ/${image}/${quality}`" alt="" class="image">
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
			},
			quality: {
				type: String,
				required: false,
                default: 'high'
			}
    },
    created() {
        window.addEventListener('keyup', this.keypress);
    },
    beforeDestroy() {
        window.removeEventListener('keyup', this.keypress);
    },
    data() {
			return {
				loading: true,
			}
    },
    methods: {
			closeLightbox() {
				this.$emit('close')	
			},
			keypress(e) {
				if (e.keyCode === 27) {
					this.closeLightbox()
				}
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
.close:hover ~ .line {
    background-color: rgb(253, 187, 24);
    /* box-shadow: 0 0 10px white; */
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
    cursor: pointer;
}

.background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(3px);
    z-index: 3;
    display: flex;
    justify-content: center;
    align-items: center;
}
.image {
    z-index: 4;
    max-width: 92vw;
    max-height: 92vh;
}
</style>