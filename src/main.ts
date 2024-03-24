import { createSSRApp } from "vue";
import App from "./App.vue";
import pinia from './stores'
import share from "./utils/share";

export function createApp() {
  const app = createSSRApp(App);
  app.use(pinia)
  app.mixin(share)
  return {
    app,
  };
}
