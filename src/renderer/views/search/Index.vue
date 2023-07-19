<template>
  <div
    id="search"
    class="top-[34px] fixed z-10 w-4/5 drop-shadow-[0_0_6px_rgba(0,0,0,0.2)]"
    style="text-shadow: none"
    :style="{
      color: $store.state.setting.appearance.theme.fontBasic,
      backgroundColor: $store.state.setting.appearance.theme.mainBackground,
      borderRadius: $store.state.setting.appearance.backgroundTransparency < 1 && $store.state.setting.appearance.windowRoundedCorners ? '8px' : null,
    }"
  >
    <div
      class="flex items-center h-[34px]"
      :class="`${!arrayIsEmpty(resultList) ? 'border-b-[1px] !h-[35px]' : ''}`"
      :style="{ borderColor: $store.state.setting.appearance.theme.border }"
    >
      <div class="mx-2 whitespace-nowrap">
        <svg class="w-[18px] h-[18px]" :style="{ color: $store.state.setting.appearance.theme.fontBasic }" viewBox="0 0 24 24" v-if="!sourceSearch">
          <path
            fill="currentColor"
            d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
          />
        </svg>
        <span class="text-sm block" v-else>{{ sourceSearch.name }}</span>
      </div>
      <input
        type="text"
        v-model="name"
        ref="searchInput"
        class="w-full resize-none text-sm py-1 hover:outline-0 focus-visible:outline-0"
        :style="{
          color: $store.state.setting.appearance.theme.fontBasic,
          backgroundColor: $store.state.setting.appearance.theme.mainBackground,
          borderColor: $store.state.setting.appearance.theme.border,
        }"
      />
      <Close @click="close" :key="'close-' + $store.state.setting.appearance.theme.name"></Close>
    </div>
    <ul
      id="search-result-list"
      style="overflow-x: hidden"
      @click="parentItemRun($event)"
      @mouseover="parentMouseover($event)"
      @mouseout="parentMouseout($event)"
      data-simplebar
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
        <span class="text-sm ml-2 overflow-hidden text-ellipsis whitespace-nowrap h-[20px]"
          >{{ getItemName(item.name) }}<span class="text-xs ml-2">({{ item.classificationName }})</span></span
        >
      </li>
    </ul>
  </div>
</template>

<script>
import "simplebar";
import "simplebar/dist/simplebar.css";
import ItemJS from "@/views/item/js/index.js";
import CommonJS from "@/common";
import Close from "@/components/Close";
import IndexJS from "./js/index.js";
import ClassificationJS from "@/views/classification/js/index.js";
const { ipcRenderer } = window.require("electron");

export default {
  name: "SearchIndex",
  components: { Close },
  props: {
    show: {
      type: Boolean,
    },
  },
  data() {
    return {
      // 名称
      name: null,
      // map
      itemMap: null,
      // 显示筛选后的结果
      resultList: null,
      // 选中的结果
      selected: null,
      // 搜索模式
      webSearch: false,
      sourceSearch: null,
    };
  },
  created() {
    this.itemMap = IndexJS.convertToMap(this.$store.state.list);
  },
  mounted() {
    this.$nextTick(() => {
      // 输入框默认获取焦点
      this.$refs.searchInput.focus();
    });
    this.resize();
    window.addEventListener("resize", this.resize, true);
    window.addEventListener("keydown", this.keydown, true);
  },
  unmounted() {
    window.removeEventListener("resize", this.resize, true);
    window.removeEventListener("keydown", this.keydown, true);
  },
  watch: {
    name() {
      this.search();
    },
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
     * 重新设置宽高
     */
    resize() {
      // body
      let body = document.querySelector("body");
      // search
      let search = document.getElementById("search");
      // result
      let result = document.getElementById("search-result-list");
      // 设置整个搜索模块居中
      search.style.left = (body.clientWidth - search.clientWidth) / 2 + "px";
      // 设置搜索结果高度
      if (result != null) {
        // 高度
        result.style.maxHeight = body.clientHeight - 70 * 2 + "px";
      }
    },
    /**
     * 搜索
     */
    search() {
      if (!this.webSearch) {
        this.resultList = IndexJS.search(this.name, this.itemMap);
        if (!this.arrayIsEmpty(this.resultList)) {
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
        }
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
      ItemJS.itemRun(item, null);
      this.close();
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
    /**
     * 关闭
     */
    close() {
      this.webSearch = false;
      this.sourceSearch = null;
      this.$emit("update:show", false);
    },
    keydown(e) {
      // 提取快捷键
      let shortcutKey = CommonJS.setShortcutKey(e, null, false);
      // 隐藏搜索框
      if (this.$store.state.setting != null) {
        if (this.$store.state.setting.item != null) {
          if (this.$store.state.setting.item.searchShortcutKey != null && shortcutKey == this.$store.state.setting.item.searchShortcutKey) {
            this.close();
            e.preventDefault();
            return;
          }
        }
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
          if (!this.strIsEmpty(this.name)) {
            let flag = false;
            if (this.$store.state.setting.webSearch.mode == 0) {
              if (this.name.substring(0, 1) == ":") {
                flag = true;
              }
            } else if (this.$store.state.setting.webSearch.mode == 1) {
              flag = true;
            }
            if (flag) {
              let keyword = this.$store.state.setting.webSearch.mode == 0 ? this.name.substring(1) : this.name;
              for (let searchSource of this.$store.state.setting.webSearch.searchSourceList) {
                if (keyword == searchSource.keyword) {
                  this.webSearch = true;
                  this.sourceSearch = searchSource;
                  this.name = null;
                  this.resultList = null;
                  this.selected = null;
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
          let URL = this.sourceSearch.URL.replace("{w}", this.name == null ? "" : this.name);
          ipcRenderer.send("openUrl", URL);
          this.close();
        } else {
          if (this.selected != null && this.resultList.length - 1 >= this.selected) {
            this.itemRun(this.resultList[this.selected]);
          }
        }
      }
      // 退格键
      if (e.keyCode == 8) {
        if (this.webSearch) {
          if (this.name == null || this.name == "") {
            this.webSearch = false;
            this.sourceSearch = null;
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
      let realY = itemRect.y - 34 - 34 - 1 + 48;
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
    getItemTitle: ItemJS.getItemTitle,
  },
};
</script>

<style scoped></style>
