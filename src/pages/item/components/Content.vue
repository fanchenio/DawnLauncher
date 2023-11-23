<template>
  <div
    id="item-content"
    class="pl-2 pr-[4px] h-full w-full flex-1 overflow-x-hidden"
    :style="{
      maxHeight: height + 'px',
      width: store.setting.classification.layout === 'top' ? 'auto' : '100%',
    }"
    @contextmenu="contextmenu"
    @dragstart="dragstart"
    @dragover="dragover"
    @dragleave="dragleave"
    @drop="drop($event, null)"
  >
    <!-- 只选中了父级分类 -->
    <template v-if="!store.selectedClassificationChildId">
      <!-- 有子级分类 -->
      <template
        v-if="hasChildClassification(store.selectedClassificationParentId)"
      >
        <div
          v-for="(classification, index) of getClassificationChildList(
            store.selectedClassificationParentId
          )"
          :key="'classification-child-' + classification.id + '-item-' + index"
          class="item-container"
          :classification-id="classification.id"
          @drop="drop($event, classification.id)"
        >
          <p
            :style="{
              filter: store.setting.appearance.fontShadow
                ? 'drop-shadow(1px 1px 1px ' +
                  store.setting.appearance.fontShadowColor +
                  ')'
                : undefined,
              fontSize:
                store.setting.subClassification.itemAreaNameFontSize + 'px',
              fontWeight:
                store.setting.subClassification.itemAreaNameFontWeight,
              lineHeight:
                store.setting.subClassification.itemAreaNameFontLineHeight +
                'rem',
              textAlign: store.setting.subClassification.itemAreaNameAlign,
              marginRight:
                store.setting.subClassification.itemAreaNameAlign === 'right'
                  ? '4px'
                  : undefined,
            }"
          >
            {{ classification.name }}
          </p>
          <ItemList
            class="pt-1"
            :data="getShowItemListByClassificationId(classification.id)"
            :classification-id="classification.id"
          ></ItemList>
        </div>
      </template>
      <!-- 无子级分类 -->
      <div
        v-else
        class="item-container"
        :classification-id="store.selectedClassificationParentId"
        @drop="drop($event, store.selectedClassificationParentId)"
      >
        <ItemList
          :data="
            getShowItemListByClassificationId(
              store.selectedClassificationParentId
            )
          "
          :classification-id="store.selectedClassificationParentId"
        ></ItemList>
      </div>
    </template>
    <!-- 选中了子分类 -->
    <div
      v-else
      class="item-container"
      :classification-id="store.selectedClassificationChildId"
      @drop="drop($event, store.selectedClassificationChildId)"
    >
      <ItemList
        :data="
          getShowItemListByClassificationId(store.selectedClassificationChildId)
        "
        :classification-id="store.selectedClassificationChildId"
      ></ItemList>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  ref,
  onMounted,
  onUnmounted,
  onBeforeMount,
  watch,
  onUpdated,
  nextTick,
} from "vue";
import Sortable, { MultiDrag, SortableEvent } from "sortablejs";
import SimpleBar from "simplebar";
import "simplebar/dist/simplebar.css";
import {
  getLocalSetting,
  setLocalSetting,
  deleteLocalSetting,
} from "../../../utils/localSetting";
import {
  getSelectedClassificationId,
  hasChildClassification,
  getClassificationChildList,
  getClassificationById,
} from "../../classification/js";
import {
  addItem,
  updateItem,
  deleteItem,
  convertItemList,
  getItemListByClassificationId,
  getShowItemListByClassificationId,
  getItemById,
  updateItemOrder,
  itemRemoveStyle,
  itemHoverStyle,
  allItemRemoveStyle,
  deleteItemByClassificationId,
  setItemWidth,
  run,
  removeInvalidItem,
} from "../js";
import ItemList from "./List.vue";
import { Item } from "../../../../types/item";
import { getClassElement } from "../../../utils/style";
import { convert } from "../../../../commons/utils/common";
import { scrollToTop, findElement, unlistens } from "../../../utils/common";
import { useMainStore } from "../../../store";
// pinia
const store = useMainStore();
// 开发时会重复挂载插件导致页面错误
try {
  // 拖拽控件支持多选
  Sortable.mount(new MultiDrag());
} catch (e) {}
// 锁定项目 解锁项目
let lockItem = getLocalSetting<boolean>("lockItem") ?? false;
// 监听布局
watch(
  () => store.setting.classification.layout,
  () => {
    // 刷新DOM完毕执行
    nextTick(() => {
      // 监听页面大小
      resize();
      // 滚动到顶部
      scrollToTop(itemContentSimpleBar);
    });
  }
);
// 监听选中的父级分类
watch(
  () => store.selectedClassificationParentId,
  () => {
    // 刷新DOM完毕执行
    nextTick(() => {
      // 设置项目宽度
      setItemWidth();
      // 创建项目拖拽对象
      createItemSortable();
      // 清除批量操作
      clearBatchOperation();
      // 滚动到顶部
      scrollToTop(itemContentSimpleBar);
    });
  }
);
// 监听选中的子级分类
watch(
  () => store.selectedClassificationChildId,
  () => {
    // 刷新DOM完毕执行
    nextTick(() => {
      // 设置项目宽度
      setItemWidth();
      // 创建项目拖拽对象
      createItemSortable();
      // 清除批量操作
      clearBatchOperation();
      // 滚动到顶部
      scrollToTop(itemContentSimpleBar);
    });
  }
);
/**
 * 获取项目列表
 */
