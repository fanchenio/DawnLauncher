<template>
  <!-- 分类 -->
  <div
    id="classification-content"
    class="pl-[8px] text-sm overflow-x-hidden"
    :class="[
      `${
        store.setting.classification.layout === 'top' ? 'pr-[4px]' : 'pr-[8px]'
      }`,
    ]"
    :style="{
      maxHeight: height + 'px',
      height: store.setting.classification.layout === 'top' ? 'auto' : '100%',
      width:
        store.setting.classification.layout === 'left' ||
        store.setting.classification.layout === 'right'
          ? store.setting.classification.mode === 'icon'
            ? '35px'
            : store.setting.classification.width + 'px'
          : 'auto',
    }"
    @wheel="wheel"
    @contextmenu="contextmenu"
    @dragover="dragover"
    @drop="drop"
    @mouseover="mouseover"
    @mouseout="mouseout"
    :key="'classification-content-' + count"
  >
    <ul
      id="classification-list"
      :class="[
        `${
          store.setting.classification.layout === 'top'
            ? 'flex flex-wrap gap-[4px] pb-1'
            : ''
        }`,
      ]"
    >
      <li
        v-for="(classification, index) of store.classificationList"
        :key="'classification-' + classification.id + '-' + index"
        class="classification-parent"
        @dragleave="clearMouseOverChangeClassificationSetTimeout"
      >
        <div
          :id="'classification-' + classification.id"
          class="classification-parent-content px-2 flex items-center relative h-[30px] rounded"
          :class="[
            `${
              store.setting.classification.nameAlign === 'center' ||
              store.setting.classification.mode === 'icon'
                ? 'justify-center'
                : ''
            }`,
            `${store.setting.classification.mode === 'normal' ? 'px-2' : ''}`,
            `${store.setting.classification.layout !== 'top' ? 'mb-1' : ''}`,
          ]"
          :classification-id="classification.id"
          :style="{
            color:
              isSelectedParent(classification.id) ||
              (store.itemSorting &&
                store.mouseoverClassificationId === classification.id)
                ? store.setting.appearance.theme.secondFontColor
                : undefined,
            backgroundColor:
              isSelectedParent(classification.id) ||
              (store.itemSorting &&
                store.mouseoverClassificationId === classification.id)
                ? hexToRGBA(
                    store.setting.appearance.theme.secondBackgroundColor,
                    store.setting.appearance.transparency
                  )
                : undefined,
          }"
          @click="switchParentClassification(classification.id, true)"
          @dragleave="clearMouseOverChangeClassificationSetTimeout"
        >
          <span
            class="overflow-hidden text-ellipsis whitespace-nowrap"
            :style="{
              filter: store.setting.appearance.fontShadow
                ? 'drop-shadow(1px 1px 1px ' +
                  store.setting.appearance.fontShadowColor +
                  ')'
                : undefined,
            }"
          >
            {{ getClassificationName(classification) }}
          </span>
          <Icon
            v-if="
              classification.childList &&
              classification.childList.length > 0 &&
              !classificationChildShowHiddenMap.has(classification.id) &&
              store.setting.classification.mode === 'normal'
            "
            class="cursor-pointer absolute right-[2px]"
            :style="{
              filter: store.setting.appearance.fontShadow
                ? 'drop-shadow(1px 1px 1px ' +
                  store.setting.appearance.fontShadowColor +
                  ')'
                : undefined,
            }"
            size="18"
            @click="showHiddenChildClassification($event, classification.id)"
          >
            <ChevronRightRound></ChevronRightRound>
          </Icon>
          <Icon
            v-if="
              classification.childList &&
              classification.childList.length > 0 &&
              classificationChildShowHiddenMap.has(classification.id) &&
              store.setting.classification.mode === 'normal'
            "
            class="cursor-pointer absolute right-[2px]"
            :style="{
              filter: store.setting.appearance.fontShadow
                ? 'drop-shadow(1px 1px 1px ' +
                  store.setting.appearance.fontShadowColor +
                  ')'
                : undefined,
            }"
            size="18"
            @click="showHiddenChildClassification($event, classification.id)"
          >
            <KeyboardArrowDownRound></KeyboardArrowDownRound>
          </Icon>
        </div>
        <div
          v-show="
            classification.childList &&
            classification.childList.length > 0 &&
            classificationChildShowHiddenMap.has(classification.id)
          "
          :class="[
            `${
              store.setting.classification.layout === 'top'
                ? '!fixed !z-[10000] !rounded-lg !drop-shadow-[0_0_6px_rgba(0,0,0,0.2)] !origin-top-left !pt-1 !mt-1'
                : ''
            }`,
          ]"
          :data-simplebar="store.setting.classification.layout === 'top'"
          :style="{
            backgroundColor:
              store.setting.classification.layout === 'top'
                ? hexToRGBA(
                    store.setting.appearance.theme.mainBackgroundColor,
                    store.setting.appearance.transparency
                  )
                : '',
            width:
              store.setting.classification.layout === 'top'
                ? classificationWidth + 'px'
                : '',
            maxHeight:
              store.setting.classification.layout === 'top' ? '300px' : 'auto',
          }"
        >
          <ul
            class="classification-child-list h-full"
            :classification-parent-id="classification.id"
          >
            <li
              v-for="(
                childClassification, childIndex
              ) of classification.childList"
              :id="'classification-child-' + classification.id"
              :key="
                'classification-' +
                classification.id +
                '-' +
                childClassification.id +
                '-' +
                childIndex
              "
              class="classification-child mb-1 px-2 flex items-center h-[30px]"
              :class="[
                `${
                  store.setting.classification.nameAlign === 'center' ||
                  store.setting.classification.mode === 'icon'
                    ? 'justify-center'
                    : ''
                }`,
                `${
                  store.setting.classification.layout !== 'top' ? 'rounded' : ''
                }`,
                `${
                  store.setting.classification.mode === 'normal' ? 'px-2' : ''
                }`,
              ]"
              :style="{
                color:
                  isSelectedChild(childClassification.id, classification.id) ||
                  (store.itemSorting &&
                    store.mouseoverClassificationId === childClassification.id)
                    ? store.setting.appearance.theme.secondFontColor
                    : undefined,
                backgroundColor:
                  isSelectedChild(childClassification.id, classification.id) ||
                  (store.itemSorting &&
                    store.mouseoverClassificationId === childClassification.id)
                    ? hexToRGBA(
                        store.setting.appearance.theme.secondBackgroundColor,
                        store.setting.appearance.transparency
                      )
                    : undefined,
              }"
              :classification-parent-id="classification.id"
              :classification-id="childClassification.id"
              @click="
                switchChildClassification(
                  classification.id,
                  childClassification.id
                )
              "
              @dragleave="clearMouseOverChangeClassificationSetTimeout"
            >
              <span
                class="overflow-hidden text-ellipsis whitespace-nowrap"
                :style="{
                  filter: store.setting.appearance.fontShadow
                    ? 'drop-shadow(1px 1px 1px ' +
                      store.setting.appearance.fontShadowColor +
                      ')'
                    : undefined,
                }"
              >
                {{ getClassificationName(childClassification) }}
              </span>
            </li>
            <li
              v-show="store.setting.classification.layout !== 'top'"
              class="h-[1px] my-1 border-t-[1px]"
              style="border-top-style: solid"
              :style="{
                borderColor: hexToRGBA(
                  store.setting.appearance.theme.borderColor,
                  store.setting.appearance.transparency
                ),
              }"
            ></li>
          </ul>
        </div>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import {
  ref,
  Ref,
  onMounted,
  onUnmounted,
  onBeforeMount,
  nextTick,
  onUpdated,
  watch,
} from "vue";
import {
  getClassElement,
  setStyle,
  removeStyle,
  hexToRGBA,
} from "../../../utils/style";
import { Icon } from "@vicons/utils";
import { ChevronRightRound, KeyboardArrowDownRound } from "@vicons/material";
import {
  getClassificationName,
  hasChildClassification,
  addClassification,
  getClassificationById,
  deleteClassification,
  updateClassification,
  updateClassificationOrder,
  updateClassificationIcon,
  convertClassificationList,
} from "../js/index";
import { Classification } from "../../../../types/classification";
import Sortable from "sortablejs";
import SimpleBar from "simplebar";
import "simplebar/dist/simplebar.css";
import { convert } from "../../../../commons/utils/common";
import {
  getLocalSetting,
  setLocalSetting,
  deleteLocalSetting,
} from "../../../utils/localSetting";
import { findElement, unlistens } from "../../../utils/common";
import { deleteItemByClassificationId } from "../../item/js";
import { useMainStore } from "../../../store";
// pinia
const store = useMainStore();
// 暴露方法给父级组件
defineExpose({
  switchClassificationById,
  layoutTopHideOtherSubClassification,
});
// 计数器
let count = ref(0);
// 监听布局
watch(
  () => store.setting.classification.layout,
  () => {
    // +1
    count.value = count.value + 1;
    classificationChildShowHiddenMap.value = new Map();
    // 刷新DOM完毕执行
    nextTick(() => {
      // 滚动条
      createSimpleBar();
      // 设置分类宽度
      setClassificationWidth();
      // 创建父级分类拖拽对象;
      createClassificationParentSortable();
      // 创建子级分类拖拽对象
      createClassificationChildSortable();
    });
  }
);
// 监听滚轮切换分类
watch(
  () => store.classificationWheelEvent,
  (newValue: WheelEvent | null) => {
    if (newValue) {
      wheelSwitchClassification(newValue);
    }
  }
);
// 锁定分类 解锁分类
let lockClassification =
  getLocalSetting<boolean>("lockClassification") ?? false;
