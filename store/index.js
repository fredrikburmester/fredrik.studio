export const state = () => ({
  albums: ["Home", "Portraits", "Husarö", "Norrköping", "Berlin", "Tanzania", "Krug", "Fugelstad", "Pets"]
})

export const mutations = {
	setAlbums(state) {
		state.albums = state
	}
}