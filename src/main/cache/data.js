import Store from "electron-store";

const cacheStore = new Store({ name: "cache", encryptionKey: "41fdb85a-4706-57b1-ba22-d7556f3723c7", clearInvalidConfig: true });

export default {
  cacheStore,
};
