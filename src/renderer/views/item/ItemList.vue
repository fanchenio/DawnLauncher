<template>
  <div
    class="item-list flex flex-wrap pb-1 w-full min-h-[20px]"
    :class="classificationChildItem ? 'pt-1' : ''"
    :classification-child-id="classificationChildId"
    :classification-child-item="classificationChildItem"
    :style="{ fontSize: $store.state.setting.item.fontSize + 'px' }"
    @click="parentItemRun($event, false)"
    @dblclick="parentItemRun($event, true)"
    @mouseover="itemMouseover"
    @mouseout="itemMouseout"
  >
    <template v-if="(layout != null && layout == 'tile') || ($store.state.setting.item.layout == 'tile' && (layout == null || layout == 'default'))">
      <template v-for="(item, index) of itemList">
        <div
          class="item"
          :style="[{ height: 'auto' }]"
          :key="'item-' + item.id + '-' + index"
          :item-id="item.id"
          :classification-parent-id="item.classificationParentId != null ? item.classificationParentId : item.classificationId"
          :classification-child-id="item.classificationParentId != null ? item.classificationId : null"
          :aggregate-classification-parent-id="aggregate ? classificationParentId : null"
          :aggregate-classification-child-id="aggregate ? classificationChildId : null"
          draggable="true"
          :title="getItemTitle(item)"
          v-if="showOnly == null || showOnly == 'default' || (showOnly == 'file' && item.type != 1) || (showOnly == 'folder' && item.type == 1)"
        >
          <div
            class="rounded mb-[1px] mr-[1px] inner-item"
            :class="[`${$store.state.setting.item.hideItemName ? 'py-3' : 'py-2'}`]"
            :item-id="item.id"
            :classification-parent-id="item.classificationParentId != null ? item.classificationParentId : item.classificationId"
            :classification-child-id="item.classificationParentId != null ? item.classificationId : null"
            :item-child="itemChild"
            :aggregate-classification-parent-id="aggregate ? classificationParentId : null"
            :aggregate-classification-child-id="aggregate ? classificationChildId : null"
            :style="{ backgroundColor: isMultiItem(item.id) ? $hexToRGBA($store.state.setting.appearance.theme.minorBackground, 0.3) : null }"
          >
            <template v-if="item.type != 5 || item.useAppxBackgroundColor == null || !item.useAppxBackgroundColor">
              <svg
                v-if="isInvalidItem(item)"
                class="icon mx-auto"
                viewBox="0 0 1024 1024"
                :style="[
                  { width: getIconSize() + 'px' },
                  { height: getIconSize() + 'px' },
                  { minWidth: getIconSize() + 'px' },
                  { minHeight: getIconSize() + 'px' },
                  {
                    filter: $store.state.setting.appearance.useFontShadow
                      ? 'drop-shadow(1px 1px 1px ' + $store.state.setting.appearance.fontShadow + ')'
                      : null,
                  },
                ]"
              >
                <path
                  d="M969.182003 701.303054C942.98583 761.818425 907.560805 814.394635 862.909139 859.030351 818.273423 903.682017 765.86402 939.121773 705.727336 965.303215 645.576031 991.515341 581.182839 1004.606061 512.545547 1004.606061 443.925315 1004.606061 379.349482 991.515341 318.818158 965.303215 258.302785 939.121773 205.726577 903.682017 161.090861 859.030351 116.439196 814.393527 80.999438 761.818425 54.817996 701.303054 28.605873 640.772838 15.515152 576.197117 15.515152 507.575665 15.515152 438.938373 28.605873 374.545181 54.817996 314.393878 80.999438 254.257304 116.439196 201.8479 161.090861 157.212073 205.726577 112.560409 258.302785 77.135381 318.818158 50.939208 379.349482 24.743034 443.925203 11.636364 512.545547 11.636364 581.182839 11.636364 645.576031 24.742924 705.727336 50.939208 765.8628 77.1366 818.273311 112.560409 862.909139 157.212073 907.560805 201.848897 942.984611 254.258412 969.182003 314.393878 995.378179 374.545181 1008.484848 438.938373 1008.484848 507.575665 1008.484848 576.197117 995.379287 640.772838 969.182003 701.303054L969.182003 701.303054Z"
                  fill="#d81e06"
                  data-spm-anchor-id="a313x.7781069.0.i1"
                  class="selected"
                ></path>
                <path
                  d="M512 709.220647C472.332325 709.220647 440.203301 741.349668 440.203301 781.017346 440.203301 820.68502 472.332325 852.814044 512 852.814044 551.667675 852.814044 583.796699 820.68502 583.796699 781.017346 583.796699 741.349668 551.667675 709.220647 512 709.220647L512 709.220647Z"
                  fill="#FFFFFF"
                ></path>
                <path
                  d="M512 639.709091C492.184111 639.709091 476.101651 606.196596 476.101651 564.820837L440.203301 227.823683C440.203301 186.447921 472.332325 152.935427 512 152.935427 551.667675 152.935427 583.796699 186.447921 583.796699 227.823683L547.898349 564.820837C547.898349 606.196596 531.815889 639.709091 512 639.709091L512 639.709091Z"
                  fill="#FFFFFF"
                ></path>
              </svg>
              <template v-else>
                <div
                  v-if="item.htmlIcon != null"
                  class="mx-auto"
                  :style="[
                    { width: getIconSize() + 'px' },
                    { height: getIconSize() + 'px' },
                    { minWidth: getIconSize() + 'px' },
                    { minHeight: getIconSize() + 'px' },
                    {
                      filter: $store.state.setting.appearance.useFontShadow
                        ? 'drop-shadow(1px 1px 1px ' + $store.state.setting.appearance.fontShadow + ')'
                        : null,
                    },
                  ]"
                  v-html="sanitize(item.htmlIcon)"
                ></div>
                <img
                  v-else
                  :src="getIcon(classificationParentId, classificationChildId, item)"
                  class="mx-auto"
                  :style="[
                    { width: getIconSize() + 'px' },
                    { height: getIconSize() + 'px' },
                    { minWidth: getIconSize() + 'px' },
                    { minHeight: getIconSize() + 'px' },
                    {
                      filter: $store.state.setting.appearance.useFontShadow
                        ? 'drop-shadow(1px 1px 1px ' + $store.state.setting.appearance.fontShadow + ')'
                        : null,
                    },
                  ]"
                />
              </template>
            </template>
            <template v-else>
              <div
                class="mx-auto flex items-center justify-center"
                style="background-color: rgb(0, 120, 215)"
                :style="[
                  { width: getIconSize() + 'px' },
                  { height: getIconSize() + 'px' },
                  { minWidth: getIconSize() + 'px' },
                  { minHeight: getIconSize() + 'px' },
                  {
                    filter: $store.state.setting.appearance.useFontShadow
                      ? 'drop-shadow(1px 1px 1px ' + $store.state.setting.appearance.fontShadow + ')'
                      : null,
                  },
                ]"
              >
                <img
                  :src="getIcon(classificationParentId, classificationChildId, item)"
                  :style="[{ width: getIconSize() - 8 + 'px' }, { height: getIconSize() - 8 + 'px' }]"
                />
              </div>
            </template>
            <p
              class="text-center mt-2 mx-2"
              :class="[
                `${
                  $store.state.setting.item.itemNameRowCount == 2
                    ? $store.state.setting.item.hideEllipsis
                      ? 'item-name-tile-2-no-ellipsis'
                      : 'item-name-tile-2'
                    : $store.state.setting.item.hideEllipsis
                    ? 'item-name-tile-1-no-ellipsis'
                    : 'item-name-tile-1'
                }`,
              ]"
              :style="{
                filter: $store.state.setting.appearance.useFontShadow ? 'drop-shadow(1px 1px 1px ' + $store.state.setting.appearance.fontShadow + ')' : null,
                fontWeight: $store.state.setting.item.fontWeight,
                lineHeight: $store.state.setting.item.fontLineHeight + 'rem',
              }"
              v-if="!$store.state.setting.item.hideItemName"
            >
              <template v-for="(text, tIndex) of item.name.split('\\n')">
                {{ text }}
                <br v-if="item.name.split('\\n').length > 1 && tIndex < item.name.split('\\n').length - 1" />
              </template>
            </p>
          </div>
        </div>
      </template>
    </template>
    <template v-else-if="(layout != null && layout == 'list') || ($store.state.setting.item.layout == 'list' && (layout == null || layout == 'default'))">
      <template v-for="(item, index) of itemList">
        <div
          class="item"
          :style="[{ height: !$store.state.setting.item.hideItemName ? 16 + 1 + getIconSize() + 'px' : 'auto' }]"
          :key="'item-' + item.id + '-' + index"
          :item-id="item.id"
          :classification-parent-id="item.classificationParentId != null ? item.classificationParentId : item.classificationId"
          :classification-child-id="item.classificationParentId != null ? item.classificationId : null"
          :item-child="itemChild"
          :aggregate-classification-parent-id="aggregate ? classificationParentId : null"
          :aggregate-classification-child-id="aggregate ? classificationChildId : null"
          draggable="true"
          :title="getItemTitle(item)"
          v-if="showOnly == null || showOnly == 'default' || (showOnly == 'file' && item.type != 1) || (showOnly == 'folder' && item.type == 1)"
        >
          <div
            class="rounded flex items-center mb-[1px] mr-[1px] inner-item"
            :class="[`${$store.state.setting.item.hideItemName ? 'py-3' : 'p-2'}`]"
            :item-id="item.id"
            :classification-parent-id="item.classificationParentId != null ? item.classificationParentId : item.classificationId"
            :classification-child-id="item.classificationParentId != null ? item.classificationId : null"
            :aggregate-classification-parent-id="aggregate ? classificationParentId : null"
            :aggregate-classification-child-id="aggregate ? classificationChildId : null"
            :style="{ backgroundColor: isMultiItem(item.id) ? $hexToRGBA($store.state.setting.appearance.theme.minorBackground, 0.3) : null }"
          >
            <template v-if="item.type != 5 || item.useAppxBackgroundColor == null || !item.useAppxBackgroundColor">
              <svg
                v-if="isInvalidItem(item)"
                class="icon"
                :class="[`${$store.state.setting.item.hideItemName ? 'mx-auto' : ''}`]"
                viewBox="0 0 1024 1024"
                :style="[
                  { width: getIconSize() + 'px' },
                  { height: getIconSize() + 'px' },
                  { minWidth: getIconSize() + 'px' },
                  { minHeight: getIconSize() + 'px' },
                  {
                    filter: $store.state.setting.appearance.useFontShadow
                      ? 'drop-shadow(1px 1px 1px ' + $store.state.setting.appearance.fontShadow + ')'
                      : null,
                  },
                ]"
              >
                <path
                  d="M969.182003 701.303054C942.98583 761.818425 907.560805 814.394635 862.909139 859.030351 818.273423 903.682017 765.86402 939.121773 705.727336 965.303215 645.576031 991.515341 581.182839 1004.606061 512.545547 1004.606061 443.925315 1004.606061 379.349482 991.515341 318.818158 965.303215 258.302785 939.121773 205.726577 903.682017 161.090861 859.030351 116.439196 814.393527 80.999438 761.818425 54.817996 701.303054 28.605873 640.772838 15.515152 576.197117 15.515152 507.575665 15.515152 438.938373 28.605873 374.545181 54.817996 314.393878 80.999438 254.257304 116.439196 201.8479 161.090861 157.212073 205.726577 112.560409 258.302785 77.135381 318.818158 50.939208 379.349482 24.743034 443.925203 11.636364 512.545547 11.636364 581.182839 11.636364 645.576031 24.742924 705.727336 50.939208 765.8628 77.1366 818.273311 112.560409 862.909139 157.212073 907.560805 201.848897 942.984611 254.258412 969.182003 314.393878 995.378179 374.545181 1008.484848 438.938373 1008.484848 507.575665 1008.484848 576.197117 995.379287 640.772838 969.182003 701.303054L969.182003 701.303054Z"
                  fill="#d81e06"
                  data-spm-anchor-id="a313x.7781069.0.i1"
                  class="selected"
                ></path>
                <path
                  d="M512 709.220647C472.332325 709.220647 440.203301 741.349668 440.203301 781.017346 440.203301 820.68502 472.332325 852.814044 512 852.814044 551.667675 852.814044 583.796699 820.68502 583.796699 781.017346 583.796699 741.349668 551.667675 709.220647 512 709.220647L512 709.220647Z"
                  fill="#FFFFFF"
                ></path>
                <path
                  d="M512 639.709091C492.184111 639.709091 476.101651 606.196596 476.101651 564.820837L440.203301 227.823683C440.203301 186.447921 472.332325 152.935427 512 152.935427 551.667675 152.935427 583.796699 186.447921 583.796699 227.823683L547.898349 564.820837C547.898349 606.196596 531.815889 639.709091 512 639.709091L512 639.709091Z"
                  fill="#FFFFFF"
                ></path>
              </svg>
              <template v-else>
                <div
                  v-if="item.htmlIcon != null"
                  :class="[`${$store.state.setting.item.hideItemName ? 'mx-auto' : ''}`]"
                  :style="[
                    { width: getIconSize() + 'px' },
                    { height: getIconSize() + 'px' },
                    { minWidth: getIconSize() + 'px' },
                    { minHeight: getIconSize() + 'px' },
                    {
                      filter: $store.state.setting.appearance.useFontShadow
                        ? 'drop-shadow(1px 1px 1px ' + $store.state.setting.appearance.fontShadow + ')'
                        : null,
                    },
                  ]"
                  v-html="sanitize(item.htmlIcon)"
                ></div>
                <img
                  v-else
                  :src="getIcon(classificationParentId, classificationChildId, item)"
                  :class="[`${$store.state.setting.item.hideItemName ? 'mx-auto' : ''}`]"
                  :style="[
                    { width: getIconSize() + 'px' },
                    { height: getIconSize() + 'px' },
                    { minWidth: getIconSize() + 'px' },
                    { minHeight: getIconSize() + 'px' },
                    {
                      filter: $store.state.setting.appearance.useFontShadow
                        ? 'drop-shadow(1px 1px 1px ' + $store.state.setting.appearance.fontShadow + ')'
                        : null,
                    },
                  ]"
                />
              </template>
            </template>
            <template v-else>
              <div
                class="flex items-center justify-center"
                style="background-color: rgb(0, 120, 215)"
                :style="[
                  { width: getIconSize() + 'px' },
                  { height: getIconSize() + 'px' },
                  { minWidth: getIconSize() + 'px' },
                  { minHeight: getIconSize() + 'px' },
                  {
                    filter: $store.state.setting.appearance.useFontShadow
                      ? 'drop-shadow(1px 1px 1px ' + $store.state.setting.appearance.fontShadow + ')'
                      : null,
                  },
                ]"
                :class="[`${$store.state.setting.item.hideItemName ? 'mx-auto' : ''}`]"
              >
                <img
                  :src="getIcon(classificationParentId, classificationChildId, item)"
                  :style="[{ width: getIconSize() - 8 + 'px' }, { height: getIconSize() - 8 + 'px' }]"
                />
              </div>
            </template>
            <p
              class="mx-2"
              :class="[`${$store.state.setting.item.hideEllipsis ? 'item-name-list-no-ellipsis' : 'item-name-list'}`]"
              :style="{
                filter: $store.state.setting.appearance.useFontShadow ? 'drop-shadow(1px 1px 1px ' + $store.state.setting.appearance.fontShadow + ')' : null,
                fontWeight: $store.state.setting.item.fontWeight,
                lineHeight: $store.state.setting.item.fontLineHeight + 'rem',
              }"
              v-if="!$store.state.setting.item.hideItemName"
            >
              {{ getItemName(item.name) }}
            </p>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import ItemJS from "@/views/item/js/index.js";
