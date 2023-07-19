import appInit from "./appInit";
import { app, BrowserWindow, dialog, ipcMain, Menu, protocol, Tray, screen } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import classificationIpcEvent from "./classification/ipcEvent";
import itemIpcEvent from "./item/ipcEvent";
import settingIpcEvent from "./setting/ipcEvent";
import ipcEvent from "./ipcEvent";
import settingIndex from "./setting/index";
import path from "path";
import util from "./util";
import itemIndex from "./item/index";
import cacheData from "./cache/data";
import data from "./data";

// 解决透明窗口闪烁
app.commandLine.appendSwitch("wm-window-animations-disabled");

// 数据
const settingData = require("./setting/data");

protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { secure: true, standard: true } }]);

// 主窗口
let mainWindow = null;
// 设置窗口
let settingWindow = null;
// 搜索框
let searchWindow = null;

/**
 * 创建主窗口
 * @param init
 * @returns {Promise<void>}
 */
async function createWindow(init) {
  // 浏览器开发者工具
  let devTools;
  // 环境判断
  if (process.env.NODE_ENV !== "production") {
    // 开发
    devTools = true;
  } else {
    // 正式
    devTools = false;
  }
  if (init) {
    // 初始化监听
    await ipcEvent();
    await classificationIpcEvent();
    await itemIpcEvent();
    await settingIpcEvent();
    // 初始化数据
    await settingData.initData();
    await data.initData();
    await data.splitData();
    await data.validData();
    // watch
    global.mapDirectoryWatcher = new Map();
  }
  // 记录是否透明
  if (global.setting.appearance.backgroundTransparency == 1) {
    global.backgroundTransparency = false;
  } else {
    global.backgroundTransparency = true;
  }
  // 主窗口
  global.mainWindow = mainWindow = new BrowserWindow({
    minWidth: 300,
    minHeight: 400,
    width: 800,
    height: 600,
    frame: false,
    show: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    transparent: global.backgroundTransparency,
    skipTaskbar: true,
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: true,
      contextIsolation: false,
      spellcheck: false,
      devTools: devTools,
    },
  });
  // 加载页面
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    mainWindow.loadURL("app://./index.html");
  }
  // 加载完webContents后再显示窗口
  mainWindow.webContents.on("did-finish-load", function () {
    // 透明度
    mainWindow.setOpacity(Number(global.setting.appearance.transparency));
    // 永远居中不可移动
    if (global.setting.general.alwaysCenter) {
      // 是否可移动
      mainWindow.setMovable(false);
    } else {
      // 是否可移动
      mainWindow.setMovable(!global.setting.general.fixedPosition);
    }
    // 恢复上一次的位置
    let bounds = cacheData.cacheStore.get("bounds");
    if (bounds != null) {
      mainWindow.setBounds(bounds);
    }
    // 永远置顶
    if (global.setting.general.alwaysTop) {
      mainWindow.setAlwaysOnTop(true, "screen-saver");
    }
    // 是否托盘化启动
    if (!global.setting.general.startupTray) {
      mainWindow.show();
    }
    // 锁定尺寸
    mainWindow.setResizable(!global.setting.general.lockSize);
    // 检查更新
    let checkUpdate = cacheData.cacheStore.get("checkUpdate");
    if (checkUpdate == null || checkUpdate) {
      util.checkUpdate("init");
    }
    // 永远居中
    if (global.setting.general.alwaysCenter) {
      mainWindow.center();
    }
    // 判断窗口位置
    let displays = util.getWindowInScreen();
    if (displays.length == 0) {
      // 代表窗口的位置不再任一屏幕内，将窗口位置移动到主窗口
      mainWindow.center();
    }
    // 边缘吸附
    util.edgeAdsorb();
  });
  // 禁用标题栏右键
  mainWindow.hookWindowMessage(278, function (e) {
    // 窗口禁用
    mainWindow.setEnabled(false);
    // 延时太快会立刻启动，太慢会妨碍窗口其他操作，可自行测试最佳时间
    setTimeout(() => {
      mainWindow.setEnabled(true);
    }, 100);
    return true;
  });
  // 窗口移动完毕
  mainWindow.on("moved", () => {
    // 永远居中
    if (global.setting.general.alwaysCenter) {
      mainWindow.center();
    }
    // 记录位置
    cacheData.cacheStore.set("bounds", mainWindow.getBounds());
    // 边缘吸附
    util.edgeAdsorb();
  });
  // 改变窗口大小完毕
  mainWindow.on("resized", () => {
    // 永远居中
    if (global.setting.general.alwaysCenter) {
      mainWindow.center();
    }
    // 记录位置
    cacheData.cacheStore.set("bounds", mainWindow.getBounds());
  });
  // 监听鼠标移动
  const mouseEvent = require("./mouse");
  mouseEvent.on("mousemove", (data) => {
    if (global.setting.general.edgeAutoHide && (global.blurHide == null || !global.blurHide) && !global.setting.general.alwaysCenter) {
      autoHide(data, 40, true);
    }
  });
  // 监听鼠标抬起
  mouseEvent.on("mouseup", (data) => {
    // 中键单击
    if (data.button == 3 && global.setting.general.showHideMouseWheelClick) {
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
    }
    // 双击任务栏显示/隐藏窗口
    if (global.setting.general.doubleClickTaskbar) {
      // 不是左键的话
      if (data.button != 1) {
        // 清除timeout
        clearTimeout(global.doubleClickTimer);
        // 清空
        global.doubleClickCounter = 0;
        return;
      }
      // 双击操作
      let displays = util.getWindowInScreen();
      if (displays.length > 1 || displays.length == 0) {
        // 清除timeout
        clearTimeout(global.doubleClickTimer);
        // 清空
        global.doubleClickCounter = 0;
        return;
      }
      // 获取鼠标位置
      let point = screen.getCursorScreenPoint();
      // 判断鼠标是否在当前屏幕内
      if (
        point.x >= displays[0].bounds.x &&
        point.x <= displays[0].bounds.x + displays[0].bounds.width &&
        point.y >= displays[0].bounds.y &&
        point.y <= displays[0].bounds.y + displays[0].bounds.height
      ) {
        // 判断是否双击在任务栏上
        let flag = false;
        // 判断任务栏在哪一侧
        if (displays[0].bounds.height > displays[0].workArea.height) {
          if (displays[0].bounds.y == displays[0].workArea.y) {
            // 底部
            let top = displays[0].workArea.y + displays[0].workArea.height;
            let bottom = displays[0].bounds.y + displays[0].bounds.height;
            if (point.y >= top && point.y <= bottom) {
              flag = true;
            }
          } else {
            // 顶部
            if (point.y >= displays[0].bounds.y && point.y <= displays[0].workArea.y) {
              flag = true;
            }
          }
        } else if (displays[0].bounds.width > displays[0].workArea.width) {
          if (displays[0].bounds.x == displays[0].workArea.x) {
            // 右侧
            let left = displays[0].workArea.x + displays[0].workArea.width;
            let right = displays[0].bounds.x + displays[0].bounds.width;
            if (point.x >= left && point.x <= right) {
              flag = true;
            }
          } else {
            // 左侧
            if (point.x >= displays[0].bounds.x && point.x <= displays[0].workArea.x) {
              flag = true;
            }
          }
        }
        if (flag) {
          // 监听双击
          if (global.doubleClickCounter == null) {
            global.doubleClickCounter = 0;
          }
          // +1
          global.doubleClickCounter++;
          // 等于2就是双击
          if (global.doubleClickCounter != null && global.doubleClickCounter == 2) {
            // 清除timeout
            clearTimeout(global.doubleClickTimer);
            // 清空
            global.doubleClickCounter = 0;
            let className = global.api.getCursorPosWindowClassName();
            if (className.indexOf("MSTask") >= 0 || className == "Shell_TrayWnd") {
              if (mainWindow.isVisible()) {
                // mainWindow.hide();
                global.mainWindow.webContents.send("hideMainWindowBefore");
              } else {
                util.showFollowMousePosition();
                mainWindow.show();
              }
            }
          } else {
            // 间隔为500毫秒，如果超过500毫秒就代表不是双击
            global.doubleClickTimer = setTimeout(function () {
              global.doubleClickCounter = 0;
            }, 500);
          }
        } else {
          // 清除timeout
          clearTimeout(global.doubleClickTimer);
          // 清空
          global.doubleClickCounter = 0;
        }
      } else {
        // 清除timeout
        clearTimeout(global.doubleClickTimer);
        // 清空
        global.doubleClickCounter = 0;
      }
    }
  });
  // 失去焦点
  mainWindow.on("blur", () => {
    if (global.setting.general.edgeAutoHide && global.blurHide) {
      let scaleFactor = screen.getPrimaryDisplay().scaleFactor;
      let data = {
        x: screen.getCursorScreenPoint().x * scaleFactor,
        y: screen.getCursorScreenPoint().y * scaleFactor,
      };
      autoHide(data, 0, false);
    }
    if (mainWindow.isVisible()) {
      if (global.setting.general.hideLosingFocus && !global.setting.general.alwaysTop) {
        // 隐藏
        // mainWindow.hide();
        global.mainWindow.webContents.send("hideMainWindowBefore");
      }
    }
  });
  // 显示窗口
  mainWindow.on("show", () => {
    // 检测无效项目
    if (global.setting.item.checkInvalidItem) {
      global.mainWindow.webContents.send("checkInvalidItemResult", JSON.stringify(itemIndex.checkInvalidItem()));
    }
    // 边缘吸附
    util.edgeAdsorb();
    // 显示窗口时将输入法切换为英文模式
    if (global.setting.general.switchEnglish) {
      global.api.SwitchEnglish(mainWindow.getNativeWindowHandle());
    }
  });
  // 隐藏窗口
  mainWindow.on("hide", () => {
    global.blurHide = null;
  });
  // 关闭窗口事件
  mainWindow.on("close", () => {
    // 关闭搜索框
    if (searchWindow != null && !searchWindow.isDestroyed()) {
      searchWindow.close();
    }
    // 释放鼠标监听
    global.api.disableMouseMove();
  });
}

