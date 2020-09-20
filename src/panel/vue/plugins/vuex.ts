import Vuex from 'vuex'
import Vue from 'vue'
Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    filesList: null,
  },
  mutations: {
    setFilesList(state, files) {
      Vue.set(state, 'filesList', files)
    }
  },
});

export { store }