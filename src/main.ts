import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import { apiClientKey, createApiClient } from "@/api";
import { registerErrorHandler } from "@/plugins/error-handler";
import { createSessionExpiryHandler } from "@/plugins/session";
import router from "@/router";
import { readToken } from "@/utils/auth-storage";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.provide(
  apiClientKey,
  createApiClient({
    baseURL: import.meta.env.VITE_APP_API_URL,
    getToken: readToken,
    onUnauthorized: createSessionExpiryHandler({ pinia, router }),
  }),
);

registerErrorHandler(app);

app.mount("#app");
