import { Classification } from "../../types/classification";
import { Setting } from "../../types/setting";
import { getItemName } from "../../commons/utils/common";
import { convertClassificationList } from "../pages/classification/js";
import { convertItemList } from "../pages/item/js";
import { useMainStore } from "../store";
// pinia
const store = useMainStore();

/**
 * 校验快捷键
 * @param oldShortcutKey
 * @param shortcutKey
 * @param window
 * @returns
 */
async function checkShortcutKey(
  setting: Setting,
  oldShortcutKey: string | null,
  shortcutKey: string,
  windowName: string,
  type:
    | "Classification"
    | "Item"
    | "GeneralShowHide"
    | "GeneralSearch"
    | "QuickSearch"
): Promise<boolean> {
  if (shortcutKey) {
    // 校验是否有特殊字符
    for (let i = 0; i < shortcutKey.length; i++) {
      let charCode = shortcutKey.charCodeAt(i);
      if (charCode < 0 || charCode > 127) {
        window.api.showErrorMessageBox(
          windowName,
          store.language.shortcutKeyPrompt7
        );
        return false;
      }
    }
  }
  // 校验完整性
  if (!checkShortcutKeyComplete(shortcutKey)) {
    window.api.showErrorMessageBox(
      windowName,
      store.language.shortcutKeyPrompt1
    );
    return false;
  }
  // 判断是否和旧快捷键相同，相同的话跳过
  if (oldShortcutKey && oldShortcutKey === shortcutKey) {
    return true;
  }
  // 校验快捷键重复
  let message = await checkShortcutKeyDuplicate(setting, shortcutKey, type);
  if (message) {
    window.api.showErrorMessageBox(windowName, message);
    return false;
  }
  return true;
}

/**
 * 校验快捷键完整
 */
function checkShortcutKeyComplete(shortcutKey: string): boolean {
  if (shortcutKey.trim() !== "") {
    let flag = false;
    let split = shortcutKey.split("+");
    for (let s of split) {
      if (s.trim() === "") {
        return false;
      }
      if (
        s.trim() !== "Ctrl" &&
        s.trim() !== "Alt" &&
        s.trim() !== "Shift" &&
        s.trim() !== "Win"
      ) {
        flag = true;
      }
    }
    return flag;
  }
  return false;
}

/**
 * 校验快捷键重复
 * @param setting
 * @param shortcutKey
 * @param type
 * @returns
 */
async function checkShortcutKeyDuplicate(
  setting: Setting,
  shortcutKey: string,
  type:
    | "Classification"
    | "Item"
    | "GeneralShowHide"
    | "GeneralSearch"
    | "QuickSearch"
): Promise<string | null> {
  // 查询分类
  let classificationList: Array<Classification> = convertClassificationList(
    window.classification.list()
  );
  // 查询项目
  let itemMap = convertItemList(window.item.simpleList());
  // 校验
  for (const parent of classificationList) {
    // 父级分类
    if (parent.shortcutKey === shortcutKey) {
      return store.language.shortcutKeyPrompt2(parent.name);
    }
    // 项目
    let itemList = itemMap.get(parent.id);
    if (!itemList) {
      itemList = [];
    }
    for (const item of itemList) {
      if (item.shortcutKey === shortcutKey) {
        return store.language.shortcutKeyPrompt3(
          parent.name + "-" + getItemName(item.name)
        );
      }
    }
    // 有子分类
    if (parent.childList) {
      for (const child of parent.childList) {
        if (child.shortcutKey === shortcutKey) {
          return store.language.shortcutKeyPrompt2(
            parent.name + "-" + child.name
          );
        }
        // 项目
        let itemList = itemMap.get(child.id);
        if (!itemList) {
          itemList = [];
        }
        for (const item of itemList) {
          if (item.shortcutKey === shortcutKey) {
            return store.language.shortcutKeyPrompt3(
              parent.name + "-" + child.name + "-" + getItemName(item.name)
            );
          }
        }
      }
    }
  }
  // 校验窗口显示/隐藏快捷键
  if (
    type !== "GeneralShowHide" &&
    shortcutKey === setting.general.showHideShortcutKey
  ) {
    return store.language.shortcutKeyPrompt4;
  }
  if (
    type !== "GeneralSearch" &&
    shortcutKey === setting.general.searchShowHideShortcutKey
  ) {
    return store.language.shortcutKeyPrompt5;
  }
  if (
    type !== "QuickSearch" &&
    shortcutKey === setting.quickSearch.showHideShortcutKey
  ) {
    return store.language.shortcutKeyPrompt6;
  }
  return null;
}

export { checkShortcutKey };
