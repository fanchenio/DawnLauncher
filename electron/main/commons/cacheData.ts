import Store from "electron-store";
import { getUserDataPath } from ".";

const cacheStore = new Store({
  name: "Cache",
  clearInvalidConfig: true,
  cwd: getUserDataPath(),
});

export default {
  cacheStore,
};
