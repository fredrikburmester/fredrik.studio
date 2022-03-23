<template>
    <Transition name="fade">
        <div class="information lg:sticky">
            <a href="/" id="title" class="dark:text-white">FB</a>
            <h1 id="subtitle" class="dark:text-white">Photographer</h1>
            <h1 id="album-name" class="dark:text-white">{{ album }}</h1>
            <p id="description" class="dark:text-white">{{ description }}</p>
        </div>
    </Transition>
</template>

<script>
export default {
    name: 'Content',
    props: {
        album: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        }
    },
    data () {
        return {
        //
        }
    },
    methods: {
        //
    }
}
</script>

<style scoped>
#title {
  font-family: Open Sans, sans-serif;
  font-size: 100px;
  line-height: 100px;
  font-weight: 400;
  text-align: center;
  letter-spacing: 18px;
  margin-left: 18px;
  margin-bottom: 0;
  cursor: pointer;
}
.page-container .information {
  display: grid;
  grid-template-rows: 100px 50px 100px;
  place-content: center;
  align-self: self-start;
  height: calc(100vh - 180px);
	top: 90px;

}

@media only screen and (max-width: 1000px) {
	.page-container .information {
		height: auto;
		margin-top: 30px;
	}
}

.page-container .information h1 {
  font-size: 2em;
  padding: 0 2rem 0 2rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>