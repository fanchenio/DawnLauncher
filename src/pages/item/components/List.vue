<template>
  <div
    class="item-list flex flex-wrap pb-1 w-full min-h-[20px] gap-[4px]"
    :style="{
      fontSize: store.setting.item.fontSize + 'px',
    }"
    :classification-id="classificationId"
    @mouseover="mouseover"
    @mouseout="mouseout"
    @click="runItem($event, false)"
    @dblclick="runItem($event, true)"
  >
    <div
      v-for="(item, index) of itemList"
      :draggable="true"
      class="item rounded self-start"
      :class="[
        `${getLayout(classificationId) === 'list' ? 'flex items-center' : ''}`,
        `${store.setting.item.hideItemName ? 'py-3' : 'py-2'}`,
      ]"
      :item-id="item.id"
      :id="'item-' + item.id"
      :key="'item-' + item.id + '-' + index"
      :style="{
        backgroundColor: store.itemBatchOperationDataArray.includes(item.id)
          ? hexToRGBA(store.setting.appearance.theme.secondBackgroundColor, 0.3)
          : undefined,
        height:
          getLayout(classificationId) === 'tile' ||
          !store.setting.item.hideItemName
            ? 'auto'
            : getIconSize(classificationId) + 'px',
      }"
      :title="getItemTitle(item)"
    >
      <ItemIcon :classification-id="classificationId" :item="item"></ItemIcon>
      <p
        class="text-center mx-2"
        :class="[
          `${getLayout(classificationId) === 'tile' ? 'mt-2 text-center' : ''}`,
          `${
            getLayout(classificationId) === 'list'
              ? store.setting.item.hideEllipsis
                ? 'item-name-list-no-ellipsis'
                : 'item-name-list'
              : store.setting.item.itemNameRowCount === 2
              ? store.setting.item.hideEllipsis
                ? 'item-name-tile-2-no-ellipsis'
                : 'item-name-tile-2'
              : store.setting.item.hideEllipsis
              ? 'item-name-tile-1-no-ellipsis'
              : 'item-name-tile-1'
          }`,
        ]"
        :style="{
          filter: store.setting.appearance.fontShadow
            ? 'drop-shadow(1px 1px 1px ' +
              store.setting.appearance.fontShadowColor +
              ')'
            : undefined,
          fontWeight: store.setting.item.fontWeight,
          lineHeight: store.setting.item.fontLineHeight + 'rem',
          maxHeight:
            getLayout(classificationId) === 'list'
              ? store.setting.item.hideEllipsis
                ? store.setting.item.fontLineHeight * 1 + 'rem'
                : undefined
              : store.setting.item.itemNameRowCount === 2
              ? store.setting.item.hideEllipsis
                ? store.setting.item.fontLineHeight * 2 + 'rem'
                : undefined
              : store.setting.item.hideEllipsis
              ? store.setting.item.fontLineHeight * 1 + 'rem'
              : undefined,
        }"
        v-if="!store.setting.item.hideItemName"
      >
        <template
          v-if="item.name"
          v-for="(text, tIndex) of item.name.split('\\n')"
        >
          {{ text }}
          <br
            v-if="
              item.name.split('\\n').length > 1 &&
              tIndex < item.name.split('\\n').length - 1
            "
          />
        </template>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { Item } from "../../../../types/item";
