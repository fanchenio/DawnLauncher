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
        {{ store.language.aggregateClassification }}
        <Icon
          class="app-region-no-drag ml-0.5"
          size="16"
          :title="store.language.aggregateClassificationPrompt1"
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
    <NConfigProvider :theme-overrides="themeOverrides">
      <div class="w-full">
        <NForm label-placement="left" label-width="auto" :show-feedback="false">
          <NFormItem :label="store.language.sort">
            <NSelect
              class="sort"
              :options="sortOptions"
              v-model:value="sort"
              size="small"
            ></NSelect>
          </NFormItem>
          <NFormItem :label="store.language.number">
            <NInputNumber
              v-model:value="itemCount"
              size="small"
              :min="1"
              class="w-full"
              placeholder=""
              :show-button="false"
            ></NInputNumber>
          </NFormItem>
        </NForm>
        <div class="h-full flex justify-end items-end mt-2">
          <NButton
            type="primary"
            size="small"
            :focusable="false"
            class="mr-2 w-20"
            @click="confirm"
            >{{ store.language.ok }}</NButton
          >
          <NButton
            size="small"
            :focusable="false"
            class="w-20"
            @click="close"
            >{{ store.language.cancel }}</NButton
          >
        </div>
      </div>
    </NConfigProvider>
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import { Icon } from "@vicons/utils";
import { CloseRound, HelpOutlineOutlined } from "@vicons/material";
import {
  NForm,
  NFormItem,
  NInputNumber,
  NButton,
  NSelect,
  NConfigProvider,
  GlobalThemeOverrides,
} from "naive-ui";
import { setIconStyle, removeIconStyle } from "../../utils/style";
import { newClassification } from "../../../commons/utils/common";
import { Classification } from "../../../types/classification";
import { useMainStore } from "../../store";
// pinia
const store = useMainStore();
// 样式
let themeOverrides: GlobalThemeOverrides = {
  Select: {
    peers: {
      InternalSelectMenu: {
        height: "74px",
      },
    },
  },
};
// 获取页面参数
const queryParams = new URLSearchParams(window.location.search);
// 获取ID
let id = parseInt(queryParams.get("id")!);
// 路径
let sort = ref("initial");
// 项目数量
let itemCount = ref(50);
// 分类
let classification: Classification | null;
(async () => {
  // 查询分类信息
  classification = window.classification.selectById(id);
  if (classification) {
    classification = newClassification(classification);
    // 赋值
    if (
      classification.data.itemSort !== "default" &&
      classification.type === 2
    ) {
      sort.value = classification.data.itemSort;
    }
    itemCount.value = classification.data.aggregateItemCount;
  }
})();
// 排序
let sortOptions = ref([
  {
    label: store.language.byInitialLetter,
    value: "initial",
  },
  {
    label: store.language.byOpenNumber,
    value: "openNumber",
  },
  {
    label: store.language.byLastOpen,
    value: "lastOpen",
  },
]);
/**
 * 确定
 */
async function confirm() {
  if (classification) {
    if (window.classification.hasChildClassification(id)) {
      window.api.showErrorMessageBox(
        "classificationAggregateWindow",
        store.language.aggregateClassificationPrompt2
      );
    } else {
      if (sort.value === "openNumber") {
        window.api.showInfoMessageBox(
          "classificationAggregateWindow",
          store.language.aggregateClassificationPrompt3
        );
      }
      let res =
        classification.type !== 2
          ? window.api.showConfirmBox(
              "classificationAggregateWindow",
              store.language.aggregateClassificationPrompt4
            )
          : true;
      if (res) {
        res = window.classification.updateAggregate(
          id,
          sort.value,
          itemCount.value
        );
        if (res) {
          window.api.emit("mainWindow", "onUpdateClassificationAggregate", {
            id: id,
            sort: sort.value,
            itemCount: itemCount.value,
          });
        }
        close();
      }
    }
  }
}
// 加载完dom后再显示页面
nextTick(() => {
  window.classification.showAggregateWindow();
});
// 关闭窗口
function close() {
  window.classification.closeAggregateWindow();
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
