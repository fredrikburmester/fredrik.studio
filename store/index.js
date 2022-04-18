export const state = () => ({
	albums: ["Home", "Portraits", "Husarö", "Norrköping", "Berlin", "Tanzania", "Krug", "Fugelstad", "Pets"],
	error: "Hey, this page doesn't exist! 🌮 ",
})

export const mutations = {
	setAlbums(state) {
		state.albums = state
	},
	setError(state) {
		state.error = state
	}
}