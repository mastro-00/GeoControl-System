import { createApp } from "vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./assets/styles.css";
import App from "./App.vue";
import router from "@router/index";
import { loadRuntimeConfig } from "@config";
import { initApi } from "@services/api";

async function bootstrap() {
  await loadRuntimeConfig();
  initApi();
  createApp(App).use(router).mount("#app");
}

bootstrap();
