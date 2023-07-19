import { globalShortcut } from "electron";
import path from "path";
import util from "../util";
import itemJS from "../item/index";
import ClassificationJS from "../classification/index";

/**
 * 设置快捷键
 * @param setting
 */
function setShortcutKey(setting) {
  // 取消所有快捷键
  globalShortcut.unregisterAll();
  if (setting != null) {
    // 设置快捷键
    if (setting.general != null) {
      if (!util.strIsEmpty(setting.general.showHideShortcutKey)) {
        globalShortcut.register(setting.general.showHideShortcutKey, () => {
          if (util.notDisturb()) {
            return;
          }
          if (global.mainWindow.isVisible()) {
            // global.mainWindow.hide();
            global.mainWindow.webContents.send("hideMainWindowBefore");
          } else {
            util.showFollowMousePosition();
            global.mainWindow.show();
            global.mainWindow.focus();
            global.blurHide = true;
          }
        });
      }
    }
    if (setting.quickSearch != null) {
      if (setting.quickSearch.enable && !util.strIsEmpty(setting.quickSearch.showHideShortcutKey)) {
        globalShortcut.register(setting.quickSearch.showHideShortcutKey, () => {
          if (util.notDisturb()) {
            return;
          }
          if (global.searchWindow != null && global.searchWindowShow) {
            if (global.searchWindow.isVisible()) {
              global.searchWindow.webContents.send("hideSearchWindowBefore");
            } else {
              let params = {
                setting: global.setting,
                list: global.list,
              };
              global.searchWindow.webContents.send("showSearchWindowOperation", JSON.stringify(params));
            }
          }
        });
      }
    }
    // 扫描有没有全局快捷键分类、项目
    if (!util.arrayIsEmpty(global.list)) {
      let itemList = [];
      let classificationList = [];
      for (let c of global.list) {
        if (c.globalShortcutKey && !util.strIsEmpty(c.shortcutKey)) {
          classificationList.push(c);
        }
        if (!util.arrayIsEmpty(c.childList)) {
          for (let cc of c.childList) {
            if (cc.globalShortcutKey && !util.strIsEmpty(cc.shortcutKey)) {
              classificationList.push(cc);
            }
            if (!util.arrayIsEmpty(cc.itemList)) {
              for (let item of cc.itemList) {
                if (item.globalShortcutKey && !util.strIsEmpty(item.shortcutKey)) {
                  itemList.push(item);
                }
              }
            }
          }
        } else {
          if (!util.arrayIsEmpty(c.itemList)) {
            for (let item of c.itemList) {
              if (item.globalShortcutKey && !util.strIsEmpty(item.shortcutKey)) {
                itemList.push(item);
              }
            }
          }
        }
      }
      // 设置快捷键
      for (let item of itemList) {
        globalShortcut.register(item.shortcutKey, () => {
          if (util.notDisturb()) {
            return;
          }
          if (item.type == 4) {
            if (!util.arrayIsEmpty(item.itemList)) {
              for (let iItem of item.itemList) {
                itemJS.itemRun(iItem, null, null);
              }
            }
          } else {
            itemJS.itemRun(item, null, null);
          }
        });
      }
      for (let classification of classificationList) {
        globalShortcut.register(classification.shortcutKey, () => {
          if (util.notDisturb()) {
            return;
          }
          if (global.mainWindow != null && !global.mainWindow.isDestroyed()) {
            if (!global.mainWindow.isVisible()) {
              global.mainWindow.show();
              global.mainWindow.focus();
              global.blurHide = true;
              if (!global.setting.general.alwaysTop) {
                global.mainWindow.setAlwaysOnTop(true, "screen-saver");
                global.mainWindow.setAlwaysOnTop(false);
              }
            }
            let { classificationParentId, classificationChildId } = ClassificationJS.convertClassificationId(classification.id, classification.parentId);
            let params = {
              classificationParentId: classificationParentId,
              classificationChildId: classificationChildId,
            };
            global.mainWindow.webContents.send("changeClassification", JSON.stringify(params));
          }
        });
      }
    }
  }
}

/**
 * 获取数据目录配置文件地址
 * @returns {string}
 */
function getDawnLauncherProfilePath() {
  let p;
  if (process.env.NODE_ENV !== "production") {
    p = path.resolve(".");
  } else {
    p = path.dirname(process.execPath);
  }
  p = path.resolve(p, "..");
  p = path.join(p, ".dawn_launcher_profile");
  return p;
}

export default {
  setShortcutKey,
  getDawnLauncherProfilePath,
};
