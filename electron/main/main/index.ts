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
import { getMainBackgorunColor, sendToWebContent } from "../commons";

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
    type: "toolbar",
    frame: false,
    show: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    transparent: global.setting.appearance.transparency < 1,
    skipTaskbar: true,
    backgroundColor:
      global.setting.appearance.transparency === 1
        ? getMainBackgorunColor()
        : null,
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
    let displays = getWindowInScreen();
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
      let scaleFactor = screen.getPrimaryDisplay().scaleFactor;
      autoHide(
        screen.getCursorScreenPoint().x * scaleFactor,
        screen.getCursorScreenPoint().y * scaleFactor,
        0,
        false
      );
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
  addon.createMouseHook((...args: any[]) => {
    let res = JSON.parse(args[1]);
    let event: string = res.event;
    let x: number = res.x;
    let y: number = res.y;
    // 1左键 2右键 3滚轮
    let button: number = res.button;
    if (event === "mousemove") {
      // 鼠标移动
      if (!global.blurHide) {
        // 停靠在桌面边缘时自动隐藏
        autoHide(x, y, 40, true);
      }
    } else if (event === "mousedown") {
      // 鼠标按下
    } else if (event === "mouseup") {
      // 鼠标抬起
      if (button === 3) {
        // 中间单击
        // 显示隐藏窗口
        showHideMouseWheelClick();
      }
      // 双击任务栏
      doubleClickTaskbar(button);
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
 * @param selectedClassificationId
 */
function showMainWindowBefore(
  blurHide: boolean,
  selectedClassificationId: number | null = null
) {
  // 向主窗口发送通知
  sendToWebContent("mainWindow", "onShowMainWindowBefore", {
    blurHide,
    selectedClassificationId,
  });
}

/**
 * 显示窗口
 * @param blurHide
 */
function showMainWindow(blurHide: boolean) {
  // flag
  let flag = true;
  // 是否开启勿扰模式
  if (global.setting.general.notDisturb) {
    if (global.addon.isFullscreen()) {
      flag = false;
    }
  }
  // 显示时跟随鼠标位置
  showFollowMousePosition();
  if (flag) {
    global.mainWindow.show();
    // 如果没有设置置顶时，显示窗口先置顶一下，再取消
    if (!global.mainWindow.isAlwaysOnTop) {
      mainWindow.setAlwaysOnTop(true, "screen-saver");
      mainWindow.setAlwaysOnTop(false);
    }
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
 * 获取窗口所在的屏幕
 */
function getWindowInScreen() {
  let inDisplays: Array<Display> = [];
  let displays = screen.getAllDisplays();
  let bounds = global.mainWindow.getBounds();
  for (let display of displays) {
    let workArea = display.workArea;
    if (
      ((workArea.x <= bounds.x && workArea.x + workArea.width >= bounds.x) ||
        (workArea.x <= bounds.x + bounds.width &&
          workArea.x + workArea.width >= bounds.x + bounds.width)) &&
      ((workArea.y <= bounds.y && workArea.y + workArea.height >= bounds.y) ||
        (workArea.y <= bounds.y + bounds.height &&
          workArea.y + workArea.height >= bounds.y + bounds.height))
    ) {
      inDisplays.push(display);
    }
  }
  return inDisplays;
}

/**
 * 边缘吸附
 * @param display
 * @returns
 */
function edgeAdsorb(display: Display | null) {
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
    let displays = display ? [display] : getWindowInScreen();
    if (displays.length > 1 || displays.length === 0) {
      return;
    }
    // 获取屏幕工作区域
    let workArea = displays[0].workArea;
    // 窗口位置信息
    let bounds = global.mainWindow.getBounds();
    if (bounds.x + bounds.width >= workArea.x + workArea.width) {
      // 右侧
      global.mainWindow.setBounds({
        x: workArea.x + workArea.width - bounds.width,
      });
      global.mainWindowDirection = "right";
      global.blurHide = false;
    } else if (bounds.x <= workArea.x) {
      // 左侧
      global.mainWindow.setBounds({ x: workArea.x });
      global.mainWindowDirection = "left";
      global.blurHide = false;
    }
    if (bounds.y + bounds.height >= workArea.y + workArea.height) {
      // 底部
      global.mainWindow.setBounds({
        y: workArea.y + workArea.height - bounds.height,
      });
      global.mainWindowDirection = "bottom";
      global.blurHide = false;
    } else if (bounds.y <= workArea.y) {
      // 顶部
      global.mainWindow.setBounds({ y: workArea.y });
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
    for (let i = 0; i < 10; i++) {
      global.mainWindow.setSize(bounds.width, bounds.height);
    }
    // 获取当前鼠标所在屏幕
    let display = screen.getDisplayNearestPoint(point);
    // 边缘吸附
    edgeAdsorb(display);
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
 * @param x
 * @param y
 * @param size
 * @param timer 是否启用延迟显示/隐藏
 * @returns
 */
function autoHide(x: number, y: number, size: number, timer: boolean) {
  if (global.mainWindow.isDestroyed() || !global.setting.general.edgeAutoHide) {
    return;
  }
  // 当有子窗口时不自动隐藏
  if (mainWindow.getChildWindows().length > 0) {
    return;
  }
  try {
    // 屏幕
    let displays = getWindowInScreen();
    if (displays.length > 1 || displays.length === 0) {
      return;
    }
    // 工作区域
    let workArea = displays[0].workArea;
    // 缩放比例
    let scaleFactor = displays[0].scaleFactor;
    // 窗口位置信息
    let bounds = mainWindow.getBounds();
    if (mainWindow.isVisible()) {
      let flag = false;
      if (bounds.x + bounds.width >= workArea.x + workArea.width) {
        // 右侧
        flag =
          x <= bounds.x * scaleFactor - size ||
          y <= bounds.y * scaleFactor - size ||
          y >= (bounds.y + bounds.height) * scaleFactor + size;
      } else if (bounds.x === workArea.x) {
        // 左侧
        flag =
          x > (bounds.x + bounds.width) * scaleFactor + size ||
          y <= bounds.y * scaleFactor - size ||
          y >= (bounds.y + bounds.height) * scaleFactor + size;
      } else if (bounds.y + bounds.height >= workArea.y + workArea.height) {
        // 底部
        flag =
          y < bounds.y * scaleFactor - size ||
          x <= bounds.x * scaleFactor - size ||
          x >= (bounds.x + bounds.width) * scaleFactor + size;
      } else if (bounds.y === workArea.y) {
        // 顶部
        flag =
          y > (bounds.y + bounds.height) * scaleFactor + size ||
          x <= bounds.x * scaleFactor - size ||
          x >= (bounds.x + bounds.width) * scaleFactor + size;
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
        let scaleFactorX = bounds.x * scaleFactor;
        let scaleFactorY = bounds.y * scaleFactor;
        let windowWidthPosition = (bounds.x + bounds.width) * scaleFactor;
        let windowHeightPosition = (bounds.y + bounds.height) * scaleFactor;
        if (
          global.mainWindowDirection === "right" &&
          x >= windowWidthPosition - 1 &&
          y >= scaleFactorY &&
          y <= windowHeightPosition
        ) {
          // 右侧
          flag = true;
        } else if (
          global.mainWindowDirection === "left" &&
          x <= workArea.x &&
          y >= scaleFactorY &&
          y <= windowHeightPosition
        ) {
          // 左侧
          flag = true;
        } else if (
          global.mainWindowDirection === "bottom" &&
          y >= windowHeightPosition - 1 &&
          x >= scaleFactorX &&
          x <= windowWidthPosition
        ) {
          // 底部
          flag = true;
        } else if (
          global.mainWindowDirection === "top" &&
          y <= workArea.y &&
          x >= scaleFactorX &&
          x <= windowWidthPosition
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
              showMainWindowBefore(false);
            }, global.setting.general.delayDisplayMs);
          } else if (!timer || global.setting.general.delayDisplayMs === 0) {
            // 显示
            showMainWindowBefore(false);
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
function doubleClickTaskbar(button: number) {
  // 必须开启设置
  if (!global.setting.general.showHideDoubleClickTaskbar) {
    return;
  }
  // 不是左键的话
  if (button !== 1) {
    // 清除timeout
    clearTimeout(global.doubleClickTaskbarTimer);
    // 清空计数
    global.doubleClickTaskbarCounter = 0;
    return;
  }
  // 获取屏幕
  let displays = getWindowInScreen();
  if (displays.length > 1 || displays.length === 0) {
    // 清除timeout
    clearTimeout(global.doubleClickTaskbarTimer);
    // 清空计数
    global.doubleClickTaskbarCounter = 0;
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
      if (displays[0].bounds.y === displays[0].workArea.y) {
        // 底部
        let top = displays[0].workArea.y + displays[0].workArea.height;
        let bottom = displays[0].bounds.y + displays[0].bounds.height;
        if (point.y >= top && point.y <= bottom) {
          flag = true;
        }
      } else {
        // 顶部
        if (
          point.y >= displays[0].bounds.y &&
          point.y <= displays[0].workArea.y
        ) {
          flag = true;
        }
      }
    } else if (displays[0].bounds.width > displays[0].workArea.width) {
      if (displays[0].bounds.x === displays[0].workArea.x) {
        // 右侧
        let left = displays[0].workArea.x + displays[0].workArea.width;
        let right = displays[0].bounds.x + displays[0].bounds.width;
        if (point.x >= left && point.x <= right) {
          flag = true;
        }
      } else {
        // 左侧
        if (
          point.x >= displays[0].bounds.x &&
          point.x <= displays[0].workArea.x
        ) {
          flag = true;
        }
      }
    }
    if (flag) {
      // 监听双击
      if (!global.doubleClickTaskbarCounter) {
        global.doubleClickTaskbarCounter = 0;
      }
      // +1
      global.doubleClickTaskbarCounter++;
      // 等于2就是双击
      if (
        global.doubleClickTaskbarCounter &&
        global.doubleClickTaskbarCounter === 2
      ) {
        // 清除timeout
        clearTimeout(global.doubleClickTaskbarTimer);
        // 清空计数
        global.doubleClickTaskbarCounter = 0;
        // 判断点击的窗口ClassName
        let className = global.addon.getCursorPosWindowClassName();
        if (className.indexOf("MSTask") >= 0 || className === "Shell_TrayWnd") {
          if (mainWindow.isVisible()) {
            hideMainWindow();
          } else {
            showMainWindowBefore(false);
          }
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
