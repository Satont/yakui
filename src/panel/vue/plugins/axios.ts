import _Vue from 'vue'
import { TYPE, POSITION } from 'vue-toastification'
import axios from 'axios'

export default function AxiosPlugin<AxiosPluginOptions>(Vue: typeof _Vue, options?: AxiosPluginOptions): void {
  const instance = axios.create({
    baseURL: '/api/v1',
    headers: {
      'x-twitch-tokenn': localStorage.getItem('accessToken')
    },
  })


  instance.interceptors.response.use(config => config, error => {
    Vue.$toast('Something went wrong!', {
      type: TYPE.ERROR,
      position: POSITION.TOP_RIGHT,
      timeout: 3000
    })
    return Promise.reject(error);
  });

  Vue.prototype.$axios = instance
}

export class AxiosPluginOptions {

}