// 存储子级分类展开状态
let classificationChildShowHiddenMap: Ref<Map<number, boolean>> = ref(
  new Map()
);
// 是否选中父级分类
function isSelectedParent(id: number): boolean {
  return (
    store.selectedClassificationParentId === id &&
    !store.selectedClassificationChildId
  );
}
// 是否选中子级分类
function isSelectedChild(id: number, parentId: number): boolean {
  return (
    store.selectedClassificationParentId === parentId &&
    store.selectedClassificationChildId === id
  );
}
/**
 * 获取分类列表
 */
async function getClassificationList() {
  // 获取列表
  let classificationList = window.classification.list();
  // 转换
  store.classificationList = convertClassificationList(classificationList);
  // default
  let defaultFlag = true;
  // 是否记住分类状态
  if (store.setting.classification.rememberSelectionState) {
    let strJson: string | null = getLocalSetting("classificationSelected");
    if (strJson) {
      let data = JSON.parse(strJson);
      if (data.parentId) {
        let classificationParent = getClassificationById(data.parentId);
        if (classificationParent) {
          defaultFlag = false;
          store.selectedClassificationParentId = data.parentId;
          if (data.childId) {
            let classificationChild = getClassificationById(data.childId);
            if (classificationChild) {
              store.selectedClassificationChildId = data.childId;
            }
          }
          if (store.setting.classification.layout !== "top") {
            if (data.show) {
              classificationChildShowHiddenMap.value.set(data.parentId, true);
            }
            let strJson: string | null = getLocalSetting(
              "classificationChildShowHiddenMap"
            );
            if (strJson) {
              let arr: Array<number> = JSON.parse(strJson);
              for (const id of arr) {
                classificationChildShowHiddenMap.value.set(id, true);
              }
            }
          }
        }
      }
    }
  }
  if (defaultFlag) {
    // 默认选中
    defaultSelected(null, null);
  }
}
// 创建滚动条
function createSimpleBar() {
  if (
    store.setting.classification.layout === "left" ||
    store.setting.classification.layout === "right"
  ) {
    let element = document.getElementById("classification-content");
    if (element) {
      new SimpleBar(element);
    }
  }
}
// 默认选中
function defaultSelected(id: number | null, parentId: number | null) {
  if (id) {
    if (!parentId) {
      store.selectedClassificationParentId = id;
      store.selectedClassificationChildId = null;
    } else {
      store.selectedClassificationParentId = parentId;
      store.selectedClassificationChildId = id;
      classificationChildShowHiddenMap.value.set(
        store.selectedClassificationParentId,
        true
      );
    }
  } else {
    if (
      !store.selectedClassificationParentId &&
      store.classificationList.length > 0
    ) {
      store.selectedClassificationParentId = store.classificationList[0].id;
      store.selectedClassificationChildId = null;
    }
  }
  // 记住分类状态
  rememberClassification();
}
// 切换分类
let classificationTimer: any = null;
let classificationCounter: number = 0;
function switchParentClassification(id: number, counter: boolean) {
  if (store.selectedClassificationParentId !== id) {
    // 清除timeout
    clearTimeout(classificationTimer);
    classificationCounter = 0;
  }
  if (counter && hasChildClassification(id)) {
    // +1
    classificationCounter++;
    // 等于2就是双击
    if (classificationCounter === 2) {
      // 清除timeout
      clearTimeout(classificationTimer);
      // 归0
      classificationCounter = 0;
      // 双击操作
      if (classificationChildShowHiddenMap.value.has(id)) {
        // 收起
        classificationChildShowHiddenMap.value.delete(id);
      } else {
        // 展开
        classificationChildShowHiddenMap.value.set(id, true);
      }
    } else {
      // 间隔为500毫秒，如果超过500毫秒就代表不是双击
      classificationTimer = setTimeout(function () {
        classificationCounter = 0;
      }, 500);
    }
  }
  store.selectedClassificationParentId = id;
  store.selectedClassificationChildId = null;
  store.itemBatchOperation = false;
  // TOP布局
  layoutTopHideOtherSubClassification(null, id);
  // 记住分类状态
  rememberClassification();
  if (
    store.setting.classification
      .switchClassificationCollapseOtherSubClassification
  ) {
    // 收起其他子分类
    collapseSubClassification(store.selectedClassificationParentId);
  }
}
// 切换子分类
function switchChildClassification(parentId: number, id: number) {
  store.selectedClassificationParentId = parentId;
  store.selectedClassificationChildId = id;
  store.itemBatchOperation = false;
  // TOP布局
  layoutTopHideOtherSubClassification(null, parentId);
  // 记住分类状态
  rememberClassification();
  if (
    store.setting.classification
      .switchClassificationCollapseOtherSubClassification
  ) {
    // 收起其他子分类
    collapseSubClassification(store.selectedClassificationParentId);
  }
}
// 根据分类ID切换分类
function switchClassificationById(classificationId: number | null) {
  if (classificationId) {
    // 查询分类
    let classification = getClassificationById(classificationId);
    if (classification) {
      if (classification.parentId) {
        switchChildClassification(classification.parentId, classification.id);
      } else {
        switchParentClassification(classification.id, false);
      }
    }
  }
}
// 鼠标悬停切换分类
let mouseHoverClassificationParentId: number | null = null;
let mouseHoverClassificationChildId: number | null = null;
let mouseHoverChangeClassificationSetTimeout: NodeJS.Timeout | null = null;
function mouseHoverChangeClassification(
  classificationParentId: number,
  classificationChildId: number | null,
  timeout: number
) {
  // 清空timeout
  clearMouseOverChangeClassificationSetTimeout();
  // 记录分类ID
  mouseHoverClassificationParentId = classificationParentId;
  mouseHoverClassificationChildId = classificationChildId;
  // 设置timeout
  mouseHoverChangeClassificationSetTimeout = setTimeout(() => {
    // 切换分类
    if (classificationChildId) {
      switchChildClassification(classificationParentId, classificationChildId);
    } else {
      switchParentClassification(classificationParentId, false);
    }
    // 清空timeout
    clearMouseOverChangeClassificationSetTimeout();
  }, timeout);
}
// 清空timeout
function clearMouseOverChangeClassificationSetTimeout() {
  if (mouseHoverChangeClassificationSetTimeout) {
    mouseHoverClassificationParentId = null;
    mouseHoverClassificationChildId = null;
    clearTimeout(mouseHoverChangeClassificationSetTimeout);
    mouseHoverChangeClassificationSetTimeout = null;
  }
}
// 鼠标悬停展开子分类
let mouseHoverShowHiddenChildClassificationSetTimeout: NodeJS.Timeout | null =
  null;
