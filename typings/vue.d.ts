import { AxiosStatic } from "axios";
import VueSocketIO from 'vue-socket.io-extended'

declare module 'vue/types/vue' {
  interface Vue {
    $axios: AxiosStatic;
    sockets: VueSocketIO;
  }
  interface VueConstructor  {
    $axios: AxiosStatic;
    sockets: VueSocketIO;
  }
}
