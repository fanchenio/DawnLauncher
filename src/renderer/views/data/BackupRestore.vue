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
    <TopTitleBar :title="$store.state.currentLanguage.backupRestoreData" v-model:show="s"></TopTitleBar>
    <div class="pt-2 flex items-center justify-center">
      <Button :text="$store.state.currentLanguage.backup" class="w-20 mr-1" type="primary" @click="backup"></Button>
      <Button :text="$store.state.currentLanguage.restore" class="w-20 ml-1" type="primary" @click="restore"></Button>
    </div>
  </div>
</template>

<script>
import TopTitleBar from "@/components/TopTitleBar";
import Button from "@/components/Button";

const { ipcRenderer } = window.require("electron");

export default {
  name: "BackupRestore",
  components: { TopTitleBar, Button },
  props: {
    // 是否显示
    show: {
      type: Boolean,
    },
  },
  data() {
    return {
      s: null,
    }
  },
  created() {
    this.s = this.show
  },
  watch: {
    s: function (newData) {
      this.$emit("update:show", newData);
    },
  },
  methods: {
    backup() {
      ipcRenderer.send("backup");
    },
    restore() {
      ipcRenderer.send("restore");
    },
  },
};
</script>

<style scoped></style>
