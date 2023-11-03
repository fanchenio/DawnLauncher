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
        {{ store.language.svgIcon }}
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
          v-if="!htmlIcon"
          class="w-[38px] h-[38px] min-w-[38px] min-h-[38px] border border-solid rounded"
          :style="{ borderColor: store.setting.appearance.theme.borderColor }"
        ></div>
        <div
          v-else
          class="w-[40px] h-[40px] min-w-[40px] min-h-[40px]"
          v-html="DOMPurify.sanitize(htmlIcon)"
        ></div>
        <span class="block text-xs ml-2">{{
          store.language.svgIconPrompt1
        }}</span>
      </div>
      <NInput
        class="mt-2"
        type="textarea"
        v-model:value="rawHtmlIcon"
        size="small"
        :placeholder="store.language.svgIcon"
        :autosize="{ minRows: 3, maxRows: 3 }"
      ></NInput>
      <div class="flex mt-1 items-center">
        <NButton
          type="primary"
          size="small"
          :focusable="false"
          class="mr-2"
          @click="check()"
          :disabled="!rawHtmlIcon || rawHtmlIcon.trim() === ''"
          >{{ store.language.checkCode }}</NButton
        >
      </div>
      <div class="flex mt-2 items-center justify-end">
        <NButton
          type="primary"
          size="small"
          :focusable="false"
          class="mr-2 w-20"
          :disabled="!htmlIcon || htmlIcon.trim() === ''"
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
import DOMPurify from "dompurify";
import { setIconStyle, removeIconStyle } from "../../utils/style";
import { useMainStore } from "../../store";
// pinia
const store = useMainStore();
// 原始代码
let rawHtmlIcon = ref<string | null>(null);
// 格式化后的代码
let htmlIcon = ref<string | null>(null);
// 校验代码
function check() {
  if (rawHtmlIcon.value) {
    let svg = DOMPurify.sanitize(rawHtmlIcon.value);
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, "image/svg+xml");
    const svgElements = doc.getElementsByTagName("svg");
    if (svgElements.length === 1) {
      const serializer = new XMLSerializer();
      let svgElement = svgElements[0];
      svgElement.removeAttribute("class");
      svgElement.removeAttribute("style");
      svgElement.setAttribute("width", "100%");
      svgElement.setAttribute("height", "100%");
      htmlIcon.value = serializer.serializeToString(svgElement);
      rawHtmlIcon.value = htmlIcon.value;
      return;
    }
  }
  htmlIcon.value = null;
  rawHtmlIcon.value = null;
}
// 确定
function confirm() {
  window.api.emit("itemAddEditWindow", "onItemSVGIcon", htmlIcon.value);
  close();
}
// 加载完dom后再显示页面
nextTick(() => {
  window.item.showSVGIconWindow();
});
/**
 * 关闭窗口
 */
function close() {
  window.item.closeSVGIconWindow();
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
