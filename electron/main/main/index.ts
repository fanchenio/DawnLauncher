import {
  BrowserWindow,
  Display,
  Menu,
  Tray,
  app,
  screen,
  shell,
} from "electron";
import { createSettingWindow } from "../setting";
import { join } from "node:path";
import cacheData from "../commons/cacheData";
import {
  getMainBackgorunColor,
  getWindowInScreen,
  sendToWebContent,
} from "../commons";
import { release } from "node:os";

// 窗口
let mainWindow: BrowserWindow | null = null;

/**
 * 主窗口
 */
function createMainWindow() {
  // 如果窗口存在先关闭窗口
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
    mainWindow.close();
    mainWindow = null;
    global.mainWindow = null;
  }
  // 创建窗口
  mainWindow = global.mainWindow = new BrowserWindow({
    title: "Dawn Launcher",
    width: 800,
    height: 600,
    frame: false,
    show: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    transparent: global.setting.appearance.transparency < 1,
    skipTaskbar: global.setting.general.hideTaskbar,
    backgroundColor:
      global.setting.appearance.transparency === 1
        ? getMainBackgorunColor()
        : null,
    icon: join(process.env.VITE_PUBLIC, "logo.ico"),
    webPreferences: {
      spellcheck: false,
      backgroundThrottling: false,
      preload: join(__dirname, "../preload/index.js"),
      devTools: process.env.NODE_ENV === "development",
    },
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(join(process.env.DIST, "index.html"));
  }
  // 加载完毕
  mainWindow.webContents.on("did-finish-load", () => {
    // 设置窗口无动画
    global.addon.removeWindowAnimation(
      mainWindow.getNativeWindowHandle().readInt32LE(0)
    );
    // 恢复上一次的位置
    let bounds = cacheData.cacheStore.get("mainWindowBounds");
    if (bounds) {
      mainWindow.setBounds(bounds);
    }
    // 永远居中不可移动
    if (global.setting.general.alwaysCenter) {
      mainWindow.setMovable(false);
    } else {
      mainWindow.setMovable(!global.setting.general.fixedPosition);
    }
    // 永远置顶
    if (global.setting.general.alwaysTop) {
      mainWindow.setAlwaysOnTop(true, "screen-saver");
    }
    // 锁定尺寸
    if (!global.setting.general.lockSize) {
      mainWindow.setResizable(!global.setting.general.lockSize);
    }
    // 托盘
    createTray(!global.setting.general.hideTray);
    // 永远居中
    alwaysCenter();
    // 判断窗口位置
    let displays = getWindowInScreen(mainWindow);
    if (displays.length === 0) {
      // 代表窗口的位置不再任一屏幕内，将窗口位置移动到主窗口
      mainWindow.center();
    }
    // 边缘吸附
    edgeAdsorb(null);
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // 显示窗口
  mainWindow.on("show", () => {
    // 显示窗口时将输入法切换为英文模式
    if (global.setting.general.switchEnglish) {
      global.addon.switchEnglish(
        mainWindow.getNativeWindowHandle().readInt32LE(0)
      );
    }
    // 边缘吸附
    edgeAdsorb(null);
  });
  // 失去焦点
  mainWindow.on("blur", () => {
    if (global.setting.general.edgeAutoHide && global.blurHide) {
      autoHide(0, false);
    }
    if (
      mainWindow.isVisible() &&
      global.setting.general.hideLoseFocus &&
      !global.setting.general.alwaysTop
    ) {
      // 如果当前还有打开的子窗口就不执行失去焦点隐藏
      if (mainWindow.getChildWindows().length === 0) {
        hideMainWindow();
      }
    }
  });
  // 窗口移动完毕
  mainWindow.on("moved", () => {
    // 边缘吸附
    edgeAdsorb(null);
    // 永远居中
    alwaysCenter();
    // 记录位置
    cacheData.cacheStore.set("mainWindowBounds", mainWindow.getBounds());
  });
  // 改变窗口大小完毕
  mainWindow.on("resized", () => {
    // 边缘吸附
    edgeAdsorb(null);
    // 永远居中
    alwaysCenter();
    // 记录位置
    cacheData.cacheStore.set("mainWindowBounds", mainWindow.getBounds());
  });
  // 窗口隐藏事件
  mainWindow.on("hide", () => {
    // 收起子分类
    if (global.setting.classification.hideWindowCollapseSubClassification) {
      sendToWebContent("mainWindow", "onCollapseSubClassification", {});
    }
  });
  // 创建鼠标hook
  let mousedownClassName = null;
  addon.createMouseHook((...args: any[]) => {
    let res = JSON.parse(args[1]);
    let event: string = res.event;
    let x: number = res.x;
    let y: number = res.y;
    let className: string =
      !res.class_name || res.class_name.trim() === ""
        ? null
        : res.class_name.trim();
    // 1左键 2右键 3滚轮
    let button: number = res.button;
    if (event === "mousemove") {
      // 鼠标移动
      if (!global.blurHide) {
        // 停靠在桌面边缘时自动隐藏
        autoHide(20, true);
      }
    } else if (event === "mousedown") {
      // 鼠标按下
      if (button === 1) {
        mousedownClassName = className;
      }
    } else if (event === "mouseup") {
      // 鼠标抬起
      if (button === 1) {
        // 双击任务栏
        doubleClickTaskbar(mousedownClassName, className);
      } else if (button === 3) {
        // 中间单击
        showHideMouseWheelClick();
      }
    }
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
}

/**
 * 显示窗口之前
 * @param blurHide
 * @param autoHide
 * @param selectedClassificationId
 */
function showMainWindowBefore(
  blurHide: boolean,
  autoHide = false,
  selectedClassificationId: number | null = null
) {
  // 向主窗口发送通知
  sendToWebContent("mainWindow", "onShowMainWindowBefore", {
    blurHide,
    autoHide,
    selectedClassificationId,
  });
}

/**
 * 显示窗口
 * @param blurHide
 * @param autoHide
 */
function showMainWindow(blurHide: boolean, autoHide = false) {
  // flag
  let flag = true;
  // 是否开启勿扰模式
  if (global.setting.general.notDisturb) {
    if (global.addon.isFullscreen()) {
      flag = false;
    }
  }
  if (!autoHide) {
    // 显示时跟随鼠标位置
    showFollowMousePosition();
  }
  if (flag) {
    global.mainWindow.show();
    global.mainWindow.focus();
    global.blurHide = blurHide;
    if (blurHide) {
      global.blurHide = true;
    } else {
      global.blurHide = false;
    }
  }
}

/**
 * 隐藏窗口
 */
function hideMainWindow() {
  if (global.mainWindow.isVisible()) {
    global.mainWindow.hide();
    global.blurHide = false;
  }
}

/**
 * 托盘
 */
function createTray(show: boolean) {
  if (show) {
    // 销毁托盘
    if (global.tray && !global.tray.isDestroyed()) {
      global.tray.destroy();
      global.tray = null;
    }
    // 创建托盘
    global.tray = new Tray(join(process.env.VITE_PUBLIC, "tray.ico"));
    // 菜单
    let contextMenu = Menu.buildFromTemplate([
      {
        label: global.language.displayMainWindow,
        click: function () {
          showMainWindowBefore(true);
        },
      },
      {
        label: global.language.settings,
        click: function () {
          createSettingWindow();
        },
      },
      {
        label: global.language.exit,
        click: function () {
          app.quit();
        },
      },
    ]);
    global.tray.setToolTip("Dawn Launcher");
    global.tray.setContextMenu(contextMenu);
    // 点击托盘
    global.tray.on("click", () => {
      showMainWindowBefore(true);
    });
  } else {
    // 销毁托盘
    if (global.tray && !global.tray.isDestroyed()) {
      global.tray.destroy();
      global.tray = null;
    }
  }
}

/**
 * 边缘吸附
 * @param display
 * @param workArea
 * @returns
 */
function edgeAdsorb(display: Display | null, workArea = false) {
  // 如果勾选停靠在桌面边缘时自动隐藏，放行
  if (
    global.mainWindow.isDestroyed() ||
    (!global.setting.general.edgeAdsorb && !global.setting.general.edgeAutoHide)
  ) {
    return;
  }
  try {
    // 清空方向
    global.mainWindowDirection = null;
    // 屏幕
    let displays = display ? [display] : getWindowInScreen(mainWindow);
    if (displays.length > 1 || displays.length === 0) {
      return;
    }
    // 屏幕区域
    let displayBounds = workArea ? displays[0].workArea : displays[0].bounds;
    // 窗口位置信息
    let bounds = global.mainWindow.getBounds();
    if (bounds.x <= displayBounds.x && bounds.y <= displayBounds.y) {
      // 左上角
      global.mainWindow.setBounds({ x: displayBounds.x, y: displayBounds.y });
      global.mainWindowDirection = "leftTop";
      global.blurHide = false;
    } else if (
      bounds.x + bounds.width >= displayBounds.x + displayBounds.width &&
      bounds.y <= displayBounds.y
    ) {
      // 右上角
      global.mainWindow.setBounds({
        x: displayBounds.x + displayBounds.width - bounds.width,
        y: displayBounds.y,
      });
      global.mainWindowDirection = "rightTop";
      global.blurHide = false;
    } else if (
      bounds.x <= displayBounds.x &&
      bounds.y + bounds.height >= displayBounds.y + displayBounds.height
    ) {
      // 左下角
      global.mainWindow.setBounds({
        x: displayBounds.x,
        y: displayBounds.y + displayBounds.height - bounds.height,
      });
      global.mainWindowDirection = "leftBottom";
      global.blurHide = false;
    } else if (
      bounds.x + bounds.width >= displayBounds.x + displayBounds.width &&
      bounds.y + bounds.height >= displayBounds.y + displayBounds.height
    ) {
      // 右下角
      global.mainWindow.setBounds({
        x: displayBounds.x + displayBounds.width - bounds.width,
        y: displayBounds.y + displayBounds.height - bounds.height,
      });
      global.mainWindowDirection = "rightBottom";
      global.blurHide = false;
    } else if (bounds.x <= displayBounds.x) {
      // 左侧
      global.mainWindow.setBounds({ x: displayBounds.x });
      global.mainWindowDirection = "left";
      global.blurHide = false;
    } else if (
      bounds.x + bounds.width >=
      displayBounds.x + displayBounds.width
    ) {
      // 右侧
      global.mainWindow.setBounds({
        x: displayBounds.x + displayBounds.width - bounds.width,
      });
      global.mainWindowDirection = "right";
      global.blurHide = false;
    } else if (
      bounds.y + bounds.height >=
      displayBounds.y + displayBounds.height
    ) {
      // 底部
      global.mainWindow.setBounds({
        y: displayBounds.y + displayBounds.height - bounds.height,
      });
      global.mainWindowDirection = "bottom";
      global.blurHide = false;
    } else if (bounds.y <= displayBounds.y) {
      // 顶部
      global.mainWindow.setBounds({ y: displayBounds.y });
      global.mainWindowDirection = "top";
      global.blurHide = false;
    }
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.log(e);
    }
    global.mainWindow.setBounds({ x: 1, y: 1 });
  }
}

/**
 * 显示时跟随鼠标位置
 */
function showFollowMousePosition() {
  // 当永远居中、固定位置勾选后不能使用显示时跟随鼠标位置
  if (
    !global.setting.general.alwaysCenter &&
    !global.setting.general.fixedPosition &&
    global.setting.general.showFollowMousePosition
  ) {
    // 获取鼠标位置
    let point = screen.getCursorScreenPoint();
    // 窗口位置信息
    let bounds = global.mainWindow.getBounds();
    let x = Math.round(bounds.width / 2);
    let y = Math.round(bounds.height / 2);
    // 设置窗口位置
    global.mainWindow.setPosition(point.x - x, point.y - y);
    // 调整窗口位置并显示时会出现闪屏的情况
    // https://github.com/electron/electron/issues/10862
    for (let i = 0; i < 10; i++) {
      global.mainWindow.setSize(bounds.width, bounds.height);
    }
    // 获取当前鼠标所在屏幕
    let display = screen.getDisplayNearestPoint(point);
    // 边缘吸附
    edgeAdsorb(display, true);
  }
}

/**
 * 中间单击显示/隐藏窗口
 */
function showHideMouseWheelClick() {
  if (global.setting.general.showHideMouseWheelClick) {
    if (global.mainWindow.isVisible()) {
      hideMainWindow();
    } else {
      showMainWindowBefore(true);
    }
  }
}

/**
 * 永远居中
 */
function alwaysCenter() {
  if (global.setting.general.alwaysCenter) {
    mainWindow.center();
  }
}

/**
 * 边缘自动隐藏
 * @param size
 * @param timer 是否启用延迟显示/隐藏
 * @returns
 */
function autoHide(size: number, timer: boolean) {
  if (global.mainWindow.isDestroyed() || !global.setting.general.edgeAutoHide) {
    return;
  }
  // 当有子窗口时不自动隐藏
  if (mainWindow.getChildWindows().length > 0) {
    return;
  }
  let x = screen.getCursorScreenPoint().x;
  let y = screen.getCursorScreenPoint().y;
  try {
    // 屏幕
    let displays = getWindowInScreen(mainWindow);
    if (displays.length > 1 || displays.length === 0) {
      return;
    }
    // 屏幕区域
    let displayBounds = displays[0].bounds;
    // 窗口位置信息
    let bounds = mainWindow.getBounds();
    if (mainWindow.isVisible()) {
      let flag = false;
      if (bounds.x === displayBounds.x && bounds.y === displayBounds.y) {
        // 左上角
        flag =
          x >= bounds.x + bounds.width + size ||
          y >= bounds.y + bounds.height + size;
      } else if (
        bounds.x + bounds.width === displayBounds.x + displayBounds.width &&
        bounds.y === displayBounds.y
      ) {
        // 右上角
        flag = x <= bounds.x - size || y >= bounds.y + bounds.height + size;
      } else if (
        bounds.x === displayBounds.x &&
        bounds.y + bounds.height === displayBounds.y + displayBounds.height
      ) {
        // 左下角
        flag = x >= bounds.x + bounds.width + size || y <= bounds.y - size;
      } else if (
        bounds.x + bounds.width === displayBounds.x + displayBounds.width &&
        bounds.y + bounds.height === displayBounds.y + displayBounds.height
      ) {
        // 右下角
        flag = x <= bounds.x - size || y <= bounds.y - size;
      } else if (
        bounds.x + bounds.width >=
        displayBounds.x + displayBounds.width
      ) {
        // 右侧
        flag =
          x <= bounds.x - size ||
          y <= bounds.y - size ||
          y >= bounds.y + bounds.height + size;
      } else if (bounds.x === displayBounds.x) {
        // 左侧
        flag =
          x > bounds.x + bounds.width + size ||
          y <= bounds.y - size ||
          y >= bounds.y + bounds.height + size;
      } else if (
        bounds.y + bounds.height >=
        displayBounds.y + displayBounds.height
      ) {
        // 底部
        flag =
          y < bounds.y - size ||
          x <= bounds.x - size ||
          x >= bounds.x + bounds.width + size;
      } else if (bounds.y === displayBounds.y) {
        // 顶部
        flag =
          y > bounds.y + bounds.height + size ||
          x <= bounds.x - size ||
          x >= bounds.x + bounds.width + size;
      }
      if (flag && !global.classificationRightMenu && !global.itemRightMenu) {
        if (
          timer &&
          global.setting.general.delayHideMs > 0 &&
          !global.autoHideTimer
        ) {
          // 延迟隐藏
          global.autoHideTimer = setTimeout(function () {
            hideMainWindow();
          }, global.setting.general.delayHideMs);
        } else if (!timer || global.setting.general.delayHideMs === 0) {
          // 隐藏
          hideMainWindow();
        }
      } else {
        // 清空timer
        clearTimeout(global.autoHideTimer);
        global.autoHideTimer = null;
      }
    } else {
      if (global.mainWindowDirection) {
        let flag = false;
        if (
          global.mainWindowDirection === "leftTop" &&
          x === displayBounds.x &&
          y === displayBounds.y
        ) {
          // 左上角
          flag = true;
        } else if (
          global.mainWindowDirection === "rightTop" &&
          x === displayBounds.x + displayBounds.width - 1 &&
          y === displayBounds.y
        ) {
          // 右上角
          flag = true;
        } else if (
          global.mainWindowDirection === "leftBottom" &&
          x === displayBounds.x &&
          y === displayBounds.y + displayBounds.height - 1
        ) {
          // 左下角
          flag = true;
        } else if (
          global.mainWindowDirection === "rightBottom" &&
          x === displayBounds.x + displayBounds.width - 1 &&
          y === displayBounds.y + displayBounds.height - 1
        ) {
          // 右下角
          flag = true;
        } else if (
          global.mainWindowDirection === "left" &&
          x <= displayBounds.x &&
          y >= bounds.y &&
          y <= bounds.y + bounds.height
        ) {
          // 左侧
          flag = true;
        } else if (
          global.mainWindowDirection === "right" &&
          x >= bounds.x + bounds.width - 1 &&
          y >= bounds.y &&
          y <= bounds.y + bounds.height
        ) {
          // 右侧
          flag = true;
        } else if (
          global.mainWindowDirection === "bottom" &&
          y >= bounds.y + bounds.height - 1 &&
          x >= bounds.x &&
          x <= bounds.x + bounds.width
        ) {
          // 底部
          flag = true;
        } else if (
          global.mainWindowDirection === "top" &&
          y <= displayBounds.y &&
          x >= bounds.x &&
          x <= bounds.x + bounds.width
        ) {
          // 顶部
          flag = true;
        }
        if (flag) {
          if (
            timer &&
            global.setting.general.delayDisplayMs > 0 &&
            !global.autoHideTimer
          ) {
            // 延迟显示
            global.autoHideTimer = setTimeout(function () {
              showMainWindowBefore(false, true);
            }, global.setting.general.delayDisplayMs);
          } else if (!timer || global.setting.general.delayDisplayMs === 0) {
            // 显示
            showMainWindowBefore(false, true);
          }
        } else {
          // 清空timer
          clearTimeout(global.autoHideTimer);
          global.autoHideTimer = null;
        }
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.log(e);
    }
    global.mainWindow.setBounds({ x: 1, y: 1 });
  }
}

/**
 * 双击任务栏显示/隐藏
 */
function doubleClickTaskbar(
  mousedownClassName: string | null,
  className: string | null
) {
  // 必须开启设置
  if (!global.setting.general.showHideDoubleClickTaskbar) {
    return;
  }
  // 获取屏幕
  let displays = getWindowInScreen(mainWindow);
  if (
    displays.length > 1 ||
    displays.length === 0 ||
    (className !== "Shell_TrayWnd" && className !== "Shell_SecondaryTrayWnd")
  ) {
    // 清除timeout
    clearTimeout(global.doubleClickTaskbarTimer);
    // 清空计数
    global.doubleClickTaskbarCounter = 0;
    return;
  }
  // 必须是指定Class
  if (
    (release().startsWith("10.0.1") &&
      global.addon.getCursorPosWindowClassName().indexOf("MSTask") >= 0) ||
    (release().startsWith("10.0.2") &&
      global.addon.getCursorPosWindowClassName() !== "TrayNotifyWnd")
  ) {
    // 监听双击
    if (!global.doubleClickTaskbarCounter) {
      global.doubleClickTaskbarCounter = 0;
    }
    // +1
    global.doubleClickTaskbarCounter++;
    if (
      global.doubleClickTaskbarCounter &&
      global.doubleClickTaskbarCounter === 2 &&
      (mousedownClassName === "Shell_TrayWnd" ||
        mousedownClassName === "Shell_SecondaryTrayWnd")
    ) {
      // 清除timeout
      clearTimeout(global.doubleClickTaskbarTimer);
      // 清空计数
      global.doubleClickTaskbarCounter = 0;
      // 显示或隐藏
      if (mainWindow.isVisible()) {
        hideMainWindow();
      } else {
        showMainWindowBefore(false);
      }
    } else {
      // 间隔为500毫秒，如果超过500毫秒就代表不是双击
      global.doubleClickTaskbarTimer = setTimeout(function () {
        global.doubleClickTaskbarCounter = 0;
      }, 500);
    }
  } else {
    // 清除timeout
    clearTimeout(global.doubleClickTaskbarTimer);
    // 清空计数
    global.doubleClickTaskbarCounter = 0;
  }
}

export {
  createMainWindow,
  showMainWindowBefore,
  showMainWindow,
  hideMainWindow,
  createTray,
  edgeAdsorb,
  getWindowInScreen,
  showHideMouseWheelClick,
  alwaysCenter,
  autoHide,
};
