<template>
  <div
    class="h-full text-sm"
    :style="{
      backgroundColor: store.setting.appearance.theme.mainBackgroundColor,
      color: store.setting.appearance.theme.mainFontColor,
      height: height + 'px',
    }"
  >
    <div class="flex items-center px-2 app-region-drag">
      <h1 class="w-full text-sm flex items-center h-[34px] app-region-drag">
        {{ !id ? store.language.newItem : store.language.editItem }}
      </h1>
      <Icon
        class="close-icon app-region-no-drag"
        size="18"
        @click="close"
        @mouseover="setIconStyle($event, 'close-icon', store.setting)"
        @mouseout="removeIconStyle($event, 'close-icon')"
        :title="store.language.close"
      >
        <CloseRound></CloseRound>
      </Icon>
    </div>
    <div class="flex">
      <ul class="px-2" v-if="!id">
        <li
          v-for="(menu, index) of menuList"
          :key="'menu-' + index"
          class="menu mb-1 px-2 flex items-center relative h-[30px] rounded"
          :class="[
            `${
              store.setting.classification.nameAlign === 'center'
                ? 'justify-center'
                : ''
            }`,
          ]"
          @mouseover="menuItemMouseover"
          @mouseout="menuItemMouseout($event, menu.id)"
          :style="{
            color:
              selectedMenuId === menu.id
                ? store.setting.appearance.theme.secondFontColor
                : undefined,
            backgroundColor:
              selectedMenuId === menu.id
                ? store.setting.appearance.theme.secondBackgroundColor
                : undefined,
          }"
          @click="changeMenu(menu.id)"
        >
          {{ menu.label }}
        </li>
      </ul>
      <div class="flex-1">
        <!-- 页面高度 - 34（标题栏固定高度） - 底部按钮（固定高度） -->
        <div id="content" :style="{ maxHeight: height - 34 - 40 + 'px' }">
          <div class="mx-2">
            <div
              class="flex items-end"
              v-if="
                selectedMenuId === 0 ||
                selectedMenuId === 1 ||
                selectedMenuId === 2 ||
                (selectedMenuId === 3 && id) ||
                (selectedMenuId === 4 && id) ||
                selectedMenuId === 5
              "
            >
              <!-- 默认无框 -->
              <div
                v-if="!form.data.icon && !form.data.htmlIcon"
                class="w-[38px] h-[38px] min-w-[38px] min-h-[38px] border border-solid rounded hover:cursor-pointer"
                :style="{
                  borderColor: store.setting.appearance.theme.borderColor,
                }"
                @click="getFileIcon"
              ></div>
              <template v-else>
                <!-- SVG代码图标 -->
                <template v-if="form.data.htmlIcon">
                  <div
                    class="mx-auto flex items-center justify-center w-[40px] h-[40px]"
                    @click="getFileIcon"
                    v-html="DOMPurify.sanitize(form.data.htmlIcon)"
                  ></div>
                </template>
                <!-- 普通图标 -->
                <template v-else-if="form.data.icon">
                  <!-- 使用背景 -->
                  <div
                    v-if="form.data.iconBackgroundColor"
                    class="mx-auto flex items-center justify-center w-[40px] h-[40px]"
                    style="background-color: rgb(0, 120, 215)"
                  >
                    <img
                      :src="form.data.icon"
                      class="w-[32px] h-[32px] hover:cursor-pointer"
                      @click="getFileIcon"
                    />
                  </div>
                  <!-- 无背景 -->
                  <img
                    v-else
                    :src="form.data.icon"
                    class="w-[40px] h-[40px] hover:cursor-pointer"
                    @click="getFileIcon"
                  />
                </template>
              </template>
              <div class="flex-1 ml-2">
                <span class="block">{{ store.language.name }}</span>
                <NInput
                  class="mt-1"
                  v-model:value="form.name"
                  clearable
                  size="small"
                  placeholder=""
                  :autofocus="true"
                ></NInput>
              </div>
            </div>
            <span
              class="block mt-2"
              v-if="
                selectedMenuId === 0 ||
                selectedMenuId === 1 ||
                selectedMenuId === 2 ||
                (selectedMenuId === 3 && id) ||
                (selectedMenuId === 4 && id) ||
                selectedMenuId === 5
              "
              >{{ store.language.modifyIcon }}</span
            >
            <div
              class="flex flex-wrap mt-1.5 items-center"
              v-if="
                selectedMenuId === 0 ||
                selectedMenuId === 1 ||
                selectedMenuId === 2 ||
                (selectedMenuId === 3 && id) ||
                (selectedMenuId === 4 && id) ||
                selectedMenuId === 5
              "
            >
              <NButton
                class="mr-1 px-[4px]"
                size="small"
                :focusable="false"
                @click="getFileIcon"
                :title="store.language.uploadIcon"
                ><Icon size="18"> <UploadRound></UploadRound> </Icon
              ></NButton>
              <NButton
                class="mr-1 px-[4px]"
                size="small"
                :focusable="false"
                @click="createNetworkIconWindow"
                :title="store.language.networkIcon"
                ><Icon size="18"> <LinkRound></LinkRound> </Icon
              ></NButton>
              <NButton
                class="mr-1 px-[4px]"
                size="small"
                :focusable="false"
                @click="createSVGIconWindow"
                :title="store.language.svgIcon"
                ><Icon size="18"> <CodeRound></CodeRound> </Icon
              ></NButton>
              <NButton
                v-if="
                  form.data.target &&
                  form.data.target.trim() !== '' &&
                  (selectedMenuId === 0 || selectedMenuId === 1)
                "
                class="px-[4px]"
                size="small"
                :focusable="false"
                @click="defaultIcon"
                :title="store.language.defaultIcon"
                ><Icon size="18"> <RestartAltRound></RestartAltRound> </Icon
              ></NButton>
            </div>
            <div
              v-if="
                selectedMenuId === 0 ||
                selectedMenuId === 1 ||
                (selectedMenuId === 3 && id) ||
                (selectedMenuId === 4 && id)
              "
              class="mt-1.5"
            >
              <NCheckbox
                v-if="form.type === 0 || form.type === 1"
                v-model:checked="form.data.fixedIcon"
                :focusable="false"
                :label="store.language.fixedIcon"
                :title="store.language.itemAddEditPrompt1"
              />
              <NCheckbox
                v-if="form.type === 4"
                v-model:checked="form.data.iconBackgroundColor"
                :focusable="false"
                :label="store.language.backgroundIcon"
              />
            </div>
            <div
              class="mt-2"
              v-if="
                selectedMenuId === 0 ||
                selectedMenuId === 1 ||
                selectedMenuId === 2 ||
                (selectedMenuId === 3 && id) ||
                (selectedMenuId === 4 && id) ||
                selectedMenuId === 5
              "
            >
              <span class="block">{{ store.language.shortcutKey }}</span>
              <NInput
                class="mt-1.5"
                v-model:value="form.shortcutKey"
                clearable
                size="small"
                placeholder=""
                @keydown="
                  tempShortcutKey = form.shortcutKey = getShortcutKey(
                    $event,
                    form.shortcutKey,
                    true
                  )
                "
                @blur="checkShortcutKey"
              ></NInput>
              <NCheckbox
                class="mt-2"
                v-model:checked="form.globalShortcutKey"
                :focusable="false"
                :label="store.language.globalShortcutKey"
              />
            </div>
            <div
              class="mt-2"
              v-if="
                selectedMenuId === 0 ||
                selectedMenuId === 1 ||
                selectedMenuId === 2 ||
                (selectedMenuId === 4 && id)
              "
            >
              <span class="block">{{
                selectedMenuId === 2 ? store.language.url : store.language.path
              }}</span>
              <NInput
                class="mt-1.5"
                type="textarea"
                v-model:value="form.data.target"
                size="small"
                placeholder=""
                :autosize="{ minRows: 3, maxRows: 3 }"
              ></NInput>
              <div class="flex flex-wrap mt-1.5">
                <NButton
                  type="primary"
                  size="small"
                  :focusable="false"
                  class="mr-2 w-20"
                  @click="select()"
                  v-if="selectedMenuId === 0 || selectedMenuId === 1"
                  >{{ store.language.select }}</NButton
                >
                <NButton
                  type="primary"
                  size="small"
                  :focusable="false"
                  class="mr-2"
                  :disabled="
                    !form.data.target || form.data.target.trim() === ''
                  "
                  @click="getURLInfo"
                  :loading="getURLInfoLoading"
                  v-if="selectedMenuId === 2"
                  >{{ store.language.getURLInformation }}</NButton
                >
                <NButton
                  type="primary"
                  size="small"
                  :focusable="false"
                  class="mr-2"
                  v-if="
                    (selectedMenuId === 0 || selectedMenuId === 1) &&
                    form.data.target
                  "
                  @click="convertPath"
                  >{{
                    isAbsolutePath(form.data.target)
                      ? store.language.convertRelativePath
                      : store.language.convertAbsolutePath
                  }}</NButton
                >
              </div>
            </div>
            <div class="mt-2" v-if="selectedMenuId === 0">
              <span class="block">{{ store.language.startLocation }}</span>
              <NInput
                class="mt-1.5"
                v-model:value="form.data.startLocation"
                clearable
                size="small"
                :placeholder="store.language.itemAddEditPrompt2"
              ></NInput>
            </div>
            <div class="mt-2" v-if="selectedMenuId === 0">
              <span class="block">{{ store.language.parameters }}</span>
              <NInput
                class="mt-1.5"
                v-model:value="form.data.params"
                clearable
                size="small"
                placeholder=""
              ></NInput>
            </div>
            <NCheckbox
              class="mt-2"
              v-if="
                selectedMenuId === 0 &&
                form.data.target &&
                form.data.target.trim() !== '' &&
                (getFileExtname(form.data.target) === 'exe' ||
                  getFileExtname(form.data.target) === 'bat')
              "
              v-model:checked="form.data.runAsAdmin"
              :focusable="false"
              :label="store.language.runAsAdministrator"
            />
            <MultiItem
              v-if="selectedMenuId === 5"
              :multiItemIdList="multiItemIdList"
              @update="updateMultiItem"
            ></MultiItem>
            <div class="mt-2" v-if="selectedMenuId === 5">
              <span class="block">{{ store.language.timeInterval }}</span>
              <NInputNumber
                v-model:value="form.data.multiItemsTimeInterval"
                size="small"
                :min="0"
                class="mt-1.5"
                :show-button="false"
                placeholder=""
              >
                <template #suffix>
                  {{ store.language.millisecond }}
                </template></NInputNumber
              >
            </div>
            <div
              class="mt-2"
              v-if="
                selectedMenuId === 0 ||
                selectedMenuId === 1 ||
                selectedMenuId === 2 ||
                (selectedMenuId === 3 && id) ||
                (selectedMenuId === 4 && id) ||
                selectedMenuId === 5
              "
            >
              <span class="block">{{ store.language.remark }}</span>
              <NInput
                class="mt-1.5"
                type="textarea"
                v-model:value="form.data.remark"
                size="small"
                placeholder=""
                :autosize="{ minRows: 3, maxRows: 3 }"
              ></NInput>
            </div>
            <!-- 系统项目 -->
            <SystemItemList
              v-if="selectedMenuId === 3 && !id"
              @selected="selectedCommonItem"
            ></SystemItemList>
            <!-- 开始菜单项目 -->
            <StartMenuItemList
              v-if="selectedMenuId === 400"
              @selected="selectedCommonItem"
            >
            </StartMenuItemList>
            <!-- Appx项目 -->
            <AppxItemList
              v-if="selectedMenuId === 4 && !id"
              @selected="selectedCommonItem"
            ></AppxItemList>
          </div>
        </div>
        <div class="absolute right-[0.5rem] bottom-[6px] flex items-center">
          <NButton
            v-if="
              selectedMenuId === 0 ||
              selectedMenuId === 1 ||
              selectedMenuId === 2 ||
              (selectedMenuId === 3 && id) ||
              (selectedMenuId === 4 && id) ||
              selectedMenuId === 5
            "
            type="primary"
            size="small"
            :focusable="false"
            class="mr-2 w-20"
            :disabled="
              !form.name ||
              form.name.trim() === '' ||
              !form.data.target ||
              form.data.target.trim() === ''
            "
            @click="confirm"
            >{{ store.language.ok }}</NButton
          >
          <NButton
            size="small"
            :focusable="false"
            class="w-20"
            @click="close"
            >{{ store.language.cancel }}</NButton
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, onUnmounted } from "vue";
import { Icon } from "@vicons/utils";
import {
  CloseRound,
  UploadRound,
  LinkRound,
  CodeRound,
  RestartAltRound,
} from "@vicons/material";
import { NInput, NButton, NCheckbox, useMessage, NInputNumber } from "naive-ui";
import SimpleBar from "simplebar";
import "simplebar/dist/simplebar.css";
import DOMPurify from "dompurify";
import {
  setIconStyle,
  removeIconStyle,
  setStyle,
  removeStyle,
} from "../../utils/style";
import { checkShortcutKey as commonCheckShortcutKey } from "../../utils/shortcutKey";
import { getShortcutKey } from "../../utils/common";
import { Result } from "../../../types/common";
import {
  convert,
  isAbsolutePath,
  deleteExtname,
  getFileName,
  getFileExtname,
} from "../../../commons/utils/common";
import SystemItemList from "./components/SystemItemList.vue";
import StartMenuItemList from "./components/StartMenuItemList.vue";
import AppxItemList from "./components/AppxItemList.vue";
import { newItem, newItemData } from "../../../commons/utils/common";
import { CommonItem, Item } from "../../../types/item";
import { scrollToTop, unlistens } from "../../utils/common";
import MultiItem from "./components/MultiItem.vue";
import { useMainStore } from "../../store";
// pinia
const store = useMainStore();
// message
const message = useMessage();
// 创建滚动条
let simpleBar: SimpleBar | null;
function createSimpleBar() {
  let element = document.getElementById("content");
  if (element) {
    simpleBar = new SimpleBar(element);
  }
}
// 获取页面参数
const queryParams = new URLSearchParams(window.location.search);
// 分类ID
let classificationId = queryParams.get("classificationId")!;
// 获取ID
let id = queryParams.get("id");
// form
let form: Item = reactive(
  newItem({
    classificationId: parseInt(classificationId),
  })
);
// 菜单
let menuList = [
  {
    id: 0,
    label: store.language.file,
  },
  {
    id: 1,
    label: store.language.folder,
  },
  {
    id: 2,
    label: store.language.url,
  },
  {
    id: 3,
    label: store.language.system,
  },
  {
    id: 400,
    label: store.language.startMenu,
  },
  {
    id: 4,
    label: store.language.appx,
  },
  {
    id: 5,
    label: store.language.multiItems,
  },
];
// 快捷键用
let oldShortcutKey: string | null = null;
let tempShortcutKey: string | null = null;
// 多项目列表
let multiItemIdList = ref<Array<number>>([]);
// 当前菜单
let selectedMenuId = ref<number>(0);
// 切换菜单
function changeMenu(menuId: number) {
  selectedMenuId.value = menuId;
  resetForm();
  if (menuId === 2) {
    form.data.htmlIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 -960 960 960" style="width: 100%; height: 100%;"><path fill="currentColor" d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-40-82v-78q-33 0-56.5-23.5T360-320v-40L168-552q-3 18-5.5 36t-2.5 36q0 121 79.5 212T440-162Zm276-102q20-22 36-47.5t26.5-53q10.5-27.5 16-56.5t5.5-59q0-98-54.5-179T600-776v16q0 33-23.5 56.5T520-680h-80v80q0 17-11.5 28.5T400-560h-80v80h240q17 0 28.5 11.5T600-440v120h40q26 0 47 15.5t29 40.5Z"/></svg>';
  } else if (menuId === 5) {
    form.data.htmlIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 -960 960 960" style="width: 100%; height: 100%;"><path fill="currentColor" d="M240-400v80h-80q-33 0-56.5-23.5T80-400v-400q0-33 23.5-56.5T160-880h400q33 0 56.5 23.5T640-800v80h-80v-80H160v400h80ZM400-80q-33 0-56.5-23.5T320-160v-400q0-33 23.5-56.5T400-640h400q33 0 56.5 23.5T880-560v400q0 33-23.5 56.5T800-80H400Zm0-80h400v-400H400v400Zm200-200Z" /></svg>';
  }
  scrollToTop(simpleBar);
}
// reset form
function resetForm() {
  form = reactive(
    newItem({
      classificationId: parseInt(classificationId),
      type: selectedMenuId.value,
    })
  );
}
// 编辑项目
if (id) {
  (async () => {
    let item = window.item.selectById(parseInt(id));
    if (item) {
      form = reactive(newItem(item));
      oldShortcutKey = form.shortcutKey;
      selectedMenuId.value = item.type;
      if (item.type === 5) {
        if (item.data.target) {
          let arr = item.data.target.split(",");
          multiItemIdList.value = arr.map((a) => parseInt(a));
        }
      }
    }
  })();
}
// 获取图标
function getFileIcon() {
  let filePath = window.api.selectFile(
    "itemAddEditWindow",
    false,
    form.data.target
  );
  if (filePath) {
    window.api.getFileIcon("itemAddEditWindow", filePath);
  }
}
/**
 * 校验快捷键
 */
