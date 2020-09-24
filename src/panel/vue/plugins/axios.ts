import _Vue from 'vue'
import axios, { AxiosError } from 'axios'
import { ValidationError } from 'express-validator'
import { refresh } from '../../Helpers/isLogged'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function AxiosPlugin<AxiosPluginOptions>(Vue: typeof _Vue, options?: AxiosPluginOptions): void {
  const instance = axios.create({
    baseURL: '/api/v1',
    headers: {
      'x-twitch-token': localStorage.getItem('accessToken'),
      'Content-Type': 'application/json',
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
    }

    return Promise.reject(error)
  })

  Vue.prototype.$axios = instance
}

export class AxiosPluginOptions {

}
