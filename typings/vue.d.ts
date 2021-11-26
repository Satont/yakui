import { AxiosStatic } from 'axios';
import VueSocketIO from 'vue-socket.io-extended';
declare module 'vue/types/vue' {
  interface Vue {
    $axios: AxiosStatic;
    sockets: VueSocketIO;
    $loadScript: (src: string) => Promise<HTMLScriptElement>;
    $unloadScript: (src: string) => Promise<void>;
  }
  interface VueConstructor {
    $axios: AxiosStatic;
    sockets: VueSocketIO;
  }
}
