<template>
  <NInput
    v-model:value="searchText"
    size="small"
    :placeholder="store.language.search"
    @keyup="search"
  >
    <template #suffix>
      <Icon :style="{ color: store.setting.appearance.theme.mainFontColor }">
        <SearchRound></SearchRound>
      </Icon>
    </template>
  </NInput>
  <div
    id="appx-item-content"
    class="border border-solid rounded text-sm h-[384px] mt-[4px] overflow-x-hidden"
    :style="{
      backgroundColor: store.setting.appearance.theme.mainBackgroundColor,
      color: store.setting.appearance.theme.mainFontColor,
      borderColor: store.setting.appearance.theme.borderColor,
    }"
  >
    <NSpin v-if="loading" class="block text-center mt-[20px]" size="small" />
    <ul
      v-if="!loading"
      id="appx-item-list"
      class="flex flex-wrap m-2"
      @mouseover="mouseover"
      @mouseout="mouseout"
    >
      <li
        v-for="(item, index) of showItemList"
        :key="'appx-item-' + item.id + '-' + index"
        :title="item.name ?? undefined"
      >
        <div class="appx-item p-2 rounded" @click="selectedItem(item)">
          <img
            v-if="item.data.icon"
            :src="item.data.icon"
            class="mx-auto block"
            :style="{
              width: store.setting.item.iconSize + 'px',
              height: store.setting.item.iconSize + 'px',
            }"
          />
          <div
            v-else
            class="mx-auto"
            :style="{
              width: store.setting.item.iconSize + 'px',
              height: store.setting.item.iconSize + 'px',
            }"
            v-html="DOMPurify.sanitize(item.data.htmlIcon!)"
          ></div>
          <p
            class="text-center mt-2 mx-2"
            :class="[
              `${
                store.setting.item.itemNameRowCount == 2
                  ? store.setting.item.hideEllipsis
                    ? 'item-name-tile-2-no-ellipsis'
                    : 'item-name-tile-2'
                  : store.setting.item.hideEllipsis
                  ? 'item-name-tile-1-no-ellipsis'
                  : 'item-name-tile-1'
              }`,
            ]"
          >
            {{ item.name }}
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch } from "vue";
import { CommonItem } from "../../../../types/item";
import { NSpin, NInput } from "naive-ui";
import SimpleBar from "simplebar";
import "simplebar/dist/simplebar.css";
import { Icon } from "@vicons/utils";
import { SearchRound } from "@vicons/material";
import DOMPurify from "dompurify";
import {
  getClassElement,
  setStyle,
  removeStyle,
  hexToRGBA,
} from "../../../utils/style";
import { getItemSearchMap, searchItem } from "../js/index";
import { useMainStore } from "../../../store";
// pinia
const store = useMainStore();
// 监听宽度
watch(
  () => store.setting.item.width,
  () => {
    nextTick(() => {
      // 设置项目宽度
      setItemWidth();
    });
  }
);
// 项目查询状态
let loading = ref<boolean>(false);
// 项目列表
let itemList: Array<CommonItem> = [];
// 显示的列表
let showItemList = ref<Array<CommonItem>>([]);
// 查询系统项目
loading.value = true;
// 搜索Map
let searchMap: Map<string, Array<CommonItem>> = new Map();
// 获取Appx项目
window.item.getAppxItemList();
// 创建滚动条
function createSimpleBar() {
  let element = document.getElementById("appx-item-content");
  if (element) {
    new SimpleBar(element);
  }
}
// 搜索项目
let searchText = ref<string | null>(null);
function search() {
  if (!loading.value) {
    if (searchText.value && searchText.value.trim() !== "") {
      showItemList.value = searchItem(searchText.value, searchMap);
    } else {
      showItemList.value = [...itemList];
    }
    nextTick(() => {
      // 设置项目宽度
      setItemWidth();
    });
  }
}
// emit
const $emit = defineEmits(["selected"]);
// 选中项目
function selectedItem(item: CommonItem) {
  $emit("selected", item, "appx");
}
// 设置项目宽度
function setItemWidth() {
  let itemElementList = document.getElementById("appx-item-list");
  if (itemElementList) {
    let width = itemElementList.getBoundingClientRect().width;
    let num = Math.floor(width / store.setting.item.width);
    let itemList = itemElementList.getElementsByTagName("li");
    for (let i = 0; i < itemList.length; i++) {
      itemList[i].style.width = width / num + "px";
    }
  }
}
// mouseover
function mouseover(e: any) {
  // 鼠标经过添加项目样式
  if (getClassElement(e, "appx-item")) {
    let style: Map<string, string> = new Map();
    style.set(
      "background-color",
      hexToRGBA(store.setting.appearance.theme.secondBackgroundColor, 0.3)
    );
    setStyle(e, "appx-item", style);
  }
}
// mouseout
function mouseout(e: any) {
  // 鼠标移走删除分类样式
  if (getClassElement(e, "appx-item")) {
    let style: Map<string, string | null> = new Map();
    style.set("background-color", null);
    removeStyle(e, "appx-item", style);
  }
}
// 监听
let onGetAppxItemListListen: Function | null = null;
// moutned
onMounted(() => {
  // 刷新DOM完毕执行
  nextTick(() => {
    // 滚动条
    createSimpleBar();
  });
  // 监听获取Appx项目
  onGetAppxItemListListen = window.item.onGetAppxItemList((data) => {
    // 数据
    itemList = data;
    // 搜索内容清空
    searchText.value = null;
    // 获取搜索Map
    searchMap = getItemSearchMap(itemList);
    // 要显示的列表
    showItemList.value = [...itemList];
    // loading
    loading.value = false;
    nextTick(() => {
      // 设置项目宽度
      setItemWidth();
    });
  });
});
// unmounted
onUnmounted(() => {
  // 删除监听
  if (onGetAppxItemListListen) {
    onGetAppxItemListListen();
  }
});
</script>
../js/item ../../../../types/item
