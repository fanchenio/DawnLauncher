import { screen, nativeImage, nativeTheme, app, dialog, shell } from "electron";
import request from "request";
import retry from "retry";
import cacheData from "./cache/data";

/**
 * 边缘吸附
 */
function edgeAdsorb(display) {
  if (global.mainWindow.isDestroyed()) {
    return;
  }
  try {
    global.direction = "none";
    let displays = display != null ? [display] : this.getWindowInScreen();
    if (displays.length > 1 || displays.length == 0) {
      return;
    }
    let workArea = displays[0].workArea;
    let bounds = global.mainWindow.getBounds();
    if (bounds.x + bounds.width >= workArea.x + workArea.width) {
      // 右侧
      global.mainWindow.setBounds({ x: workArea.x + workArea.width - bounds.width });
      global.direction = "right";
      global.blurHide = null;
    } else if (bounds.x <= workArea.x) {
      // 左侧
      global.mainWindow.setBounds({ x: workArea.x });
      global.direction = "left";
      global.blurHide = null;
    }
    if (bounds.y + bounds.height >= workArea.y + workArea.height) {
      // 底部
      global.mainWindow.setBounds({ y: workArea.y + workArea.height - bounds.height });
      global.direction = "bottom";
      global.blurHide = null;
    } else if (bounds.y <= workArea.y) {
      // 顶部
      global.mainWindow.setBounds({ y: workArea.y });
      global.direction = "top";
      global.blurHide = null;
    }
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.log(e);
    }
    global.mainWindow.setBounds({ x: 1, y: 1 });
  }
}

/**
 * 获取图标点
 * @returns {Electron.NativeImage}
 */
function getDot() {
  return nativeImage.createFromDataURL(
    !nativeTheme.shouldUseDarkColors
      ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAERJREFUOE9jZKAQMFKon2HUAAa8YWDDwMBQCQ3kdgYGhiPYAhxfIG5lYGDwgmraxsDA4E13Ayj2AlFpbDQh4U9IRAUiAEXYCBFBtkaAAAAAAElFTkSuQmCC"
      : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAEtJREFUOE9jZKAQMFKon2HUAAbcYfD//38bBgaGSmggtzMyMh7BFuA4A/H///9bGRgYvKCatjEyMnrT3QDKvEBsAhtNSHgSErGBCAD0gBQREV/HsgAAAABJRU5ErkJggg=="
  );
}

/**
 * 显示时跟随鼠标位置
 */
function showFollowMousePosition() {
  if (!global.setting.general.alwaysCenter && !global.setting.general.fixedPosition && global.setting.general.showFollowMousePosition) {
    // 获取鼠标位置
    let point = screen.getCursorScreenPoint();
    // 获取窗口大小
    let bounds = global.mainWindow.getBounds();
    let x = Math.round(bounds.width / 2);
    let y = Math.round(bounds.height / 2);
    global.mainWindow.setPosition(point.x - x, point.y - y)
    for (let i = 0; i < 10; i++) {
      global.mainWindow.setSize(bounds.width,  bounds.height)
    }
    // 获取当前鼠标所在屏幕
    let display = screen.getDisplayNearestPoint(point);
    // 边缘吸附
    edgeAdsorb(display);
  }
}

/**
 * 获取窗口所在的屏幕
 */
function getWindowInScreen() {
  let inDisplays = [];
  let displays = screen.getAllDisplays();
  let bounds = global.mainWindow.getBounds();
  for (let display of displays) {
    let workArea = display.workArea;
    if (
      ((workArea.x <= bounds.x && workArea.x + workArea.width >= bounds.x) ||
        (workArea.x <= bounds.x + bounds.width && workArea.x + workArea.width >= bounds.x + bounds.width)) &&
      ((workArea.y <= bounds.y && workArea.y + workArea.height >= bounds.y) ||
        (workArea.y <= bounds.y + bounds.height && workArea.y + workArea.height >= bounds.y + bounds.height))
    ) {
      inDisplays.push(display);
    }
  }
  return inDisplays;
}

/**
 * 去掉后缀
 * @param name
 */
