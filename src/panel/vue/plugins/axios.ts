import _Vue from 'vue'
import { TYPE, POSITION } from 'vue-toastification'
import axios, { AxiosError } from 'axios'
import { ValidationError } from 'express-validator'
import { refresh } from '../../helpers/isLogged'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function AxiosPlugin<AxiosPluginOptions>(Vue: typeof _Vue, options?: AxiosPluginOptions): void {
  const instance = axios.create({
    baseURL: '/api/v1',
    headers: {
      'x-twitch-token': localStorage.getItem('accessToken'),
      'Content-Type': 'application/json'
    },
  })

  instance.interceptors.response.use(config => config, (error: AxiosError) => {
    if (error.response.data) {
      let message: string = error.response.data.message ?? 'Unexpected error happend.'

      switch (error.response.data.code) {
        case 'validation_error':
          message = (error.response.data.data as ValidationError[]).map(e => `${e.msg} ${e.param}=${e.value}`).join('\n')
          break
        case 'jwt expired':
          refresh().then(() => location.reload())
          break
        case 'jwt malformed':
          refresh().then(() => location.reload())
          break
      }

      Vue.$toast(message, {
        type: TYPE.ERROR,
        position: POSITION.TOP_RIGHT,
        timeout: 3000,
        closeOnClick: true,
        pauseOnFocusLoss: true,
        pauseOnHover: true,
        draggable: true,
        draggablePercent: 0.6,
        showCloseButtonOnHover: false,
        icon: true,
      })
    }

    return Promise.reject(error)
  })

  Vue.prototype.$axios = instance
}

export class AxiosPluginOptions {

}
