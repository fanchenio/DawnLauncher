<template>
  <div
    class="text-sm h-screen"
    :style="{
      backgroundColor: store.setting.appearance.theme.mainBackgroundColor,
      color: store.setting.appearance.theme.mainFontColor,
      borderRadius:
        store.setting.appearance.transparency < 1 &&
        store.setting.appearance.windowRounded
          ? '8px'
          : undefined,
    }"
  >
    <div class="flex items-center px-2 app-region-drag">
      <h1 class="w-full text-sm flex items-center h-[34px] app-region-drag">
        {{ store.language.networkIcon }}
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
    <div class="px-2">
      <div class="flex items-center">
        <div
          v-if="!icon"
          class="w-[38px] h-[38px] min-w-[38px] min-h-[38px] border border-solid rounded"
          :style="{ borderColor: store.setting.appearance.theme.borderColor }"
        ></div>
        <img
          v-else
          :src="icon"
          class="w-[40px] h-[40px] min-w-[40px] min-h-[40px]"
        />
        <span class="block text-xs ml-2">{{
          store.language.networkIconPrompt1
        }}</span>
      </div>
      <NInput
        class="mt-2"
        type="textarea"
        v-model:value="url"
        size="small"
        :placeholder="store.language.imageLink"
        :autosize="{ minRows: 3, maxRows: 3 }"
      ></NInput>
      <div class="flex mt-1 items-center">
        <NButton
          type="primary"
          size="small"
          :focusable="false"
          class="mr-2"
          @click="download()"
          :loading="getIconLoading"
          :disabled="!url || url.trim() === ''"
          >{{ store.language.getIcon }}</NButton
        >
      </div>
      <div class="flex mt-2 items-center justify-end">
        <NButton
          type="primary"
          size="small"
          :focusable="false"
          class="mr-2 w-20"
          :disabled="!icon || icon.trim() === ''"
          @click="confirm"
          >{{ store.language.ok }}</NButton
        >
        <NButton size="small" :focusable="false" class="w-20" @click="close">{{
          store.language.cancel
        }}</NButton>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import { Icon } from "@vicons/utils";
import { CloseRound } from "@vicons/material";
import { NInput, NButton } from "naive-ui";
import { setIconStyle, removeIconStyle } from "../../utils/style";
import { Result } from "../../../types/common";
import { useMainStore } from "../../store";
// pinia
const store = useMainStore();
// 获取图标状态
let getIconLoading = ref<boolean>(false);
// url
let url = ref<string | null>(null);
// 图标
let icon = ref<string | null>(null);
// 获取图标
function download() {
  if (url.value) {
    getIconLoading.value = true;
    window.api.downloadImage("itemNetworkIconWindow", url.value);
  }
}
// 确定
function confirm() {
  window.api.emit("itemAddEditWindow", "onItemNetworkIcon", icon.value);
  close();
}
// 加载完dom后再显示页面
nextTick(() => {
  window.item.showNetworkIconWindow();
});
/**
 * 关闭窗口
 */
function close() {
  window.item.closeNetworkIconWindow();
}
// 监听键盘
function keydown(e: any) {
  // ESC
  if (e.keyCode === 27) {
    close();
    e.preventDefault();
    e.stopPropagation();
    return;
  }
}
// 监听
let onDownloadImageUnListen: Function | null = null;
// moutned
onMounted(() => {
  // 监听键盘
  window.addEventListener("keydown", keydown, true);
  // 监听下载图片
  onDownloadImageUnListen = window.api.onDownloadImage((data) => {
    getIconLoading.value = false;
    let res: Result = data;
    if (res.status && res.icon) {
      icon.value = res.icon;
    } else if (res.message && res.message.trim() !== "") {
      window.api.showErrorMessageBox("itemNetworkIconWindow", res.message);
    }
  });
});
// unmounted
onUnmounted(() => {
  // 监听键盘
  window.removeEventListener("keydown", keydown, true);
  // 取消监听
  if (onDownloadImageUnListen) {
    onDownloadImageUnListen();
  }
});
</script>
../../../types/common
