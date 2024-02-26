<template>
  <div
    class="overflow-x-hidden max-h-[525px]"
    :style="{
      color: store.setting.appearance.theme.mainFontColor,
      backgroundColor: store.setting.appearance.theme.mainBackgroundColor,
    }"
  >
    <div
      class="flex items-center h-[44px]"
      :class="`${resultList && resultList.length > 0 ? 'border-b-[1px]' : ''}`"
      :style="{
        borderColor: store.setting.appearance.theme.borderColor,
        borderBottomStyle:
          resultList && resultList.length > 0 ? 'solid' : undefined,
      }"
    >
      <div class="mx-[10px] whitespace-nowrap flex items-center">
        <Icon class="app-region-drag" size="22" v-if="mode === 'search'">
          <SearchOutline></SearchOutline>
        </Icon>
        <Icon class="app-region-drag" size="22" v-if="mode === 'commandLine'">
          <TerminalOutline></TerminalOutline>
        </Icon>
        <span
          class="text-xl block app-region-drag"
          v-if="mode === 'webSearch' && webSearchSource"
          >{{ webSearchSource.name }}</span
        >
      </div>
      <input
        ref="searchInput"
        type="text"
        v-model="value"
        class="w-full resize-none text-xl font-light hover:outline-0 focus-visible:outline-0"
        :style="{
          backgroundColor: store.setting.appearance.theme.mainBackgroundColor,
          color: store.setting.appearance.theme.mainFontColor,
        }"
        :placeholder="getPlaceholder()"
      />
    </div>
    <ul
      id="search-result-list"
      class="overflow-x-hidden max-h-[480px]"
      @contextmenu="contextmenu"
      @mouseover="mouseover"
      @mouseout="mouseout"
      @click="parentRunItem"
      @dragover="dragover"
      @drop="drop"
      data-simplebar
      v-cloak
    >
      <li
        v-for="(item, index) of resultList"
        class="item flex items-center px-[12px] h-[48px]"
        :key="'item-' + item.id + '-' + index"
        :id="'item-' + index"
        :item-id="item.id"
        :style="{
          backgroundColor:
            selected === index ||
            store.quickSearchItemRightMenuItemId === item.id
              ? hexToRGBA(
                  store.setting.appearance.theme.secondBackgroundColor,
                  0.3
                )
              : undefined,
        }"
        :title="getItemTitle(item as Item)"
        :index="index"
        :target="item.data.target"
      >
        <CustomItemIcon :item="(item as Item)" :icon-size="28"></CustomItemIcon>
        <span
          class="text-sm ml-[10px] overflow-hidden text-ellipsis whitespace-nowrap h-[20px] flex-1 pr-[10px]"
          >{{ getName(item.name)
          }}<span v-if="mode === 'search'" class="text-xs ml-2">{{
            getSearchItemClassificationName((item as Item).classificationId)
          }}</span></span
        >
        <!-- 快捷键 -->
        <template
          v-if="
            store.setting.quickSearch.openShortcutKey !== 'none' && index <= 9
          "
        >
          <template
            v-if="
              showHistory ||
              store.setting.quickSearch.openShortcutKey === 'altNumberKey'
            "
          >
            <keyText text="Alt"></keyText>
            &nbsp;+&nbsp;
            <keyText
              :text="(index + 1 === 10 ? 0 : index + 1).toString()"
            ></keyText>
          </template>
          <template
            v-else-if="
              store.setting.quickSearch.openShortcutKey === 'numberKey'
            "
          >
            <keyText
              :text="
                store.language.numberKey +
                (index + 1 === 10 ? 0 : index + 1).toString()
              "
            ></keyText>
          </template>
          <template
            v-else-if="
              store.setting.quickSearch.openShortcutKey === 'ctrlNumberKey'
            "
          >
            <keyText text="Ctrl"></keyText>
            &nbsp;+&nbsp;
            <keyText
              :text="(index + 1 === 10 ? 0 : index + 1).toString()"
            ></keyText>
          </template>
        </template>
        <!-- 删除历史记录 -->
        <Icon
          v-if="showHistory"
          class="delete-history-icon text-[10px] p-[2px] ml-[10px] cursor-pointer"
          style="border-radius: 12px"
          :style="{
            color: store.setting.appearance.theme.mainFontColor,
            backgroundColor:
              store.setting.appearance.theme.secondBackgroundColor,
          }"
          :title="store.language.deleteHistory"
        >
          <CloseRound></CloseRound>
        </Icon>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { convertClassificationList } from "../classification/js";
