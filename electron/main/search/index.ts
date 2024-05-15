import { BrowserWindow, shell, screen } from "electron";
import { join } from "node:path";
import { getWindowInScreen, sendToWebContent } from "../commons";
import cacheData from "../commons/cacheData";

// 窗口
let quickSearchWindow: BrowserWindow | null = null;

/**
 * 快速搜索窗口
 */
function createQuickSearchWindow() {
  // 创建窗口
  global.quickSearchWindowInit = false;
  quickSearchWindow = global.quickSearchWindow = new BrowserWindow({
    title: "Dawn Launcher",
    width: global.setting.quickSearch.width,
    height: 44,
    type: "toolbar",
    frame: false,
    show: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    resizable: false,
    alwaysOnTop: true,
    backgroundColor: global.setting.appearance.theme.mainBackgroundColor,
    webPreferences: {
      spellcheck: false,
      backgroundThrottling: false,
      preload: join(__dirname, "../preload/index.js"),
      devTools: process.env.NODE_ENV === "development",
    },
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    quickSearchWindow.loadURL(
      process.env.VITE_DEV_SERVER_URL + "Search/QuickSearch"
    );
  } else {
    quickSearchWindow.loadFile(join(process.env.DIST, "index.html"), {
      hash: "/Search/QuickSearch",
    });
  }
  quickSearchWindow.webContents.on("did-finish-load", function () {
    // 恢复上一次的位置
    let bounds = cacheData.cacheStore.get("quickSearchWindowBounds");
    if (bounds) {
      quickSearchWindow.setBounds(bounds);
    }
    // 设置可以显示
    global.searchWindowShow = true;
  });
  quickSearchWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // 失去焦点
  quickSearchWindow.on("blur", () => {
    // 失去焦点后隐藏
    if (global.setting.quickSearch.hideLoseFocus) {
      hideQuickSearchWindow();
    }
  });
  // 显示窗口
  quickSearchWindow.on("show", () => {
    // 背景色
    quickSearchWindow.setBackgroundColor(
      global.setting.appearance.theme.mainBackgroundColor
    );
    // 显示窗口时将输入法切换为英文模式
    if (global.setting.general.switchEnglish) {
      global.addon.switchEnglish(
        quickSearchWindow.getNativeWindowHandle().readInt32LE(0)
      );
    }
  });
  // 窗口移动完毕
  quickSearchWindow.on("moved", () => {
    // 记录位置
    cacheData.cacheStore.set(
      "quickSearchWindowBounds",
      quickSearchWindow.getBounds()
    );
  });
  // 隐藏窗口
  quickSearchWindow.on("hide", () => {
    // 设置默认高度
    quickSearchWindow.setBounds({ height: 44 });
    // 发送消息清空数据
    quickSearchWindow.webContents.send("onQuickSearchClearData");
  });
  // 禁用标题栏右键
  quickSearchWindow.hookWindowMessage(278, function (e) {
    // 窗口禁用
    quickSearchWindow.setEnabled(false);
    // 延时太快会立刻启动，太慢会妨碍窗口其他操作，可自行测试最佳时间
    setTimeout(() => {
      quickSearchWindow.setEnabled(true);
    }, 100);
    return true;
  });
}

/**
 * 显示快速搜索窗口之前
 */
function showQuickSearchWindowBefore() {
  // 向主窗口发送通知
  sendToWebContent("quickSearchWindow", "onShowQuickSearchWindowBefore", null);
}

/**
 * 显示快速搜索窗口
 */
function showQuickSearchWindow() {
  // 获取鼠标所在的屏幕
  let currentDisplay = screen.getDisplayNearestPoint(
    screen.getCursorScreenPoint()
  );
  // 获取窗口所在的屏幕
  let windowDisplay = getWindowInScreen(quickSearchWindow);
  if (windowDisplay.length === 0) {
    // 代表窗口的位置不再任一屏幕内，将窗口位置移动到主窗口
    quickSearchWindow.center();
  } else if (
    (windowDisplay.length === 1 && currentDisplay.id !== windowDisplay[0].id) ||
    windowDisplay.length > 1
  ) {
    // 在鼠标所在的屏幕显示
    let workArea = currentDisplay.workArea;
    let bounds = quickSearchWindow.getBounds();
    let x = Math.round(workArea.x + workArea.width / 2 - bounds.width / 2);
    let y = Math.round(workArea.y + workArea.height / 2 - 44 / 2);
    quickSearchWindow.setPosition(x, y);
    for (let i = 0; i < 10; i++) {
      quickSearchWindow.setSize(global.setting.quickSearch.width, 44);
    }
  }
  // 显示
}

/**
 * 隐藏快速搜索窗口
 */
function hideQuickSearchWindow() {
  quickSearchWindow.hide();
}

export {
  createQuickSearchWindow,
  showQuickSearchWindow,
  hideQuickSearchWindow,
  showQuickSearchWindowBefore,
};
