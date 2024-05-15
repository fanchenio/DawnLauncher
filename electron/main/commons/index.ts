import { Result } from "../../../types/common";
import { resolve, dirname, relative, join } from "node:path";
import { mkdirSync, existsSync } from "node:fs";
import mime from "mime";
import retry from "retry";
import request from "request";
import * as cheerio from "cheerio";
import { isAbsolutePath } from "../../../commons/utils/common";
import {
  BrowserWindow,
  Display,
  app,
  dialog,
  nativeImage,
  nativeTheme,
  screen,
} from "electron";
import { getRandomUserAgent, iconExts } from "../../commons/utils";
import URI from "urijs";
import { hideMainWindow } from "../main";
import { hideQuickSearchWindow } from "../search";

/**
 * 获取代理
 */
function getProxy() {
  if (
    global.setting.network.useProxy &&
    global.setting.network.proxy.address &&
    global.setting.network.proxy.address.trim() !== ""
  ) {
    let uri = new URI(global.setting.network.proxy.address);
    if (uri.protocol() && uri.protocol().trim() !== "") {
      let address = uri.protocol().toLowerCase() + "://";
      if (
        global.setting.network.proxy.username &&
        global.setting.network.proxy.username.trim() !== "" &&
        global.setting.network.proxy.password &&
        global.setting.network.proxy.password.trim() !== ""
      ) {
        address +=
          global.setting.network.proxy.username +
          ":" +
          global.setting.network.proxy.password +
          "@";
      }
      address += uri.hostname() + ":" + uri.port();
      return address;
    }
  }
  return null;
}

/**
 * 下载图片
 * @param windowName
 * @param url
 */
function downloadImage(windowName: string, url: string) {
  let result: Result = {
    status: false,
    message: global.language.downloadImagePrompt1,
    icon: null,
    name: null,
  };
  // 重试
  const operation = retry.operation({
    retries: 5, // 最多重试 5 次
    factor: 1, // 每次重试之间的时间间隔加倍
    minTimeout: 1000, // 第一次重试之前等待的时间
    maxTimeout: 5000, // 最长等待时间
  });
  operation.attempt((currentAttempt) => {
    // 下载图片
    request(
      {
        uri: url,
        proxy: getProxy(),
        encoding: null,
        timeout: 5000,
        headers: {
          "User-Agent": getRandomUserAgent(),
        },
        maxRedirects: 5,
        jar: true,
      },
      function (error, response, body) {
        if (operation.retry(error)) {
          return;
        }
        if (
          !error &&
          response.statusCode >= 200 &&
          response.statusCode <= 299
        ) {
          if (response.headers && response.headers["content-type"]) {
            let ext = mime.getExtension(response.headers["content-type"]);
            if (iconExts.includes(ext)) {
              let buffer = Buffer.from(body);
              result.icon =
                "data:" +
                mime.getType(response.headers["content-type"]) +
                ";base64," +
                buffer.toString("base64");
              result.status = true;
              result.message = null;
            } else {
              result.icon = null;
              result.status = false;
              result.message = global.language.downloadImagePrompt2;
            }
          }
        }
        // window
        sendToWebContent(windowName, "onDownloadImage", result);
      }
    );
  });
}

/**
 * 获取网址信息
 * @param windowName
 * @param url
 * @param redirect
 */
function getURLInfo(windowName: string, url: string, redirect: boolean) {
  let result: Result = {
    status: false,
    message: null,
    name: null,
    icon: null,
  };
  // 重试
  const operation = retry.operation({
    retries: 5, // 最多重试 5 次
    factor: 1, // 每次重试之间的时间间隔加倍
    minTimeout: 1000, // 第一次重试之前等待的时间
    maxTimeout: 5000, // 最长等待时间
  });
  try {
    // 发起请求
    operation.attempt((currentAttempt) => {
      request(
        {
          uri: url,
          proxy: getProxy(),
          timeout: 5000,
          headers: {
            "User-Agent": getRandomUserAgent(),
          },
          maxRedirects: 5,
          jar: true,
        },
        function (error, response, body) {
          if (operation.retry(error)) {
            return;
          }
          if (
            !error &&
            response.statusCode >= 200 &&
            response.statusCode <= 299
          ) {
            const $ = cheerio.load(body);
            // 是否有跳转标签
            let refresh = $("meta[http-equiv='refresh']");
            // content
            let content = refresh.attr("content");
            if (content && content.trim() !== "" && redirect) {
              // 如果有跳转标签的话，就请求新网址并获取网址信息
              let contentSplit = content.split(";");
              let urlProperty = contentSplit[contentSplit.length - 1];
              let urlPropertySplit = urlProperty.split("=");
              let newURL = urlPropertySplit[urlPropertySplit.length - 1];
              // 重新获取新网址信息
              getURLInfo(windowName, newURL, false);
            } else {
              // 解析HTML并返回信息
              analysisHTML(windowName, url, body);
            }
          } else {
            sendUrlInfo(windowName, result);
          }
        }
      );
    });
  } catch (e) {
    sendUrlInfo(windowName, result);
  }
}

