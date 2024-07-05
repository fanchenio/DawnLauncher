<template>
  <div
    id="main"
    class="flex flex-col text-sm w-full"
    :style="{
      height: height + 'px',
      color: store.setting.appearance.theme.mainFontColor,
      backgroundColor:
        store.setting.appearance.backgroundImage &&
        store.backgroundImage &&
        store.setting.appearance.backgroundImageTransparency < 1
          ? undefined
          : hexToRGBA(
              store.setting.appearance.theme.mainBackgroundColor,
              store.setting.appearance.transparency
            ),
      borderRadius:
        store.setting.appearance.transparency < 1 &&
        store.setting.appearance.windowRounded
          ? '8px'
          : undefined,
      backgroundImage:
        store.setting.appearance.backgroundImage &&
        store.backgroundImage &&
        store.setting.appearance.backgroundImageTransparency == 1
          ? 'url(' + store.backgroundImage + ')'
          : undefined,
      backgroundRepeat: store.setting.appearance.backgroundImageMode,
      backgroundPosition:
        store.setting.appearance.backgroundImagePosition === 'default'
          ? undefined
          : store.setting.appearance.backgroundImagePosition,
    }"
  >
    <!-- 标题栏 -->
    <div class="h-[34px] flex">
      <!-- 左侧：标题 -->
      <h1
        class="mx-2 flex items-center h-[34px] float-left text-sm w-[140px] app-region-drag"
      >
        {{ store.setting.appearance.title }}
      </h1>
      <!-- 右侧 -->
      <div class="flex flex-1 app-region-drag">
        <!-- 图标 -->
        <div class="ml-auto flex items-center app-region-no-drag">
          <NPopselect
            class="window-setting"
            :options="[]"
            trigger="click"
            size="small"
          >
            <Icon
              class="mx-2"
              size="18"
              :style="{
                filter: store.setting.appearance.fontShadow
                  ? 'drop-shadow(1px 1px 1px ' +
                    store.setting.appearance.fontShadowColor +
                    ')'
                  : null,
              }"
              :class="[
                `${
                  store.setting.general.alwaysTop ||
                  store.setting.general.fixedPosition ||
                  store.setting.general.alwaysCenter ||
                  store.setting.general.lockSize
                    ? '!text-[#03C988]'
                    : ''
                }`,
              ]"
              :title="store.language.window"
            >
              <svg class="text-[18px]" viewBox="0 0 24 24">
                <path fill="currentColor" d="M4,4H20V20H4V4M6,8V18H18V8H6Z" />
              </svg>
            </Icon>
            <template #empty>
              <NForm
                label-placement="left"
                :show-feedback="false"
                size="small"
                class="py-[6px] pl-[10px] pr-[2px]"
              >
                <NFormItem>
                  <NCheckbox
                    v-model:checked="store.setting.general.alwaysTop"
                    size="small"
                    :focusable="false"
                    @update:checked="setAlwaysTop"
                    >{{ store.language.alwaysTop }}</NCheckbox
                  >
                </NFormItem>
                <NFormItem>
                  <NCheckbox
                    v-model:checked="store.setting.general.lockSize"
                    size="small"
                    :focusable="false"
                    @update:checked="setLockSize"
                    >{{ store.language.lockSize }}</NCheckbox
                  >
                </NFormItem>
                <NFormItem>
                  <NCheckbox
                    v-model:checked="store.setting.general.fixedPosition"
                    size="small"
                    :focusable="false"
                    @update:checked="setFixedPosition"
                    >{{ store.language.fixedPosition }}</NCheckbox
                  >
                </NFormItem>
                <NFormItem>
                  <NCheckbox
                    v-model:checked="store.setting.general.alwaysCenter"
                    size="small"
                    :focusable="false"
                    @update:checked="setAlwaysCenter"
                    >{{ store.language.alwaysCenter }}</NCheckbox
                  >
                </NFormItem>
              </NForm>
            </template>
          </NPopselect>
          <Icon
            class="mx-2 search-icon"
            size="18"
            :style="{
              filter: store.setting.appearance.fontShadow
                ? 'drop-shadow(1px 1px 1px ' +
                  store.setting.appearance.fontShadowColor +
                  ')'
                : null,
            }"
            :title="store.language.search"
            @mouseover="setIconStyle($event, 'search-icon', store.setting)"
            @mouseout="removeIconStyle($event, 'search-icon')"
            @click="store.search = !store.search"
          >
            <SearchRound></SearchRound>
          </Icon>
          <NDropdown
            trigger="click"
            size="small"
            :options="topRightMenuOptions"
          >
            <Icon
              class="mx-2 menu-icon"
              size="18"
              :style="{
                filter: store.setting.appearance.fontShadow
                  ? 'drop-shadow(1px 1px 1px ' +
                    store.setting.appearance.fontShadowColor +
                    ')'
                  : null,
              }"
              @mouseover="setIconStyle($event, 'menu-icon', store.setting)"
              @mouseout="removeIconStyle($event, 'menu-icon')"
              :title="store.language.settings"
            >
              <MenuRound></MenuRound>
            </Icon>
          </NDropdown>
          <Icon
            class="ml-2 mr-2 close-icon"
            size="18"
            :style="{
              filter: store.setting.appearance.fontShadow
                ? 'drop-shadow(1px 1px 1px ' +
                  store.setting.appearance.fontShadowColor +
                  ')'
                : null,
            }"
            @mouseover="setIconStyle($event, 'close-icon', store.setting)"
            @mouseout="removeIconStyle($event, 'close-icon')"
            @click="hideWindow"
            :title="store.language.close"
          >
            <CloseRound></CloseRound>
          </Icon>
        </div>
      </div>
    </div>
    <!-- 内容 -->
    <div
      class="h-full w-full"
      :class="[
        `${store.setting.classification.layout !== 'top' ? 'flex' : ''}`,
      ]"
    >
      <ClassificationContent
        ref="classificationContentRef"
        :class="[
          `${
            store.setting.classification.layout === 'left'
              ? 'order-1'
              : store.setting.classification.layout === 'right'
              ? 'order-2'
              : ''
          }`,
        ]"
      ></ClassificationContent>
      <ItemContent
        :class="[
          `${
            store.setting.classification.layout === 'left'
              ? 'order-2'
              : store.setting.classification.layout === 'right'
              ? 'order-1'
              : ''
          }`,
        ]"
      ></ItemContent>
    </div>
  </div>
  <!-- 搜索 -->
  <Search v-if="store.search"></Search>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { Icon } from "@vicons/utils";