/**
 * 创建搜索窗口
 * @returns {Promise<void>}
 */
async function createSettingWindow() {
  // 浏览器开发者工具
  let devTools;
  // 环境判断
  if (process.env.NODE_ENV !== "production") {
    // 开发
    devTools = true;
  } else {
    // 正式
    devTools = false;
  }
  // 设置窗口
  global.settingWindow = settingWindow = new BrowserWindow({
    width: 600,
    height: 500,
    frame: false,
    show: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    parent: mainWindow,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      spellcheck: false,
      devTools: devTools,
    },
  });
  // 加载页面
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    settingWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + "#/setting");
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    settingWindow.loadURL("app://./index.html#setting");
  }
  // 加载完webContents后再显示窗口
  settingWindow.webContents.on("did-finish-load", function () {
    // 显示窗口
    settingWindow.show();
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
 * 创建搜索窗口
 * @returns {Promise<void>}
 */
async function createSearchWindow() {
  // 是否可以显示
  global.searchWindowShow = false;
  if (searchWindow != null && !searchWindow.isDestroyed()) {
    searchWindow.destroy();
  }
  // 浏览器开发者工具
  let devTools;
  // 环境判断
  if (process.env.NODE_ENV !== "production") {
    // 开发
    devTools = true;
  } else {
    // 正式
    devTools = false;
  }
  // 窗口
  global.searchWindow = searchWindow = new BrowserWindow({
    width: 600,
    height: 44,
    type: "toolbar",
    frame: false,
    show: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    resizable: false,
    alwaysOnTop: true,
    backgroundColor: global.setting.appearance.theme.mainBackground.replace("bg-[", "").replace("]", ""),
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: true,
      contextIsolation: false,
      spellcheck: false,
      devTools: devTools,
    },
  });
  // 加载页面
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    searchWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + "#/searchWindow");
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    searchWindow.loadURL("app://./index.html#searchWindow");
  }
  // 加载完webContents后再显示窗口
  searchWindow.webContents.on("did-finish-load", function () {
    // 恢复上一次的位置
    let bounds = cacheData.cacheStore.get("searchWindowBounds");
    if (bounds != null) {
      searchWindow.setBounds({ x: bounds.x, y: bounds.y });
    }
    // 设置可以显示
    global.searchWindowShow = true;
  });
  // 隐藏窗口
  searchWindow.on("hide", () => {
    searchWindow.setBounds({ height: 44 });
    searchWindow.webContents.send("hideSearchWindowOperation");
  });
  // 显示窗口
  searchWindow.on("show", () => {
    searchWindow.setBackgroundColor(global.setting.appearance.theme.mainBackground.replace("bg-[", "").replace("]", ""));
    // 显示窗口时将输入法切换为英文模式
    if (global.setting.general.switchEnglish) {
      global.api.SwitchEnglish(searchWindow.getNativeWindowHandle());
    }
  });
  // 窗口移动完毕
  searchWindow.on("moved", () => {
    // 记录位置
    cacheData.cacheStore.set("searchWindowBounds", searchWindow.getBounds());
  });
  // 失去焦点
  searchWindow.on("blur", () => {
    if (searchWindow.isVisible() && global.setting.quickSearch.hideLosingFocus) {
      global.searchWindow.webContents.send("hideSearchWindowBefore");
    }
  });
  // 禁用标题栏右键
  searchWindow.hookWindowMessage(278, function (e) {
    // 窗口禁用
    searchWindow.setEnabled(false);
    // 延时太快会立刻启动，太慢会妨碍窗口其他操作，可自行测试最佳时间
    setTimeout(() => {
      searchWindow.setEnabled(true);
    }, 100);
    return true;
  });
}

