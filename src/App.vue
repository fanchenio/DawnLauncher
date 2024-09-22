<template>
  <NConfigProvider :theme-overrides="themeOverrides">
    <NMessageProvider><router-view></router-view></NMessageProvider>
  </NConfigProvider>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import {
  NConfigProvider,
  GlobalThemeOverrides,
  NMessageProvider,
} from "naive-ui";
import { hexToRGBA } from "./utils/style";
import { getSetting } from "../commons/utils/setting";
import { useMainStore } from "./store";
import { getLanguage } from "../commons/data/languages";
import { getShortcutKey } from "./utils/common";
// pinia
const store = useMainStore();
// 查询设置
(async () => {
  let setting = window.setting.select();
  if (setting) {
    store.setting = getSetting(setting);
  } else {
    let setting = getSetting(null);
    window.setting.add(setting);
    store.setting = setting;
  }
  store.language = getLanguage(store.setting.general.language);
})();
// 主题
let themeOverrides = ref<GlobalThemeOverrides | null>(null);
// 获取主题
function setTheme() {
  themeOverrides.value = {
    common: {
      borderColor: store.setting.appearance.theme.borderColor,
      cubicBezierEaseInOut: "none",
      cubicBezierEaseOut: "none",
      cubicBezierEaseIn: "none",
    },
    Input: {
      color: store.setting.appearance.theme.mainBackgroundColor,
      colorFocus: store.setting.appearance.theme.mainBackgroundColor,
      textColor: store.setting.appearance.theme.mainFontColor,
      caretColor: store.setting.appearance.theme.mainFontColor,
      borderHover: "1px solid " + store.setting.appearance.theme.borderColor,
      borderFocus: "1px solid " + store.setting.appearance.theme.borderColor,
      boxShadowFocus: "none",
      placeholderColor: hexToRGBA(
        store.setting.appearance.theme.mainFontColor,
        0.3
      ),
    },
    Button: {
      colorPrimary: store.setting.appearance.theme.secondBackgroundColor,
      colorFocusPrimary: store.setting.appearance.theme.secondBackgroundColor,
      colorHoverPrimary: hexToRGBA(
        store.setting.appearance.theme.secondBackgroundColor,
        0.7
      ),
      colorDisabledPrimary:
        store.setting.appearance.theme.secondBackgroundColor,
      borderDisabledPrimary: "none",
      borderPrimary: "none",
      borderHoverPrimary: "none",
      borderFocusPrimary: "none",
      borderPressedPrimary: "none",
      colorPressedPrimary: hexToRGBA(
        store.setting.appearance.theme.secondBackgroundColor,
        0.7
      ),
      textColorPrimary: store.setting.appearance.theme.secondFontColor,
      textColorHoverPrimary: store.setting.appearance.theme.secondFontColor,
      textColorFocusPrimary: store.setting.appearance.theme.secondFontColor,
      textColorPressedPrimary: store.setting.appearance.theme.secondFontColor,
      textColor: store.setting.appearance.theme.mainFontColor,
      textColorHover: "none",
      textColorFocus: "none",
      borderHover: "none",
      borderPressed: "none",
      textColorPressed: "none",
      rippleDuration: "none",
    },
    InternalSelection: {
      boxShadowFocus: "none",
      boxShadowActive: "none",
    },
    Message: {
      padding: "6px",
    },
    Checkbox: {
      color: hexToRGBA(store.setting.appearance.theme.mainBackgroundColor, 1),
      textColor: hexToRGBA(store.setting.appearance.theme.mainFontColor, 1),
      border:
        "1px solid " + hexToRGBA(store.setting.appearance.theme.borderColor, 1),
      borderChecked:
        "1px solid " +
        hexToRGBA(store.setting.appearance.theme.mainFontColor, 1),
      colorChecked: "none",
      checkMarkColor: hexToRGBA(
        store.setting.appearance.theme.mainFontColor,
        1
      ),
    },
    Radio: {
      boxShadowActive:
        "inset 0 0 0 1px " +
        hexToRGBA(store.setting.appearance.theme.mainFontColor, 1),
      boxShadowFocus:
        "inset 0 0 0 1px " +
        hexToRGBA(store.setting.appearance.theme.mainFontColor, 1),
      boxShadowHover:
        "inset 0 0 0 1px " +
        hexToRGBA(store.setting.appearance.theme.mainFontColor, 1),
      dotColorActive: hexToRGBA(
        store.setting.appearance.theme.mainFontColor,
        1
      ),
      color: hexToRGBA(store.setting.appearance.theme.mainBackgroundColor, 1),
      textColor: hexToRGBA(store.setting.appearance.theme.mainFontColor, 1),
    },
    Form: {
      labelTextColor: store.setting.appearance.theme.mainFontColor,
    },
    Dropdown: {
      color: store.setting.appearance.theme.mainBackgroundColor,
      optionColorHover: store.setting.appearance.theme.secondBackgroundColor,
      optionTextColor: store.setting.appearance.theme.mainFontColor,
      optionTextColorHover: store.setting.appearance.theme.secondFontColor,
      dividerColor: store.setting.appearance.theme.borderColor,
    },
    Select: {
      peers: {
        InternalSelection: {
          textColor: store.setting.appearance.theme.mainFontColor,
          color: store.setting.appearance.theme.mainBackgroundColor,
          colorActive: store.setting.appearance.theme.mainBackgroundColor,
          borderHover:
            "1px solid " + store.setting.appearance.theme.borderColor,
          borderFocus:
            "1px solid " + store.setting.appearance.theme.borderColor,
          borderActive:
            "1px solid " + store.setting.appearance.theme.borderColor,
        },
        InternalSelectMenu: {
          color: store.setting.appearance.theme.mainBackgroundColor,
          optionColorPending: hexToRGBA(
            store.setting.appearance.theme.secondBackgroundColor,
            0.3
          ),
          optionColorActivePending: hexToRGBA(
            store.setting.appearance.theme.secondBackgroundColor,
            0.3
          ),
          actionTextColor: store.setting.appearance.theme.mainFontColor,
          optionTextColorActive: store.setting.appearance.theme.mainFontColor,
          optionTextColor: store.setting.appearance.theme.mainFontColor,
          optionTextColorPressed: store.setting.appearance.theme.mainFontColor,
          optionTextColorDisabled: store.setting.appearance.theme.mainFontColor,
          optionCheckColor: store.setting.appearance.theme.mainFontColor,
        },
      },
    },
    Slider: {
      fillColor: store.setting.appearance.theme.secondBackgroundColor,
      fillColorHover: store.setting.appearance.theme.secondBackgroundColor,
      handleColor: store.setting.appearance.theme.secondBackgroundColor,
      railColor: store.setting.appearance.theme.secondBackgroundColor,
      railColorHover: store.setting.appearance.theme.secondBackgroundColor,
    },
    ColorPicker: {
      color: store.setting.appearance.theme.mainBackgroundColor,
      textColor: store.setting.appearance.theme.mainFontColor,
    },
    Spin: {
      color: store.setting.appearance.theme.secondBackgroundColor,
    },
    Popselect: {
      peers: {
        Popover: {
          color: store.setting.appearance.theme.mainBackgroundColor,
        },
      },
    },
  };
}
// 设置主题
setTheme();
// 监听主题变更
watch(
  () => store.setting.appearance.theme,
  async () => {
    setTheme();
    createStyle();
  }
);
function createStyle() {
  // 找到要删除的 style 标签
  let styleElement = document.getElementById("placeholder-style");
  // 如果找到了 style 标签，则从其父节点中移除
  if (styleElement && styleElement.parentNode) {
    styleElement.parentNode.removeChild(styleElement);
  }
  // 创建一个新的伪类样式规则
  let style = document.createElement("style");
  style.setAttribute("id", "placeholder-style");
  style.type = "text/css";
  // 设置伪类样式规则的内容
  style.innerHTML =
    "input::placeholder, textarea::placeholder {" +
    "color: " +
    hexToRGBA(store.setting.appearance.theme.mainFontColor, 0.5) +
    ";" +
    "}";
  // 将伪类样式规则添加到 head 元素中
  document.head.appendChild(style);

  // 找到要删除的 style 标签
  let oldRangeStyleElement = document.getElementById("range-style");
  // 如果找到了 style 标签，则从其父节点中移除
  if (oldRangeStyleElement && oldRangeStyleElement.parentNode) {
    oldRangeStyleElement.parentNode.removeChild(oldRangeStyleElement);
  }
  // 创建一个新的伪类样式规则
  let rangeStyleElement = document.createElement("style");
  rangeStyleElement.setAttribute("id", "range-style");
  rangeStyleElement.type = "text/css";
  // 设置伪类样式规则的内容
  rangeStyleElement.innerHTML =
    ".range::-webkit-slider-runnable-track {" +
    "background-color: " +
    store.setting.appearance.theme.secondBackgroundColor +
    "!important;" +
    "border-radius: 0.5rem!important;" +
    "height: 4px!important;" +
    "}" +
    ".range::-webkit-slider-thumb {" +
    "-webkit-appearance: none!important; " +
    "appearance: none!important;" +
    "margin-top: -8px!important;" +
    "border-radius: 50%!important;" +
    "background-color: " +
    store.setting.appearance.theme.secondBackgroundColor +
    "!important;" +
    "border: 1px solid " +
    store.setting.appearance.theme.secondBackgroundColor +
    "!important;" +
    "width: 20px!important;" +
    "height: 20px!important;" +
    "}";
  // 将伪类样式规则添加到 head 元素中
  document.head.appendChild(rangeStyleElement);

  // 找到要删除的 style 标签
  let oldScrollStyleElement = document.getElementById("scroll-style");
  // 如果找到了 style 标签，则从其父节点中移除
  if (oldScrollStyleElement && oldScrollStyleElement.parentNode) {
    oldScrollStyleElement.parentNode.removeChild(oldScrollStyleElement);
  }
  // 创建一个新的伪类样式规则
  let scrollStyleElement = document.createElement("style");
  scrollStyleElement.setAttribute("id", "scroll-style");
  scrollStyleElement.type = "text/css";
  // 设置伪类样式规则的内容
  scrollStyleElement.innerHTML =
    ".simplebar-scrollbar::before {" +
    "  background-color: " +
    store.setting.appearance.theme.secondBackgroundColor +
    "!important;" +
    "  right: 0!important;" +
    "}" +
    "textarea::-webkit-scrollbar-thumb {" +
    "  background-color: " +
    store.setting.appearance.theme.secondBackgroundColor +
    "!important;" +
    "border-radius: 7px!important;" +
    "}";
  // 将伪类样式规则添加到 head 元素中
  document.head.appendChild(scrollStyleElement);
}
// 监听键盘
function keydown(e: any) {
  let prod = import.meta.env.PROD;
  if (prod) {
    // 获取快捷键
    let shortcutKey = getShortcutKey(e, null, false);
    if (shortcutKey) {
      // 禁止页面刷新
      if (
        shortcutKey.toLowerCase() === "ctrl + r" ||
        shortcutKey.toLowerCase() === "ctrl + shift + r" ||
        shortcutKey.toLowerCase() === "f5"
      ) {
        e.preventDefault();
      }
      // 禁止关闭页面
      if (
        shortcutKey.toLowerCase() === "ctrl + w" ||
        shortcutKey.toLowerCase() === "alt + f4"
      ) {
        e.preventDefault();
      }
    }
  }
}
// 监听鼠标右键
function contextmenu(e: MouseEvent) {
  let target = e.target as HTMLInputElement;
  if (target) {
    if (
      (target.nodeName != null &&
        target.nodeName.toLowerCase() == "input" &&
        target.type != null &&
        target.type.toLowerCase() == "text") ||
      (target.nodeName != null && target.nodeName.toLowerCase() == "textarea")
    ) {
      window.api.textRightMenu();
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }
}
// 监听
let onUpdateSettingUnListen: Function | null = null;
// mounted
onMounted(() => {
  // 创建样式
  createStyle();
  // 监听键盘
  window.addEventListener("keydown", keydown, true);
  // 监听右键
  window.addEventListener("contextmenu", contextmenu, true);
  // 监听更新项目
  onUpdateSettingUnListen = window.setting.onUpdate((data) => {
    store.setting = data;
  });
});
// unmounted
onUnmounted(() => {
  // 监听键盘
  window.removeEventListener("keydown", keydown, true);
  // 监听右键
  window.removeEventListener("contextmenu", contextmenu, true);
  // 删除监听
  if (onUpdateSettingUnListen) {
    onUpdateSettingUnListen();
  }
});
</script>
