import SimpleBar from "simplebar";

/**
 * 组装URL
 * @param url
 * @param paramsMap
 * @returns
 */
function getURL(url: string, paramsMap: Map<string, any>): string {
  let res = url;
  if (paramsMap.size > 0) {
    res += "?";
    let params: string | null = null;
    for (let [key, value] of paramsMap.entries()) {
      if (params) {
        params += "&" + key + "=" + value;
      } else {
        params = key + "=" + value;
      }
    }
    res += params;
  }
  return res;
}

/**
 * 滚动条置顶
 * @param simpleBar
 */
function scrollToTop(simpleBar: SimpleBar | null) {
  if (simpleBar) {
    let scroll = simpleBar.getScrollElement();
    if (scroll) {
      scroll.scrollTop = 0;
    }
  }
}

/**
 * 寻找父级
 * @param e
 * @param className
 */
function findElement(target: any, className: string) {
  if (target && target.classList) {
    let flag = false;
    for (const clazz of target.classList) {
      if (clazz === className) {
        flag = true;
        break;
      }
    }
    if (flag) {
      return target;
    } else {
      if (target.parentElement) {
        return findElement(target.parentElement, className);
      }
    }
  }
  return null;
}

/**
 * 取消监听
 * @param arr
 */
function unlistens(arr: Array<Function>) {
  for (const func of arr) {
    if (func) {
      func();
    }
  }
}

/**
 * 获取新ID
 */
function getNewId(list: Array<any>) {
  if (list == null || list.length == 0) {
    return 1;
  }
  // 获取ID列表
  let idList = list.map((item) => item.id);
  // 获取最大ID
  let maxId = Math.max(...idList);
  // +1
  return ++maxId;
}

/**
 * 校验KeyCode
 * @param e
 * @returns
 */
function checkKeyCode(e: any) {
  // (e.keyCode >= 48 && e.keyCode <= 57) 键盘上方数字
  // (e.keyCode >= 65 && e.keyCode <= 90) 键盘字母a-z不区分大小写
  // (e.keyCode >= 96 && e.keyCode <= 111) 数字键盘
  // (e.keyCode >= 112 && e.keyCode <= 135) 键盘F1到F24
  // e.keyCode == 8 退格键
  // e.keyCode == 9 Tab
  // e.keyCode == 12 Clear
  // e.keyCode == 13 回车
  // e.keyCode == 16 Shift
  // e.keyCode == 17 Control
  // e.keyCode == 18 Alt
  // e.keyCode == 91 Mate(Win)
  // e.keyCode == 20 Cape Lock 大小写
  // e.keyCode == 27 Esc
  // (e.keyCode >= 32 && e.keyCode <= 40) 控制键盘区
  // e.keyCode == 45 Insert
  // e.keyCode == 46 Delete
  // e.keyCode == 144 Num Lock
  // (e.keyCode >= 186 && e.keyCode <= 192) 符号;: =+ ,< -_ .> /? `~
  // (e.keyCode >= 219 && e.keyCode <= 222) 符号[{ \| ]} '"
  if (
    (e.keyCode >= 48 && e.keyCode <= 57) ||
    (e.keyCode >= 65 && e.keyCode <= 90) ||
    (e.keyCode >= 96 && e.keyCode <= 111) ||
    (e.keyCode >= 112 && e.keyCode <= 135) ||
    e.keyCode === 8 ||
    e.keyCode === 9 ||
    e.keyCode === 12 ||
    e.keyCode === 13 ||
    e.keyCode === 16 ||
    e.keyCode === 17 ||
    e.keyCode === 18 ||
    e.keyCode === 91 ||
    e.keyCode === 20 ||
    e.keyCode === 27 ||
    (e.keyCode >= 32 && e.keyCode <= 40) ||
    e.keyCode === 45 ||
    e.keyCode === 46 ||
    e.keyCode === 144 ||
    (e.keyCode >= 186 && e.keyCode <= 192) ||
    (e.keyCode >= 219 && e.keyCode <= 222)
  ) {
    return true;
  }
  return false;
}

/**
 * 获取快捷键
 * @param e
 * @param originalVal
 * @param preventDefault
 * @returns
 */
function getShortcutKey(
  e: any,
  originalVal: string | null,
  preventDefault: boolean
) {
  if (preventDefault) {
    e.preventDefault();
  }
  if (checkKeyCode(e)) {
    // Esc
    if (e.keyCode === 27) {
      return originalVal;
    }
    if (e.keyCode === 8) {
      return null;
    } else {
      let keys = [];
      // 如果是组合键
      if (e.ctrlKey && e.keyCode != 17) {
        keys.push("Ctrl + ");
      }
      if (e.altKey && e.keyCode != 18) {
        keys.push("Alt + ");
      }
      if (e.metaKey && e.keyCode != 91) {
        keys.push("Win + ");
      }
      if (e.shiftKey && e.keyCode != 16) {
        keys.push("Shift + ");
      }
      // 非组合键情况，按键是ctrl alt shift win
      if (
        e.keyCode === 16 ||
        e.keyCode === 17 ||
        e.keyCode === 18 ||
        e.keyCode === 91
      ) {
        let key;
        if (e.ctrlKey && e.keyCode === 17) {
          key = "Ctrl + ";
        }
        if (e.altKey && e.keyCode === 18) {
          key = "Alt + ";
        }
        if (e.metaKey && e.keyCode === 91) {
          key = "Win + ";
        }
        if (e.shiftKey && e.keyCode === 16) {
          key = "Shift + ";
        }
        keys.push(key);
      } else {
        // 排序
        keys.sort((a, b) => a.localeCompare(b));
        // 其他
        if (e.key.toUpperCase() === "ENTER") {
          keys.push("Enter");
        } else {
          if (e.keyCode === 32) {
            keys.push("Space");
          } else if (e.keyCode >= 96 && e.keyCode <= 105) {
            keys.push("Num" + e.key);
          } else if (e.keyCode >= 106 && e.keyCode <= 111) {
            if (e.keyCode === 106) {
              keys.push("NumMult");
            } else if (e.keyCode === 107) {
              keys.push("NumAdd");
            } else if (e.keyCode === 109) {
              keys.push("NumSub");
            } else if (e.keyCode === 110) {
              keys.push("NumDec");
            } else if (e.keyCode === 111) {
              keys.push("NumDiv");
            }
          } else {
            keys.push(e.key.replace("Arrow", "").toUpperCase());
          }
        }
      }
      return keys.join("");
    }
  } else {
    return null;
  }
}

export {
  getURL,
  scrollToTop,
  findElement,
  unlistens,
  getNewId,
  getShortcutKey,
  checkKeyCode,
};