function removeSuffix(name) {
  if (name != null && name.trim() != "") {
    let arr = name.split(".");
    if (arr.length > 1) {
      let n = name.substring(0, name.lastIndexOf("."));
      if (n.trim() != "") {
        name = n;
      }
    }
  }
  return name;
}

/**
 * 获取后缀
 * @param name
 */
function getSuffix(name) {
  let suffix = "";
  if (name != null && name.trim() != "") {
    let arr = name.split(".");
    if (arr.length > 1) {
      suffix = name.substring(name.lastIndexOf(".") + 1);
    }
  }
  return suffix.toLowerCase();
}

/**
 * 勿扰模式
 */
function notDisturb() {
  return global.setting.general.notDisturb && global.api.IsFullscreen();
}

/**
 * 检查更新
 */
function checkUpdate(type) {
  try {
    // 重试
    const operation = retry.operation({
      retries: 5, // 最多重试 5 次
      factor: 1, // 每次重试之间的时间间隔加倍
      minTimeout: 1000, // 第一次重试之前等待的时间
      maxTimeout: 5000, // 最长等待时间
    });
    // 发起请求
    operation.attempt((currentAttempt) => {
      request(
        {
          uri: "https://dawnlauncher.com/version.json",
          timeout: 5000,
        },
        function (error, response, body) {
          if (operation.retry(error)) {
            return;
          }
          if (!error && response.statusCode == 200) {
            let buffer = Buffer.from(body);
            let json = JSON.parse(buffer.toString());
            if (json.version != app.getVersion()) {
              if (type == "init") {
                dialog
                  .showMessageBox(global.mainWindow, {
                    message: global.currentLanguage.checkForUpdatesNewVersionMessage,
                    buttons: [global.currentLanguage.ok, global.currentLanguage.cancel, global.currentLanguage.notPrompt],
                    type: "info",
                    noLink: true,
                    cancelId: 1,
                  })
                  .then((r) => {
                    if (r.response == 0) {
                      shell.openExternal("https://dawnlauncher.com/");
                    } else if (r.response == 2) {
                      cacheData.cacheStore.set("checkUpdate", false);
                    }
                  });
              } else {
                dialog
                  .showMessageBox(global.mainWindow, {
                    message: global.currentLanguage.checkForUpdatesNewVersionMessage,
                    buttons: [global.currentLanguage.ok, global.currentLanguage.cancel],
                    type: "info",
                    noLink: true,
                    cancelId: 1,
                  })
                  .then((r) => {
                    if (r.response == 0) {
                      shell.openExternal("https://dawnlauncher.com/");
                    }
                  });
              }
            } else {
              if (type == "checkUpdate") {
                dialog.showMessageBox(global.mainWindow, {
                  message: global.currentLanguage.checkForUpdatesLatestVersionMessage,
                  buttons: [global.currentLanguage.ok],
                  type: "info",
                  noLink: true,
                });
              }
            }
          } else {
            if (type == "checkUpdate") {
              dialog.showMessageBox(global.mainWindow, {
                message: global.currentLanguage.checkForUpdatesFailedMessage,
                buttons: [global.currentLanguage.ok],
                type: "error",
                noLink: true,
              });
            }
          }
        }
      );
    });
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.log(e);
    }
  }
}

/**
 * 判断数组是否等于空
 * @param arr
 */
function arrayIsEmpty(arr) {
  if (arr == null || arr.length == 0) {
    return true;
  }
  return false;
}

/**
 * 判断字符串是否为空
 * @param str
 */
function strIsEmpty(str) {
  if (str == null || str.trim() == "") {
    return true;
  }
  return false;
}

/**
 * 菜单监听
 * @param menu
 */
function menuListen(menu) {
  menu.on("menu-will-show", () => {
    global.menuShow = true;
  });
  menu.on("menu-will-close", () => {
    global.menuShow = false;
  });
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

export default {
  edgeAdsorb,
  getDot,
  showFollowMousePosition,
  getWindowInScreen,
  removeSuffix,
  notDisturb,
  checkUpdate,
  getSuffix,
  arrayIsEmpty,
  strIsEmpty,
  menuListen,
  getKey,
};
