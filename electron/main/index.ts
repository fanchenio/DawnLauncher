import { app, BrowserWindow, dialog } from "electron";
import { join, dirname, basename } from "node:path";
import indexIpcEvent from "./main/ipcEvent";
import classificationIpcEvent from "./classification/ipcEvent";
import { init as classificationDataInit } from "./classification/data";
import { init as itemDataInit } from "./item/data";
import { initSystemItem } from "./item/commons/data";
import commonIpcEvent from "./commons/ipcEvent";
import itemIpcEvent from "./item/ipcEvent";
import settingIpcEvent from "./setting/ipcEvent";
import {
  init as settingDataInit,
  update as updateSetting,
} from "./setting/data";
import { setShortcutKey } from "./setting";
import searchIpcEvent from "./search/ipcEvent";
import { createMainWindow } from "./main";
import { closeAllChildProcess } from "./commons";
import { createQuickSearchWindow } from "./search";
import { getLanguage } from "../../commons/data/languages";
import aboutIpcEvent from "./about/ipcEvent";
import dataIpcEvent from "./data/ipcEvent";

// 数据存储目录
if (
  process.env.NODE_ENV !== "development" &&
  import.meta.env.VITE_INSTALL === "false"
) {
  app.setPath("appData", join(dirname(process.execPath), "data"));
  app.setPath("userData", join(dirname(process.execPath), "data"));
  app.setPath("sessionData", join(dirname(process.execPath), "data"));
}

process.env.DIST_ELECTRON = join(__dirname, "..");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// 解决透明窗口闪烁
app.commandLine.appendSwitch("wm-window-animations-disabled");

// 初始化设置数据
settingDataInit();
// 如果主窗口是非透明窗口的话，禁止GPU加速，解决白屏问题。
// 如果主窗口是透明窗口的话，将除主窗口外的窗口都改为透明度0.99，解决解决白屏问题。
if (global.setting.appearance.transparency === 1) {
  app.disableHardwareAcceleration();
}

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
app.whenReady().then(() => {
  try {
    // 禁止多开
    const instanceLock = app.requestSingleInstanceLock();
    if (!instanceLock) {
      app.quit();
      return;
    }
    // addon
    global.addon = require("../../native/addon.node");
    if (global.first) {
      // 首次添加，判断系统语言
      if (app.getLocale().toLowerCase().indexOf("zh-") === 0) {
        // 简体中文
        global.setting.general.language = "SimplifiedChinese";
      } else {
        // 英文
        global.setting.general.language = "English";
      }
      // 修改
      updateSetting(global.setting);
    }
    // 获取语言
    global.language = getLanguage(global.setting.general.language);
    // 禁用debugtron
    for (let i = 0; i < process.argv.length; i++) {
      const arg = process.argv[i];
      if (
        arg.indexOf("--inspect") !== -1 ||
        arg.indexOf("--remote-debugging-port") !== -1
      ) {
        dialog.showMessageBoxSync({
          message: "达咩呦达咩达咩~",
          buttons: [global.language.ok],
          type: "error",
          noLink: true,
        });
        app.quit();
        return;
      }
    }
    // 初始化数据
    classificationDataInit();
    itemDataInit();
    initSystemItem();
    // 初始化监听
    indexIpcEvent();
    commonIpcEvent();
    classificationIpcEvent();
    itemIpcEvent();
    settingIpcEvent();
    searchIpcEvent();
    aboutIpcEvent();
    dataIpcEvent();
    // 创建主窗口
    createMainWindow();
    if (global.setting.quickSearch.enable) {
      // 创建快速搜索窗口
      createQuickSearchWindow();
    }
    // 设置快捷键
    setShortcutKey();
    // 每次开启软件时都设置一次开机启动选项
    if (process.env.NODE_ENV !== "development") {
      const exeName = basename(process.execPath);
      app.setLoginItemSettings({
        openAtLogin: global.setting.general.startup,
        openAsHidden: false,
        path: process.execPath,
        args: ["--processStart", `"${exeName}"`],
      });
    }
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.log(e);
    } else {
      dialog.showMessageBoxSync({
        type: "error",
        title: "Dawn Launcher",
        message: e.stack,
      });
      app.quit();
    }
  }
});

// 全局异常
process.on("uncaughtException", (err) => {
  dialog.showMessageBoxSync({
    type: "error",
    title: "Dawn Launcher",
    message: err.stack,
  });
  // 关闭所有子进程
  closeAllChildProcess();
  // 退出
  app.quit();
});

app.on("before-quit", () => {
  // 关闭所有子进程
  closeAllChildProcess();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (global.mainWindow) {
    if (!global.mainWindow.isVisible()) {
      global.mainWindow.show();
      global.mainWindow.focus();
      global.blurHide = true;
    } else {
      global.mainWindow.focus();
    }
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createMainWindow();
  }
});
