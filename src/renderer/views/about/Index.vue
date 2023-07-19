<template>
  <div
    class="text-sm h-full"
    style="text-shadow: none"
    :style="{
      backgroundColor: $store.state.setting.appearance.theme.mainBackground,
      color: $store.state.setting.appearance.theme.fontBasic,
      borderRadius: $store.state.setting.appearance.backgroundTransparency < 1 && $store.state.setting.appearance.windowRoundedCorners ? '8px' : null,
    }"
  >
    <TopTitleBar :title="$store.state.currentLanguage.about" v-model:show="s"></TopTitleBar>
    <div class="px-2">
      <img src="../../assets/images/logo-transparent.png" class="w-20 h-20 mx-auto" draggable="false" />
      <p class="mt-4">Dawn Launcher {{ version }}</p>
      <p class="mt-2">Copyright © 2022-2023 Dawn Launcher. All Rights Reserved</p>
      <p class="mt-2 pb-2">
        {{ $store.state.currentLanguage.officialWebsite }}<span v-html="$getColon()"></span
        ><span @click="openUrl" class="cursor-pointer">https://dawnlauncher.com/</span>
      </p>
    </div>
  </div>
</template>

<script>
import TopTitleBar from "@/components/TopTitleBar";
const { ipcRenderer } = window.require("electron");
export default {
  name: "About",
  components: { TopTitleBar },
  props: {
    // 是否显示
    show: {
      type: Boolean,
    },
  },
  data() {
    return {
      version: null,
      s: null,
    };
  },
  watch: {
    s: function (newData) {
      this.$emit("update:show", newData);
    },
  },
  created() {
    this.s = this.show
    this.version = ipcRenderer.sendSync("getVersion");
  },
  methods: {
    openUrl() {
      ipcRenderer.send("openUrl", "https://dawnlauncher.com/");
    },
  },
};
</script>

<style scoped></style>
