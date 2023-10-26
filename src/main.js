import { createApp } from "vue";
import { initRoot } from "@/setup";
import App from "@/App";
import store from "@/store";
import { SPB_LOG } from "@/utils";

import "@/assets/css/main.css";

try {
  const root = initRoot();

  const app = createApp(App);

  app.use(store);
  app.mount(root);
} catch (err) {
  SPB_LOG(err);
}
