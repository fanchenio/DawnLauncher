import store from "../store";
import * as DOMPurify from "dompurify";
import ClassificationJS from "@/views/classification/js";

/**
 * 校验KeyCode
 * @param e
 */
function checkKeyCode(e) {
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
    e.keyCode == 8 ||
    e.keyCode == 9 ||
    e.keyCode == 12 ||
    e.keyCode == 13 ||
    e.keyCode == 16 ||
    e.keyCode == 17 ||
    e.keyCode == 18 ||
    e.keyCode == 20 ||
    e.keyCode == 27 ||
    (e.keyCode >= 32 && e.keyCode <= 40) ||
    e.keyCode == 45 ||
    e.keyCode == 46 ||
    e.keyCode == 144 ||
    (e.keyCode >= 186 && e.keyCode <= 192) ||
    (e.keyCode >= 219 && e.keyCode <= 222)
  ) {
    return true;
  }
  return false;
}

/**
 * 获取Key
 * @param classificationParentId
 * @param classificationChildId
 * @param itemId
 * @returns {*}
 */
function getKey(classificationParentId, classificationChildId, itemId) {
  let key = classificationParentId;
  if (classificationChildId != null) {
    key += "-" + classificationChildId;
  }
  key += "-" + itemId;
  return key;
}

/**
 * 获取图标
 */
function getIcon(classificationParentId, classificationChildId, itemId) {
  if (store.state.iconDataMap != null) {
    let icon = store.state.iconDataMap.get(getKey(classificationParentId, classificationChildId, itemId));
    if (icon != null) {
      return icon.icon;
    } else {
      return null;
    }
  }
  return null;
}

export default {
  /**
   * 转int
   * @param v
   */
  parseInt(v) {
    return v != null ? parseInt(v) : null;
  },
  /**
   * 获取新ID
   */
  getNewId(list) {
    if (list == null || list.length == 0) {
      return 1;
    }
    // 获取ID列表
    let idList = list.map((item) => item.id);
    // 获取最大ID
    let maxId = Math.max(...idList);
    // +1
    return ++maxId;
  },
  /**
   * 设置快捷键
   */
  setShortcutKey(e, originalVal, preventDefault) {
    if (preventDefault) {
      e.preventDefault();
    }
    if (checkKeyCode(e)) {
      // Esc
      if (e.keyCode == 27) {
        return originalVal;
      }
      if (e.keyCode == 8) {
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
        if (e.keyCode == 16 || e.keyCode == 17 || e.keyCode == 18 || e.keyCode == 91) {
          let key;
          if (e.ctrlKey && e.keyCode == 17) {
            key = "Ctrl + ";
          }
          if (e.altKey && e.keyCode == 18) {
            key = "Alt + ";
          }
          if (e.metaKey && e.keyCode == 91) {
            key = "Win + ";
          }
          if (e.shiftKey && e.keyCode == 16) {
            key = "Shift + ";
          }
          keys.push(key);
        } else {
          // 排序
          keys.sort((a, b) => a.localeCompare(b));
          // 其他
          if (e.key.toUpperCase() == "ENTER") {
            keys.push("Enter");
          } else {
            if (e.keyCode == 32) {
              keys.push("Space");
            } else if (e.keyCode >= 96 && e.keyCode <= 105) {
              keys.push("Num" + e.key);
            } else if (e.keyCode >= 106 && e.keyCode <= 111) {
              if (e.keyCode == 106) {
                keys.push("NumMult");
              } else if (e.keyCode == 107) {
                keys.push("NumAdd");
              } else if (e.keyCode == 109) {
                keys.push("NumSub");
              } else if (e.keyCode == 110) {
                keys.push("NumDec");
              } else if (e.keyCode == 111) {
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
  },
  /**
   * 校验快捷键完整
   * @param shortcutKey
   * @returns {boolean}
   */
  checkShortcutKeys(shortcutKey) {
    if (shortcutKey != null && shortcutKey.trim() != "") {
      let flag = false;
      let split = shortcutKey.split("+");
      for (let s of split) {
        if (s.trim() == "") {
          return false;
        }
        if (s.trim() != "Ctrl" && s.trim() != "Alt" && s.trim() != "Shift" && s.trim() != "Win") {
          flag = true;
        }
      }
      return flag;
    }
    return false;
  },
  /**
   * 校验应用程序内快捷是否重复
   * @param shortcutKey
   * @param appShortcutKeyMap
   */
  checkAppShortcutKeysDuplicate(shortcutKey, appShortcutKeyMap) {
    let s = appShortcutKeyMap.get(shortcutKey);
    if (s != null) {
      let name = s.classificationParentName;
      if (s.type == "classification") {
        if (s.classificationChildName != null && s.classificationChildName.trim() != "") {
          name += "-" + s.classificationChildName;
        }
        return store.state.currentLanguage.shortcutKeyConflictMessage(name, 0);
      } else {
        if (s.classificationChildName != null && s.classificationChildName.trim() != "") {
          name += "-" + s.classificationChildName;
        }
        name += "-" + s.itemName;
        return store.state.currentLanguage.shortcutKeyConflictMessage(name, 1);
      }
    }
    return null;
  },
  /**
   * 校验设置中的快捷键是否重复
   * @param shortcutKey
   * @param setting
   * @param exclude
   * @returns {null}
   */
  checkSettingShortcutKeysDuplicate(shortcutKey, setting, exclude) {
    let msg = null;
    let showHide, search, quickSearch;
    if (setting.general != null && (exclude == null || exclude != "showHideShortcutKey")) {
      showHide = setting.general.showHideShortcutKey;
    }
    if (setting.item != null && (exclude == null || exclude != "searchShortcutKey")) {
      search = setting.item.searchShortcutKey;
    }
    if (setting.quickSearch != null && (exclude == null || exclude != "quickSearchShowHideShortcutKey")) {
      quickSearch = setting.quickSearch.showHideShortcutKey;
    }
    if (showHide != null && showHide.trim() != "" && showHide == shortcutKey) {
      msg = store.state.currentLanguage.shortcutKeyConflictSettingGeneralShowHideMessage;
    } else if (search != null && search.trim() != "" && search == shortcutKey) {
      msg = store.state.currentLanguage.shortcutKeyConflictSettingItemSearchMessage;
    } else if (quickSearch != null && quickSearch.trim() != "" && quickSearch == shortcutKey) {
      msg = store.state.currentLanguage.shortcutKeyConflictSettingQuickSearchShowHideMessage;
    }
    return msg;
  },
  /**
   * 判断数组是否等于空
   * @param arr
   */
  arrayIsEmpty(arr) {
    if (arr == null || arr.length == 0) {
      return true;
    }
    return false;
  },
  /**
   * 判断字符串是否为空
   * @param str
   */
  strIsEmpty(str) {
    if (str == null || str.trim() == "") {
      return true;
    }
    return false;
  },
  DOMPurify,
  /**
   * 获取图标
   */
  getIcon,
  /**
   * 获取Key
   * @param classificationParentId
   * @param classificationChildId
   * @param itemId
   * @returns {*}
   */
  getKey,
  /**
   * 获取图标根据分类
   */
  getIconByClassification(item) {
    let { classificationParentId, classificationChildId } = ClassificationJS.convertClassificationId(item.classificationId, item.classificationParentId);
    return getIcon(classificationParentId, classificationChildId, item.id);
  },
};
