import Vuex from 'vuex';
import Vue from 'vue';
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    filesList: {},
    loggedUser: {},
    metaData: {},
  },
  mutations: {
    setFilesList(state, files) {
      Vue.set(state, 'filesList', files);
    },
    setLoggedUser(state, user) {
      Vue.set(state, 'loggedUser', user);
    },
    setMetaData(state, data) {
      Vue.set(state, 'metaData', data);
    },
  },
});

export { store };