async function checkShortcutKey() {
  if (form.shortcutKey && form.shortcutKey.trim() !== "") {
    let success = await commonCheckShortcutKey(
      store.setting,
      oldShortcutKey,
      form.shortcutKey,
      "itemAddEditWindow",
      "Item"
    );
    if (!success) {
      form.shortcutKey = null;
      tempShortcutKey = null;
    }
    return success;
  }
  return true;
}
// 选择
function select() {
  let path = null;
  if (selectedMenuId.value === 0) {
    // 文件
    path = window.api.selectFile("itemAddEditWindow", true, form.data.target);
  } else if (selectedMenuId.value === 1) {
    // 文件夹
    path = window.api.selectDirectory("itemAddEditWindow", form.data.target);
  }
  if (path) {
    form.data.target = path;
    window.api.getFileIcon("itemAddEditWindow", path);
    // 名称
    if (selectedMenuId.value === 0) {
      form.name = deleteExtname(getFileName(path)) ?? "";
    } else {
      form.name = getFileName(path) ?? "";
    }
  }
}
/**
 * 默认图标
 */
function defaultIcon() {
  if (form.data.target) {
    window.api.getFileIcon("itemAddEditWindow", form.data.target);
  }
}
// 获取网址信息
let getURLInfoLoading = ref<boolean>(false);
function getURLInfo() {
  if (form.data.target) {
    getURLInfoLoading.value = true;
    const regex = /^.+:\/\/.*/;
    if (!regex.test(form.data.target)) {
      form.data.target = "http://" + form.data.target;
    }
    // 获取网址信息
    window.api.getURLInfo("itemAddEditWindow", form.data.target);
  }
}
// 转换路径
function convertPath() {
  if (form.data.target) {
    form.data.target = window.api.convertPath(form.data.target);
  }
}
// 确认
async function confirm() {
  // 校验快捷键
  let success = await checkShortcutKey();
  if (!success) {
    return;
  }
  // 后缀
  let ext = getFileExtname(form.data.target);
  // 如果选中按管理员运行，但是文件类型不是exe和bat就修改为false
  if (form.data.runAsAdmin && (!ext || (ext !== "exe" && ext !== "bat"))) {
    form.data.runAsAdmin = false;
  }
  if (!id) {
    // 添加
    await addItem();
    close();
  } else {
    // 编辑
    let item: Item = convert(form);
    let res = window.item.update(item);
    if (res) {
      window.api.emit("mainWindow", "onUpdateItem", {
        item,
      });
    }
    close();
  }
}
// 添加项目
async function addItem() {
  let item = window.item.add(
    newItem({
      classificationId: form.classificationId,
      name: form.name,
      type: form.type,
      data: newItemData({
        startLocation: form.data.startLocation,
        target: form.data.target,
        params: form.data.params,
        runAsAdmin: form.data.runAsAdmin,
        icon: form.data.icon,
        htmlIcon: form.data.htmlIcon,
        remark: form.data.remark,
        iconBackgroundColor: form.data.iconBackgroundColor,
        fixedIcon: form.data.fixedIcon,
        multiItemsTimeInterval: form.data.multiItemsTimeInterval,
      }),
      shortcutKey: form.shortcutKey,
      globalShortcutKey: form.globalShortcutKey,
    })
  );
  if (item) {
    window.api.emit("mainWindow", "onAddItem", {
      itemList: [item],
      clear: false,
      classificationId: null,
    });
  }
}
// 选中多项目
function updateMultiItem(value: Array<number>) {
  if (value && value.length > 0) {
    form.data.target = value.join(",");
  } else {
    form.data.target = null;
  }
}
// 选中通用项目
async function selectedCommonItem(commonItem: CommonItem, type: string) {
  form.name = commonItem.name;
  form.data.target = commonItem.data.target;
  form.data.params = commonItem.data.params;
  form.data.icon = commonItem.data.icon;
  form.data.htmlIcon = commonItem.data.htmlIcon;
  if (type === "startMenu" && form.data.target) {
    // 判断是文件还是文件夹
    let res = window.api.isFile(form.data.target);
    if (res) {
      form.type = res ? 0 : 1;
      await addItem();
      message.success(store.language.itemAddEditPrompt3);
    } else {
      message.error(store.language.itemAddEditPrompt4);
    }
  } else {
    await addItem();
    message.success(store.language.itemAddEditPrompt3);
  }
}
// 创建网络图标窗口
function createNetworkIconWindow() {
  window.item.createNetworkIconWindow();
}
// 创建SVG图标窗口
function createSVGIconWindow() {
  window.item.createSVGIconWindow();
}
// 加载完dom后再显示页面
nextTick(() => {
  window.item.showAddEditWindow();
});
// 关闭窗口
function close() {
  window.item.closeAddEditWindow();
}
// 菜单鼠标经过
function menuItemMouseover(e: any) {
  let style: Map<string, string> = new Map();
  style.set("color", store.setting.appearance.theme.secondFontColor);
  style.set(
    "background-color",
    store.setting.appearance.theme.secondBackgroundColor
  );
  setStyle(e, "menu", style);
}
// 菜单鼠标移走
function menuItemMouseout(e: any, menuId: number) {
  if (selectedMenuId.value !== menuId) {
    let style: Map<string, string | null> = new Map();
    style.set("color", null);
    style.set("background-color", null);
    removeStyle(e, "menu", style);
  }
}
// 页面高度
let height = ref(0);
// 初始化页面尺寸
resize();
/**
 * 监听页面大小
 */
