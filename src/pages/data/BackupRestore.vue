<template>
  <div
    class="text-sm h-screen"
    :style="{
      backgroundColor: store.setting.appearance.theme.mainBackgroundColor,
      color: store.setting.appearance.theme.mainFontColor,
    }"
  >
    <div class="flex items-center px-2 app-region-drag">
      <h1 class="w-full text-sm flex items-center h-[34px] app-region-drag">
        {{ store.language.backupRestoreData }}
      </h1>
      <Icon
        class="close-icon app-region-no-drag"
        size="18"
        @click="close"
        @mouseover="setIconStyle($event, 'close-icon', store.setting)"
        @mouseout="removeIconStyle($event, 'close-icon')"
        :title="store.language.close"
      >
        <CloseRound></CloseRound>
      </Icon>
    </div>
    <div class="flex items-center justify-center">
      <NButton
        type="primary"
        size="small"
        :focusable="false"
        class="mr-2 w-20"
        @click="backup"
        >{{ store.language.backup }}</NButton
      >
      <NButton
        type="primary"
        size="small"
        :focusable="false"
        class="w-20"
        @click="restore"
        >{{ store.language.restore }}</NButton
      >
    </div>
    <Desc
      class="m-2 text-center"
      :content="store.language.backupRestoreDataPrompt"
    ></Desc>
  </div>
</template>
<script setup lang="ts">
import { nextTick, onMounted, onUnmounted } from "vue";
import { setIconStyle, removeIconStyle } from "../../utils/style";
import { Icon } from "@vicons/utils";
import { CloseRound } from "@vicons/material";
import { NButton } from "naive-ui";
import Desc from "../../components/Desc.vue";
import { useMainStore } from "../../store";
// pinia
const store = useMainStore();
// 备份数据
function backup() {
  window.data.backupData();
}
// 恢复数据
function restore() {
  window.data.restoreData();
}
// 关闭
function close() {
  window.data.closeBackupRestoreDataWindow();
}
// 加载完dom后再显示页面
nextTick(() => {
  window.data.showBackupRestoreDataWindow();
});
// 键盘按下
function keydown(e: any) {
  if (e.keyCode === 27) {
    // ESC
    close();
    e.preventDefault();
    e.stopPropagation();
    return;
  }
}
// moutned
onMounted(() => {
  // 监听键盘
  window.addEventListener("keydown", keydown, true);
});
// unmounted
onUnmounted(() => {
  // 监听键盘
  window.removeEventListener("keydown", keydown, true);
});
</script>