/**
 * 解析HTML并返回信息
 * @param windowName
 * @param url
 * @param data
 */
function analysisHTML(windowName: string, url: string, data: string) {
  let result: Result = {
    status: false,
    message: null,
    name: null,
    icon: null,
  };
  try {
    // 解析HTML
    let $ = cheerio.load(data);
    // 获取标题
    result.name = $("head").find("title").text();
    // 获取图标URL
    let iconURL: string | null = null;
    let icon = $("link[rel='icon']");
    let href = icon.attr("href");
    if (href && href.trim() !== "") {
      iconURL = href;
    } else {
      let shortcutIcon = $("link[rel='shortcut icon']");
      let shortcutIconhref = shortcutIcon.attr("href");
      if (shortcutIconhref && shortcutIconhref.trim() !== "") {
        iconURL = shortcutIconhref;
      } else {
        iconURL = "/favicon.ico";
      }
    }
    if (iconURL) {
      // 去掉类似//www.baidu.com/favicon.ico这样域名的”//“字符
      if (iconURL.indexOf("//") === 0) {
        iconURL = "http:" + iconURL;
      }
      // 无协议头，使用当前网址域名
      if (iconURL.indexOf("http://") < 0 && iconURL.indexOf("https://") < 0) {
        iconURL = url + (iconURL.indexOf("//") === 0 ? "" : "//") + iconURL;
      }
      // 重试
      const operation = retry.operation({
        retries: 5, // 最多重试 5 次
        factor: 1, // 每次重试之间的时间间隔加倍
        minTimeout: 1000, // 第一次重试之前等待的时间
        maxTimeout: 5000, // 最长等待时间
      });
      operation.attempt((currentAttempt) => {
        // 下载图标
        request(
          {
            uri: iconURL,
            proxy: getProxy(),
            encoding: null,
            timeout: 5000,
            headers: {
              "User-Agent": getRandomUserAgent(),
            },
            maxRedirects: 5,
            jar: true,
          },
          function (error, response, body) {
            if (operation.retry(error)) {
              return;
            }
            if (
              !error &&
              response.statusCode >= 200 &&
              response.statusCode <= 299
            ) {
              let buffer = Buffer.from(body);
              result.icon =
                "data:" +
                mime.getType(iconURL) +
                ";base64," +
                buffer.toString("base64");
              result.status = true;
              sendUrlInfo(windowName, result);
            } else {
              sendUrlInfo(windowName, result);
            }
          }
        );
      });
    } else {
      sendUrlInfo(windowName, result);
    }
  } catch (e) {
    sendUrlInfo(windowName, result);
  }
}

/**
 * 发送网址信息
 * @param result
 */
function sendUrlInfo(windowName: string, result: Result) {
  sendToWebContent(windowName, "onGetURLInfo", result);
}

/**
 * 路径转换
 * @param path
 */
function convertPath(path: string) {
  let appPath =
    process.env.NODE_ENV === "development"
      ? resolve(".")
      : dirname(process.execPath);
  if (isAbsolutePath(path)) {
    return relative(appPath, path);
  } else {
    return resolve(appPath, path);
  }
}

/**
 * 发送IPC到所有窗口
 * @param channel
 * @param data
 */
function sendAllWindows(channel: string, data: any) {
  for (const window of BrowserWindow.getAllWindows()) {
    if (!window.isDestroyed()) {
      window.webContents.send(channel, data);
    }
  }
}
/**
 * 获取窗口实例
 * @param name
 */
