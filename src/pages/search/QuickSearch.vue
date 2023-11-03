<template>
  <div
    class="overflow-x-hidden max-h-[525px]"
    style="text-shadow: none"
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
      <div class="mx-2 whitespace-nowrap flex items-center">
        <svg
          class="w-[24px] h-[24px] app-region-drag"
          viewBox="0 96 960 960"
          v-if="!webSearch"
        >
          <path
            fill="currentColor"
            d="M779.385 902.154 528.923 651.693q-30 25.538-69 39.538-39 14-78.385 14-96.1 0-162.665-66.529-66.566-66.529-66.566-162.577t66.529-162.702q66.529-66.654 162.577-66.654 96.049 0 162.702 66.565Q610.769 379.899 610.769 476q0 41.692-14.769 80.692-14.769 39-38.769 66.693l250.462 250.461-28.308 28.308ZM381.538 665.231q79.616 0 134.423-54.808Q570.769 555.615 570.769 476q0-79.615-54.808-134.423-54.807-54.808-134.423-54.808-79.615 0-134.423 54.808Q192.308 396.385 192.308 476q0 79.615 54.807 134.423 54.808 54.808 134.423 54.808Z"
          />
        </svg>
        <span
          class="text-2xl block app-region-drag"
          v-else-if="webSearch && webSearchSource"
          >{{ webSearchSource.name }}</span
        >
      </div>
      <input
        ref="searchInput"
        type="text"
        v-model="value"
        class="w-full resize-none text-2xl font-light hover:outline-0 focus-visible:outline-0"
        :style="{
          backgroundColor: store.setting.appearance.theme.mainBackgroundColor,
          color: store.setting.appearance.theme.mainFontColor,
        }"
        placeholder="Dawn Launcher"
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
        class="item flex items-center px-2 h-[48px]"
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
      >
        <CustomItemIcon :item="(item as Item)" :icon-size="32"></CustomItemIcon>
        <span
          class="text-sm ml-2 overflow-hidden text-ellipsis whitespace-nowrap h-[20px] flex-1 pr-[10px]"
          >{{ getName(item.name)
          }}<span class="text-xs ml-2">{{
            getSearchItemClassificationName((item as Item).classificationId)
          }}</span></span
        >
        <span
          class="ml-auto text-[12px]"
          v-if="
            store.setting.quickSearch.openShortcutKey !== 'none' && index <= 9
          "
          :style="{
            color: hexToRGBA(store.setting.appearance.theme.mainFontColor, 0.7),
          }"
          >{{
            showHistory
              ? "Alt + "
              : store.setting.quickSearch.openShortcutKey === "numberKey"
              ? store.language.numberKey
              : store.setting.quickSearch.openShortcutKey === "ctrlNumberKey"
              ? "Ctrl + "
              : "Alt + "
          }}{{ index + 1 === 10 ? 0 : index + 1 }}</span
        >
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
import { itemAllRemoveStyle, searchResultDivMoveScroll } from "./js/index";
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
let webSearch = ref(false);
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
  if (!webSearch.value) {
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
// 父级运行项目
function parentRunItem(e: any) {
  // 找到item
  let itemElement = getClassElement(e, "item");
  if (itemElement) {
    // 项目ID
    let itemId = parseInt(itemElement.getAttribute("item-id"));
    // 查询项目
    let item = getItemById(itemId);
    if (item && item.data) {
      runItem(item);
    }
  }
}
// 运行项目
function runItem(item: Item) {
  if (store.setting.quickSearch.openAfterHideQuickSearchWindow) {
    hide();
  }
  run("quickSearch", "open", item);
}
// 隐藏窗口
function hide() {
  window.quickSearch.hideWindow();
}
// 监听右键
function contextmenu(e: any) {
  e.preventDefault();
  e.stopPropagation();
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
// dragover
function dragover(e: any) {
  // 从程序外拖动文件到项目图标上时用此项目打开文件
  if (store.setting.quickSearch.useItemOpen) {
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
    if (!webSearch.value) {
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
              webSearch.value = true;
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
  }
  // enter
  if (e.keyCode === 13) {
    if (webSearch.value && webSearchSource.value) {
      let url = webSearchSource.value.url.replace("{w}", value.value ?? "");
      window.api.openURL(url);
      if (store.setting.quickSearch.openAfterHideQuickSearchWindow) {
        hide();
      }
    } else if (
      !webSearch.value &&
      resultList.value.length - 1 >= selected.value
    ) {
      runItem(resultList.value[selected.value] as Item);
    }
    e.stopPropagation();
    e.preventDefault();
  }
  // 退格键
  if (e.keyCode === 8) {
    if (webSearch.value) {
      if (!value.value || value.value.trim() === "") {
        webSearch.value = false;
        webSearchSource.value = null;
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
            runItem(resultList.value[index] as Item);
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
      nextTick(() => {
        setTimeout(() => {
          // 显示窗口
          window.quickSearch.showWindow();
        }, 100);
      });
    })
  );
  // 清空数据
  listens.push(
    window.quickSearch.onClearData((data) => {
      // 清空数据
      value.value = null;
      resultList.value = [];
      selected.value = 0;
      webSearch.value = false;
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
