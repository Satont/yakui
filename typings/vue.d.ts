import { AxiosStatic } from 'axios'
import VueSocketIO from 'vue-socket.io-extended'
import dayjs from 'dayjs'

declare module 'vue-plugin-load-script'

declare module 'vue/types/vue' {
  interface Vue {
    $bvToast: BvToast;
    $axios: AxiosStatic;
    $dayjs: dayjs;
    sockets: VueSocketIO;
    $loadScript: (name: string) => Promise<void>;
    $unloadScript: (name: string) => Promise<void>;
  }
  interface VueConstructor  {
    $bvToast: BvToast;
    $dayjs: dayjs;
    $axios: AxiosStatic;
    sockets: VueSocketIO;
  }
}
