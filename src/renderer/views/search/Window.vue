<template>
  <div
    class="max-h-[525px]"
    style="overflow-x: hidden; text-shadow: none"
    :style="{ backgroundColor: $store.state.setting.appearance.theme.mainBackground, color: $store.state.setting.appearance.theme.fontBasic }"
  >
    <div
      class="flex items-center h-[44px]"
      :class="`${!arrayIsEmpty(resultList) ? 'border-b-[1px] !h-[45px]' : ''}`"
      :style="{ borderColor: $store.state.setting.appearance.theme.border }"
    >
      <div class="mx-2 whitespace-nowrap">
        <svg class="w-[24px] h-[24px] app-region-drag" viewBox="0 96 960 960" v-if="!sourceSearch">
          <path
            fill="currentColor"
            d="M779.385 902.154 528.923 651.693q-30 25.538-69 39.538-39 14-78.385 14-96.1 0-162.665-66.529-66.566-66.529-66.566-162.577t66.529-162.702q66.529-66.654 162.577-66.654 96.049 0 162.702 66.565Q610.769 379.899 610.769 476q0 41.692-14.769 80.692-14.769 39-38.769 66.693l250.462 250.461-28.308 28.308ZM381.538 665.231q79.616 0 134.423-54.808Q570.769 555.615 570.769 476q0-79.615-54.808-134.423-54.807-54.808-134.423-54.808-79.615 0-134.423 54.808Q192.308 396.385 192.308 476q0 79.615 54.807 134.423 54.808 54.808 134.423 54.808Z"
          />
        </svg>
        <span class="text-2xl block app-region-drag" v-else>{{ sourceSearch.name }}</span>
      </div>
      <input
        type="text"
        v-model="nameOne"
        id="nameOne"
        class="w-full resize-none text-2xl pr-2 font-light hover:outline-0 focus-visible:outline-0"
        :style="{ backgroundColor: $store.state.setting.appearance.theme.mainBackground, color: $store.state.setting.appearance.theme.fontBasic }"
        :placeholder="sourceSearch != null && !strIsEmpty(sourceSearch.description) && webSearch ? sourceSearch.description : 'Dawn Launcher'"
      />
      <input
        type="text"
        v-model="nameTwo"
        id="nameTwo"
        class="w-full resize-none text-2xl pr-2 font-light hover:outline-0 focus-visible:outline-0 hidden"
        :style="{ backgroundColor: $store.state.setting.appearance.theme.mainBackground, color: $store.state.setting.appearance.theme.fontBasic }"
        :placeholder="sourceSearch != null && !strIsEmpty(sourceSearch.description) && webSearch ? sourceSearch.description : 'Dawn Launcher'"
      />
    </div>
    <ul
      id="search-result-list"
      class="max-h-[480px]"
      style="overflow-x: hidden"
      v-show="resultList != null && resultList.length > 0"
      @click="parentItemRun($event)"
      @mouseover="parentMouseover($event)"
      @mouseout="parentMouseout($event)"
      data-simplebar
      v-cloak
    >
      <li
        v-for="(item, index) of resultList"
        class="flex items-center p-2 h-[48px] search-result-item"
        :key="'search-item-' + item.id + '-' + index"
        :id="'result-' + index"
        :item-id="item.id"
        :classification-parent-id="String(item.classificationIds).split('-').length == 2 ? item.classificationIds.split('-')[0] : item.classificationId"
        :classification-child-id="String(item.classificationIds).split('-').length == 2 ? item.classificationIds.split('-')[1] : null"
        :item-child="String(item.classificationIds).split('-').length == 2"
        :title="getItemTitle(item)"
        :index="index"
        :style="{ backgroundColor: selected == index ? $hexToRGBA($store.state.setting.appearance.theme.minorBackground, 0.3) : null }"
      >
        <template v-if="item.type != 5 || item.useAppxBackgroundColor == null || !item.useAppxBackgroundColor">
          <div v-if="item.htmlIcon != null" class="w-8 h-8 min-w-[32px] min-h-[32px]" v-html="sanitize(item.htmlIcon)"></div>
          <img v-else :src="getIconByClassification(item)" class="w-8 h-8 min-w-[32px] min-h-[32px]" />
        </template>
        <div v-else class="flex items-center justify-center w-8 h-8 min-w-[32px] min-h-[32px]" style="background-color: rgb(0, 120, 215)">
          <img :src="getIconByClassification(item)" :style="[{ width: 32 - 8 + 'px' }, { height: 32 - 8 + 'px' }]" />
        </div>
        <span class="text-sm ml-2 overflow-hidden text-ellipsis whitespace-nowrap h-[20px] flex-1 pr-[10px]"
          >{{ getItemName(item.name) }}<span class="text-xs ml-2">({{ item.classificationName }})</span></span
        >
        <span
          class="ml-auto text-[12px]"
          v-if="$store.state.setting.quickSearch.openShortcutKey != 'none' && index <= 9"
          :style="{ color: $hexToRGBA($store.state.setting.appearance.theme.fontBasic, 0.5) }"
          >{{
            showHistory
              ? "Alt + "
              : $store.state.setting.quickSearch.openShortcutKey == "numberKey"
              ? $store.state.currentLanguage.numberKey
              : $store.state.setting.quickSearch.openShortcutKey == "ctrlNumberKey"
              ? "Ctrl + "
              : "Alt + "
          }}{{ index + 1 == 10 ? 0 : index + 1 }}</span
        >
      </li>
    </ul>
  </div>
