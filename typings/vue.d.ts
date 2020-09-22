import { AxiosStatic } from 'axios'
import VueSocketIO from 'vue-socket.io-extended'

declare module 'vue-plugin-load-script'

declare module 'vue/types/vue' {
  interface Vue {
    $axios: AxiosStatic;
    sockets: VueSocketIO;
    $loadScript: (name: string) => Promise<void>;
    $unloadScript: (name: string) => Promise<void>;
  }
  interface VueConstructor  {
    $axios: AxiosStatic;
    sockets: VueSocketIO;
  }
}