/**
 * 自动隐藏
 * @param data
 * @param size
 * @param timer
 */
function autoHide(data, size, timer) {
  if (global.mainWindow.isDestroyed()) {
    return;
  }
  try {
    let displays = util.getWindowInScreen();
    if (displays.length > 1 || displays.length == 0) {
      return;
    }
    let workArea = displays[0].workArea;
    let scaleFactor = displays[0].scaleFactor;
    let bounds = mainWindow.getBounds();
    if (mainWindow.isVisible()) {
      let flag = false;
      if (bounds.x + bounds.width >= workArea.x + workArea.width) {
        // 右侧
        flag = data.x <= bounds.x * scaleFactor - size || data.y <= bounds.y * scaleFactor - size || data.y >= (bounds.y + bounds.height) * scaleFactor + size;
      } else if (bounds.x == workArea.x) {
        // 左侧
        flag =
          data.x > (bounds.x + bounds.width) * scaleFactor + size ||
          data.y <= bounds.y * scaleFactor - size ||
          data.y >= (bounds.y + bounds.height) * scaleFactor + size;
      } else if (bounds.y + bounds.height >= workArea.y + workArea.height) {
        // 底部
        flag = data.y < bounds.y * scaleFactor - size || data.x <= bounds.x * scaleFactor - size || data.x >= (bounds.x + bounds.width) * scaleFactor + size;
      } else if (bounds.y == workArea.y) {
        // 顶部
        flag =
          data.y > (bounds.y + bounds.height) * scaleFactor + size ||
          data.x <= bounds.x * scaleFactor - size ||
          data.x >= (bounds.x + bounds.width) * scaleFactor + size;
      }
      if (flag) {
        if (global.menuShow != null && global.menuShow) {
          return;
        }
        if (timer && global.setting.general.delayHidingMS > 0 && global.autoHideTimer == null) {
          global.autoHideTimer = setTimeout(function () {
            // 隐藏
            // mainWindow.hide();
            global.mainWindow.webContents.send("hideMainWindowBefore");
          }, global.setting.general.delayHidingMS);
        } else if (global.setting.general.delayHidingMS == 0 || !timer) {
          // 隐藏
          // mainWindow.hide();
          global.mainWindow.webContents.send("hideMainWindowBefore");
        }
      } else {
        clearTimeout(global.autoHideTimer);
        global.autoHideTimer = null;
      }
    } else {
      if (global.direction != "none") {
        let flag = false;
        let x = bounds.x * scaleFactor;
        let y = bounds.y * scaleFactor;
        let windowWidthPosition = (bounds.x + bounds.width) * scaleFactor;
        let windowHeightPosition = (bounds.y + bounds.height) * scaleFactor;
        if (global.direction == "right" && data.x >= windowWidthPosition - 1 && data.y >= y && data.y <= windowHeightPosition) {
          // 右侧
          flag = true;
        } else if (global.direction == "left" && data.x <= workArea.x && data.y >= y && data.y <= windowHeightPosition) {
          // 左侧
          flag = true;
        } else if (global.direction == "bottom" && data.y >= windowHeightPosition - 1 && data.x >= x && data.x <= windowWidthPosition) {
          // 底部
          flag = true;
        } else if (global.direction == "top" && data.y <= workArea.y && data.x >= x && data.x <= windowWidthPosition) {
          // 顶部
          flag = true;
        }
        if (flag) {
          if (util.notDisturb()) {
            return;
          }
          if (timer && global.setting.general.delayDisplayMS > 0 && global.autoHideTimer == null) {
            global.autoHideTimer = setTimeout(function () {
              // 显示
              mainWindow.show();
              if (!global.setting.general.alwaysTop) {
                global.mainWindow.setAlwaysOnTop(true, "screen-saver");
                global.mainWindow.setAlwaysOnTop(false);
              }
            }, global.setting.general.delayDisplayMS);
          } else if (global.setting.general.delayDisplayMS == 0 || !timer) {
            // 显示
            mainWindow.show();
            if (!global.setting.general.alwaysTop) {
              global.mainWindow.setAlwaysOnTop(true, "screen-saver");
              global.mainWindow.setAlwaysOnTop(false);
            }
          }
        } else {
          clearTimeout(global.autoHideTimer);
          global.autoHideTimer = null;
        }
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.log(e);
    }
    global.mainWindow.setBounds({ x: 1, y: 1 });
  }
}

/**
 * 显示设置窗口
 */
function showSettingWindow() {
  if (settingWindow != null && !settingWindow.isDestroyed()) {
    if (!settingWindow.isVisible()) {
      settingWindow.show();
    }
    settingWindow.focus();
  } else {
    createSettingWindow();
  }
}

app.whenReady().then(() => {
  // 禁用debugtron
  for (let i = 0; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.indexOf("--inspect") !== -1 || arg.indexOf("--remote-debugging-port") !== -1) {
      dialog.showMessageBoxSync(global.mainWindow, {
        title: "Dawn Launcher",
        message: "达咩呦达咩达咩~",
        buttons: ["确定"],
        type: "error",
        noLink: true,
      });
      app.quit();
      return;
    }
  }
  // 禁止多开
  const instanceLock = app.requestSingleInstanceLock();
  if (!instanceLock) {
    app.quit();
    return;
  }
  // 设置快捷键
  let setting = settingData.get();
  settingIndex.setShortcutKey(setting);
  // 引用c++
  try {
    global.api = require("bindings")({
      bindings: "api.node",
      module_root: process.env.NODE_ENV !== "production" ? path.resolve(".") : path.dirname(process.execPath),
    });
  } catch (e) {
    dialog.showMessageBoxSync(global.mainWindow, {
      title: "Dawn Launcher",
      message: "缺少DLL文件，请重新下载安装包，安装后运行。",
      buttons: ["确定"],
      type: "error",
      noLink: true,
    });
    app.quit();
    return;
  }
  // 创建窗口
  createWindow(true);
});