</template>

<script>
import "simplebar";
import "simplebar/dist/simplebar.css";
import IndexJS from "./js/index.js";
import ItemJS from "@/views/item/js";
import ClassificationJS from "@/views/classification/js";
import CommonJS from "@/common";
const { ipcRenderer } = window.require("electron");

export default {
  name: "searchWindow",
  data() {
    return {
      // 数据
      list: [],
      // 名称
      nameOne: null,
      nameTwo: null,
      // 设置
      setting: null,
      // map
      itemMap: null,
      // 显示筛选后的结果
      resultList: null,
      // 选中的结果
      selected: null,
      // 全局watch
      nameWatch: null,
      // 默认使用哪个
      nameSwitch: "nameOne",
      // 搜索模式
      webSearch: false,
      sourceSearch: null,
      // 显示历史记录
      showHistory: false,
    };
  },
  created() {
    // 获取数据
    this.getData(null, null);
    // 获取图标数据
    this.getIconData();
  },
  mounted() {
    // 获取图标数据
    ipcRenderer.on("getIconData", () => {
      this.getIconData();
    });
    // 更新数据
    ipcRenderer.on("searchWindowGetData", () => {
      this.getData(null, null);
    });
    // 隐藏窗口之前
    ipcRenderer.on("hideSearchWindowBefore", () => {
      this.hideWindow();
    });
    // 隐藏窗口之前
    ipcRenderer.on("hideSearchWindowOperation", () => {
      // 判断显示哪个文本框
      document.getElementById("nameOne").style.display = "none";
      document.getElementById("nameTwo").style.display = "none";
      document.getElementById(this.nameSwitch).style.display = "block";
    });
    // 显示窗口时做的操作
    ipcRenderer.on("showSearchWindowOperation", (event, args) => {
      let params = JSON.parse(args);
      // 获取焦点
      document.getElementById(this.nameSwitch).focus();
      // 手动监听name字段
      this.nameWatch = this.$watch(this.nameSwitch, () => {
        this.search();
      });
      // 获取数据
      this.getData(params.setting, params.list);
      this.$nextTick(() => {
        // 计算高度
        let height = this.arrayIsEmpty(this.resultList) ? 0 : this.resultList.length > 9 ? 10 * 48 : this.resultList.length * 48;
        // 显示窗口
        ipcRenderer.send("searchWindowShow", height + 44 + 1);
      });
    });
    // 更新图标数据
    ipcRenderer.on("searchWindowUpdateIconData", (event, args) => {
      // 参数
      let updateIconData = JSON.parse(args);
      if (this.$store.state.iconDataMap == null) {
        this.$store.state.iconDataMap = new Map();
      }
      // 删除
      if (!this.arrayIsEmpty(updateIconData.delete)) {
        for (let del of updateIconData.delete) {
          this.$store.state.iconDataMap.delete(CommonJS.getKey(del.classificationParentId, del.classificationChildId, del.itemId));
        }
      }
      // 添加
      if (!this.arrayIsEmpty(updateIconData.add)) {
        for (let add of updateIconData.add) {
          let icon = {
            classificationParentId: add.classificationParentId,
            classificationChildId: add.classificationChildId,
            itemId: add.itemId,
            icon: add.icon,
          };
          this.$store.state.iconDataMap.set(CommonJS.getKey(add.classificationParentId, add.classificationChildId, add.itemId), icon);
        }
      }
      // 更新
      if (!this.arrayIsEmpty(updateIconData.update)) {
        for (let update of updateIconData.update) {
          let icon = this.$store.state.iconDataMap.get(CommonJS.getKey(update.classificationParentId, update.classificationChildId, update.itemId));
          if (icon != null) {
            icon.icon = update.icon;
            this.$store.state.iconDataMap.set(CommonJS.getKey(update.classificationParentId, update.classificationChildId, update.itemId), icon);
          } else {
            this.$store.state.iconDataMap.set(CommonJS.getKey(update.classificationParentId, update.classificationChildId, update.itemId), update);
          }
        }
      }
    });
    // 键盘按下
    window.addEventListener("keydown", this.keydown, true);
    // 右键菜单
    window.addEventListener("contextmenu", this.rightMenu, true);
    window.addEventListener("dragover", this.dragover, true);
    window.addEventListener("drop", this.drop, true);
  },
  unmounted() {
    window.removeEventListener("keydown", this.keydown, true);
    window.removeEventListener("dragover", this.dragover, true);
    window.removeEventListener("drop", this.drop, true);
  },
  methods: {
    /**
     * 判断数组是否等于空
     */
    arrayIsEmpty: CommonJS.arrayIsEmpty,
    /**
     * 判断字符串是否为空
     */
    strIsEmpty: CommonJS.strIsEmpty,
    /**
     * 过滤XSS
     */
    sanitize: CommonJS.DOMPurify.sanitize,
    /**
     * 获取图标根据分类
     */
    getIconByClassification: CommonJS.getIconByClassification,
    /**
     * 获取项目名称
     */
    getItemName: ItemJS.getName,
    /**
     * 拖拽悬停
     * @param e
     */
    dragover(e) {
      if (this.setting.quickSearch.useItemOpen) {
        // 取消选中效果
        let itemList = document.getElementsByClassName("search-result-item");
        for (let i = 0; i < itemList.length; i++) {
          if (i == this.selected) {
            continue;
          }
          this.$styleMouseout(itemList[i], "search-result-item", ["background-color"]);
        }
        // 选中效果
        this.$styleMouseover(e, "search-result-item", ["background-color"], [this.$hexToRGBA(this.setting.appearance.theme.minorBackground, 0.3)]);
      }
      e.preventDefault();
      e.stopPropagation();
    },
    /**
     * 拖拽释放
     * @param e
     */
    drop(e) {
      if (this.setting.quickSearch.useItemOpen) {
        this.parentItemRun(e);
      }
      e.preventDefault();
      e.stopPropagation();
    },
    /**
     * 获取数据
     */
    getData(setting, list) {
      // 设置
      setting = setting != null ? setting : ipcRenderer.sendSync("getSetting");
      this.setting = setting;
      this.$store.state.setting = setting;
      this.$store.state.currentLanguage = this.$store.state.language[this.$store.state.setting.general.language];
      // 数据
      list = list != null ? list : ipcRenderer.sendSync("getList");
      this.list = list;
      this.$store.state.list = list;
      // 将数据转为Map
      this.itemMap = IndexJS.convertToMap(list);
      // 创建样式
      this.createStyle();
      // 历史记录
      if (this.setting.quickSearch.showHistory) {
        // 获取历史记录
        let resultList = this.getHistory();
        this.resultList = resultList;
        if (!this.arrayIsEmpty(resultList)) {
          this.resetScroll();
          this.showHistory = true;
        }
      }
    },
    /**
     * 获取历史记录
     */
    getHistory() {
      // 默认列表
      if (this.setting.quickSearch.showHistory) {
        // 获取全部项目
        let itemList = [];
        for (let c of this.list) {
          if (c.excludeSearch == null || !c.excludeSearch) {
            if (!this.arrayIsEmpty(c.childList)) {
              for (let cc of c.childList) {
                if (cc.excludeSearch == null || !cc.excludeSearch) {
                  if (!this.arrayIsEmpty(cc.itemList)) {
                    for (let item of cc.itemList) {
                      if (
                        (this.setting.quickSearch.showHistorySort == "openNumber" && item.quickSearchOpenNumber != null) ||
                        (this.setting.quickSearch.showHistorySort == "lastOpen" && item.quickSearchLastOpen != null)
                      ) {
                        item.classificationName = ClassificationJS.getIcon(c) + c.name + "/" + ClassificationJS.getIcon(cc) + cc.name;
                        item.classificationIds = c.id + "-" + cc.id;
                        itemList.push(item);
                      }
                    }
                  }
                }
              }
            } else {
              if (!this.arrayIsEmpty(c.itemList)) {
                for (let item of c.itemList) {
                  if (
                    (this.setting.quickSearch.showHistorySort == "openNumber" && item.quickSearchOpenNumber != null) ||
                    (this.setting.quickSearch.showHistorySort == "lastOpen" && item.quickSearchLastOpen != null)
                  ) {
                    item.classificationName = ClassificationJS.getIcon(c) + c.name;
                    item.classificationIds = c.id;
                    itemList.push(item);
                  }
                }
              }
            }
          }
        }
        // 排序
        if (this.setting.quickSearch.showHistorySort == "openNumber") {
          itemList = ItemJS.sort(itemList, this.setting.quickSearch.showHistorySort, "quickSearchOpenNumber");
          itemList.reverse();
        } else if (this.setting.quickSearch.showHistorySort == "lastOpen") {
          itemList = ItemJS.sort(itemList, this.setting.quickSearch.showHistorySort, "quickSearchLastOpen");
          itemList.reverse();
        }
        // 截取数据
        if (itemList.length > 10) {
          return itemList.slice(0, 10);
        } else {
          return itemList;
        }
      }
      return [];
    },
    /**
     * 重置滚动条
     */
    resetScroll() {
      this.selected = 0;
      this.$nextTick(() => {
        let listEL = document.getElementById("search-result-list");
        if (listEL != null) {
          let sim = listEL.getElementsByClassName("simplebar-content-wrapper")[0];
          if (sim != null) {
            sim.scrollTop = 0;
          }
        }
      });
    },
    /**
     * 设置窗口高度
     */
    setWindowHeight() {
      let height = this.arrayIsEmpty(this.resultList) ? 0 : this.resultList.length > 9 ? 10 * 48 : this.resultList.length * 48;
      ipcRenderer.send("setSearchWindowHeight", height + 44 + 1);
    },
    /**
     * 搜索
     */
    search() {
      let name = this.nameSwitch == "nameOne" ? this.nameOne : this.nameTwo;
      if (!this.webSearch) {
        let resultList = IndexJS.search(name, this.itemMap);
        if (!this.arrayIsEmpty(resultList)) {
          if (this.setting.quickSearch.openNow && resultList.length == 1) {
            this.itemRun(resultList[0]);
            this.showHistory = false;
            return;
          } else {
            this.resultList = resultList;
            this.resetScroll();
            this.showHistory = false;
          }
        } else if (this.strIsEmpty(name)) {
          // 历史记录
          if (this.setting.quickSearch.showHistory) {
            // 获取历史记录
            this.resultList = this.getHistory();
            if (!this.arrayIsEmpty(this.resultList)) {
              this.resetScroll();
              this.showHistory = true;
            }
          } else {
            this.resultList = resultList;
            this.showHistory = false;
          }
        } else {
          this.resultList = resultList;
          this.showHistory = false;
        }
        this.setWindowHeight();
      }
    },
    /**
     * 父级点击运行
     * @param e
     */
    parentItemRun(e) {
      // 找到search-result-item
      let target = this.$getClassElement(e, "search-result-item");
      if (target != null) {
        // 获取分类ID
        let classificationParentId = target.getAttribute("classification-parent-id");
        let classificationChildId = target.getAttribute("classification-child-id");
        // 项目ID
        let itemId = target.getAttribute("item-id");
        // 查询项目
        if (classificationParentId != null && itemId != null) {
          let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
          if (classification != null && !this.arrayIsEmpty(classification.itemList)) {
            let item = ItemJS.getItemById(classification, itemId);
            if (item != null) {
              this.itemRun(item);
            }
          }
        }
      }
    },
    /**
     * 运行项目
     */
    itemRun(item) {
      if (this.setting.quickSearch.openAfterHideQuickSearchWindow) {
        this.hideWindow();
      }
      ItemJS.itemRun(item, null, this.setting.quickSearch.showHistory);
    },
    /**
     * 父级鼠标悬浮
     */
    parentMouseover(e) {
      this.$styleMouseover(e, "search-result-item", ["background-color"], [this.$hexToRGBA(this.$store.state.setting.appearance.theme.minorBackground, 0.3)]);
    },
    /**
     * 父级鼠标离开
     */
    parentMouseout(e) {
      // 获取元素
      let target = this.$getClassElement(e, "search-result-item");
      if (target != null) {
        let index = target.getAttribute("index");
        if (index != null) {
          if (Number(index) != this.selected) {
            this.$styleMouseout(e, "search-result-item", ["background-color"]);
          }
        }
      }
    },
    keydown(e) {
      // name
      let name = this.nameSwitch == "nameOne" ? this.nameOne : this.nameTwo;
      // esc
      if (e.keyCode == 27) {
        this.hideWindow();
        return;
      }
      // 禁止页面刷新
      let sk = CommonJS.setShortcutKey(e, null, false);
      if (!this.strIsEmpty(sk) && (sk.toLowerCase() == "ctrl + r" || sk.toLowerCase() == "ctrl + shift + r" || sk.toLowerCase() == "f5")) {
        e.preventDefault();
        return;
      }
      // 禁止关闭页面
      if (!this.strIsEmpty(sk) && sk.toLowerCase() == "ctrl + w") {
        e.preventDefault();
        return;
      }
      // 上下按键 38上 40下
      if (e.keyCode == 38 || e.keyCode == 40) {
        e.preventDefault();
        if (!this.arrayIsEmpty(this.resultList)) {
          if (e.keyCode == 38 && this.selected > 0) {
            this.selected--;
            this.searchResultDivMoveScroll(0);
            return;
          }
          if (e.keyCode == 40 && this.selected < this.resultList.length - 1) {
            this.selected++;
            this.searchResultDivMoveScroll(1);
            return;
          }
        }
      }
      // 空格
      if (e.keyCode == 32) {
        if (!this.webSearch) {
          // 判断是否是搜索引擎
          if (!this.strIsEmpty(name)) {
            let flag = false;
            if (this.$store.state.setting.webSearch.mode == 0) {
              if (name.substring(0, 1) == ":") {
                flag = true;
              }
            } else if (this.$store.state.setting.webSearch.mode == 1) {
              flag = true;
            }
            if (flag) {
              let keyword = this.$store.state.setting.webSearch.mode == 0 ? name.substring(1) : name;
              for (let searchSource of this.$store.state.setting.webSearch.searchSourceList) {
                if (keyword == searchSource.keyword) {
                  this.webSearch = true;
                  this.sourceSearch = searchSource;
                  if (this.nameSwitch == "nameOne") {
                    this.nameOne = null;
                  } else {
                    this.nameTwo = null;
                  }
                  this.resultList = null;
                  this.selected = null;
                  ipcRenderer.send("setSearchWindowHeight", 44 + 1);
                  e.preventDefault();
                }
              }
            }
          }
        }
      }
      // enter
      if (e.keyCode == 13) {
        e.preventDefault();
        if (this.webSearch) {
          let URL = this.sourceSearch.URL.replace("{w}", name == null ? "" : name);
          ipcRenderer.send("openUrl", URL);
          this.hideWindow();
        } else {
          if (this.selected != null && this.resultList.length - 1 >= this.selected) {
            this.itemRun(this.resultList[this.selected]);
          }
        }
      }
      // 退格键
      if (e.keyCode == 8) {
        if (this.webSearch) {
          if (name == null || name == "") {
            this.webSearch = false;
            this.sourceSearch = null;
          }
        }
      }
      if (this.showHistory) {
        // 历史记录使用alt+数字键
        if (e.altKey && e.keyCode != 18 && ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105))) {
          let index;
          if (e.key == 0) {
            index = 9;
          } else {
            index = e.key - 1;
          }
          if (!this.arrayIsEmpty(this.resultList) && index < this.resultList.length) {
            this.itemRun(this.resultList[index]);
            e.preventDefault();
          }
        }
      } else {
        if (this.$store.state.setting.quickSearch.openShortcutKey != "none") {
          let flag = false;
          if (this.$store.state.setting.quickSearch.openShortcutKey == "numberKey") {
            flag = true;
          } else if (this.$store.state.setting.quickSearch.openShortcutKey == "ctrlNumberKey" && e.ctrlKey && e.keyCode != 17) {
            flag = true;
          } else if (this.$store.state.setting.quickSearch.openShortcutKey == "altNumberKey" && e.altKey && e.keyCode != 18) {
            flag = true;
          }
          if (flag && ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105))) {
            // 如果是单纯的数字键需要先搜索一遍数据，如果搜索结果大于等于1条的话，就继续查询，否则的话是立即执行
            if (this.$store.state.setting.quickSearch.openShortcutKey == "numberKey") {
              let resultList = IndexJS.search(name + e.key, this.itemMap);
              if (resultList != null && resultList.length > 0) {
                flag = false;
              }
            }
            if (flag) {
              let index;
              if (e.key == 0) {
                index = 9;
              } else {
                index = e.key - 1;
              }
              if (!this.arrayIsEmpty(this.resultList) && index < this.resultList.length) {
                this.itemRun(this.resultList[index]);
                e.preventDefault();
              }
            }
          }
        }
      }
    },
    /**
     * 移动滚动条
     * @param type 0上 1下
     */
    searchResultDivMoveScroll(type) {
      let itemEl = document.getElementById("result-" + this.selected);
      let itemRect = itemEl.getBoundingClientRect();
      let listEL = document.getElementById("search-result-list");
      let realY = itemRect.y - 44 - 1 + 48;
      if (type == 0) {
        if (realY < 48) {
          let sim = listEL.getElementsByClassName("simplebar-content-wrapper")[0];
          sim.scrollTop = sim.scrollTop - (48 - realY);
        }
      } else {
        if (realY > listEL.clientHeight) {
          let sim = listEL.getElementsByClassName("simplebar-content-wrapper")[0];
          sim.scrollTop = sim.scrollTop + (realY - listEL.clientHeight);
        }
      }
    },
    /**
     * 右键菜单
     */
    rightMenu(e) {
      e.preventDefault();
      // 判断当前元素是不是文本框，如果是文本框右键的话，就显示剪切、复制、粘贴菜单
      if (
        (e.target.nodeName != null && e.target.nodeName.toLowerCase() == "input" && e.target.type != null && e.target.type.toLowerCase() == "text") ||
        (e.target.nodeName != null && e.target.nodeName.toLowerCase() == "textarea")
      ) {
        ipcRenderer.send("textRightMenu");
        return;
      }
      // 获取右键的元素
      let { element, classificationParentId, classificationChildId, itemId } = this.getRightClickElementInfo(e);
      // 为空不继续执行
      if (this.strIsEmpty(element)) {
        return;
      }
      // 查询分类
      let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
      // 调用相应的菜单
      if (element == "item" || element == "item-child") {
        // 获取分类下的项目
        let item = ItemJS.getItemById(classification, itemId);
        ipcRenderer.send(
          "itemRightMenu",
          JSON.stringify({
            item: item,
            classificationChildId: classificationChildId,
            classificationParentId: classificationParentId,
            showClearItem: false,
            searchWindow: true,
            x: e.screenX,
            y: e.screenY,
            isMapDirectory: !this.strIsEmpty(classification.mapDirectory),
            aggregate: classification.type != null && classification.type == 1,
          })
        );
      }
    },
    /**
     * 获取右键元素的属性
     */
    getRightClickElementInfo(e) {
      let element;
      let classificationParentId;
      let classificationChildId;
      let itemId;
      for (let i = 0; i < e.path.length; i++) {
        if (e.path[i].attributes == null) {
          continue;
        }
        if (e.path[i].getAttribute("item-child") != null && e.path[i].getAttribute("item-child") == "false") {
          // 父级分类下某个项目右键
          element = "item";
          classificationParentId = e.path[i].getAttribute("classification-parent-id");
          itemId = e.path[i].getAttribute("item-id");
          break;
        } else if (e.path[i].getAttribute("item-child") != null && e.path[i].getAttribute("item-child") == "true") {
          // 子级分类下某个项目右键
          element = "item-child";
          classificationParentId = e.path[i].getAttribute("classification-parent-id");
          classificationChildId = e.path[i].getAttribute("classification-child-id");
          itemId = e.path[i].getAttribute("item-id");
          break;
        }
      }
      return {
        element,
        classificationParentId,
        classificationChildId,
        itemId,
      };
    },
    getItemTitle: ItemJS.getItemTitle,
    /**
     * 隐藏窗口
     */
    hideWindow() {
      // 取消监听
      if (this.nameWatch != null) {
        this.nameWatch();
      }
      if (this.nameSwitch == "nameOne") {
        this.nameSwitch = "nameTwo";
      } else {
        this.nameSwitch = "nameOne";
      }
      this.nameOne = null;
      this.nameTwo = null;
      this.resultList = null;
      this.selected = null;
      this.webSearch = false;
      this.sourceSearch = null;
      ipcRenderer.send("hideSearchWindow");
    },
    /**
     * 创建样式
     */
    createStyle() {
      // 找到要删除的 style 标签
      let styleElement = document.getElementById("placeholder-style");
      // 如果找到了 style 标签，则从其父节点中移除
      if (styleElement) {
        styleElement.parentNode.removeChild(styleElement);
      }
      // 创建一个新的伪类样式规则
      let style = document.createElement("style");
      style.setAttribute("id", "placeholder-style");
      style.type = "text/css";
      // 设置伪类样式规则的内容
      style.innerHTML =
        "#nameOne::placeholder {" +
        "color: " +
        this.$store.state.setting.appearance.theme.fontBasic +
        ";" +
        "}" +
        "#nameTwo::placeholder {" +
        "color: " +
        this.$store.state.setting.appearance.theme.fontBasic +
        ";" +
        "}";
      // 将伪类样式规则添加到 head 元素中
      document.head.appendChild(style);

      // 找到要删除的 style 标签
      let scrollStyleElement = document.getElementById("scroll-style");
      // 如果找到了 style 标签，则从其父节点中移除
      if (scrollStyleElement) {
        scrollStyleElement.parentNode.removeChild(scrollStyleElement);
      }
      // 创建一个新的伪类样式规则
      scrollStyleElement = document.createElement("style");
      scrollStyleElement.setAttribute("id", "scroll-style");
      scrollStyleElement.type = "text/css";
      // 设置伪类样式规则的内容
      scrollStyleElement.innerHTML =
        ".simplebar-scrollbar::before {" +
        "  background-color: " +
        this.$store.state.setting.appearance.theme.minorBackground +
        ";" +
        "  right: 0;" +
        "}" +
        "textarea::-webkit-scrollbar-thumb {" +
        "  background-color: " +
        this.$store.state.setting.appearance.theme.minorBackground +
        ";" +
        "border-radius: 7px;" +
        "}";
      // 将伪类样式规则添加到 head 元素中
      document.head.appendChild(scrollStyleElement);
    },
    /**
     * 获取图标数据
     */
    getIconData() {
      let iconData = ipcRenderer.sendSync("getIconData");
      this.$store.state.iconDataMap = new Map();
      for (let icon of iconData) {
        this.$store.state.iconDataMap.set(CommonJS.getKey(icon.classificationParentId, icon.classificationChildId, icon.itemId), icon);
      }
    },
  },
};
</script>
<style>
[v-cloak] {
  display: none;
}
</style>
