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
        {{ getTitle() }}
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
    <NForm label-placement="left" label-width="auto" :show-feedback="false">
      <NFormItem :label="store.language.name">
        <NInput
          v-model:value="form.name"
          clearable
          size="small"
          placeholder=""
          :autofocus="true"
        ></NInput>
      </NFormItem>
      <NFormItem class="mt-1" :label="store.language.shortcutKey">
        <NInput
          v-model:value="form.shortcutKey"
          size="small"
          clearable
          placeholder=""
          @keydown="
            tempShortcutKey = form.shortcutKey = getShortcutKey(
              $event,
              form.shortcutKey,
              true
            )
          "
          @blur="checkShortcutKey"
        ></NInput>
      </NFormItem>
      <NFormItem
        ><NCheckbox
          v-model:checked="form.globalShortcutKey"
          class="ml-auto global-shortcut-key"
          :focusable="false"
          >{{ store.language.globalShortcutKey }}</NCheckbox
        ></NFormItem
      >
    </NForm>
    <div class="flex justify-end items-end">
      <NButton
        type="primary"
        size="small"
        :focusable="false"
        class="mr-2 w-20"
        @click="confirm"
        :disabled="!form.name || form.name.trim() === ''"
        >{{ store.language.ok }}</NButton
      >
      <NButton size="small" :focusable="false" class="w-20" @click="close">{{
        store.language.cancel
      }}</NButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, nextTick, onMounted, onUnmounted } from "vue";
import { Icon } from "@vicons/utils";
import { CloseRound } from "@vicons/material";
import { NForm, NFormItem, NInput, NButton, NCheckbox } from "naive-ui";
import { setIconStyle, removeIconStyle } from "../../utils/style";
import { checkShortcutKey as commonCheckShortcutKey } from "../../utils/shortcutKey";
import { getShortcutKey } from "../../utils/common";
import { Classification } from "../../../types/classification";
import { newClassification, convert } from "../../../commons/utils/common";
import { useMainStore } from "../../store";
// pinia
const store = useMainStore();
// form
let form: Classification = reactive(
  newClassification({
    name: store.language.newClassificationName,
  })
);
// 快捷键用
let oldShortcutKey: string | null = null;
let tempShortcutKey: string | null = null;
// 获取页面参数
const queryParams = new URLSearchParams(window.location.search);
// 获取ID
let id = queryParams.get("id");
// 父级分类ID
let parentId = queryParams.get("parentId");
form.parentId = !parentId ? null : parseInt(parentId);
// 编辑分类
if (id) {
  (async () => {
    // 查询分类信息
    let classification = window.classification.selectById(parseInt(id));
    if (classification) {
      // 赋值
      form = reactive(newClassification(classification));
      oldShortcutKey = form.shortcutKey;
    }
  })();
}
// 标题
function getTitle() {
  if (!id) {
    if (!parentId) {
      return store.language.newClassification;
    } else {
      return store.language.newSubclassification;
    }
  } else {
    if (!parentId) {
      return store.language.editClassification;
    } else {
      return store.language.editSubclassification;
    }
  }
}
/**
 * 校验快捷键
 */
async function checkShortcutKey() {
  if (form.shortcutKey && form.shortcutKey.trim() !== "") {
    let success = await commonCheckShortcutKey(
      store.setting,
      oldShortcutKey,
      form.shortcutKey,
      "classificationAddEditWindow",
      "Classification"
    );
    if (!success) {
      form.shortcutKey = null;
      tempShortcutKey = null;
    }
    return success;
  }
  return true;
}
// 确定
async function confirm() {
  if (form.name && form.name.trim() !== "") {
    // 校验快捷键
    let success = await checkShortcutKey();
    if (!success) {
      return;
    }
    if (!id) {
      // 添加分类
      let classification = window.classification.add(
        form.parentId,
        form.name,
        form.shortcutKey,
        form.globalShortcutKey
      );
      if (classification) {
        window.api.emit("mainWindow", "onAddClassification", classification);
      }
    } else {
      // 更新分类
      let res = window.classification.update(convert(form));
      if (res) {
        window.api.emit("mainWindow", "onUpdateClassification", convert(form));
      }
    }
    // 关闭窗口
    close();
  }
}
// 加载完dom后再显示页面
nextTick(() => {
  window.classification.showAddEditWindow();
});
// 关闭窗口
function close() {
  window.classification.closeAddEditWindow();
}
// 键盘按下
function keydown(e: any) {
  if (e.keyCode === 13 && form.name && form.name.trim() !== "") {
    confirm();
    e.preventDefault();
    e.stopPropagation();
    return;
  } else if (e.keyCode === 27) {
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
../../../types/classification
