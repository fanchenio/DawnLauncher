<template>
  <div
    id="search"
    class="overflow-x-hidden top-[34px] fixed z-10 w-4/5 drop-shadow-[0_0_6px_rgba(0,0,0,0.2)]"
    style="text-shadow: none"
    :style="{
      color: store.setting.appearance.theme.mainFontColor,
      backgroundColor: store.setting.appearance.theme.mainBackgroundColor,
    }"
  >
    <div
      class="flex items-center h-[34px]"
      :class="`${resultList && resultList.length > 0 ? 'border-b-[1px]' : ''}`"
      :style="{
        borderColor: store.setting.appearance.theme.borderColor,
        borderBottomStyle:
          resultList && resultList.length > 0 ? 'solid' : undefined,
      }"
    >
      <div class="mx-2 whitespace-nowrap flex items-center">
        <Icon size="18" v-if="mode === 'search'">
          <SearchOutline></SearchOutline>
        </Icon>
        <Icon size="18" v-if="mode === 'commandLine'">
          <TerminalOutline></TerminalOutline>
        </Icon>
        <span
          class="text-sm block"
          v-if="mode === 'webSearch' && webSearchSource"
          >{{ webSearchSource.name }}</span
        >
      </div>
      <input
        ref="searchInput"
        type="text"
        v-model="value"
        class="w-full resize-none text-sm hover:outline-0 focus-visible:outline-0"
        :style="{
          backgroundColor: store.setting.appearance.theme.mainBackgroundColor,
          color: store.setting.appearance.theme.mainFontColor,
        }"
        :placeholder="getPlaceholder()"
      />
      <Icon
        size="18"
        class="search-close-icon p-2 cursor-default"
        :style="{ color: store.setting.appearance.theme.mainFontColor }"
        @mouseover="setIconStyle($event, 'search-close-icon', store.setting)"
        @mouseout="removeIconStyle($event, 'search-close-icon')"
        @click="close"
        :title="store.language.close"
      >
        <CloseRound></CloseRound>
      </Icon>
    </div>
    <ul
      id="search-result-list"
      class="overflow-x-hidden"
      @contextmenu="contextmenu"
      @mouseover="mouseover"
      @mouseout="mouseout"
      @click="runItem"
      data-simplebar
    >
      <li
        v-for="(item, index) of resultList"
        class="search-result-item flex items-center px-2 h-[48px]"
        :style="{
          backgroundColor:
            selected === index || store.searchItemRightMenuItemId === item.id
              ? hexToRGBA(
                  store.setting.appearance.theme.secondBackgroundColor,
                  0.3
                )
              : undefined,
        }"
        :key="'search-item-' + item.id + '-' + index"
        :id="'search-item-' + index"
        :item-id="item.id"
        :title="getItemTitle(item as Item)"
        :index="index"
        :target="item.data.target"
      >
        <CustomItemIcon :item="(item as Item)" :icon-size="32"></CustomItemIcon>
        <span
          class="text-sm ml-2 overflow-hidden text-ellipsis whitespace-nowrap h-[20px]"
          >{{ getName(item.name)
          }}<span v-if="mode === 'search'" class="text-xs ml-2">{{
            getSearchItemClassificationName((item as Item).classificationId)
          }}</span></span
        >
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { Icon } from "@vicons/utils";
import { CloseRound } from "@vicons/material";
import {
  getItemSearchMap,
  searchItem,
  getName,
  run,
  getItemById,
  getItemTitle,
  filterExcludeSearchItemList,
} from "../../item/js/index";
import { CommonItem, Item } from "../../../../types/item";
import { getShortcutKey } from "../../../utils/common";
import CustomItemIcon from "../../../components/CustomItemIcon.vue";
import { itemHoverStyle, itemRemoveStyle } from "../../item/js/index";
import { getSearchItemClassificationName } from "../../classification/js/index";
import {
  getClassElement,
  hexToRGBA,
  setIconStyle,
  removeIconStyle,
} from "../../../utils/style";
import { WebSearchSource } from "../../../../types/setting";
import { convert } from "../../../../commons/utils/common";
import "simplebar";
import "simplebar/dist/simplebar.css";
import {
  getCommandLineItemList,
  itemAllRemoveStyle,
  searchResultDivMoveScroll,
  commandLineRun,
} from "../js/index";
import { SearchOutline, TerminalOutline } from "@vicons/ionicons5";
import { useMainStore } from "../../../store";
// pinia
const store = useMainStore();
// 搜索框
let searchInput = ref<any>(null);
// 搜索模式
let mode = ref<"search" | "webSearch" | "commandLine">("search");
// 搜索模式对应的实体
let webSearchSource = ref<WebSearchSource | null>(null);
// 搜索内容
let value = ref<string | null>(null);
// 选中的项
let selected = ref<number>(0);
// 结果列表
let resultList = ref<Array<CommonItem | Item>>([]);
// 过滤排除搜索
let itemList: Array<Item> = filterExcludeSearchItemList();
// 搜索Map
let searchMap = getItemSearchMap(
  itemList,
  store.setting.quickSearch.matchConditionsRemark
);
// 监听值
watch(
  () => value.value,
  () => {
    search();
  }
);
// 搜索
function search() {
  if (mode.value === "search") {
    if (value.value) {
      resultList.value = searchItem(value.value, searchMap, 50);
      if (resultList.value && resultList.value.length > 0) {
        selected.value = 0;
        // 刷新DOM完毕执行
        nextTick(() => {
          let listEL = document.getElementById("search-result-list");
          if (listEL) {
            let sim = listEL.getElementsByClassName(
              "simplebar-content-wrapper"
            )[0];
            if (sim) {
              sim.scrollTop = 0;
            }
          }
        });
      }
    } else {
      resultList.value = [];
    }
  }
}
// 运行项目
function runItem(e: any) {
  // 找到item
  let itemElement = getClassElement(e, "search-result-item");
  if (itemElement) {
    if (mode.value === "search") {
      // 项目ID
      let itemId = parseInt(itemElement.getAttribute("item-id"));
      // 查询项目
      let item = getItemById(itemId);
      if (item && item.data) {
        run("search", "open", item);
        close();
      }
    } else if (mode.value === "commandLine") {
      // 目标
      commandLineRun(itemElement.getAttribute("target"), value.value);
      close();
    }
  }
}
// 获取placeholder
function getPlaceholder() {
  let text = store.language.search;
  if (
    mode.value === "webSearch" &&
    webSearchSource.value &&
    webSearchSource.value.description &&
    webSearchSource.value.description.trim() !== ""
  ) {
    text = webSearchSource.value.description.trim();
  } else if (mode.value === "commandLine") {
    text = "Command Line";
  }
  return text;
}
// 关闭
function close() {
  store.search = false;
}
// 监听搜索右键ID
watch(
  () => store.searchItemRightMenuItemId,
  (newValue) => {
    if (!newValue) {
      itemAllRemoveStyle("search-result-item", selected.value);
    }
  }
);
// 监听右键
function contextmenu(e: any) {
  e.preventDefault();
  e.stopPropagation();
  if (mode.value === "search") {
    // 当前项目
    let item: Item | null = null;
    // 判断是在哪个区域右键
    if (getClassElement(e, "search-result-item")) {
      // 项目右键
      // 获取项目ID
      let element = getClassElement(e, "search-result-item");
      // 项目ID
      let id = parseInt(element.getAttribute("item-id"));
      // 获取项目
      item = convert(getItemById(id));
    }
    if (item) {
      // 弹出菜单
      store.searchItemRightMenuItemId = item.id;
      window.item.showRightMenu({
        item,
        x: e.screenX,
        y: e.screenY,
        type: "search",
      });
    }
  }
}
function keydown(e: any) {
  // 提取快捷键
  let shortcutKey = getShortcutKey(e, null, false);
  // 隐藏搜索框
  if (
    store.setting.general.searchShowHideShortcutKey &&
    shortcutKey === store.setting.general.searchShowHideShortcutKey
  ) {
    close();
    e.preventDefault();
    return;
  }
  // 上下按键 38上 40下
  if (e.keyCode === 38 || e.keyCode === 40) {
    e.preventDefault();
    if (resultList.value && resultList.value.length > 0) {
      if (e.keyCode === 38 && selected.value > 0) {
        selected.value = selected.value - 1;
        searchResultDivMoveScroll("search-item", 34 + 34, "up", selected.value);
        return;
      }
      if (e.keyCode === 40 && selected.value < resultList.value.length - 1) {
        selected.value = selected.value + 1;
        searchResultDivMoveScroll(
          "search-item",
          34 + 34,
          "down",
          selected.value
        );
        return;
      }
    }
  }
  // 空格
  if (e.keyCode === 32) {
    if (mode.value === "search") {
      // 判断是否是搜索引擎
      if (value.value && value.value.trim() !== "") {
        let flag = false;
        if (store.setting.webSearch.mode === 0) {
          if (value.value.substring(0, 1) === ":") {
            flag = true;
          }
        } else if (store.setting.webSearch.mode === 1) {
          flag = true;
        }
        if (flag) {
          let keyword =
            store.setting.webSearch.mode == 0
              ? value.value.substring(1)
              : value.value;
          for (let searchSource of store.setting.webSearch.searchSourceList) {
            if (keyword === searchSource.keyword) {
              mode.value = "webSearch";
              webSearchSource.value = searchSource;
              value.value = null;
              resultList.value = [];
              selected.value = 0;
              e.preventDefault();
            }
          }
        }
      }
    }
    if (mode.value !== "webSearch" && mode.value !== "commandLine") {
      // 判断是否是命令行
      if (value.value && value.value.trim() !== "") {
        if (value.value === ">") {
          mode.value = "commandLine";
          value.value = null;
          resultList.value = getCommandLineItemList();
          selected.value = 0;
          e.preventDefault();
        }
      }
    }
  }
  // enter
  if (e.keyCode === 13) {
    if (mode.value === "webSearch" && webSearchSource.value) {
      let url = webSearchSource.value.url.replace("{w}", value.value ?? "");
      window.api.openURL(url);
      close();
    } else if (
      mode.value === "search" &&
      resultList.value.length - 1 >= selected.value
    ) {
      run("search", "open", resultList.value[selected.value] as Item);
      close();
    } else if (
      mode.value === "commandLine" &&
      resultList.value.length - 1 >= selected.value
    ) {
      commandLineRun(
        resultList.value[selected.value].data.target!,
        value.value
      );
      close();
    }
    e.preventDefault();
  }
  // 退格键
  if (e.keyCode === 8) {
    if (mode.value === "webSearch") {
      if (!value.value || value.value.trim() === "") {
        mode.value = "search";
        webSearchSource.value = null;
      }
    } else if (mode.value === "commandLine") {
      if (!value.value || value.value.trim() === "") {
        mode.value = "search";
        resultList.value = [];
      }
    }
  }
}
// mouseover
function mouseover(e: any) {
  // 鼠标经过添加样式
  if (
    getClassElement(e, "search-result-item") &&
    !store.searchItemRightMenuItemId
  ) {
    itemHoverStyle(e, "search-result-item");
  }
}
// mouseout
function mouseout(e: any) {
  // 鼠标移走删除样式
  if (
    getClassElement(e, "search-result-item") &&
    !store.searchItemRightMenuItemId
  ) {
    let element = getClassElement(e, "search-result-item");
    let index = element.getAttribute("index");
    if (selected.value !== parseInt(index)) {
      itemRemoveStyle(e, "search-result-item");
    }
  }
}
// 监听页面大小
function resize() {
  // body
  let body = document.querySelector("body");
  if (body) {
    // search
    let search = document.getElementById("search");
    // result
    let result = document.getElementById("search-result-list");
    if (search) {
      // 设置整个搜索模块居中
      search.style.left = (body.clientWidth - search.clientWidth) / 2 + "px";
    }
    // 设置搜索结果高度
    if (result) {
      // 高度
      result.style.maxHeight = body.clientHeight - 70 * 2 + "px";
    }
  }
}
// moutned
onMounted(() => {
  window.addEventListener("resize", resize, true);
  window.addEventListener("keydown", keydown, true);
  // 刷新DOM完毕执行
  nextTick(() => {
    searchInput.value.focus();
    resize();
  });
});
// unmounted
onUnmounted(() => {
  window.removeEventListener("resize", resize, true);
  window.removeEventListener("keydown", keydown, true);
});
</script>
