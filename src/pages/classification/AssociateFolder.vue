<template>
  <div
    class="text-sm h-screen px-2"
    :style="{
      backgroundColor: store.setting.appearance.theme.mainBackgroundColor,
      color: store.setting.appearance.theme.mainFontColor,
    }"
  >
    <div class="flex items-center app-region-drag">
      <h1 class="w-full text-sm flex items-center h-[34px] app-region-drag">
        {{ store.language.associateFolder }}
        <Icon
          class="app-region-no-drag ml-0.5"
          size="16"
          :title="store.language.associateFolderPrompt1"
          ><HelpOutlineOutlined></HelpOutlineOutlined
        ></Icon>
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
    <div class="w-full">
      <NInput
        type="textarea"
        size="small"
        :placeholder="store.language.folderPath"
        v-model:value="path"
        :autosize="{ minRows: 2, maxRows: 2 }"
      ></NInput>
      <div class="flex flex-wrap mt-1.5 items-center">
        <NButton
          class="mr-1 px-[4px]"
          size="small"
          :focusable="false"
          @click="select"
          :title="store.language.select"
          ><Icon size="18"> <FolderOutlined></FolderOutlined> </Icon
        ></NButton>
        <NButton
          class="px-[4px]"
          size="small"
          :focusable="false"
          @click="path = null"
          :title="store.language.clear"
          ><Icon size="18"> <DeleteOutlined></DeleteOutlined> </Icon
        ></NButton>
      </div>
      <span class="h-[34px] flex items-center">{{
        store.language.hiddenItems
      }}</span>
      <NInput
        type="textarea"
        size="small"
        :placeholder="store.language.associateFolderPrompt2"
        v-model:value="hiddenItems"
        :autosize="{ minRows: 2, maxRows: 2 }"
      ></NInput>
      <div class="h-full flex justify-end items-end mt-2">
        <NButton
          type="primary"
          size="small"
          :focusable="false"
          class="mr-2 w-20"
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
import {
  CloseRound,
  FolderOutlined,
  DeleteOutlined,
  HelpOutlineOutlined,
} from "@vicons/material";
import { NInput, NButton } from "naive-ui";
import { setIconStyle, removeIconStyle } from "../../utils/style";
import { newClassification } from "../../../commons/utils/common";
import { Classification } from "../../../types/classification";
import { useMainStore } from "../../store";
// pinia
const store = useMainStore();
// 获取页面参数
const queryParams = new URLSearchParams(window.location.search);
// 获取ID
let id = parseInt(queryParams.get("id")!);
// 路径
let path = ref<string | null>(null);
// 隐藏项
let hiddenItems = ref<string | null>(null);
// 分类
let classification: Classification | null;
(async () => {
  // 查询分类信息
  classification = window.classification.selectById(id);
  if (classification) {
    classification = newClassification(classification);
    // 赋值
    path.value = classification.data.associateFolderPath;
    hiddenItems.value = classification.data.associateFolderHiddenItems;
  }
})();
// 浏览
async function select() {
  let res = window.api.selectDirectory(
    "classificationAssociateFolderWindow",
    path.value
  );
  if (res) {
    path.value = res;
  }
}
/**
 * 确定
 */
async function confirm() {
  if (classification) {
    if (window.classification.hasChildClassification(id)) {
      window.api.showErrorMessageBox(
        "classificationAssociateFolderWindow",
        store.language.associateFolderPrompt3
      );
    } else {
      if (path.value && path.value.trim() === "") {
        path.value = null;
      }
      if (hiddenItems.value && hiddenItems.value.trim() === "") {
        hiddenItems.value = null;
      }
      // 如果路径不为空判断路径是否存在
      if (path.value) {
        // 检查路径是否存在
        let res: boolean = window.api.pathExist(path.value);
        if (!res) {
          window.api.showErrorMessageBox(
            "classificationAssociateFolderWindow",
            store.language.associateFolderPrompt4
          );
          return;
        }
        // 检查是否是文件夹
        res = window.api.isFile(path.value);
        if (res) {
          window.api.showErrorMessageBox(
            "classificationAssociateFolderWindow",
            store.language.associateFolderPrompt5
          );
          return;
        }
      }
      let res = true;
      if (classification.type === 0 && path.value) {
        res = window.api.showConfirmBox(
          "classificationAssociateFolderWindow",
          store.language.associateFolderPrompt6
        );
      } else if (classification.type === 1 && !path.value) {
        res = window.api.showConfirmBox(
          "classificationAssociateFolderWindow",
          store.language.associateFolderPrompt7
        );
      }
      if (res) {
        let classification = window.classification.setAssociateFolder(
          id,
          path.value,
          hiddenItems.value
        );
        window.api.emit("mainWindow", "onUpdateAssociateFolderClassification", {
          id,
          type: classification.type,
          path: path.value,
          hiddenItems: hiddenItems.value,
        });
        close();
      }
    }
  }
}
// 加载完dom后再显示页面
nextTick(() => {
  window.classification.showAssociateFolderWindow();
});
// 关闭窗口
function close() {
  window.classification.closeAssociateFolderWindow();
}
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
./js/classification ../../../types/classification
