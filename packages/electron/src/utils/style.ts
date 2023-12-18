import { Setting } from "../../types/setting";

/**
 * 根据类名获取元素
 * @param e
 * @param className
 * @returns
 */
function getClassElement(e: any, className: string) {
  let target: any = null;
  if (e instanceof HTMLElement) {
    target = e;
  } else {
    const paths = e.composedPath && e.composedPath();
    for (let i = 0; i < paths.length; i++) {
      if (paths[i].classList && paths[i].classList.length > 0) {
        for (let clazz of paths[i].classList) {
          if (clazz === className) {
            target = paths[i];
            break;
          }
        }
      }
    }
  }
  return target;
}

/**
 * 根据ID获取元素
 * @param e
 * @param className
 * @returns
 */
function getIdElement(e: any, id: string) {
  let target: any = null;
  if (e instanceof HTMLElement) {
    target = e;
  } else {
    const paths = e.composedPath && e.composedPath();
    for (let i = 0; i < paths.length; i++) {
      if (paths[i].id === id) {
        target = paths[i];
        break;
      }
    }
  }
  return target;
}

/**
 * 设置样式
 * @param e
 * @param className
 * @param style
 */
function setStyle(e: any, className: string, style: Map<string, string>) {
  let target = getClassElement(e, className);
  if (target) {
    for (const [key, value] of style) {
      target.style.setProperty(key, value);
    }
  }
}

/**
 * 删除样式
 * @param e
 * @param className
 * @param style
 */
function removeStyle(
  e: any,
  className: string,
  style: Map<string, string | null>
) {
  let target = getClassElement(e, className);
  if (target) {
    for (const [key, value] of style) {
      if (value) {
        target.style.setProperty(key, value);
      } else {
        target.style.removeProperty(key);
      }
    }
  }
}

/**
 * 十六进制转RGBA的函数
 * @param hex
 * @param a
 * @returns
 */
function hexToRGBA(hex: string, a: number | null) {
  // 去掉井号
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
  // 返回
  return `rgba(${red}, ${green}, ${blue}, ${!a ? alpha : a})`;
}

/**
 * 设置图标样式
 * @param e
 * @param className
 */
function setIconStyle(e: any, className: string, setting: Setting) {
  setStyle(
    e,
    className,
    new Map([["color", hexToRGBA(setting.appearance.theme.mainFontColor, 0.8)]])
  );
}

/**
 * 删除图标样式
 * @param e
 * @param className
 */
function removeIconStyle(e: any, className: string) {
  removeStyle(e, className, new Map([["color", null]]));
}

export {
  getClassElement,
  getIdElement,
  setStyle,
  removeStyle,
  hexToRGBA,
  setIconStyle,
  removeIconStyle,
};
