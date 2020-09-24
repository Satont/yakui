import { AxiosStatic } from 'axios'
import { BvToast } from 'bootstrap-vue'
import VueSocketIO from 'vue-socket.io-extended'

declare module 'vue-plugin-load-script'

declare module 'vue/types/vue' {
  interface Vue {
    $bvToast: BvToast;
    $axios: AxiosStatic;
    sockets: VueSocketIO;
    $loadScript: (name: string) => Promise<void>;
    $unloadScript: (name: string) => Promise<void>;
  }
  interface VueConstructor  {
    $bvToast: BvToast;
    $axios: AxiosStatic;
    sockets: VueSocketIO;
  }
}