function mouseHovershowHiddenChildClassification(classificationId: number) {
  // 清空timeout
  clearMouseOverShowHiddenChildClassificationSetTimeout();
  // 设置timeout
  mouseHoverShowHiddenChildClassificationSetTimeout = setTimeout(() => {
    // 展开子分类
    if (
      hasChildClassification(classificationId) &&
      !classificationChildShowHiddenMap.value.has(classificationId)
    ) {
      classificationChildShowHiddenMap.value.set(classificationId, true);
    }
    // 清空timeout
    clearMouseOverShowHiddenChildClassificationSetTimeout();
  }, 400);
}
// 清空timeout
function clearMouseOverShowHiddenChildClassificationSetTimeout() {
  if (mouseHoverShowHiddenChildClassificationSetTimeout) {
    clearTimeout(mouseHoverShowHiddenChildClassificationSetTimeout);
    mouseHoverShowHiddenChildClassificationSetTimeout = null;
  }
}
// 展开或收起子分类
function showHiddenChildClassification(e: any, id: number) {
  if (classificationChildShowHiddenMap.value.has(id)) {
    classificationChildShowHiddenMap.value.delete(id);
  } else {
    classificationChildShowHiddenMap.value.set(id, true);
  }
  // TOP布局
  layoutTopHideOtherSubClassification(null, id);
  if (
    store.setting.classification
      .switchClassificationCollapseOtherSubClassification
  ) {
    // 收起其他子分类
    collapseSubClassification(id);
  }
  if (e) {
    e.stopPropagation();
  }
}
// 滚轮切换分类
function wheelSwitchClassification(e: any) {
  if (e) {
    // 阻止默认事件
    e.preventDefault();
  }
  // 分类
  let element = document.getElementById("classification-content");
  if (!element) {
    return;
  }
  // 获取是上还是下 -1为上 1为下
  const delta = Math.sign(e.deltaY);
  // 判断当前分类是第几
  let index = 0;
  for (let i = 0; i < store.classificationList.length; i++) {
    if (
      store.classificationList[i].id === store.selectedClassificationParentId
    ) {
      index = i;
    }
  }
  let n = index;
  // 切换分类
  if (delta === 1) {
    // 向下
    if (index < store.classificationList.length - 1) {
      n = index + 1;
    }
  } else {
    // 向上
    if (index > 0) {
      n = index - 1;
    }
  }
  if (n !== index) {
    let classification = store.classificationList[n];
    switchParentClassification(classification.id, false);
    if (
      store.setting.classification.layout === "left" ||
      store.setting.classification.layout === "right"
    ) {
      // 获取判断可以容纳多少个分类
      let classificationNum = Math.trunc(element.clientHeight / 34);
      // 获取滚动条实例
      let simpleBar = SimpleBar.instances.get(element);
      // 获取元素
      let classificationElement = document.getElementById(
        "classification-" + classification.id
      );
      if (!classificationElement) {
        return;
      }
      // 分类坐标
      let elTop = classificationElement.offsetTop;
      // 向下
      if (delta === 1 && n + 1 > classificationNum) {
        let newTop = elTop + 34 - element.clientHeight;
        if (newTop > simpleBar.getScrollElement().scrollTop) {
          simpleBar.getScrollElement().scrollTop = newTop;
        }
      } else if (delta === -1) {
        let down = Math.ceil(simpleBar.getScrollElement().scrollTop / 34);
        let boundingClientRect = classificationElement.getBoundingClientRect();
        if (n < down) {
          simpleBar.getScrollElement().scrollTop =
            simpleBar.getScrollElement().scrollTop -
            (34 - boundingClientRect.y);
        }
      }
    }
  }
}
// 隐藏其他子分类
function layoutTopHideOtherSubClassification(e: any, id: number | null) {
  // 如果是顶部布局，当点击除父级分类的地方的话，就收起子分类
  if (store.setting.classification.layout === "top") {
    // 寻找分类ID
    let findClassificationId = (target: any) => {
      if (target && target.classList) {
        if (target.classList.contains("classification-parent-content")) {
          let id = target.getAttribute("classification-id");
          if (id) {
            return parseInt(id);
          }
        }
      }
      return null;
    };
    // 分类ID
    let classificationId: number | null = id;
    if (!classificationId) {
      // 先寻找当前元素，寻找不到的话就寻找父级元素
      if (e.target) {
        classificationId = findClassificationId(e.target);
        if (!classificationId && e.target.parentElement) {
          classificationId = findClassificationId(e.target.parentElement);
        }
      }
    }
    // 如果分类ID不为空的话，就隐藏除当前分类的子分类列表
    if (classificationId) {
      for (const key of classificationChildShowHiddenMap.value.keys()) {
        if (key !== classificationId) {
          classificationChildShowHiddenMap.value.delete(key);
        }
      }
    } else {
      classificationChildShowHiddenMap.value = new Map();
    }
  }
}
// 收起子分类
function collapseSubClassification(id: number | null) {
  for (let key of classificationChildShowHiddenMap.value.keys()) {
    if (key !== id) {
      classificationChildShowHiddenMap.value.delete(key);
    }
  }
}
// 记住分类状态
function rememberClassification() {
  if (
    store.setting.classification.rememberSelectionState &&
    store.selectedClassificationParentId
  ) {
    // 记录选择分类的状态
    let data = {
      parentId: store.selectedClassificationParentId,
      childId: store.selectedClassificationChildId,
      show:
        store.setting.classification.layout === "top"
          ? false
          : classificationChildShowHiddenMap.value.has(
              store.selectedClassificationParentId
            ),
    };
    setLocalSetting("classificationSelected", JSON.stringify(data));
    // 记录分类展开状态
    if (
      store.setting.classification.layout !== "top" &&
      classificationChildShowHiddenMap.value.size > 0
    ) {
      let arr = [];
      for (const key of classificationChildShowHiddenMap.value.keys()) {
        arr.push(key);
      }
      setLocalSetting("classificationChildShowHiddenMap", JSON.stringify(arr));
    } else {
      deleteLocalSetting("classificationChildShowHiddenMap");
    }
  }
}
// 父级分类拖拽对象
let classificationParentSortable: Sortable | null = null;
// 创建父级分类拖拽对象
function createClassificationParentSortable() {
  // 如果存在先销毁
  if (classificationParentSortable) {
    classificationParentSortable.destroy();
  }
  // 创建
  let element = document.getElementById("classification-list");
  if (element) {
    classificationParentSortable = Sortable.create(element, {
      animation: 0,
      forceFallback: true,
      fallbackTolerance: 4,
      disabled: lockClassification,
      onStart() {
        store.classificationSorting = true;
      },
      async onEnd({ newIndex, oldIndex }) {
        if (
          newIndex !== null &&
          newIndex !== undefined &&
          oldIndex !== null &&
          oldIndex !== undefined
        ) {
          // 当前分类
          const currentClassification = store.classificationList[oldIndex];
          // 目标分类
          const targetClassification = store.classificationList[newIndex];
          // 更新序号数据库
          let res = window.classification.updateOrder(
            currentClassification.id,
            !targetClassification ? null : targetClassification.id,
            null
          );
          if (res) {
            // 更新序号
            updateClassificationOrder(
              currentClassification.id,
              !targetClassification ? null : targetClassification.id,
              null
            );
          }
          store.classificationSorting = false;
          // 刷新DOM完毕执行
          nextTick(() => {
            // 分类宽度
            setClassificationWidth();
            // 页面高度 - 34（标题栏固定高度）
            height.value = document.documentElement.clientHeight - 34;
            // 创建子级分类拖拽对象
            createClassificationChildSortable();
          });
        }
      },
    });
  }
}
// 子级分类拖拽对象
let classificationChildSortable: Array<Sortable> | null = null;
// 创建父级分类拖拽对象
function createClassificationChildSortable() {
  // 如果存在先销毁
  if (classificationChildSortable) {
    for (const sortable of classificationChildSortable) {
      if (sortable) {
        sortable.destroy();
      }
    }
  }
  classificationChildSortable = [];
  // 创建
  let classificationChildElementList = document.getElementsByClassName(
    "classification-child-list"
  );
  for (let i = 0; i < classificationChildElementList.length; i++) {
    const element = classificationChildElementList[i];
    classificationChildSortable.push(
      Sortable.create(<HTMLElement>element, {
        animation: 0,
        forceFallback: false,
        fallbackTolerance: 4,
        disabled: lockClassification,
        onStart() {
          store.classificationSorting = true;
        },
        async onEnd({ newIndex, oldIndex }) {
          // 先查询父级分类
          let parentId: number = parseInt(
            element.getAttribute("classification-parent-id")!
          );
          let parentClassification = getClassificationById(parentId);
          if (
            parentClassification &&
            parentClassification.childList &&
            parentClassification.childList.length > 0 &&
            newIndex !== null &&
            newIndex !== undefined &&
            oldIndex !== null &&
            oldIndex !== undefined
          ) {
            // 当前分类
            const currentClassification =
              parentClassification.childList[oldIndex];
            // 目标分类
            const targetClassification =
              parentClassification.childList[newIndex];
            // 更新序号数据库
            let res = window.classification.updateOrder(
              currentClassification.id,
              !targetClassification ? null : targetClassification.id,
              parentId
            );
            if (res) {
              // 更新序号
              updateClassificationOrder(
                currentClassification.id,
                !targetClassification ? null : targetClassification.id,
                parentId
              );
            }
          }
          store.classificationSorting = false;
          // 刷新DOM完毕执行
          nextTick(() => {
            // 分类宽度
            setClassificationWidth();
          });
        },
      })
    );
  }
}
// 页面高度
let height = ref(0);
// 初始化页面尺寸
resize();
// 监听页面大小
function resize() {
  // 刷新DOM完毕执行
  nextTick(() => {
    // 分类宽度
    setClassificationWidth();
    // 页面高度 - 34（标题栏固定高度）
    height.value = document.documentElement.clientHeight - 34;
  });
}
// 监听滚轮
function wheel(e: any) {
  if (!store.setting.classification.mouseWheel) {
    return;
  }
  // 滚轮切换分类
  wheelSwitchClassification(e);
}
// 监听鼠标右键
async function contextmenu(e: any) {
  e.preventDefault();
  e.stopPropagation();
  let classification: Classification | null = null;
  // 判断区域
  if (getClassElement(e, "classification-parent-content")) {
    // 获取分类ID
    let element = getClassElement(e, "classification-parent-content");
    let id = parseInt(element.getAttribute("classification-id"));
    // 切换分类
    switchParentClassification(id, false);
    // 查询分类
    classification = convert(getClassificationById(id));
  } else if (getClassElement(e, "classification-child")) {
    // 获取分类ID切换分类
    let element = getClassElement(e, "classification-child");
    let id = parseInt(element.getAttribute("classification-id"));
    let parentId = parseInt(element.getAttribute("classification-parent-id"));
    switchChildClassification(parentId, id);
    // 查询分类
    classification = convert(getClassificationById(id));
  }
  // 弹出菜单
  window.classification.showRightMenu(classification, lockClassification);
}
// 设置分类宽度
let classificationWidth = ref(0);
function setClassificationWidth() {
  // 获取分类区域
  let classificationListElement = document.getElementById(
    "classification-list"
  );
  if (classificationListElement) {
    // 获取每个分类
    let classificationParentListElement =
      classificationListElement.getElementsByClassName("classification-parent");
    // 分类位置为顶部时需要设置分类宽度
    if (store.setting.classification.layout === "top") {
      // 当前分类区域宽度
      let width = window.innerWidth - 14;
      // 最小宽度
      let minWidth =
        store.setting.classification.mode === "icon"
          ? 35
          : store.setting.classification.width;
      // 计算每个分类宽度
      let num = Math.floor(width / (minWidth + 4));
      // 设置分类宽度
      if (classificationParentListElement.length >= num) {
        for (let i = 0; i < classificationParentListElement.length; i++) {
          let element = classificationParentListElement[i] as HTMLElement;
          element.style.width = (width - num * 4) / num + "px";
          classificationWidth.value = (width - num * 4) / num;
        }
      } else {
        for (let i = 0; i < classificationParentListElement.length; i++) {
          let element = classificationParentListElement[i] as HTMLElement;
          element.style.width = minWidth + "px";
          classificationWidth.value = minWidth;
        }
      }
    } else {
      // 设置分类宽度
      for (let i = 0; i < classificationParentListElement.length; i++) {
        let element = classificationParentListElement[i] as HTMLElement;
        element.style.width = "100%";
      }
    }
  }
}
// mouseover
function mouseover(e: any) {
  // 鼠标经过添加分类样式
  if (getClassElement(e, "classification-child")) {
    let style: Map<string, string> = new Map();
    style.set("color", store.setting.appearance.theme.secondFontColor);
    style.set(
      "background-color",
      store.setting.appearance.theme.secondBackgroundColor
    );
    setStyle(e, "classification-child", style);
    // 分类ID
    let classificationElement = getClassElement(e, "classification-child");
    let classificationId = parseInt(
      classificationElement.getAttribute("classification-id")
    );
    // 父级分类ID
    let classificationParentId = parseInt(
      classificationElement.getAttribute("classification-parent-id")
    );
    // 如果是在项目拖拽中，跨分类移动项目
    if (store.itemSorting) {
      store.mouseoverClassificationId = classificationId;
    }
    if (
      store.setting.classification.mouseHover &&
      !store.itemSorting &&
      !store.classificationSorting
    ) {
      // 鼠标悬浮切换分类
      mouseHoverChangeClassification(
        classificationParentId,
        classificationId,
        store.setting.classification.mouseHoverMs
      );
    }
  } else if (getClassElement(e, "classification-parent-content")) {
    let style: Map<string, string> = new Map();
    style.set("color", store.setting.appearance.theme.secondFontColor);
    style.set(
      "background-color",
      store.setting.appearance.theme.secondBackgroundColor
    );
    setStyle(e, "classification-parent-content", style);
    // 分类ID
    let classificationElement = getClassElement(
      e,
      "classification-parent-content"
    );
    let classificationId = parseInt(
      classificationElement.getAttribute("classification-id")
    );
    // 如果是在项目拖拽中，跨分类移动项目
    if (store.itemSorting) {
      store.mouseoverClassificationId = classificationId;
      // 判断当前分类是否展开，如果没有展开的话需要展开
      if (
        hasChildClassification(classificationId) &&
        !classificationChildShowHiddenMap.value.has(classificationId)
      ) {
        mouseHovershowHiddenChildClassification(classificationId);
      }
    }
    if (
      store.setting.classification.mouseHover &&
      !store.itemSorting &&
      !store.classificationSorting
    ) {
      // 鼠标悬浮切换分类
      mouseHoverChangeClassification(
        classificationId,
        null,
        store.setting.classification.mouseHoverMs
      );
    }
  }
}
// mouseout
function mouseout(e: any) {
  // 鼠标移走删除分类样式
  if (getClassElement(e, "classification-child")) {
    // 获取分类ID
    let classificationChildElement = getClassElement(e, "classification-child");
    let classificationId = parseInt(
      classificationChildElement.getAttribute("classification-id")
    );
    let classificationParentId = parseInt(
      classificationChildElement.getAttribute("classification-parent-id")
    );
    // 如果鼠标移走的是当前选中的分类则不删除样式
    if (!isSelectedChild(classificationId, classificationParentId)) {
      let style: Map<string, string | null> = new Map();
      style.set("color", null);
      style.set("background-color", null);
      removeStyle(e, "classification-child", style);
    }
  } else if (getClassElement(e, "classification-parent-content")) {
    // 获取分类ID
    let classificationParentElement = getClassElement(
      e,
      "classification-parent-content"
    );
    let classificationId = parseInt(
      classificationParentElement.getAttribute("classification-id")
    );
    // 如果鼠标移走的是当前选中的分类则不删除样式
    if (!isSelectedParent(classificationId)) {
      let style: Map<string, string | null> = new Map();
      style.set("color", null);
      style.set("background-color", null);
      removeStyle(e, "classification-parent-content", style);
    }
  }
  // 清空悬浮时分类ID
  store.mouseoverClassificationId = null;
  // 清空鼠标悬停切换分类timeout
  clearMouseOverChangeClassificationSetTimeout();
  // 清空鼠标悬停展开子分类timeout
  clearMouseOverShowHiddenChildClassificationSetTimeout();
}
// dragover
function dragover(e: any) {
  // 鼠标经过添加分类样式
  if (findElement(e.target, "classification-child")) {
    // 分类ID
    let target = findElement(e.target, "classification-child");
    let classificationId = parseInt(target.getAttribute("classification-id"));
    // 父级分类ID
    let classificationParentId = parseInt(
      target.getAttribute("classification-parent-id")
    );
    if (
      mouseHoverClassificationParentId !== classificationParentId ||
      mouseHoverClassificationChildId !== classificationId
    ) {
      // 鼠标悬浮切换分类
      mouseHoverChangeClassification(
        classificationParentId,
        classificationId,
        400
      );
    }
  } else if (findElement(e.target, "classification-parent-content")) {
    let target = findElement(e.target, "classification-parent-content");
    // 分类ID
    let classificationId = parseInt(target.getAttribute("classification-id"));
    if (!mouseHoverClassificationParentId && !mouseHoverClassificationChildId) {
      // 鼠标悬浮切换分类
      mouseHoverChangeClassification(classificationId, null, 400);
    }
  }
  e.preventDefault();
  e.stopPropagation();
}
// drop
function drop(e: any) {
  // 如果项目在拖拽排序中直接返回
  if (store.itemSorting) {
    return;
  }
  // 获取文件列表
  let pathList = [];
  for (const file of e.dataTransfer.files) {
    pathList.push(file.path);
  }
  if (pathList.length > 0) {
    // 根据文件夹创建分类
    window.classification.addClassificationByDirectory(pathList);
  }
}
// updated
onUpdated(() => {
  // 刷新DOM完毕执行
  nextTick(() => {
    // 分类宽度
    setClassificationWidth();
  });
});
// beforeMount
onBeforeMount(async () => {
  await getClassificationList();
  // 刷新DOM完毕执行
  nextTick(() => {
    // 分类宽度
    setClassificationWidth();
    // 创建父级分类拖拽对象
    createClassificationParentSortable();
    // 创建子级分类拖拽对象
    createClassificationChildSortable();
  });
});
// 监听
let listens: Array<Function> = [];
// moutned
onMounted(() => {
  // resize
  window.addEventListener("resize", resize, true);
  // 刷新DOM完毕执行
  nextTick(() => {
    // 分类宽度
    setClassificationWidth();
    // 滚动条
    createSimpleBar();
    // 创建父级分类拖拽对象
    createClassificationParentSortable();
    // 创建子级分类拖拽对象
    createClassificationChildSortable();
  });
  // 监听新增分类
  listens.push(
    window.classification.onAdd((data) => {
      // 分类
      let classification: Classification = data;
      // 添加分类
      addClassification(classification);
      // 默认选中
      defaultSelected(classification.id, classification.parentId);
      // 刷新DOM完毕执行
      nextTick(() => {
        // 分类宽度
        setClassificationWidth();
        // 创建父级分类拖拽对象
        createClassificationParentSortable();
        // 创建子级分类拖拽对象
        createClassificationChildSortable();
      });
    })
  );
  // 监听更新分类
  listens.push(
    window.classification.onUpdate((data) => {
      updateClassification(data);
      // 刷新DOM完毕执行
      nextTick(() => {
        // 分类宽度
        setClassificationWidth();
      });
    })
  );
  // 监听删除分类
  listens.push(
    window.classification.onDelete((data) => {
      // 删除
      deleteClassification(data);
      // 清空选中ID
      store.selectedClassificationParentId = null;
      store.selectedClassificationChildId = null;
      // 默认选中
      defaultSelected(null, null);
      // 刷新DOM完毕执行
      nextTick(() => {
        // 分类宽度
        setClassificationWidth();
        // 创建父级分类拖拽对象
        createClassificationParentSortable();
        // 创建子级分类拖拽对象
        createClassificationChildSortable();
      });
    })
  );
  // 监听锁定/解锁分类
  listens.push(
    window.classification.onLock((data) => {
      if (!lockClassification) {
        setLocalSetting("lockClassification", "true");
        lockClassification = true;
      } else {
        deleteLocalSetting("lockClassification");
        lockClassification = false;
      }
      // 刷新DOM完毕执行
      nextTick(() => {
        // 创建父级分类拖拽对象
        createClassificationParentSortable();
        // 创建子级分类拖拽对象
        createClassificationChildSortable();
      });
    })
  );
  // 更新分类图标
  listens.push(
    window.classification.onUpdateIcon((data) => {
      updateClassificationIcon(data.id, data.icon);
    })
  );
  // 收起子分类
  listens.push(
    window.classification.onCollapseSubClassification((data) => {
      collapseSubClassification(null);
    })
  );
  // 修改项目布局
  listens.push(
    window.classification.onUpdateItemLayout((data) => {
      let dataList = data;
      for (const data of dataList) {
        let classification = getClassificationById(data.id);
        if (classification) {
          classification.data.itemLayout = data.layout;
        }
      }
    })
  );
  // 修改项目排序
  listens.push(
    window.classification.onUpdateItemSort((data) => {
      let dataList = data;
      for (const data of dataList) {
        let classification = getClassificationById(data.id);
        if (classification) {
          classification.data.itemSort = data.sort;
        }
      }
    })
  );
  // 修改项目列数
  listens.push(
    window.classification.onUpdateItemColumnNumber((data) => {
      let classification = getClassificationById(data.id);
      if (classification) {
        classification.data.itemColumnNumber = data.columnNumber;
      }
    })
  );
  // 修改项目图标
  listens.push(
    window.classification.onUpdateItemIconSize((data) => {
      let dataList = data;
      for (const data of dataList) {
        let classification = getClassificationById(data.id);
        if (classification) {
          classification.data.itemIconSize = data.iconSize;
        }
      }
    })
  );
  // 监听根据文件夹创建分类
  listens.push(
    window.classification.onAddClassificationByDirectory((data) => {
      for (let i = 0; i < data.length; i++) {
        // 分类
        let classification: Classification = data[i].classification;
        // 添加分类
        addClassification(classification);
        // 添加项目
        window.item.drop(classification.id, data[i].fileList);
      }
      // 刷新DOM完毕执行
      nextTick(() => {
        // 分类宽度
        setClassificationWidth();
        // 创建父级分类拖拽对象
        createClassificationParentSortable();
        // 创建子级分类拖拽对象
        createClassificationChildSortable();
      });
    })
  );
  // 修改项目显示
  listens.push(
    window.classification.onUpdateItemShowOnly((data) => {
      let dataList = data;
      for (const data of dataList) {
        let classification = getClassificationById(data.id);
        if (classification) {
          classification.data.itemShowOnly = data.showOnly;
        }
      }
    })
  );
  // 修改固定分类
  listens.push(
    window.classification.onUpdateFixed((data) => {
      let id: number | null = data;
      for (let classification of store.classificationList) {
        classification.data.fixed = id === classification.id;
        if (classification.childList) {
          for (let childClassification of classification.childList) {
            childClassification.data.fixed = id === childClassification.id;
          }
        }
      }
    })
  );
  // 将排序为打开次数的分类修改为默认排序
  listens.push(
    window.classification.onUpdateItemOpenNumberSortToDefualt((data) => {
      for (const id of data) {
        let classification = getClassificationById(id);
        if (
          classification &&
          (classification.type === 0 || classification.type === 1)
        ) {
          classification.data.itemSort = "default";
        }
      }
    })
  );
  // 修改关联文件夹
  listens.push(
    window.classification.onUpdateAssociateFolder((data) => {
      let classification = getClassificationById(data.id);
      if (classification) {
        classification.type = data.type;
        classification.data.associateFolderPath = data.path;
        classification.data.associateFolderHiddenItems = data.hiddenItems;
      }
    })
  );
  // 修改聚合分类
  listens.push(
    window.classification.onUpdateAggregate((data) => {
      let classification = getClassificationById(data.id);
      if (classification) {
        classification.type = 2;
        classification.data.itemSort = data.sort;
        classification.data.aggregateItemCount = data.itemCount;
        deleteItemByClassificationId(data.id);
      }
    })
  );
  // 修改排除搜索
  listens.push(
    window.classification.onUpdateExcludeSearch((data) => {
      let classification = getClassificationById(data.id);
      if (classification) {
        classification.data.excludeSearch = data.value;
      }
    })
  );
});
// unmounted
onUnmounted(() => {
  // resize
  window.removeEventListener("resize", resize, true);
  // 删除监听
  unlistens(listens);
});
</script>
../../../../types/classification