app.on("second-instance", (event, commandLine, workingDirectory) => {
  if (mainWindow) {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
      global.blurHide = true;
    } else {
      mainWindow.focus();
    }
  }
});

app.on("window-all-closed", () => {
  // 释放鼠标监听
  global.api.disableMouseMove();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow(false).then((r) => {});
  }
});

if (process.env.NODE_ENV === "production") {
  // 开机启动
  const exeName = path.basename(process.execPath);
  ipcMain.on("setAutoLaunch", (event, args) => {
    app.setLoginItemSettings({
      openAtLogin: args,
      openAsHidden: false,
      path: process.execPath,
      args: ["--processStart", `"${exeName}"`],
    });
  });
}

// 设置当前语言
ipcMain.on("setCurrentLanguage", (event, args) => {
  let currentLanguage = JSON.parse(args);
  global.currentLanguage = currentLanguage;
  // 托盘菜单
  setTray(!global.setting.general.hideTray);
});

/**
 * 托盘
 */
function setTray(show) {
  // 获取语言
  if (show) {
    if (global.tray == null) {
      // 环境判断
      if (process.env.NODE_ENV !== "production") {
        // 开发
        global.tray = new Tray("./public/images/logo-thick.ico");
      } else {
        // 正式
        global.tray = new Tray(path.join(__dirname, "./images/logo-thick.ico"));
      }
    }
    let contextMenu = Menu.buildFromTemplate([
      {
        label: global.currentLanguage.displayMainInterface,
        click: function () {
          mainWindow.show();
          global.blurHide = true;
        },
      },
      {
        label: global.currentLanguage.setting,
        click: function () {
          showSettingWindow();
        },
      },
      {
        // 点击退出菜单退出程序
        label: global.currentLanguage.exit,
        click: function () {
          mainWindow.close();
        },
      },
    ]);
    // 托盘
    global.tray.setToolTip("Dawn Launcher");
    global.tray.setContextMenu(contextMenu);
    // 点击托盘图标，显示主窗口
    global.tray.on("click", () => {
      mainWindow.show();
      global.blurHide = true;
    });
  } else {
    // 隐藏托盘
    if (global.tray != null) {
      if (!global.tray.isDestroyed()) {
        global.tray.destroy();
        global.tray = null;
      }
    }
  }
}

// 创建搜索窗口
ipcMain.on("createSearchWindow", () => {
  // 搜索框
  createSearchWindow();
});

// 托盘
ipcMain.on("setTray", (event, args) => {
  setTray(args);
});

// 开启快捷搜索
ipcMain.on("setEnableQuickSearch", (event, args) => {
  // 设置快捷键
  let setting = settingData.get();
  setting.quickSearch.enable = args;
  settingIndex.setShortcutKey(setting);
});

// 设置背景透明度
ipcMain.on("setBackgroundTransparency", (event, args) => {
  if ((Number(args) == 1 && global.backgroundTransparency) || (Number(args) != 1 && !global.backgroundTransparency)) {
    mainWindow.destroy();
    global.mainWindow = mainWindow = null;
    createWindow(false);
  }
});

// 创建设置窗口
ipcMain.on("createSettingWindow", (event, args) => {
  showSettingWindow();
});

// 显示搜索窗口
ipcMain.on("searchWindowShow", (event, args) => {
  if (args != null) {
    searchWindow.setBounds({ height: args });
  }
  searchWindow.show();
});