function resize() {
  // 页面高度 - 34（标题栏固定高度） - 底部按钮（固定高度）
  height.value = document.documentElement.clientHeight;
}
// 键盘按下
function keydown(e: any) {
  if (e.keyCode === 27) {
    // ESC
    close();
    e.preventDefault();
    e.stopPropagation();
    return;
  }
}
// 监听
let listens: Array<Function> = [];
// moutned
onMounted(() => {
  // resize
  window.addEventListener("resize", resize);
  // 监听键盘
  window.addEventListener("keydown", keydown, true);
  // 刷新DOM完毕执行
  nextTick(() => {
    // 滚动条
    createSimpleBar();
  });
  // 监听获取图标
  listens.push(
    window.api.onGetFileIcon((data) => {
      let icon: string | null = data;
      form.data.icon = icon;
      form.data.htmlIcon = null;
    })
  );
  // 监听网络图标
  listens.push(
    window.item.onNetworkIcon((data) => {
      let icon: string | null = data;
      form.data.icon = icon;
      form.data.htmlIcon = null;
    })
  );
  // 监听SVG图标
  listens.push(
    window.item.onSVGIcon((data) => {
      let icon: string | null = data;
      form.data.htmlIcon = icon;
      form.data.icon = null;
    })
  );
  // 监听获取网址信息
  listens.push(
    window.api.onGetURLInfo((data) => {
      getURLInfoLoading.value = false;
      let res: Result = data;
      if (res.status) {
        if (res.icon && res.icon.trim() !== "") {
          form.data.icon = res.icon;
          form.data.htmlIcon = null;
        }
        form.name = res.name ?? "";
      } else {
        window.api.showErrorMessageBox(
          "itemAddEditWindow",
          store.language.itemAddEditPrompt5
        );
      }
    })
  );
});
// unmounted
onUnmounted(() => {
  // resize
  window.removeEventListener("resize", resize);
  // 监听键盘
  window.removeEventListener("keydown", keydown, true);
  // 删除监听
  unlistens(listens);
});
</script>
../../../types/common../../../types/item