import CommonJS from "@/common";
import ClassificationJS from "@/views/classification/js/index.js";

export default {
  name: "ItemList",
  props: {
    // 项目列表
    itemList: {
      type: Array,
    },
    // 项目所属父级分类ID
    classificationParentId: {
      type: Number,
    },
    // 是否是子级分类下的项目
    itemChild: {
      type: Boolean,
    },
    // 子级分类ID
    classificationChildId: {
      type: Number,
    },
    // 是否是子级分类
    classificationChildItem: {
      type: Boolean,
    },
    // 布局
    layout: {
      type: String,
    },
    // 图标大小
    iconSize: {
      type: Number,
    },
    // 无效项目列表
    invalidItemList: {
      type: Array,
    },
    // 是否排序中
    itemSorting: {
      type: Boolean,
    },
    // 是否拖出中
    dragOut: {
      type: Boolean,
    },
    // 批量操作
    batchOperation: {
      type: Boolean,
    },
    // 多选Map
    itemSortingMap: {
      type: Map,
    },
    // 只显示..
    showOnly: {
      type: String,
    },
  },
  data() {
    return {
      aggregate: false,
    };
  },
  created() {
    let classification = ClassificationJS.getClassificationById(this.classificationParentId, this.classificationChildId);
    if (classification.type != null && classification.type == 1) {
      this.aggregate = true;
    }
  },
  methods: {
    /**
     * 判断数组是否等于空
     */
    arrayIsEmpty: CommonJS.arrayIsEmpty,
    /**
     * 过滤XSS
     */
    sanitize: CommonJS.DOMPurify.sanitize,
    /**
     * 获取图标
     */
    getIcon(classificationParentId, classificationChildId, item) {
      if (this.aggregate) {
        let { classificationParentId, classificationChildId } = ClassificationJS.convertClassificationId(item.classificationId, item.classificationParentId);
        return CommonJS.getIcon(classificationParentId, classificationChildId, item.id);
      } else {
        return CommonJS.getIcon(classificationParentId, classificationChildId, item.id);
      }
    },
    /**
     * 获取项目名称
     */
    getItemName: ItemJS.getName,
    /**
     * 父级点击运行
     * @param e
     * @param dblclick
     */
    parentItemRun(e, dblclick) {
      // 找到inner-item
      let target = this.$getClassElement(e, "inner-item");
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
              this.itemRun(item, dblclick);
            }
          }
        }
      }
    },
    /**
     * 运行项目
     * @param item
     * @param dblclick
     */
    itemRun(item, dblclick) {
      // 如果在批量操作的话，就什么都不做
      if (this.batchOperation) {
        return;
      }
      if (dblclick) {
        if (
          this.$store.state.setting != null &&
          this.$store.state.setting.item != null &&
          this.$store.state.setting.item.doubleClickRunItem != null &&
          this.$store.state.setting.item.doubleClickRunItem
        ) {
          // 双击
          ItemJS.itemRun(item, false);
        }
      } else {
        if (
          this.$store.state.setting == null ||
          this.$store.state.setting.general == null ||
          this.$store.state.setting.item.doubleClickRunItem == null ||
          !this.$store.state.setting.item.doubleClickRunItem
        ) {
          // 单击
          ItemJS.itemRun(item, false);
        }
      }
    },
    /**
     * 获取图标大小
     */
    getIconSize() {
      return this.iconSize != null ? this.iconSize : this.$store.state.setting.item.iconSize;
    },
    /**
     * 获取项目标题
     */
    getItemTitle: ItemJS.getItemTitle,
    /**
     * 获取是否是无效项目
     */
    isInvalidItem(item) {
      if (!this.$store.state.setting.item.checkInvalidItem) {
        return false;
      }
      let key;
      if (item.classificationParentId != null) {
        key = item.classificationParentId + "-" + item.classificationId + "-" + item.id;
      } else {
        key = item.classificationId + "-" + item.id;
      }
      if (!this.arrayIsEmpty(this.invalidItemList) && this.invalidItemList.indexOf(key) >= 0) {
        return true;
      } else {
        return false;
      }
    },
    /**
     * 项目鼠标悬浮
     */
    itemMouseover(e) {
      if (!this.itemSorting && !this.dragOut && !this.batchOperation) {
        this.$styleMouseover(e, "inner-item", ["background-color"], [this.$hexToRGBA(this.$store.state.setting.appearance.theme.minorBackground, 0.3)]);
      }
    },
    /**
     * 项目鼠标移出
     * @param e
     */
    itemMouseout(e) {
      if (!this.batchOperation) {
        this.$styleMouseout(e, "inner-item", ["background-color"]);
      }
    },
    /**
     * 是否被多选
     */
    isMultiItem(id) {
      return (
        this.batchOperation &&
        this.itemSortingMap != null &&
        this.itemSortingMap.get(CommonJS.getKey(this.classificationParentId, this.classificationChildId, id)) != null
      );
    },
  },
};
</script>

<style scoped>
.item-name-list {
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}

.item-name-list-no-ellipsis {
  max-height: 20px;
  word-break: break-all;
  overflow: hidden;
}
</style>