function getWindow(name: string): BrowserWindow | null {
  let window: BrowserWindow | null = null;
  if (name === "mainWindow") {
    window = global.mainWindow;
  } else if (name === "quickSearchWindow") {
    window = global.quickSearchWindow;
  } else if (name === "settingWindow") {
    window = global.settingWindow;
  } else if (name === "classificationAddEditWindow") {
    window = global.classificationAddEditWindow;
  } else if (name === "classificationSetIconWindow") {
    window = global.classificationSetIconWindow;
  } else if (name === "classificationAssociateFolderWindow") {
    window = global.classificationAssociateFolderWindow;
  } else if (name === "classificationAggregateWindow") {
    window = global.classificationAggregateWindow;
  } else if (name === "itemAddEditWindow") {
    window = global.itemAddEditWindow;
  } else if (name === "itemNetworkIconWindow") {
    window = global.itemNetworkIconWindow;
  } else if (name === "itemSVGIconWindow") {
    window = global.itemSVGIconWindow;
  } else if (name === "aboutWindow") {
    window = global.aboutWindow;
  } else if (name === "backupRestoreDataWindow") {
    window = global.backupRestoreDataWindow;
  }
  if (window && !window.isDestroyed()) {
    return window;
  } else {
    return null;
  }
}

/**
 * 关闭窗口
 * @param window
 */
function closeWindow(window: BrowserWindow | null) {
  if (window && !window.isDestroyed() && window.isVisible()) {
    window.close();
  }
}

/**
 * 获取图标点
 */
function getDot() {
  return nativeImage.createFromDataURL(
    !nativeTheme.shouldUseDarkColors
      ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAERJREFUOE9jZKAQMFKon2HUAAa8YWDDwMBQCQ3kdgYGhiPYAhxfIG5lYGDwgmraxsDA4E13Ayj2AlFpbDQh4U9IRAUiAEXYCBFBtkaAAAAAAElFTkSuQmCC"
      : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAEtJREFUOE9jZKAQMFKon2HUAAbcYfD//38bBgaGSmggtzMyMh7BFuA4A/H///9bGRgYvKCatjEyMnrT3QDKvEBsAhtNSHgSErGBCAD0gBQREV/HsgAAAABJRU5ErkJggg=="
  );
}

/**
 * 发送消息到页面
 * @param windowName
 * @param listener
 * @param params
 */
function sendToWebContent(windowName: string, listener: string, params: any) {
  // 获取窗口
  let window = getWindow(windowName);
  if (window && !window.isDestroyed()) {
    window.webContents.send(listener, params);
  }
}

/**
 * 关闭所有子进程
 */
function closeAllChildProcess() {
  if (global.childProcessMap) {
    global.childProcessMap.forEach((value, key) => {
      try {
        value.utilityProcess.kill();
      } catch (e) {}
      try {
        value.port1.close();
      } catch (e) {}
      try {
        value.port2.close();
      } catch (e) {}
    });
    global.childProcessMap.clear();
  }
}

/**
 * 打开后隐藏窗口
 * @param type
 */
function openAfterHideWindow(type: string) {
  if (type === "main" || type === "search") {
    if (global.setting.item.openAfterHideMainInterface) {
      hideMainWindow();
    }
  } else if (type === "quickSearch") {
    if (global.setting.quickSearch.openAfterHideQuickSearchWindow) {
      hideQuickSearchWindow();
    }
  }
}

/**
 * 错误提示框
 * @param windowName
 * @param message
 */
function showErrorMessageBox(windowName: string, message: string) {
  dialog.showMessageBoxSync(getWindow(windowName), {
    message: message,
    buttons: [global.language.ok],
    type: "error",
    noLink: true,
  });
}

/**
 * 重启
 */
function relaunch() {
  app.relaunch();
  app.quit();
}

// 数据存储目录
function getUserDataPath() {
  let userDataPath = app.getPath("userData");
  if (
    process.env.NODE_ENV !== "development" &&
    import.meta.env.VITE_INSTALL === "false"
  ) {
    userDataPath = join(dirname(process.execPath), "data");
    if (!existsSync(userDataPath)) {
      mkdirSync(userDataPath, { recursive: true });
    }
  }
  return userDataPath;
}

/**
 * 获取主背景颜色
 */
function getMainBackgorunColor() {
  let backgroundColor = global.setting.appearance.theme.mainBackgroundColor;
  if (backgroundColor.length === 9) {
    return backgroundColor.substring(0, 7);
  } else {
    return backgroundColor;
  }
}

/**
 * 获取窗口所在的屏幕
 */
function getWindowInScreen(window: BrowserWindow) {
  let inDisplays: Array<Display> = [];
  let displays = screen.getAllDisplays();
  let bounds = window.getBounds();
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

export {
  downloadImage,
  getURLInfo,
  convertPath,
  sendAllWindows,
  closeWindow,
  getDot,
  getWindow,
  sendToWebContent,
  closeAllChildProcess,
  openAfterHideWindow,
  showErrorMessageBox,
  relaunch,
  getUserDataPath,
  getMainBackgorunColor,
  getWindowInScreen,
};