async function getItemList() {
  store.itemMap = convertItemList(window.item.list());
}
// 创建项目滚动条
let itemContentSimpleBar: SimpleBar | null = null;
function createSimpleBar() {
  // 项目区域
  let element = document.getElementById("item-content");
  if (element) {
    // 创建滚动条
    if (!SimpleBar.instances.get(element)) {
      itemContentSimpleBar = new SimpleBar(element);
      // 获取scroll
      let scroll = itemContentSimpleBar.getScrollElement();
      if (scroll) {
        // 监听滚动
        scroll.addEventListener(
          "wheel",
          (e) => {
            if (
              scroll &&
              store.setting.classification.autoSwitchClassification
            ) {
              const delta = Math.sign(e.deltaY);
              if (delta === -1 && scroll.scrollTop === 0) {
                // 上
                store.classificationWheelEvent = e;
              } else if (delta === 1) {
                // 下
                if (
                  scroll.scrollTop + scroll.clientHeight ===
                  scroll.scrollHeight
                ) {
                  store.classificationWheelEvent = e;
                }
              }
            }
          },
          { passive: false, capture: true }
        );
      }
    } else {
      if (itemContentSimpleBar) {
        itemContentSimpleBar.recalculate();
      }
    }
  }
}
// 项目拖拽对象列表
let itemSortableList: Array<Sortable> = [];
// 项目拖拽排序
function createItemSortable() {
  // 如果存在先销毁
  for (const sortable of itemSortableList) {
    if (sortable) {
      sortable.destroy();
    }
  }
  itemSortableList = [];
  // 循环每个项目区域
  let itemListElementList = document.getElementsByClassName("item-list");
  for (let i = 0; i < itemListElementList.length; i++) {
    // element
    let element = itemListElementList[i];
    // 分类ID
    let classificationId = parseInt(element.getAttribute("classification-id")!);
    // 查询分类
    let classification = getClassificationById(classificationId);
    // 只有普通分类才可以拖拽排序
    if (!classification || classification.type !== 0) {
      continue;
    }
    // 如果锁定分类的话就不创建拖拽对象
    if (!lockItem) {
      // 创建
      itemSortableList.push(
        Sortable.create(element as HTMLElement, {
          group: store.selectedClassificationChildId
            ? "classification-child-" + store.selectedClassificationChildId
            : "classification-parent-" + store.selectedClassificationParentId,
          draggable: ".item",
          animation: 0,
          forceFallback: true,
          fallbackTolerance: 4,
          multiDrag: store.itemBatchOperation,
          // 多选选择
          onSelect(e) {
            itemSortableBatchOpertionDataSet(e, "Add");
          },
          // 取消多选
          onDeselect(e) {
            itemSortableBatchOpertionDataSet(e, "Delete");
          },
          onStart() {
            store.itemSorting = true;
            if (!store.itemBatchOperation) {
              allItemRemoveStyle();
            }
          },
          async onEnd(event) {
            if (
              event.newIndex !== null &&
              event.newIndex !== undefined &&
              event.oldIndex !== null &&
              event.oldIndex !== undefined
            ) {
              let fromIdList = [];
              if (!store.itemBatchOperation) {
                // 普通操作
                // from 分类ID
                let fromClassificationId = parseInt(
                  event.from.getAttribute("classification-id")!
                );
                // 当前项目
                const currentItem =
                  getItemListByClassificationId(fromClassificationId)[
                    event.oldIndex
                  ];
                fromIdList.push(currentItem.id);
              } else {
                // 批量操作
                for (const value of store.itemBatchOperationDataArray) {
                  fromIdList.push(value);
                }
              }
              // to 分类ID
              let toClassificationId = store.mouseoverClassificationId
                ? store.mouseoverClassificationId
                : parseInt(event.to.getAttribute("classification-id")!);
              // 目标分类必须是普通分类
              let toClassification = getClassificationById(toClassificationId);
              if (toClassification && toClassification.type === 0) {
                // 更新数据库排序
                let res = window.item.updateOrder(
                  fromIdList,
                  toClassificationId,
                  store.mouseoverClassificationId ? null : event.newIndex
                );
                if (res) {
                  updateItemOrder(
                    fromIdList,
                    toClassificationId,
                    store.mouseoverClassificationId ? null : event.newIndex
                  );
                }
              }
            }
            store.itemSorting = false;
            // 清除批量操作
            clearBatchOperation();
            // 刷新DOM完毕执行
            nextTick(() => {
              // 设置项目宽度
              setItemWidth();
            });
          },
        })
      );
    } else {
      // 将所有元素设置为可拖拽，项目拖出时需要用到
      let itemListElement = element.getElementsByClassName("item");
      for (let i = 0; i < itemListElement.length; i++) {
        const element = itemListElement[i];
        element.setAttribute("draggable", "true");
      }
    }
  }
}
// 批量操作选中项目
function itemSortableBatchOpertionDataSet(e: SortableEvent, type: string) {
  let strItemId = e.item.getAttribute("item-id");
  if (strItemId) {
    let itemId = parseInt(strItemId);
    if (type === "Add") {
      if (!store.itemBatchOperationDataArray.includes(itemId)) {
        store.itemBatchOperationDataArray.push(itemId);
      }
    } else {
      let index = store.itemBatchOperationDataArray.indexOf(itemId);
      if (index >= 0) {
        store.itemBatchOperationDataArray.splice(index, 1);
      }
    }
  }
}
// 监听右键菜单选中ID
watch(
  () => store.itemRightMenuItemId,
  (newValue) => {
    if (!store.itemBatchOperation) {
      let elementList = document.getElementsByClassName("item");
      for (let i = 0; i < elementList.length; i++) {
        itemRemoveStyle(elementList[i], "item");
      }
      if (newValue) {
        let elemenet = document.getElementById("item-" + newValue);
        if (elemenet) {
          itemHoverStyle(elemenet, "item");
        }
      }
    }
  }
);
// 清除批量操作
function clearBatchOperation() {
  store.itemBatchOperation = false;
  store.itemBatchOperationDataArray = [];
}
// dragstart
function dragstart(e: any) {
  // 如果项目在拖拽排序中则不能拖出
  if (store.itemSorting) {
    return;
  }
  // 获取项目
  let item: Item | null = null;
  let itemElement = findElement(e.target, "item");
  if (itemElement) {
    let id = itemElement.getAttribute("item-id");
    if (id) {
      item = getItemById(parseInt(id));
    }
  }
  // 查询当前分类
  let classification = item
    ? getClassificationById(item.classificationId)
    : null;
  // 只有关联文件夹或设置了锁定分类，可以拖出
  if ((classification && classification.type === 1) || lockItem) {
    // 设置拖出标识
    store.itemDragOut = true;
    if (item) {
      store.itemDragOutData = item;
      window.item.dragOut(convert(item));
    } else {
      store.itemDragOut = false;
    }
  }
  e.preventDefault();
  e.stopPropagation();
}
// dragover
function dragover(e: any) {
  // 如果项目在拖拽排序中直接返回
  if (store.itemSorting) {
    return;
  }
  // 从程序外拖动文件到项目图标上时用此项目打开文件 或者 拖出
  if (store.setting.item.useItemOpen || store.itemDragOut) {
    // 选中效果
    let target = findElement(e.target, "item");
    // 取消选中效果
    let itemList = document.getElementsByClassName("item");
    for (let i = 0; i < itemList.length; i++) {
      const element = itemList[i] as HTMLElement;
      if (element.style.backgroundColor && element !== target) {
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
// dragleave
function dragleave(e: any) {
  // 解决拖出速度过快时有几率没有删除项目选中样式
  if (
    e.relatedTarget &&
    e.relatedTarget.tagName &&
    e.relatedTarget.tagName.toString().toLowerCase() !== "img" &&
    e.relatedTarget.tagName.toString().toLowerCase() !== "p"
  ) {
    let flag = false;
    for (const className of e.relatedTarget.classList) {
      if (className === "item") {
        flag = true;
      }
    }
    if (!flag) {
      // 取消选中效果
      allItemRemoveStyle();
    }
  }
  e.preventDefault();
  e.stopPropagation();
}
// drop
function drop(e: any, classificationId: number | null) {
  // 如果项目在拖拽排序中直接返回
  if (store.itemSorting) {
    return;
  }
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
  if (store.setting.item.useItemOpen && item && pathList.length > 0) {
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
    run("main", "open", copyItem);
  } else if (store.itemDragOut) {
    // 拖出
    if (
      store.itemDragOutData &&
      item &&
      store.itemDragOutData.type === 0 &&
      item.type === 0
    ) {
      // 如果不是同一个项目就可以使用某个程序打开此文件
      if (item.id !== store.itemDragOutData.id) {
        let params = store.itemDragOutData.data.target;
        if (item.data.params) {
          params += " " + item.data.params;
        }
        let copyItem: Item = convert(item);
        copyItem.data.params = params;
        // 运行
        run("main", "open", copyItem);
      }
    }
  } else {
    if (pathList.length > 0) {
      // 如果分类ID为空，尝试获取当前选中的分类ID
      if (!classificationId) {
        // 获取当前选中的分类ID
        let selectedClassificationId = getSelectedClassificationId();
        // 判断是否是父级分类
        if (
          selectedClassificationId &&
          hasChildClassification(selectedClassificationId)
        ) {
          // 获取最后一个子分类ID
          let childList = getClassificationChildList(selectedClassificationId);
          classificationId = childList[childList.length - 1].id;
        } else {
          classificationId = selectedClassificationId;
        }
      }
      // 如果分类ID不为空
      if (classificationId) {
        // 查询分类
        let classification = getClassificationById(classificationId);
        if (classification && classification.type === 0) {
          window.item.drop(classificationId, pathList);
        }
      }
    }
  }
  e.preventDefault();
  e.stopPropagation();
}
// 页面高度
let height = ref(0);
// 初始化页面尺寸
resize();
// 监听页面大小
function resize() {
  // 刷新DOM完毕执行
  nextTick(() => {
    // 设置项目宽度
    setItemWidth();
    // 页面高度 - 34（标题栏固定高度）
    let h = document.documentElement.clientHeight - 34;
    // 分类布局为顶部时需要加上分类的高度
    if (store.setting.classification.layout === "top") {
      let element = document.getElementById("classification-list");
      if (element) {
        h -= element.getBoundingClientRect().height;
      }
    }
    height.value = h;
  });
}
// 监听鼠标右键
async function contextmenu(e: any) {
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
    // 记录右键选中的ID
    store.itemRightMenuItemId = id;
  }
  // 弹出菜单
  window.item.showRightMenu({
    classificationId: getSelectedClassificationId(),
    item,
    lockItem,
    batchOperation: store.itemBatchOperation,
    batchSelectedIdList: convert(store.itemBatchOperationDataArray),
    x: e.screenX,
    y: e.screenY,
    type: "main",
  });
}
// beforeMount
onBeforeMount(async () => {
  // 查询项目列表
  await getItemList();
  // 刷新DOM完毕执行
  nextTick(() => {
    // 设置项目宽度
    setItemWidth();
    // 创建项目拖拽对象
    createItemSortable();
  });
});
// updated
onUpdated(() => {
  // 刷新DOM完毕执行
  nextTick(() => {
    // 设置项目宽度
    setItemWidth();
    // 项目滚动条
    createSimpleBar();
  });
});
// 监听
let listens: Array<Function> = [];
// moutned
onMounted(() => {
  // resize
  window.addEventListener("resize", resize);
  // 刷新DOM完毕执行
  nextTick(() => {
    // 设置项目宽度
    setItemWidth();
    // 项目滚动条
    createSimpleBar();
    // 创建项目拖拽对象
    createItemSortable();
  });
  // 监听新增项目
  listens.push(
    window.item.onAdd((data) => {
      // 项目列表
      let itemList: Array<Item> = data.itemList;
      // 是否清空原项目
      let clear: boolean = data.clear;
      // 分类ID
      let classificationId: number | null = data.classificationId;
      if (clear && classificationId) {
        deleteItemByClassificationId(classificationId);
      }
      // 添加项目
      for (const item of itemList) {
        addItem(item);
      }
      // 清空批量操作
      clearBatchOperation();
      // 刷新DOM完毕执行
      nextTick(() => {
        // 创建项目拖拽对象
        createItemSortable();
        // 设置项目宽度
        setItemWidth();
      });
    })
  );
  // 监听更新项目
  listens.push(
    window.item.onUpdate((data) => {
      updateItem(data.item);
      // 删除无效项目
      removeInvalidItem(data.item.id);
      // 刷新DOM完毕执行
      nextTick(() => {
        // 设置项目宽度
        setItemWidth();
      });
    })
  );
  // 监听删除项目
  listens.push(
    window.item.onDelete((data) => {
      let itemIdList: Array<number> = data;
      for (const id of itemIdList) {
        deleteItem(id);
        // 删除无效项目
        removeInvalidItem(id);
      }
      // 清空批量操作
      clearBatchOperation();
      // 刷新DOM完毕执行
      nextTick(() => {
        // 创建项目拖拽对象
        createItemSortable();
        // 设置项目宽度
        setItemWidth();
      });
    })
  );
  // 监听锁定/解锁项目
  listens.push(
    window.item.onLock((data) => {
      if (!lockItem) {
        setLocalSetting("lockItem", "true");
        lockItem = true;
      } else {
        deleteLocalSetting("lockItem");
        lockItem = false;
      }
      // 刷新DOM完毕执行
      nextTick(() => {
        // 创建项目拖拽对象
        createItemSortable();
      });
    })
  );
  // 监听批量操作
  listens.push(
    window.item.onBatchOperation((data) => {
      store.itemBatchOperation = data;
      store.itemBatchOperationDataArray = [];
      // 刷新DOM完毕执行
      nextTick(() => {
        // 创建项目拖拽对象
        createItemSortable();
      });
    })
  );
  // 监听转换路径
  listens.push(
    window.item.onConvertPath((data) => {
      let dataList: Array<{
        id: number;
        target: string;
      }> = data;
      for (const data of dataList) {
        let item = getItemById(data.id);
        if (item) {
          item.data.target = data.target;
        }
      }
      // 清空批量操作
      clearBatchOperation();
    })
  );
  // 监听刷新图标
  listens.push(
    window.item.onRefreshIcon((data) => {
      let dataList: Array<{
        id: number;
        icon: string;
      }> = data;
      for (const data of dataList) {
        let item = getItemById(data.id);
        if (item) {
          item.data.icon = data.icon;
          item.data.htmlIcon = null;
        }
      }
      // 清空批量操作
      clearBatchOperation();
    })
  );
  // 监听移动项目
  listens.push(
    window.item.onMove((data) => {
      updateItemOrder(data.idList, data.toClassificationId, null);
      // 清空批量操作
      clearBatchOperation();
      // 刷新DOM完毕执行
      nextTick(() => {
        // 设置项目宽度
        setItemWidth();
        // 创建项目拖拽对象
        createItemSortable();
      });
    })
  );
  // 监听批量操作全选
  listens.push(
    window.item.onBatchOperationSelectAll((data) => {
      // 全选
      if (
        !store.selectedClassificationChildId &&
        hasChildClassification(store.selectedClassificationParentId)
      ) {
        let classificationList = getClassificationChildList(
          store.selectedClassificationParentId
        );
        for (const classification of classificationList) {
          if (classification.type === 0) {
            let itemList = getItemListByClassificationId(classification.id);
            for (const item of itemList) {
              if (!store.itemBatchOperationDataArray.includes(item.id)) {
                store.itemBatchOperationDataArray.push(item.id);
              }
            }
          }
        }
      } else {
        let classificationId = getSelectedClassificationId();
        if (classificationId) {
          let classification = getClassificationById(classificationId);
          if (classification && classification.type === 0) {
            let itemList = getItemListByClassificationId(
              getSelectedClassificationId()
            );
            for (const item of itemList) {
              if (!store.itemBatchOperationDataArray.includes(item.id)) {
                store.itemBatchOperationDataArray.push(item.id);
              }
            }
          }
        }
      }
    })
  );
  // 监听项目右键菜单关闭
  listens.push(
    window.item.onRightMenuClose((data) => {
      store.itemRightMenuItemId = null;
      store.searchItemRightMenuItemId = null;
    })
  );
  // 监听项目资源管理器菜单
  listens.push(
    window.item.onExplorerMenu((data) => {
      if (data.type === "main") {
        store.itemRightMenuItemId = data.id;
      } else if (data.type === "search") {
        store.searchItemRightMenuItemId = data.id;
      }
    })
  );
  // 监听取消项目拖拽
  listens.push(
    window.item.onCancelDragOut((data) => {
      store.itemDragOutData = null;
      store.itemDragOut = false;
    })
  );
  // 监听更新打开次数
  listens.push(
    window.item.onUpdateOpenInfo((data) => {
      let item = getItemById(data.id);
      if (item) {
        if (data.type === "main" || data.type === "search") {
          item.data.openNumber = data.openNumber;
          item.data.lastOpen = data.lastOpen;
        } else if (data.type === "quickSearch") {
          item.data.quickSearchOpenNumber = data.quickSearchOpenNumber;
          item.data.quickSearchLastOpen = data.quickSearchLastOpen;
        }
      }
    })
  );
  // 监听无效项目
  listens.push(
    window.item.onCheckInvalid((data) => {
      store.invalidItemIdList = data;
    })
  );
});
// unmounted
onUnmounted(() => {
  // resize
  window.removeEventListener("resize", resize);
  // 删除监听
  unlistens(listens);
});
</script>
../../../../types/item