import {
  convertItemList,
  getItemById,
  getItemSearchMap,
  getName,
  itemHoverStyle,
  itemRemoveStyle,
  run,
  searchItem,
  getItemTitle,
  filterExcludeSearchItemList,
  sort,
} from "../item/js";
import { findElement, unlistens } from "../../utils/common";
import { WebSearchSource } from "../../../types/setting";
import { CommonItem, Item } from "../../../types/item";
import { getSearchItemClassificationName } from "../classification/js/index";
import "simplebar";
import "simplebar/dist/simplebar.css";
import CustomItemIcon from "../../components/CustomItemIcon.vue";
import { getClassElement, hexToRGBA } from "../../utils/style";
import { convert } from "../../../commons/utils/common";
import {
  itemAllRemoveStyle,
  searchResultDivMoveScroll,
  getCommandLineItemList,
  commandLineRun as commonCommandLineRun,
} from "./js/index";
import keyText from "../../components/KeyText.vue";
import { Icon } from "@vicons/utils";
import { SearchOutline, TerminalOutline } from "@vicons/ionicons5";
import { CloseRound } from "@vicons/material";
import { useMainStore } from "../../store";
// pinia
const store = useMainStore();
// 显示历史记录
let showHistory = ref(false);
// 搜索框
let searchInput = ref<any>(null);
// 搜索内容
let value = ref<string | null>(null);
// 搜索模式
let mode = ref<"search" | "webSearch" | "commandLine">("search");
// 搜索模式对应的实体
let webSearchSource = ref<WebSearchSource | null>(null);
// 选中的项
let selected = ref<number>(0);
// 结果列表
let resultList = ref<Array<CommonItem | Item>>([]);
// 搜索Map
let searchMap = new Map();
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
    // 搜索模式
    if (value.value) {
      showHistory.value = false;
      resultList.value = searchItem(value.value, searchMap, 50);
      if (resultList.value && resultList.value.length > 0) {
        if (
          store.setting.quickSearch.openNow &&
          resultList.value.length === 1
        ) {
          // 仅剩一项时立即打开
          runItem(resultList.value[0] as Item);
          return;
        }
      }
    } else {
      // 获取历史记录
      getHistory();
    }
    refresh();
  }
}
// 刷新
function refresh() {
  // 重置滚动条
  resetScroll();
  // 刷新DOM完毕执行
  nextTick(() => {
    // 设置窗口高度
    let height =
      !resultList.value || resultList.value.length === 0
        ? 0
        : resultList.value.length > 9
        ? 10 * 48 + 1
        : resultList.value.length * 48 + 1;
    window.quickSearch.setWindowHeight(height + 44);
  });
}
/**
 * 重置滚动条
 */