import { getClassElement, hexToRGBA } from "../../../utils/style";
import ItemIcon from "../../../components/ItemIcon.vue";
import {
  getItemById,
  run,
  showItemList,
  itemHoverStyle,
  itemRemoveStyle,
  getLayout,
  getIconSize,
  setItemWidth,
  getItemTitle,
} from "../../item/js/index";
import { getClassificationById } from "../../classification/js/index";
import { Classification } from "../../../../types/classification";
import { useMainStore } from "../../../store";
// pinia
const store = useMainStore();
// props
const props = defineProps<{
  classificationId: number | null;
  data: {
    id: number | null;
    resultList: Array<Item>;
  };
}>();
// 排序
let sort = "default";
// 布局
let layout = "default";
// 列数
let columnNumber: number | null = null;
// 显示
let showOnly = "default";
// 当前分类ID
let classificationId = ref(props.classificationId);
let classification = ref<Classification | null>(null);
if (classificationId.value) {
  // 查询分类
  classification.value = getClassificationById(classificationId.value);
  sort = classification.value ? classification.value.data.itemSort : "default";
  layout = classification.value
    ? classification.value.data.itemLayout
    : "default";
  columnNumber = classification.value
    ? classification.value.data.itemColumnNumber
    : null;
  showOnly = classification.value
    ? classification.value.data.itemShowOnly
    : "default";
}
// 分类列表
let itemList = ref<Array<Item>>(
  showItemList(props.data.resultList, classification.value)
);
// 监听
watch(
  () => props.classificationId,
  (newValue: number | null) => {
    // 新数据
    classificationId.value = newValue;
    if (newValue) {
      // 查询分类
      classification.value = getClassificationById(newValue);
      sort = classification.value
        ? classification.value.data.itemSort
        : "default";
      layout = classification.value
        ? classification.value.data.itemLayout
        : "default";
      columnNumber = classification.value
        ? classification.value.data.itemColumnNumber
        : null;
      showOnly = classification.value
        ? classification.value.data.itemShowOnly
        : "default";
    }
    itemList.value = showItemList(props.data.resultList, classification.value);
  }
);
// 监听数据
watch(
  () => props.data,
  (newValue: { id: number | null; resultList: Array<Item> }) => {
    if (
      classification.value &&
      newValue.id &&
      newValue.id === classification.value.id
    ) {
      // 新数据
      itemList.value = showItemList(newValue.resultList, classification.value);
    }
  },
  { deep: true }
);
// 监听分类
watch(
  () => classification.value,
  (newValue: Classification | null) => {
    if (newValue) {
      if (sort !== newValue.data.itemSort) {
        // 重新加载列表
        itemList.value = showItemList(props.data.resultList, newValue);
        sort = newValue.data.itemSort;
      } else if (layout !== newValue.data.itemLayout) {
        layout = newValue.data.itemLayout;
      } else if (columnNumber !== newValue.data.itemColumnNumber) {
        columnNumber = newValue.data.itemColumnNumber;
      } else if (showOnly !== newValue.data.itemShowOnly) {
        // 重新加载列表
        itemList.value = showItemList(props.data.resultList, newValue);
        showOnly = newValue.data.itemShowOnly;
      }
      // 刷新DOM完毕执行
      nextTick(() => {
        // 设置项目宽度
        setItemWidth();
      });
    }
  },
  { deep: true }
);
// 监听显示列表
watch(
  () => itemList.value,
  () => {
    // 刷新DOM完毕执行
    nextTick(() => {
      // 设置项目宽度
      setItemWidth();
    });
  }
);
// 运行项目
function runItem(e: any, dbclick: boolean) {
  if (!store.itemSorting && !store.itemBatchOperation) {
    // 找到item
    let itemElement = getClassElement(e, "item");
    if (itemElement) {
      // 项目ID
      let itemId = parseInt(itemElement.getAttribute("item-id"));
      // 查询项目
      let item = getItemById(itemId);
      if (item && item.data) {
        if (dbclick && store.setting.item.doubleClickOpen) {
          run("main", "open", item);
        } else if (!dbclick && !store.setting.item.doubleClickOpen) {
          run("main", "open", item);
        }
      }
    }
  }
}
// mouseover
function mouseover(e: any) {
  // 鼠标经过添加样式
  if (
    getClassElement(e, "item") &&
    !store.itemSorting &&
    !store.itemBatchOperation &&
    !store.itemRightMenuItemId &&
    !store.itemDragOut
  ) {
    itemHoverStyle(e, "item");
  }
}
// mouseout
function mouseout(e: any) {
  // 鼠标移走删除样式
  if (
    getClassElement(e, "item") &&
    !store.itemSorting &&
    !store.itemBatchOperation &&
    !store.itemRightMenuItemId &&
    !store.itemDragOut
  ) {
    itemRemoveStyle(e, "item");
  }
}
</script>
../../classification/js/classification../js/item
../../../../types/item../../../../types/classification
