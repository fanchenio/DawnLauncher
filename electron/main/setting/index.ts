import { BrowserWindow, globalShortcut, shell } from "electron";
import { join } from "node:path";
import { Setting } from "../../../types/setting";
import { hideMainWindow, showMainWindowBefore } from "../main/index";
import { list as selectClassificationList } from "../classification/data";
import { list as selectItemList } from "../item/data";
import { run } from "../item";
import { closeWindow, getMainBackgorunColor } from "../commons/index";
import {
  createQuickSearchWindow,
  hideQuickSearchWindow,
  showQuickSearchWindowBefore,
} from "../search";

// 窗口
let settingWindow: BrowserWindow | null = null;

/**
 * 设置窗口
 */
function createSettingWindow() {
  // 如果窗口存在先关闭窗口
  closeWindow(settingWindow);
  // 创建窗口
  settingWindow = global.settingWindow = new BrowserWindow({
    title: "Dawn Launcher",
    frame: false,
    parent: global.mainWindow,
    height: 500,
    width: 600,
    type: "toolbar",
    maximizable: false,
    minimizable: false,
    resizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    show: false,
    backgroundColor: getMainBackgorunColor(),
    webPreferences: {
      spellcheck: false,
      preload: join(__dirname, "../preload/index.js"),
      devTools: process.env.NODE_ENV === "development",
    },
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    settingWindow.loadURL(process.env.VITE_DEV_SERVER_URL + "Setting/Index");
  } else {
    settingWindow.loadFile(join(process.env.DIST, "index.html"), {
      hash: "/Setting/Index",
    });
  }
  settingWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // 禁用标题栏右键
  settingWindow.hookWindowMessage(278, function (e) {
    // 窗口禁用
    settingWindow.setEnabled(false);
    // 延时太快会立刻启动，太慢会妨碍窗口其他操作，可自行测试最佳时间
    setTimeout(() => {
      settingWindow.setEnabled(true);
    }, 100);
    return true;
  });
}

/**
 * 设置快捷键
 */
function setShortcutKey(setting: Setting = global.setting) {
  // 取消所有快捷键
  globalShortcut.unregisterAll();
  // 设置主窗口显示/隐藏快捷键
  if (
    setting.general.showHideShortcutKey &&
    setting.general.showHideShortcutKey.trim() !== ""
  ) {
    globalShortcut.register(setting.general.showHideShortcutKey, () => {
      if (global.mainWindow.isVisible()) {
        hideMainWindow();
      } else {
        showMainWindowBefore(true);
      }
    });
  }
  // 分类快捷键
  let classificationList = selectClassificationList();
  for (const classification of classificationList) {
    if (classification.globalShortcutKey && classification.shortcutKey) {
      globalShortcut.register(classification.shortcutKey, () => {
        // 分类
        showMainWindowBefore(true, classification.id);
      });
    }
  }
  // 项目快捷键
  let itemList = selectItemList();
  for (const item of itemList) {
    if (item.globalShortcutKey && item.shortcutKey) {
      globalShortcut.register(item.shortcutKey, () => {
        // 项目
        run("main", "open", item);
      });
    }
  }
  // 快速搜索
  if (
    setting.quickSearch.showHideShortcutKey &&
    setting.quickSearch.showHideShortcutKey.trim() !== ""
  ) {
    globalShortcut.register(setting.quickSearch.showHideShortcutKey, () => {
      // 如果窗口不存在或者被销毁的话，就创建窗口
      if (!global.quickSearchWindow || global.quickSearchWindow.isDestroyed()) {
        createQuickSearchWindow();
      }
      // 如果初始化完毕并且窗口状态是正常的话，可以进行显示/隐藏
      if (
        global.quickSearchWindowInit &&
        global.quickSearchWindow &&
        !global.quickSearchWindow.isDestroyed()
      ) {
        if (global.quickSearchWindow.isVisible()) {
          hideQuickSearchWindow();
        } else {
          showQuickSearchWindowBefore();
        }
      }
    });
  }
}

/**
 * 固定位置
 * @param fixedPosition
 * @param alwaysCenter
 */
function setFixedPosition(fixedPosition: boolean, alwaysCenter: boolean) {
  global.mainWindow.setMovable(!fixedPosition);
  // 固定位置和永远居中不能同时存在
  if (alwaysCenter && fixedPosition) {
    global.mainWindow.setMovable(false);
  }
}

export { createSettingWindow, setShortcutKey, setFixedPosition };