function resetScroll() {
  selected.value = 0;
  // 刷新DOM完毕执行
  nextTick(() => {
    let listEL = document.getElementById("search-result-list");
    if (listEL) {
      let sim = listEL.getElementsByClassName("simplebar-content-wrapper")[0];
      if (sim) {
        sim.scrollTop = 0;
      }
    }
  });
}
// 查询数据
function getData() {
  // 分类
  store.classificationList = convertClassificationList(
    window.classification.list()
  );
  // 项目
  store.itemMap = convertItemList(window.item.list());
  // 过滤排除搜索
  let itemList: Array<Item> = filterExcludeSearchItemList();
  // 搜索Map
  searchMap = getItemSearchMap(
    itemList,
    store.setting.quickSearch.matchConditionsRemark
  );
  // 历史记录
  getHistory();
}
// 获取历史记录
function getHistory() {
  if (store.setting.quickSearch.showHistory) {
    // 过滤排除搜索
    let itemList: Array<Item> = filterExcludeSearchItemList().filter((item) => {
      if (
        store.setting.quickSearch.showHistorySort === "openNumber" &&
        item.data.quickSearchOpenNumber > 0
      ) {
        return true;
      } else if (
        store.setting.quickSearch.showHistorySort === "lastOpen" &&
        item.data.quickSearchLastOpen > 0
      ) {
        return true;
      }
      return false;
    });
    // 按照指定顺序排序
    let sortList = sort(
      itemList,
      store.setting.quickSearch.showHistorySort === "openNumber"
        ? "quickSearchOpenNumber"
        : "quickSearchLastOpen"
    );
    if (sortList && sortList.length > 0) {
      // 截取数据
      if (sortList.length > 10) {
        resultList.value = sortList.slice(0, 10);
      } else {
        resultList.value = sortList;
      }
      showHistory.value = true;
    } else {
      resultList.value = [];
      showHistory.value = false;
    }
  } else {
    resultList.value = [];
    showHistory.value = false;
  }
  refresh();
}
// 父级运行项目
function parentRunItem(e: any) {
  // 找到delete-history-icon
  let deleteHistoryElement = getClassElement(e, "delete-history-icon");
  if (deleteHistoryElement) {
    // 找到item
    let itemElement = getClassElement(e, "item");
    // 项目ID
    let itemId = parseInt(itemElement.getAttribute("item-id"));
    // 删除历史记录
    window.item.deleteQuickSearchHistory(itemId);
  } else {
    // 找到item
    let itemElement = getClassElement(e, "item");
    if (itemElement) {
      if (mode.value === "search") {
        // 项目ID
        let itemId = parseInt(itemElement.getAttribute("item-id"));
        // 查询项目
        let item = getItemById(itemId);
        if (item && item.data) {
          runItem(item);
        }
      } else if (mode.value === "commandLine") {
        // 目标
        commandLineRun(itemElement.getAttribute("target"));
      }
    }
  }
}
// 命令行运行
function commandLineRun(target: string) {
  if (store.setting.quickSearch.openAfterHideQuickSearchWindow) {
    hide();
  }
  commonCommandLineRun(target, value.value);
}
// 运行项目
function runItem(item: Item) {
  if (store.setting.quickSearch.openAfterHideQuickSearchWindow) {
    hide();
  }
  run("quickSearch", "open", item);
}
// 获取placeholder
function getPlaceholder() {
  let text = "Dawn Launcher";
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
// 隐藏窗口
function hide() {
  window.quickSearch.hideWindow();
}
// 监听右键
function contextmenu(e: any) {
  e.preventDefault();
  e.stopPropagation();
  if (mode.value === "search") {
    // 当前项目
    let item: Item | null = null;
    // 判断是在哪个区域右键
    if (getClassElement(e, "item")) {
      // 项目右键
      // 获取项目ID
      let element = getClassElement(e, "item");
      // 项目ID
      let id = parseInt(element.getAttribute("item-id"));
      // 获取项目
      item = convert(getItemById(id));
    }
    if (item) {
      // 弹出菜单
      store.quickSearchItemRightMenuItemId = item.id;
      window.item.showRightMenu({
        item,
        x: e.screenX,
        y: e.screenY,
        type: "quickSearch",
      });
    }
  }
}
// dragover
function dragover(e: any) {
  // 从程序外拖动文件到项目图标上时用此项目打开文件
  if (mode.value === "search" && store.setting.quickSearch.useItemOpen) {
    // 选中效果
    let target = findElement(e.target, "item");
    // 取消选中效果
    let itemList = document.getElementsByClassName("item");
    for (let i = 0; i < itemList.length; i++) {
      const element = itemList[i] as HTMLElement;
      let index = element.getAttribute("index") as any;
      if (
        element.style.backgroundColor &&
        element !== target &&
        selected.value !== parseInt(index)
      ) {
        itemRemoveStyle(element, "item");
      }
    }
    // 选中效果
    if (target) {
      itemHoverStyle(target, "item");
    }
  }
  e.preventDefault();
  e.stopPropagation();
}
// drop
function drop(e: any) {
  if (mode.value === "search") {
    // 尝试获取项目
    let item: Item | null = null;
    let itemElement = findElement(e.target, "item");
    if (itemElement) {
      let id = itemElement.getAttribute("item-id");
      if (id) {
        item = getItemById(parseInt(id));
      }
    }
    // 获取文件列表
    let pathList = [];
    for (const file of e.dataTransfer.files) {
      pathList.push(file.path);
    }
    // 从程序外拖动文件到项目图标上时用此项目打开文件
    if (store.setting.quickSearch.useItemOpen && item && pathList.length > 0) {
      // 如果相同路径则不打开
      if (pathList.length === 1 && pathList[0] === item.data.target) {
        return;
      }
      let params = "";
      for (let i = 0; i < pathList.length; i++) {
        if (i > 0) {
          params += " ";
        }
        params += '"' + pathList[i] + '"';
      }
      if (item.data.params) {
        params += " " + item.data.params;
      }
      let copyItem: Item = convert(item);
      copyItem.data.params = params;
      // 运行
      runItem(copyItem);
    }
  }
  e.preventDefault();
  e.stopPropagation();
}
// keydown
function keydown(e: any) {
  // esc
  if (e.keyCode == 27) {
    hide();
    return;
  }
  // 上下按键 38上 40下
  if (e.keyCode === 38 || e.keyCode === 40) {
    e.preventDefault();
    if (resultList.value && resultList.value.length > 0) {
      if (e.keyCode === 38 && selected.value > 0) {
        selected.value = selected.value - 1;
        searchResultDivMoveScroll("item", 44, "up", selected.value);
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      if (e.keyCode === 40 && selected.value < resultList.value.length - 1) {
        selected.value = selected.value + 1;
        searchResultDivMoveScroll("item", 44, "down", selected.value);
        e.stopPropagation();
        e.preventDefault();
        return;
      }
    }
  }
  // 空格
  if (e.keyCode === 32) {
    if (mode.value !== "webSearch") {
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
              window.quickSearch.setWindowHeight(44);
              e.stopPropagation();
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
          refresh();
          e.stopPropagation();
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
      if (store.setting.quickSearch.openAfterHideQuickSearchWindow) {
        hide();
      }
    } else if (
      mode.value === "search" &&
      resultList.value.length - 1 >= selected.value
    ) {
      runItem(resultList.value[selected.value] as Item);
    } else if (
      mode.value === "commandLine" &&
      resultList.value.length - 1 >= selected.value
    ) {
      commandLineRun(resultList.value[selected.value].data.target!);
    }
    e.stopPropagation();
    e.preventDefault();
  }
  // 退格键
  if (e.keyCode === 8) {
    if (mode.value === "webSearch") {
      if (!value.value || value.value.trim() === "") {
        mode.value = "search";
        webSearchSource.value = null;
        window.quickSearch.setWindowHeight(44);
      }
    } else if (mode.value === "commandLine") {
      if (!value.value || value.value.trim() === "") {
        mode.value = "search";
        resultList.value = [];
        window.quickSearch.setWindowHeight(44);
      }
    }
  }
  if (showHistory.value) {
    // 历史记录使用alt+数字键
    if (
      e.altKey &&
      e.keyCode !== 18 &&
      ((e.keyCode >= 48 && e.keyCode <= 57) ||
        (e.keyCode >= 96 && e.keyCode <= 105))
    ) {
      let index;
      if (e.key === 0) {
        index = 9;
      } else {
        index = e.key - 1;
      }
      if (resultList.value && index < resultList.value.length) {
        runItem(resultList.value[index] as Item);
        e.stopPropagation();
        e.preventDefault();
      }
    }
  } else {
    if (store.setting.quickSearch.openShortcutKey !== "none") {
      let flag = false;
      if (store.setting.quickSearch.openShortcutKey === "numberKey") {
        flag = true;
      } else if (
        store.setting.quickSearch.openShortcutKey === "ctrlNumberKey" &&
        e.ctrlKey &&
        e.keyCode !== 17
      ) {
        flag = true;
      } else if (
        store.setting.quickSearch.openShortcutKey === "altNumberKey" &&
        e.altKey &&
        e.keyCode !== 18
      ) {
        flag = true;
      }
      if (
        flag &&
        ((e.keyCode >= 48 && e.keyCode <= 57) ||
          (e.keyCode >= 96 && e.keyCode <= 105))
      ) {
        // 如果是单纯的数字键需要先搜索一遍数据，如果搜索结果大于等于1条的话，就继续查询，否则的话是立即执行
        if (store.setting.quickSearch.openShortcutKey === "numberKey") {
          let resultList = searchItem(value.value + e.key, searchMap);
          if (resultList && resultList.length > 0) {
            flag = false;
          }
        }
        if (flag) {
          let index;
          if (e.key === 0) {
            index = 9;
          } else {
            index = e.key - 1;
          }
          if (resultList.value && index < resultList.value.length) {
            if (mode.value === "search") {
              runItem(resultList.value[index] as Item);
            } else if (mode.value === "commandLine") {
              commandLineRun(resultList.value[index].data.target!);
            }
            e.stopPropagation();
            e.preventDefault();
          }
        }
      }
    }
  }
}
// 加载完dom后，设置初始化完毕
nextTick(() => {
  window.quickSearch.initFinished();
});
// mouseover
function mouseover(e: any) {
  // 鼠标经过添加样式
  if (getClassElement(e, "item") && !store.quickSearchItemRightMenuItemId) {
    itemHoverStyle(e, "item");
  }
}
// mouseout
function mouseout(e: any) {
  // 鼠标移走删除样式
  if (getClassElement(e, "item") && !store.quickSearchItemRightMenuItemId) {
    let element = getClassElement(e, "item");
    let index = element.getAttribute("index");
    if (selected.value !== parseInt(index)) {
      itemRemoveStyle(e, "item");
    }
  }
}
// 监听
let listens: Array<Function> = [];
// moutned
onMounted(() => {
  window.addEventListener("keydown", keydown, true);
  // 监听显示窗口之前
  listens.push(
    window.quickSearch.onShowWindowBefore((data) => {
      // 查询数据
      getData();
      // 聚焦文本框
      searchInput.value.focus();
      // 刷新DOM完毕执行
      setTimeout(() => {
        // 显示窗口
        window.quickSearch.showWindow();
      }, 10);
    })
  );
  // 清空数据
  listens.push(
    window.quickSearch.onClearData((data) => {
      // 清空数据
      value.value = null;
      resultList.value = [];
      selected.value = 0;
      mode.value = "search";
      webSearchSource.value = null;
    })
  );
  // 监听项目右键菜单关闭
  listens.push(
    window.item.onRightMenuClose((data) => {
      store.quickSearchItemRightMenuItemId = null;
      itemAllRemoveStyle("item", selected.value);
    })
  );
  // 监听项目资源管理器菜单
  listens.push(
    window.item.onExplorerMenu((data) => {
      if (data.type === "quickSearch") {
        store.quickSearchItemRightMenuItemId = data.id;
      }
    })
  );
  // 删除历史记录
  listens.push(
    window.item.onUpdateOpenInfo((data) => {
      let item = getItemById(data.id);
      if (item) {
        item.data.quickSearchOpenNumber = data.quickSearchOpenNumber;
        item.data.quickSearchLastOpen = data.quickSearchLastOpen;
      }
      getHistory();
    })
  );
});
// unmounted
onUnmounted(() => {
  window.removeEventListener("keydown", keydown, true);
  // 删除监听
  unlistens(listens);
});
</script>
<style scoped>
[v-cloak] {
  display: none !important;
}
</style>
