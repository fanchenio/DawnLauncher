import { createApp } from "vue";
import "./styles/style.css";
import "./styles/tailwind.css";
import router from "./router/index";
import App from "./App.vue";
import { createPinia } from "pinia";
const pinia = createPinia();

createApp(App).use(router).use(pinia).mount("#app");
