import { AxiosStatic } from "axios";

declare module 'vue/types/vue' {
  interface Vue {
    $axios: AxiosStatic;
  }
  interface VueConstructor  {
    $axios: AxiosStatic;
  }
}