import { SearchRound, MenuRound, CloseRound } from "@vicons/material";
import {
  setIconStyle,
  removeIconStyle,
  hexToRGBA,
  getIdElement,
  getClassElement,
} from "../../utils/style";
import ClassificationContent from "../classification/components/Content.vue";
import ItemContent from "../item/components/Content.vue";
import { NDropdown, NPopselect, NCheckbox, NForm, NFormItem } from "naive-ui";
import { Setting } from "../../../types/setting";
import { convert } from "../../../commons/utils/common";
import { getClassificationFixed } from "../classification/js/index";
import { unlistens } from "../../utils/common";
import { getShortcutKey } from "../../utils/common";
import { Item } from "../../../types/item";
import { Classification } from "../../../types/classification";
import { getItemListByClassificationId, run } from "../item/js";
import Search from "../search/components/Search.vue";
import { useMainStore } from "../../store";
// pinia
const store = useMainStore();
// ref
const classificationContentRef = ref<any>(null);
// 监听
watch(
  () => store.setting.appearance.backgroundImageTransparency,
  () => {
    createBackgroundImageStyle();
  }
);
watch(
  () => store.setting.appearance,
  () => {
    createBackgroundImageStyle();
  },
  { deep: true }
);
// 背景图
if (store.setting.appearance.backgroundImage) {
  window.setting.getBackgroundImage(
    store.setting.appearance.backgroundImage,
    "mainWindow"
  );
}
// 右上角菜单
let topRightMenuOptions = ref<Array<any>>([
  {
    label: store.language.settings,
    key: "Setting",
    props: {
      onclick: () => {
        window.setting.createWindow();
      },
    },
  },
  {
    type: "divider",
  },
  {
    label: store.language.backupRestoreData,
    key: "BackupRestoreData",
    props: {
      onclick: () => {
        window.data.createBackupRestoreDataWindow();
      },
    },
  },
  {
    type: "divider",
  },
  {
    label: store.language.about,
    key: "About",
    props: {
      onclick: () => {
        window.about.createWindow();
      },
    },
  },
  {
    label: store.language.feedback,
    key: "Feedback",
    props: {
      onclick: () => {
        window.api.openURL("https://support.qq.com/product/487828");
      },
    },
  },
  {
    label: store.language.exit,
    key: "Exit",
    props: {
      onclick: () => {
        window.api.exit();
      },
    },
  },
]);
// 隐藏窗口
function hideWindow() {
  window.main.hideWindow();
}
// 永远置顶
function setAlwaysTop(value: boolean) {
  window.setting.setAlwaysTop(value);
  updateSetting();
}
// 锁定尺寸
function setLockSize(value: boolean) {
  window.setting.setLockSize(value);
  updateSetting();
}
// 固定位置
function setFixedPosition(value: boolean) {
  // 固定位置和永远居中不能同时存在
  window.setting.setFixedPosition(value, store.setting.general.alwaysCenter);
  updateSetting();
}
// 永远居中
function setAlwaysCenter(value: boolean) {
  // 固定位置和永远居中不能同时存在
  window.setting.setAlwaysCenter(store.setting.general.fixedPosition, value);
  updateSetting();
}
// 更新设置
function updateSetting() {
  let setting: Setting = convert(store.setting);
  window.setting.update(setting);
}
// 页面高度
let height = ref(0);
// 初始化页面尺寸
resize();
// 监听页面大小
function resize() {
  // 页面高度
  height.value = document.documentElement.clientHeight;
}
// 加载完dom后再显示页面
nextTick(() => {
  if (!store.setting.general.startupTray) {
    window.main.showWindow(false, false);
  }
  window.main.initData();
});
// 背景图Style
createBackgroundImageStyle();
function createBackgroundImageStyle() {
  // 找到要删除的 style 标签
  let oldBackgroundImageStyle = document.getElementById(
    "background-image-style"
  );
  // 如果找到了 style 标签，则从其父节点中移除
  if (oldBackgroundImageStyle && oldBackgroundImageStyle.parentNode) {
    oldBackgroundImageStyle.parentNode.removeChild(oldBackgroundImageStyle);
  }
  if (
    store.backgroundImage &&
    store.setting.appearance.backgroundImageTransparency < 1
  ) {
    // 创建一个新的伪类样式规则
    let backgroundImageStyle = document.createElement("style");
    backgroundImageStyle.setAttribute("id", "background-image-style");
    backgroundImageStyle.type = "text/css";
    // 设置伪类样式规则的内容
    backgroundImageStyle.innerHTML =
      "#main::before {" +
      "z-index: -1;" +
      'content: "";' +
      "position: absolute;" +
      "top: 0;" +
      "left: 0;" +
      "width: 100%;" +
      "height: 100%;" +
      'background-image: url("' +
      store.backgroundImage +
      '");' +
      "background-repeat: " +
      store.setting.appearance.backgroundImageMode +
      ";" +
      (store.setting.appearance.backgroundImagePosition === "default"
        ? ""
        : "background-position: " +
          store.setting.appearance.backgroundImagePosition +
          ";") +
      "opacity: " +
      store.setting.appearance.backgroundImageTransparency +
      ";" +
      (store.setting.appearance.transparency < 1 &&
      store.setting.appearance.windowRounded
        ? "border-radius: 8px;"
        : "") +
      "}";
    // 将伪类样式规则添加到 head 元素中
    document.head.appendChild(backgroundImageStyle);
  }
}
// 监听键盘
function keydown(e: any) {
  // ESC
  if (e.keyCode == 27) {
    if (store.search) {
      store.search = false;
    } else {
      window.main.hideWindow();
    }
    e.stopPropagation();
    e.preventDefault();
    return;
  }
  // 获取快捷键
  let shortcutKey = getShortcutKey(e, null, false);
  if (shortcutKey) {
    // 分类
    let hitClassification: Classification | null = null;
    // 项目
    let hitItem: Item | null = null;
    // 根据快捷键寻找分类或者项目
    mainLoop: for (const parent of store.classificationList) {
      // 父级分类
      if (parent.shortcutKey === shortcutKey) {
        hitClassification = parent;
        break;
      }
      // 获取项目
      let itemList = getItemListByClassificationId(parent.id);
      for (const item of itemList) {
        if (item.shortcutKey === shortcutKey) {
          hitItem = item;
          break mainLoop;
        }
      }
      // 有子分类
      if (parent.childList) {
        for (const child of parent.childList) {
          if (child.shortcutKey === shortcutKey) {
            hitClassification = child;
            break mainLoop;
          }
          // 获取项目
          let itemList = getItemListByClassificationId(child.id);
          for (const item of itemList) {
            if (item.shortcutKey === shortcutKey) {
              hitItem = item;
              break mainLoop;
            }
          }
        }
      }
    }
    // 切换分类
    if (hitClassification) {
      classificationContentRef.value.switchClassificationById(
        hitClassification.id
      );
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // 运行项目
    if (hitItem) {
      run("main", "open", hitItem);
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // 搜索
    if (store.setting.general.searchShowHideShortcutKey === shortcutKey) {
      store.search = true;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }
}
// 监听
let listens: Array<Function> = [];
// moutned
onMounted(() => {
  // onclick
  window.onclick = (e: any) => {
    // 分类TOP布局，隐藏其他子分类
    classificationContentRef.value.layoutTopHideOtherSubClassification(e, null);
    // 判断是否点击在Search区域
    if (!getIdElement(e, "search") && !getClassElement(e, "search-icon")) {
      store.search = false;
    }
  };
  // resize
  window.addEventListener("resize", resize, true);
  // 监听键盘
  window.addEventListener("keydown", keydown, true);
  // 监听设置背景图
  listens.push(
    window.setting.onSetBacngroundImage((data) => {
      store.backgroundImage = data;
      createBackgroundImageStyle();
    })
  );
  // 监听显示窗口之前
  listens.push(
    window.main.onShowWindowBefore((data) => {
      if (classificationContentRef.value) {
        // 如果分类ID不为空的话选择分类ID
        let selectedClassificationId: number | null =
          data.selectedClassificationId;
        if (!selectedClassificationId) {
          // 尝试查询固定分类
          let classification = getClassificationFixed();
          if (classification) {
            selectedClassificationId = classification.id;
          }
        }
        if (selectedClassificationId) {
          classificationContentRef.value.switchClassificationById(
            selectedClassificationId
          );
        }
      }
      // 刷新DOM完毕执行
      nextTick(() => {
        setTimeout(() => {
          // 显示窗口
          window.main.showWindow(data.blurHide, data.autoHide);
        }, 10);
      });
    })
  );
});
// unmounted
onUnmounted(() => {
  // resize
  window.removeEventListener("resize", resize, true);
  // 监听键盘
  window.removeEventListener("keydown", keydown, true);
  // 删除监听
  unlistens(listens);
});
</script>
<style lang="less">
.window-setting .n-base-select-menu__empty {
  padding: 0;
}
.window-setting.n-popover-shared.n-popover-shared--show-arrow {
  margin-top: 6px;
}
</style>
../../../types/setting
