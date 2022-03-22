<template>
    <Transition name="fade">
        <div class="information lg:sticky">
            <a href="/" id="title">FB</a>
            <h1 id="subtitle">Photographer</h1>
            <h1 id="album-name">{{ album }}</h1>
            <p id="description">{{ description }}</p>
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

<style>
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