import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./style/tailwind.css";
import "./style/main.css";

/**
 * 全局方法
 */
const getClassElement = function getClassElement(e, className) {
  let target;
  if (e instanceof HTMLElement) {
    target = e;
  } else {
    for (let i = 0; i < e.path.length; i++) {
      if (e.path[i].classList != null && e.path[i].classList.length > 0) {
        for (let clazz of e.path[i].classList) {
          if (clazz == className) {
            target = e.path[i];
            break;
          }
        }
      }
    }
  }
  return target;
};

/**
 * 鼠标经过
 * @param e
 * @param className
 * @param style
 * @param value
 */
const styleMouseover = function styleMouseover(e, className, style, value) {
  let target = getClassElement(e, className);
  if (target != null && style != null) {
    for (let i = 0; i < style.length; i++) {
      target.style.setProperty(style[i], value[i]);
    }
  }
};

/**
 * 鼠标移开
 * @param e
 * @param className
 * @param style
 */
const styleMouseout = function styleMouseout(e, className, style, value) {
  let target = getClassElement(e, className);
  if (target != null && style != null) {
    for (let i = 0; i < style.length; i++) {
      if (value != null && value[i] != null) {
        target.style.setProperty(style[i], value[i]);
      } else {
        target.style.removeProperty(style[i]);
      }
    }
  }
};

/**
 * 十六进制转 RGBA 的函数
 * @param hex
 * @param a
 * @returns {`rgba(${number}, ${number}, ${number}, ${string})`}
 */
const hexToRGBA = function hexToRGBA(hex, a) {
  let hexValue = hex.replace("#", "");

  // 将六位颜色值转为八位
  if (hexValue.length === 6) {
    hexValue = hexValue + "ff";
  }

  // 获取rgba各分量值
  const red = parseInt(hexValue.substring(0, 2), 16);
  const green = parseInt(hexValue.substring(2, 4), 16);
  const blue = parseInt(hexValue.substring(4, 6), 16);
  const alpha = parseInt(hexValue.substring(6, 8), 16) / 255;

  return `rgba(${red}, ${green}, ${blue}, ${a == 1 ? alpha : a})`;
};

/**
 * 返回背景颜色
 * @param setting
 * @returns {`rgba(${number}, ${number}, ${number}, ${string})`}
 */
const backgroundTransparencyBackgroundColor = function backgroundTransparencyBackgroundColor(setting) {
  return hexToRGBA(setting.appearance.theme.mainBackground, setting.appearance.backgroundTransparency);
};

/**
 * 返回字体颜色
 */
const backgroundTransparencyFontColor = function backgroundTransparencyFontColor(setting, transparency) {
  return hexToRGBA(setting.appearance.theme.fontBasic, transparency);
};

/**
 * 获取冒号
 */
const getColon = function getColon() {
  return store.state.currentLanguage.colon;
};

createApp(App)
  .mixin({
    methods: {
      $styleMouseover: styleMouseover,
      $styleMouseout: styleMouseout,
      $hexToRGBA: hexToRGBA,
      $backgroundTransparencyBackgroundColor: backgroundTransparencyBackgroundColor,
      $backgroundTransparencyFontColor: backgroundTransparencyFontColor,
      $getColon: getColon,
      $getClassElement: getClassElement,
    },
  })
  .use(store)
  .use(router)
  .mount("#app");
