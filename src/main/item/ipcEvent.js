import { ipcMain, dialog, Menu, clipboard, shell } from "electron";
import * as cheerio from "cheerio";
import url from "url";
import fs from "fs";
import path from "path";
import mime from "mime";
import index from "./index";
import util from "../util";
import xml2js from "xml2js";
import os from "os";
import request from "request";
import URI from "urijs";
import retry from "retry";
import cacheData from "../cache/data";
import ItemJS from "@/main/item/index";
import ClassificationJS from "@/main/classification/index";
const { execSync } = require("child_process");

/**
 * 随机user-agent
 * @returns {string}
 */
function getRandomUserAgent() {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/89.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/89.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.123",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.123",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/89.0",
  ];
  const randomIndex = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomIndex];
}

/**
 * 发送网址信息
 * @param item
 */
function sendUrlInfo(item) {
  global.mainWindow.webContents.send("getUrlInfo", JSON.stringify(item));
}

/**
 * 获取代理
 */
function getProxy() {
  if (global.setting.network.useProxy && !util.strIsEmpty(global.setting.network.proxy.address)) {
    let uri = new URI(global.setting.network.proxy.address);
    if (!util.strIsEmpty(uri.protocol())) {
      let address = uri.protocol().toLowerCase() + "://";
      if (!util.strIsEmpty(global.setting.network.proxy.username) && !util.strIsEmpty(global.setting.network.proxy.password)) {
        address += global.setting.network.proxy.username + ":" + global.setting.network.proxy.password + "@";
      }
      address += uri.hostname() + ":" + uri.port();
      return address;
    }
  }
  return null;
}

/**
 * 获取网址信息
 * @param u 网址
 * @param r 是否支持跳转获取
 */
function getUrlInfo(u, r) {
  let result = {
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
          uri: u,
          proxy: getProxy(),
          timeout: 5000,
          headers: {
            "User-Agent": getRandomUserAgent(),
          },
        },
        function (error, response, body) {
          if (operation.retry(error)) {
            return;
          }
          if (!error && response.statusCode >= 200 && response.statusCode <= 299) {
            // 解析HTML
            let $ = cheerio.load(body);
            // 是否有跳转标签
            let refresh = $("meta[http-equiv='refresh']");
            if (refresh != null && !util.strIsEmpty(refresh.attr("content")) && r) {
              // 如果有跳转标签的话，就请求新网址并获取网址信息
              let content = refresh.attr("content");
              let contentSplit = content.split(";");
              let urlProperty = contentSplit[contentSplit.length - 1];
              let urlPropertySplit = urlProperty.split("=");
              let newUrl = urlPropertySplit[urlPropertySplit.length - 1];
              // 重新获取新网址信息
              getUrlInfo(newUrl, false);
            } else {
              // 解析HTML并返回信息
              analysisHTML(u, body);
            }
          } else {
            sendUrlInfo(result);
          }
        }
      );
    });
  } catch (e) {
    sendUrlInfo(result);
  }
}

/**
 * 解析HTML并返回信息
 * @param u url
 * @param data HTML
 */
function analysisHTML(u, data) {
  let result = {
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
    let iconUrl;
    let icon = $("link[rel='icon']");
    if (icon != null && !util.strIsEmpty(icon.attr("href"))) {
      iconUrl = icon.attr("href");
    } else {
      let shortcutIcon = $("link[rel='shortcut icon']");
      if (shortcutIcon != null && !util.strIsEmpty(shortcutIcon.attr("href"))) {
        iconUrl = shortcutIcon.attr("href");
      } else {
        iconUrl = "/favicon.ico";
      }
    }
    if (!util.strIsEmpty(iconUrl)) {
      // 解析URL
      let urlParse = url.parse(u);
      // 新图标URL
      let newIconUrl = "";
      // 去掉类似//www.baidu.com/favicon.ico这样域名的”//“字符
      if (iconUrl.indexOf("//") == 0) {
        iconUrl = "http:" + iconUrl;
      }
      // 如果url包含https://或者http://就是正常的链接
      if (iconUrl.indexOf("http://") >= 0 || iconUrl.indexOf("https://") >= 0) {
        newIconUrl = iconUrl;
      } else {
        // 无协议头，使用当前网址域名
        newIconUrl = url.resolve("http://" + urlParse.host + (urlParse.port != null ? ":" + urlParse.port : ""), iconUrl);
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
            uri: newIconUrl,
            proxy: getProxy(),
            encoding: null,
            timeout: 5000,
            headers: {
              "User-Agent": getRandomUserAgent(),
            },
          },
          function (error, response, body) {
            if (operation.retry(error)) {
              return;
            }
            if (!error && response.statusCode >= 200 && response.statusCode <= 299) {
              let buffer = Buffer.from(body);
              result.icon = "data:" + mime.getType(newIconUrl) + ";base64," + buffer.toString("base64");
              result.status = true;
              sendUrlInfo(result);
            } else {
              sendUrlInfo(result);
            }
          }
        );
      });
    } else {
      sendUrlInfo(result);
    }
  } catch (e) {
    sendUrlInfo(result);
  }
}

/**
 * 获取文件图标
 * @param target
 * @param message
 */
async function getFileIcon(target, message) {
  return await index.getFileIcon(target, message);
}

/**
 * 转换为菜单
 *
 * @param classificationParentId
 * @param classificationChildId
 * @param id
 * @param list
 * @param del
 */
function convertMenu(classificationParentId, classificationChildId, id, list, del) {
  let menuList = [];
  for (let i = 0; i < list.length; i++) {
    let classification = list[i];
    let menu = {
      label: classification.name,
    };
    let submenu = [];
    if (!util.arrayIsEmpty(classification.childList)) {
      for (let j = 0; j < classification.childList.length; j++) {
        if (util.strIsEmpty(classification.childList[j].mapDirectory) && (classification.childList[j].type == null || classification.childList[j].type != 1)) {
          submenu.push({
            label: classification.childList[j].name,
            click: () => {
              let params = {
                from: {
                  classificationParentId: classificationParentId,
                  classificationChildId: classificationChildId,
                  id: id,
                },
                to: {
                  classificationParentId: classification.id,
                  classificationChildId: classification.childList[j].id,
                },
                del: del,
              };
              global.mainWindow.webContents.send("moveItem", JSON.stringify(params));
            },
          });
        }
      }
    }
    if (!util.arrayIsEmpty(submenu)) {
      menu.submenu = submenu;
      menu.type = "submenu";
    } else {
      menu.type = "normal";
      menu.click = () => {
        let params = {
          from: {
            classificationParentId: classificationParentId,
            classificationChildId: classificationChildId,
            id: id,
          },
          to: {
            classificationParentId: classification.id,
            classificationChildId: null,
          },
          del: del,
        };
        global.mainWindow.webContents.send("moveItem", JSON.stringify(params));
      };
    }
    if (util.strIsEmpty(classification.mapDirectory) && (classification.type == null || classification.type != 1)) {
      menuList.push(menu);
    }
  }
  return menuList;
}

/**
 * 批量操作转换为菜单
 *
 * @param list
 * @param del
 */
function batchOperationConvertMenu(list, del) {
  let menuList = [];
  for (let i = 0; i < list.length; i++) {
    let classification = list[i];
    let menu = {
      label: classification.name,
    };
    let submenu = [];
    if (!util.arrayIsEmpty(classification.childList)) {
      for (let j = 0; j < classification.childList.length; j++) {
        if (util.strIsEmpty(classification.childList[j].mapDirectory) && (classification.childList[j].type == null || classification.childList[j].type != 1)) {
          submenu.push({
            label: classification.childList[j].name,
            click: () => {
              dialog
                .showMessageBox(global.mainWindow, {
                  message: del ? global.currentLanguage.batchMoveItemMessage : global.currentLanguage.batchCopyItemMessage,
                  buttons: [global.currentLanguage.ok, global.currentLanguage.cancel],
                  type: "question",
                  noLink: true,
                  cancelId: 1,
                })
                .then((r) => {
                  if (r.response == 0) {
                    let params = {
                      to: {
                        classificationParentId: classification.id,
                        classificationChildId: classification.childList[j].id,
                      },
                      del: del,
                    };
                    global.mainWindow.webContents.send("batchMoveItem", JSON.stringify(params));
                  }
                });
            },
          });
        }
      }
    }
    if (!util.arrayIsEmpty(submenu)) {
      menu.submenu = submenu;
      menu.type = "submenu";
    } else {
      menu.type = "normal";
      menu.click = () => {
        dialog
          .showMessageBox(global.mainWindow, {
            message: del ? global.currentLanguage.batchMoveItemMessage : global.currentLanguage.batchCopyItemMessage,
            buttons: [global.currentLanguage.ok, global.currentLanguage.cancel],
            type: "question",
            noLink: true,
            cancelId: 1,
          })
          .then((r) => {
            if (r.response == 0) {
              let params = {
                to: {
                  classificationParentId: classification.id,
                  classificationChildId: null,
                },
                del: del,
              };
              global.mainWindow.webContents.send("batchMoveItem", JSON.stringify(params));
            }
          });
      };
    }
    if (util.strIsEmpty(classification.mapDirectory) && (classification.type == null || classification.type != 1)) {
      menuList.push(menu);
    }
  }
  return menuList;
}

/**
 * 读取路径下的文件
 * @param path
 * @returns {*[]}
 */
function getPathProgramList(path) {
  let resultList = [];
  try {
    // 读取开始菜单下所有内容
    let pathList = fs.readdirSync(path);
    // 循环判断文件类型
    for (let p of pathList) {
      // 完整路径
      let fullPath = path + "\\" + p;
      // 判断文件类型
      let stats;
      try {
        // 文件类型
        stats = fs.statSync(fullPath);
        // 如果是文件夹继续向下读取，如果是文件则添加到返回列表
        if (stats.isDirectory()) {
          // 文件夹
          resultList.push(...getPathProgramList(fullPath));
        } else {
          // 文件
          resultList.push(fullPath);
        }
      } catch (e) {
        if (process.env.NODE_ENV !== "production") {
          console.log(e);
        }
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.log(e);
    }
  }
  return resultList;
}

/**
 * 获取最大图标尺寸
 */
function getMaxIconSize(list, name, type) {
  // 获取最大图标尺寸
  let max = null;
  for (let targetSize of list) {
    let s = targetSize.replace(name + "." + type + "-", "").split("_");
    let size = Number(s[0].replace(".png", ""));
    if (max == null) {
      max = size;
    } else {
      if (size > max) {
        max = size;
      }
    }
  }
  return max;
}

/**
 * 接续XML同步
 * @param xml
 * @returns {Promise<unknown>}
 */
async function xml2jsSync(xml) {
  let parser = new xml2js.Parser();
  return new Promise((resolve, reject) => {
    parser.parseString(xml, function (err, json) {
      if (err) reject(err);
      else resolve(json);
    });
  });
}

/**
 * 获取AppxPropertiesLogo
 * @param installLocation
 * @param result
 * @returns {string|null}
 */
function getPropertiesIcon(installLocation, result) {
  if (result.Package.Properties != null) {
    if (result.Package.Properties[0].Logo != null) {
      let logo = result.Package.Properties[0].Logo[0];
      return installLocation + "\\" + logo;
    }
  }
  return null;
}

/**
 * 获取Appx信息
 */
async function getAppxInfo(installLocation) {
  let appxInfo = {};
  let buffer, result;
  try {
    buffer = fs.readFileSync(installLocation + "\\AppxManifest.xml");
    result = await xml2jsSync(buffer);
    // 备用，如果没有名称的话
    let executable = null;
    // targetsize图标
    let targetSizeIcon = null;
    let targetSizeIconMax = null;
    // scale图标
    let scaleIcon = null;
    let scaleIconMax = null;
    // 图标 APPID
    if (result.Package.Applications != null && result.Package.Applications[0] != null) {
      if (result.Package.Applications[0].Application[0] != null) {
        // APPID
        appxInfo.appId = result.Package.Applications[0].Application[0].$.Id;
        // Executable
        executable = result.Package.Applications[0].Application[0].$.Executable;
        // 图标
        if (result.Package.Applications[0].Application[0]["uap:VisualElements"] != null) {
          // logo地址
          let logo = result.Package.Applications[0].Application[0]["uap:VisualElements"][0].$.Square44x44Logo;
          // 解析路径
          let parsedPath = path.parse(logo);
          // 获取文件夹下所有文件
          let fileNameList = fs.readdirSync(installLocation + "\\" + parsedPath.dir);
          // 筛选出和包含logo名称的文件名
          let filterList = fileNameList.filter((f) => f.indexOf(parsedPath.name) >= 0);
          if (filterList.length > 1) {
            // 获取targetsize图片
            let targetSizeList = filterList.filter((f) => f.indexOf(parsedPath.name + ".targetsize") >= 0);
            if (targetSizeList.length > 0) {
              // 获取最大图标尺寸
              let max = getMaxIconSize(targetSizeList, parsedPath.name, "targetsize");
              if (max != null) {
                // 记录max
                targetSizeIconMax = max;
                // 先获取最终图标
                let defaultList = targetSizeList.filter(
                  (f) => f == parsedPath.name + ".targetsize-" + max + "_altform-unplated_devicefamily-colorfulunplated.png"
                );
                targetSizeIcon =
                  defaultList.length > 0
                    ? installLocation +
                      "\\" +
                      parsedPath.dir +
                      "\\" +
                      parsedPath.name +
                      ".targetsize-" +
                      max +
                      "_altform-unplated_devicefamily-colorfulunplated.png"
                    : null;
                if (targetSizeIcon == null) {
                  // 获取 名称.targetsize-{max}_altform-unplated.png
                  let defaultUnplatedList = targetSizeList.filter((f) => f == parsedPath.name + ".targetsize-" + max + "_altform-unplated.png");
                  if (defaultUnplatedList.length > 0) {
                    targetSizeIcon = installLocation + "\\" + parsedPath.dir + "\\" + parsedPath.name + ".targetsize-" + max + "_altform-unplated.png";
                  } else {
                    // 获取 名称.targetsize-{max}_altform.png
                    let defaultAltFormList = targetSizeList.filter((f) => f == parsedPath.name + ".targetsize-" + max + "_altform.png");
                    if (defaultAltFormList.length > 0) {
                      targetSizeIcon = installLocation + "\\" + parsedPath.dir + "\\" + parsedPath.name + ".targetsize-" + max + "_altform.png";
                    } else {
                      // 获取 名称.targetsize-{max}.png
                      let defaultTargetSizeList = targetSizeList.filter((f) => f == parsedPath.name + ".targetsize-" + max + ".png");
                      if (defaultTargetSizeList.length > 0) {
                        targetSizeIcon = installLocation + "\\" + parsedPath.dir + "\\" + defaultTargetSizeList[0];
                      }
                    }
                  }
                }
              }
            }
            // 获取scale图片
            let scaleList = filterList.filter((f) => f.indexOf(parsedPath.name + ".scale") >= 0);
            if (scaleList.length > 0) {
              // 获取最大图标尺寸
              let max = getMaxIconSize(scaleList, parsedPath.name, "scale");
              if (max != null) {
                // 记录max
                scaleIconMax = max;
                // 获取 名称.scale-{max}.png
                let defaultList = scaleList.filter((f) => f == parsedPath.name + ".scale-" + max + ".png");
                if (defaultList.length > 0) {
                  scaleIcon = installLocation + "\\" + parsedPath.dir + "\\" + defaultList[0];
                }
              }
            } else {
              scaleList = filterList.filter((f) => f.indexOf(parsedPath.name + ".Theme-Dark_Scale") >= 0);
              if (scaleList.length > 0) {
                let max = getMaxIconSize(scaleList, parsedPath.name, "Theme-Dark_Scale");
                if (max != null) {
                  // 记录max
                  scaleIconMax = max;
                  // 获取 名称.Theme-Dark_Scale{max}.png
                  let defaultList = scaleList.filter((f) => f == parsedPath.name + ".Theme-Dark_Scale-" + max + ".png");
                  if (defaultList.length > 0) {
                    scaleIcon = installLocation + "\\" + parsedPath.dir + "\\" + defaultList[0];
                  }
                }
              }
            }
          } else {
            if (filterList.length == 1) {
              // 只有一张图片
              appxInfo.icon = installLocation + "\\" + parsedPath.dir + "\\" + filterList[0];
            }
          }
        }
      }
    }
    if (appxInfo.icon == null) {
      // 判断图标大小
      if (targetSizeIcon != null && scaleIcon == null) {
        appxInfo.icon = targetSizeIcon;
      } else if (targetSizeIcon == null && scaleIcon != null) {
        appxInfo.icon = scaleIcon;
      } else if (targetSizeIcon != null && scaleIcon != null) {
        if (targetSizeIconMax == 256 || targetSizeIconMax > scaleIconMax) {
          appxInfo.icon = targetSizeIcon;
        } else if (targetSizeIconMax < scaleIconMax) {
          appxInfo.icon = scaleIcon;
        } else {
          appxInfo.icon = targetSizeIcon;
        }
      } else if (targetSizeIcon == null && scaleIcon == null) {
        let propertiesIcon = getPropertiesIcon(installLocation, result);
        if (propertiesIcon != null) {
          appxInfo.icon = propertiesIcon;
        }
      }
    }
    // 名称
    if (result.Package.Properties != null) {
      if (result.Package.Properties[0].DisplayName != null) {
        appxInfo.name = result.Package.Properties[0].DisplayName[0];
      }
    }
    if (appxInfo.name == null || (appxInfo.name != null && appxInfo.name.indexOf("ms-resource:") >= 0)) {
      if (executable != null && executable.indexOf("ms-resource:") < 0) {
        appxInfo.name = path.parse(executable).name;
      } else {
        appxInfo.name = null;
      }
    }
    if (appxInfo.name == null) {
      if (result.Package.Identity != null && result.Package.Identity[0] != null) {
        let name = result.Package.Identity[0].$.Name;
        if (name != null && name.indexOf("ms-resource:") < 0) {
          appxInfo.name = name;
        }
      }
    }
  } catch (ex) {
    if (result != null) {
      let propertiesIcon = getPropertiesIcon(installLocation, result);
      if (propertiesIcon != null) {
        appxInfo.icon = propertiesIcon;
      }
    }
    if (process.env.NODE_ENV !== "production") {
      console.log(ex);
    }
  }
  return appxInfo;
}

/**
 * 刷新图标缓存
 * @param item
 */
async function refreshIconCache(item) {
  let info = {};
  if (item.type == 0 || item.type == 1) {
    info.icon = await getFileIcon(item.path, false);
  } else {
    let appxInfo = await getAppxInfo(item.installLocation);
    if (appxInfo.icon != null) {
      try {
        let buffer = fs.readFileSync(appxInfo.icon);
        info.icon = "data:" + mime.getType(appxInfo.icon) + ";base64," + buffer.toString("base64");
        info.iconPath = appxInfo.icon;
      } catch (ex) {
        if (process.env.NODE_ENV !== "production") {
          console.log(ex);
        }
      }
    }
  }
  return info;
}

/**
 * 刷新图标缓存
 * @param item
 */
async function refreshIconCacheList(classificationParentId, classificationChildId) {
  // 获取分类下所有项目
  let classification;
  if (classificationParentId != null) {
    let classificationParent;
    for (let c of global.list) {
      if (c.id == classificationParentId) {
        classificationParent = c;
        break;
      }
    }
    if (classificationChildId != null) {
      if (!util.arrayIsEmpty(classificationParent.childList)) {
        let classificationChild;
        for (let c of classificationParent.childList) {
          if (c.id == classificationChildId) {
            classificationChild = c;
            break;
          }
        }
        classification = classificationChild;
      } else {
        classification = classificationParent;
      }
    } else {
      classification = classificationParent;
    }
  }
  let resultList = [];
  if (classification != null && !util.arrayIsEmpty(classification.itemList)) {
    // 刷新所有项目图标
    for (let item of classification.itemList) {
      if ((item.type == 0 || item.type == 1 || item.type == 5) && (item.notRefreshIcon == null || !item.notRefreshIcon)) {
        let info = await refreshIconCache(item);
        info.itemId = item.id;
        resultList.push(info);
      }
    }
  }
  return resultList;
}

/**
 * 读取文件
 * @param pathArr
 */
async function readFiles(pathArr) {
  let itemList = [];
  for (let filePath of pathArr) {
    try {
      let item = {
        // id
        id: null,
        // 路径
        path: null,
        // url
        url: null,
        // 名称
        name: null,
        // 图标
        icon: null,
        // 参数
        params: null,
        // 以管理员身份运行
        admin: false,
        // 类型 0:文件 1:文件夹 2:网址
        type: 0,
        // 排序
        order: 0,
      };
      // path
      let target = filePath;
      // 文件名
      item.name = path.basename(target);
      // 判断是否是快捷方式，如果是的话，需要获取真实路径
      if (mime.getType(filePath) == "application/x-ms-shortcut") {
        // 快捷方式
        // 获取真实文件路径和参数
        let shortcutDetail = global.api.GetShortcutFile(filePath);
        if (util.strIsEmpty(shortcutDetail.target)) {
          // 路径
          target = filePath;
        } else {
          // 路径
          target = shortcutDetail.target;
        }
        // 参数
        item.params = !util.strIsEmpty(shortcutDetail.arguments) ? shortcutDetail.arguments : null;
      }
      // 文件类型
      let stats = fs.statSync(target);
      // 路径
      item.path = target;
      item.type = stats.isFile() ? 0 : 1;
      // 获取图标
      item.icon = await getFileIcon(target, true);
      // 去掉后缀
      if (item.type == 0) {
        item.name = util.removeSuffix(item.name);
      }
      // add
      itemList.push(item);
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.log(e);
      }
    }
  }
  return itemList;
}

/**
 * 获取开始菜单程序
 */
async function getStartMenuProgramList() {
  // 返回列表
  let resultList = [];
  // appData
  let appDataPathList = getPathProgramList(process.env["AppData"] + "\\Microsoft\\Windows\\Start Menu\\Programs");
  // programData
  let programDataPathList = getPathProgramList(process.env["ProgramData"] + "\\Microsoft\\Windows\\Start Menu\\Programs");
  // list
  let pathList = [];
  pathList.push(...appDataPathList);
  pathList.push(...programDataPathList);
  // 查询缓存
  let cacheStartMenuProgramList = cacheData.cacheStore.get("startMenuProgramList");
  // 循环组装数据
  for (let p of pathList) {
    // 获取后缀，必须是快捷方式
    if (mime.getType(p) == "application/x-ms-shortcut") {
      // 获取名称去掉后缀
      let name = util.removeSuffix(path.basename(p));
      // 查重
      let flag = false;
      for (let e of resultList) {
        if (e.name == name) {
          flag = true;
          break;
        }
      }
      if (!flag) {
        let exist = false;
        // 是否存在如果存在的话不需要重新获取图标
        if (!util.arrayIsEmpty(cacheStartMenuProgramList)) {
          for (let pro of cacheStartMenuProgramList) {
            if (name == pro.name && p == pro.path) {
              resultList.push(pro);
              exist = true;
              break;
            }
          }
        }
        if (!exist) {
          // data
          let data = {
            name: name,
            path: p,
            icon: await getFileIcon(p, true),
          };
          // push
          resultList.push(data);
        }
      }
    }
  }
  // 排序
  resultList.sort((a, b) => a.name.localeCompare(b.name));
  // 写入缓存
  cacheData.cacheStore.set("startMenuProgramList", resultList);
  // 返回
  return resultList;
}

/**
 * 获取Appx列表
 */
async function getAppxList() {
  let resultList = [];
  try {
    let release = os.release();
    let releaseSplit = release.split(".");
    if (Number(releaseSplit[0]) >= 10) {
      let stdout = execSync('powershell -Command "Get-AppxPackage | Select-Object PackageFamilyName, InstallLocation | Format-list"');
      stdout = stdout.toString("UTF8");
      let split = stdout.trim().split("\r\n");
      split = split.filter((str) => str.trim() != "");
      let list = [];
      let packageFamilyName = null;
      let installLocation = null;
      let prev = null;
      for (let i = 0; i < split.length; i++) {
        let t = split[i].trim();
        let s = t.split(" : ");
        if (s.length > 1) {
          if (s[0].trim() == "PackageFamilyName") {
            if (packageFamilyName != null && installLocation != null) {
              list.push({
                packageFamilyName: packageFamilyName,
                installLocation: installLocation,
              });
              packageFamilyName = s[1].trim();
              installLocation = null;
              prev = "PackageFamilyName";
            } else {
              packageFamilyName = s[1].trim();
              prev = "PackageFamilyName";
            }
          } else if (s[0].trim() == "InstallLocation") {
            installLocation = s[1].trim();
            prev = "InstallLocation";
          }
        } else {
          if (prev == "PackageFamilyName") {
            packageFamilyName += t;
          } else if (prev == "InstallLocation") {
            installLocation += t;
          }
        }
      }
      if (packageFamilyName != null && installLocation != null) {
        list.push({
          packageFamilyName: packageFamilyName,
          installLocation: installLocation,
        });
      }
      // 读取XML获取图标路径和名称
      for (let e of list) {
        let appxInfo = await getAppxInfo(e.installLocation);
        e.appId = appxInfo.appId;
        e.icon = appxInfo.icon;
        e.name = appxInfo.name;
      }
      // 过滤
      let filterList = list.filter((e) => e.icon != null && e.appId != null && e.name != null);
      // 图标转BASE64
      for (let e of filterList) {
        try {
          let buffer = fs.readFileSync(e.icon);
          let icon = "data:" + mime.getType(e.icon) + ";base64," + buffer.toString("base64");
          e.originalIcon = e.icon;
          e.icon = icon;
        } catch (ex) {
          if (process.env.NODE_ENV !== "production") {
            console.log(ex);
          }
          e.icon = null;
        }
      }
      // 返回列表
      resultList = filterList.filter((e) => e.icon != null);
      // 排序
      resultList.sort((a, b) => a.name.localeCompare(b.name));
    }
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.log(e);
    }
  }
  return resultList;
}

/**
 * 图片转BASE64
 */
function imageToBase64(path) {
  fs.readFile(path, (err, data) => {
    let buffer = Buffer.from(data);
    let icon = "data:" + mime.getType(path) + ";base64," + buffer.toString("base64");
    global.mainWindow.webContents.send("imageToBase64", icon);
  });
}

/**
 * 下载图片
 * @param url
 */
function downloadImage(url) {
  let result = {
    status: false,
    message: global.currentLanguage.downloadImageFailedMessage,
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
      },
      function (error, response, body) {
        if (operation.retry(error)) {
          return;
        }
        if (!error && response.statusCode >= 200 && response.statusCode <= 299) {
          if (response.headers != null && response.headers["content-type"] != null) {
            let ext = mime.getExtension(response.headers["content-type"]);
            if (ext == "jpg" || ext == "jpeg" || ext == "png" || ext == "gif" || ext == "ico" || ext == "svg") {
              let buffer = Buffer.from(body);
              result.icon = "data:" + mime.getType(response.headers["content-type"]) + ";base64," + buffer.toString("base64");
              result.status = true;
              result.message = null;
            } else {
              result.icon = null;
              result.status = false;
              result.message = global.currentLanguage.downloadImageNotImageFormatMessage;
            }
          }
        }
        returnDownloadImage(result);
      }
    );
  });
}

/**
 * 返回下载图片信息
 * @param result
 */
function returnDownloadImage(result) {
  global.mainWindow.webContents.send("returnDownloadImage", JSON.stringify(result));
}

/**
 * 添加/修改项目菜单项
 * @param type
 * @param classificationParentId
 * @param classificationChildId
 * @param id
 * @param itemType
 */
function addEditItemMenu(type, classificationParentId, classificationChildId, id, itemType) {
  let params = {
    type: type,
    classificationParentId: classificationParentId,
    classificationChildId: classificationChildId,
    id: id,
    itemType: itemType,
  };
  global.mainWindow.webContents.send("showItemAddEditWindow", JSON.stringify(params));
}

/**
 * 清空项目菜单
 * @param classificationParentId
 * @param classificationChildId
 * @param confirm
 */
function clearItemMenu(classificationParentId, classificationChildId, confirm) {
  let params = {
    classificationParentId: classificationParentId,
    classificationChildId: classificationChildId,
    confirm: confirm,
  };
  global.mainWindow.webContents.send("clearItem", JSON.stringify(params));
}

/**
 * 项目刷新图标缓存列表菜单
 * @param classificationParentId
 * @param classificationChildId
 */
function refreshIconCacheListItemMenu(classificationParentId, classificationChildId) {
  dialog
    .showMessageBox(global.mainWindow, {
      message: global.currentLanguage.refreshIconCurrentClassificationMessage,
      buttons: [global.currentLanguage.ok, global.currentLanguage.cancel],
      type: "question",
      noLink: true,
      cancelId: 1,
    })
    .then((r) => {
      if (r.response == 0) {
        refreshIconCacheList(classificationParentId, classificationChildId).then((res) => {
          let params = {
            classificationParentId: classificationParentId,
            classificationChildId: classificationChildId,
            list: res,
          };
          global.mainWindow.webContents.send("refreshIconCacheList", JSON.stringify(params));
        });
      }
    });
}

/**
 * 项目转换路径菜单
 * @param classificationParentId
 * @param classificationChildId
 * @param type
 */
function convertPathListItemMenu(classificationParentId, classificationChildId, type) {
  dialog
    .showMessageBox(global.mainWindow, {
      message: type == "relative" ? global.currentLanguage.relativeCurrentClassificationMessage : global.currentLanguage.absoluteCurrentClassificationMessage,
      buttons: [global.currentLanguage.ok, global.currentLanguage.cancel],
      type: "question",
      noLink: true,
      cancelId: 1,
    })
    .then((r) => {
      if (r.response == 0) {
        let params = {
          classificationParentId: classificationParentId,
          classificationChildId: classificationChildId,
          type: type,
        };
        global.mainWindow.webContents.send("convertPathList", JSON.stringify(params));
      }
    });
}

export default function () {
  // 项目空白处右键菜单
  ipcMain.on("itemContentRightMenu", (event, args) => {
    // 参数
    let p = JSON.parse(args);
    // 在拥有子级分类的父级分类下右键
    let addSubmenu = [];
    let clearSubmenu = [];
    let refreshIconCacheSubmenu = [];
    let convertRelativePathSubmenu = [];
    let convertAbsolutePathSubmenu = [];
    if (p.haveClassificationChild && p.classificationChildId == null) {
      for (let i = 0; i < global.list.length; i++) {
        if (global.list[i].id == p.classificationParentId) {
          for (let j = 0; j < global.list[i].childList.length; j++) {
            if (
              util.strIsEmpty(global.list[i].childList[j].mapDirectory) &&
              (global.list[i].childList[j].type == null || global.list[i].childList[j].type != 1)
            ) {
              addSubmenu.push({
                label: global.list[i].childList[j].name,
                click: () => {
                  addEditItemMenu(0, p.classificationParentId, global.list[i].childList[j].id);
                },
              });
              clearSubmenu.push({
                label: global.list[i].childList[j].name,
                click: () => {
                  clearItemMenu(p.classificationParentId, global.list[i].childList[j].id, true);
                },
              });
              convertRelativePathSubmenu.push({
                label: global.list[i].childList[j].name,
                click: () => {
                  convertPathListItemMenu(p.classificationParentId, global.list[i].childList[j].id, "relative");
                },
              });
              convertAbsolutePathSubmenu.push({
                label: global.list[i].childList[j].name,
                click: () => {
                  convertPathListItemMenu(p.classificationParentId, global.list[i].childList[j].id, "absolute");
                },
              });
            }
            if (global.list[i].childList[j].type == null || global.list[i].childList[j].type != 1) {
              refreshIconCacheSubmenu.push({
                label: global.list[i].childList[j].name,
                click: () => {
                  refreshIconCacheListItemMenu(p.classificationParentId, global.list[i].childList[j].id);
                },
              });
            }
          }
        }
      }
    }
    // 菜单
    let menuList = [];
    if (p.haveClassificationChild && p.classificationChildId == null) {
      if (!util.arrayIsEmpty(addSubmenu)) {
        menuList.push({
          label: global.currentLanguage.newItem,
          type: "submenu",
          submenu: addSubmenu,
        });
      }
    } else {
      if (!p.isMapDirectory && !p.aggregate) {
        menuList.push({
          label: global.currentLanguage.newItem,
          click: () => {
            addEditItemMenu(0, p.classificationParentId, p.classificationChildId);
          },
        });
      }
    }
    if (!p.aggregate) {
      menuList.push(index.itemSortMenu(p.classificationParentId, p.classificationChildId, p.haveClassificationChild, p.sort));
    }
    menuList.push(...index.itemLayoutIconSize(p.classificationParentId, p.classificationChildId, p.haveClassificationChild, p.layout, p.iconSize));
    menuList.push(ItemJS.itemShowOnly(p.classificationParentId, p.classificationChildId, p.haveClassificationChild, p.showOnly));
    if (
      !p.haveClassificationChild &&
      ((p.layout != null && p.layout == "list") || (global.setting.item.layout == "list" && (p.layout == null || p.layout == "default")))
    ) {
      menuList.push(ItemJS.itemColumnNumber(p.classificationParentId, p.classificationChildId, p.haveClassificationChild, p.columnNumber));
    }
    menuList.push({ type: "separator" });
    if (p.haveClassificationChild && p.classificationChildId == null) {
      if (!util.arrayIsEmpty(refreshIconCacheSubmenu)) {
        menuList.push({
          label: global.currentLanguage.batchRefreshIconCache,
          type: "submenu",
          submenu: refreshIconCacheSubmenu,
        });
      }
    } else {
      if (!p.aggregate) {
        menuList.push({
          label: global.currentLanguage.batchRefreshIconCache,
          click: () => {
            refreshIconCacheListItemMenu(p.classificationParentId, p.classificationChildId);
          },
        });
      }
    }
    if (p.haveClassificationChild && p.classificationChildId == null) {
      if (!util.arrayIsEmpty(convertRelativePathSubmenu)) {
        menuList.push({
          label: global.currentLanguage.batchConversionRelativePath,
          type: "submenu",
          submenu: convertRelativePathSubmenu,
        });
      }
    } else {
      if (!p.isMapDirectory && !p.aggregate) {
        menuList.push({
          label: global.currentLanguage.batchConversionRelativePath,
          click: () => {
            convertPathListItemMenu(p.classificationParentId, p.classificationChildId, "relative");
          },
        });
      }
    }
    if (p.haveClassificationChild && p.classificationChildId == null) {
      if (!util.arrayIsEmpty(convertAbsolutePathSubmenu)) {
        menuList.push({
          label: global.currentLanguage.batchConversionAbsolutePath,
          type: "submenu",
          submenu: convertAbsolutePathSubmenu,
        });
      }
    } else {
      if (!p.isMapDirectory && !p.aggregate) {
        menuList.push({
          label: global.currentLanguage.batchConversionAbsolutePath,
          click: () => {
            convertPathListItemMenu(p.classificationParentId, p.classificationChildId, "absolute");
          },
        });
      }
    }
    menuList.push({ type: "separator" });
    if (p.haveClassificationChild && p.classificationChildId == null) {
      if (!util.arrayIsEmpty(clearSubmenu)) {
        menuList.push({
          label: global.currentLanguage.clearItem,
          type: "submenu",
          submenu: clearSubmenu,
        });
      }
    } else {
      if (!p.isMapDirectory && !p.aggregate) {
        menuList.push({
          label: global.currentLanguage.clearItem,
          click: () => {
            clearItemMenu(p.classificationParentId, p.classificationChildId, true);
          },
        });
      }
    }
    menuList.push({ type: "separator" });
    if (!p.isMapDirectory && !p.aggregate) {
      menuList.push({
        label: p.lockItem ? global.currentLanguage.unlockItem : global.currentLanguage.lockItem,
        click: () => {
          global.mainWindow.webContents.send("setLockItem", !p.lockItem);
          cacheData.cacheStore.set("lockItem", !p.lockItem);
        },
      });
      menuList.push({ type: "separator" });
    }
    if (!p.lockItem && !p.isMapDirectory && !p.aggregate) {
      menuList.push({
        label: p.batchOperation ? global.currentLanguage.cancelBatchOperation : global.currentLanguage.batchOperation,
        click: () => {
          global.mainWindow.webContents.send("setBatchOperation", !p.batchOperation);
        },
      });
    }
    let m = Menu.buildFromTemplate(menuList);
    util.menuListen(m);
    m.popup();
  });
  // 项目右键
  ipcMain.on("itemRightMenu", (event, args) => {
    // 参数
    let p = JSON.parse(args);
    // 项目
    let item = p.item;
    // 转为菜单
    let moveSubmenu = [];
    let copySubmenu = [];
    if ((p.search == null || !p.search) && (p.searchWindow == null || !p.searchWindow) && !p.isMapDirectory && !p.aggregate) {
      moveSubmenu = convertMenu(p.classificationParentId, p.classificationChildId, item.id, global.list, true);
      copySubmenu = convertMenu(p.classificationParentId, p.classificationChildId, item.id, global.list, false);
    }
    // 菜单
    let menuList = [
      {
        label: global.currentLanguage.open,
        click: () => {
          if (p.searchWindow != null && p.searchWindow) {
            global.searchWindow.hide();
          }
          index.itemRun(item, false);
          if (p.search != null && p.search) {
            global.mainWindow.webContents.send("closeSearch");
          }
        },
      },
      {
        label: global.currentLanguage.emptyRecycleBin,
        visible: item.type == 3 && item.shell == "shell:RecycleBinFolder",
        click: () => {
          global.api.EmptyRecycleBin(global.mainWindow.getNativeWindowHandle());
        },
      },
      {
        label: global.currentLanguage.openWith,
        visible: item.type == 0 && item.extension != ".exe" && item.extension != ".bat" && item.extension != ".lnk",
        click: () => {
          if (p.searchWindow != null && p.searchWindow) {
            global.searchWindow.hide();
          }
          index.itemRun(item, false, true);
          if (p.search != null && p.search) {
            global.mainWindow.webContents.send("closeSearch");
          }
        },
      },
      {
        label: global.currentLanguage.runAsAdministrator,
        visible: (item.type == 0 && (item.extension == ".exe" || item.extension == ".bat")) || (item.type == 3 && item.shell == "cmd"),
        click: () => {
          item.admin = true;
          index.itemRun(item, false);
          if (p.search != null && p.search) {
            global.mainWindow.webContents.send("closeSearch");
          }
          if (p.searchWindow != null && p.searchWindow) {
            global.searchWindow.hide();
          }
        },
      },
      {
        label: global.currentLanguage.openLocation,
        visible: item.type == 0,
        click: () => {
          index.itemRun(item, true);
          if (p.search != null && p.search) {
            global.mainWindow.webContents.send("closeSearch");
          }
          if (p.searchWindow != null && p.searchWindow) {
            global.searchWindow.hide();
          }
        },
      },
    ];
    menuList.push({
      type: "separator",
    });
    if (item.type != 3 && item.type != 4 && item.type != 5) {
      menuList.push({
        label: global.currentLanguage.copyFullPath,
        click: () => {
          if (item.type == 0 || item.type == 1) {
            clipboard.writeText(index.getAbsolutePath(item.path));
          } else if (item.type == 2) {
            clipboard.writeText(item.url);
          }
          if (p.search != null && p.search) {
            global.mainWindow.webContents.send("closeSearch");
          }
          if (p.searchWindow != null && p.searchWindow) {
            global.searchWindow.hide();
          }
        },
      });
    }
    if (item.type == 0 || item.type == 1 || item.type == 5) {
      menuList.push({
        label: global.currentLanguage.createDesktopShortcut,
        click: () => {
          dialog
            .showSaveDialog(global.mainWindow, {
              title: global.currentLanguage.createDesktopShortcut,
              defaultPath: util.removeSuffix(item.name.replace(/\\n/g, " ")),
              filters: [{ name: "lnk", extensions: ["lnk"] }],
            })
            .then((r) => {
              if (!r.canceled && !util.strIsEmpty(r.filePath)) {
                if (item.type == 0 || item.type == 1) {
                  // 获取绝对路径
                  item.path = index.getAbsolutePath(item.path);
                }
                shell.writeShortcutLink(r.filePath, "create", {
                  target: item.type == 5 ? item.shell : item.path,
                });
              }
            });
        },
      });
    }
    menuList.push({
      label: global.currentLanguage.exportIcon,
      click: () => {
        if (!util.strIsEmpty(item.icon) || !util.strIsEmpty(item.htmlIcon)) {
          let re = new RegExp("data:(?<ext>.*?);base64,.*");
          let res = re.exec(item.icon);
          let htmlIcon = !util.strIsEmpty(item.htmlIcon);
          if (res || htmlIcon) {
            try {
              dialog
                .showSaveDialog(global.mainWindow, {
                  title: global.currentLanguage.exportIcon,
                  defaultPath: "icon",
                  filters: [{ name: htmlIcon ? "svg" : mime.getExtension(res.groups.ext), extensions: [htmlIcon ? "svg" : mime.getExtension(res.groups.ext)] }],
                })
                .then((r) => {
                  if (!r.canceled && !util.strIsEmpty(r.filePath)) {
                    if (htmlIcon) {
                      fs.writeFile(r.filePath, item.htmlIcon, function (err) {});
                    } else {
                      let arr = item.icon.split(",");
                      if (arr.length == 2) {
                        let base64Data = arr[1];
                        let dataBuffer = Buffer.from(base64Data, "base64");
                        fs.writeFile(r.filePath, dataBuffer, function (err) {});
                      }
                    }
                  }
                });
            } catch (e) {
              if (process.env.NODE_ENV !== "production") {
                console.log(e);
              }
            }
          }
        }
      },
    });
    if (
      (item.type == 0 || item.type == 1 || item.type == 5) &&
      (p.search == null || !p.search) &&
      (p.searchWindow == null || !p.searchWindow) &&
      (item.notRefreshIcon == null || !item.notRefreshIcon) &&
      !p.aggregate
    ) {
      menuList.push({
        label: global.currentLanguage.refreshIconCache,
        click: () => {
          // 获取图标
          refreshIconCache(item).then((res) => {
            if (res.icon != null) {
              let { classificationParentId, classificationChildId } = ClassificationJS.convertClassificationId(
                item.classificationId,
                item.classificationParentId
              );
              let params = {
                classificationParentId: classificationParentId,
                classificationChildId: classificationChildId,
                id: item.id,
                icon: res.icon,
              };
              if (item.type == 5) {
                params.iconPath = res.iconPath;
              }
              global.mainWindow.webContents.send("refreshIconCache", JSON.stringify(params));
            }
          });
        },
      });
    }
    if (
      (item.type == 0 || item.type == 1) &&
      (p.search == null || !p.search) &&
      (p.searchWindow == null || !p.searchWindow) &&
      !p.isMapDirectory &&
      !p.aggregate
    ) {
      menuList.push({
        label: ItemJS.isAbsolutePath(item.path) ? global.currentLanguage.convertRelativePath : global.currentLanguage.convertAbsolutePath,
        click: () => {
          let { classificationParentId, classificationChildId } = ClassificationJS.convertClassificationId(item.classificationId, item.classificationParentId);
          let params = {
            classificationParentId: classificationParentId,
            classificationChildId: classificationChildId,
            id: item.id,
            type: ItemJS.isAbsolutePath(item.path) ? "relative" : "absolute",
          };
          global.mainWindow.webContents.send("convertPath", JSON.stringify(params));
        },
      });
    }
    if (item.type == 0 || item.type == 1 || item.type == 3) {
      let flag = false;
      let itemPath;
      if (item.type == 3) {
        if (
          item.shell == "shell:MyComputerFolder" ||
          item.shell == "shell:DocumentsLibrary" ||
          item.shell == "shell:ControlPanelFolder" ||
          item.shell == "shell:RecycleBinFolder"
        ) {
          itemPath = item.shell;
          flag = true;
        } else if (item.shell == "services.msc") {
          itemPath = process.env.SystemRoot + "\\System32\\services.msc";
          flag = true;
        } else if (item.shell == "cmd") {
          itemPath = process.env.SystemRoot + "\\System32\\cmd.exe";
          flag = true;
        } else if (item.shell == "taskmgr") {
          itemPath = process.env.SystemRoot + "\\System32\\taskmgr.exe";
          flag = true;
        } else if (item.shell == "regedit") {
          itemPath = process.env.SystemRoot + "\\regedit.exe";
          flag = true;
        } else if (item.shell == "powercfg.cpl") {
          itemPath = process.env.SystemRoot + "\\System32\\powercfg.exe";
          flag = true;
        } else if (item.shell == "compmgmt.msc /s") {
          itemPath = process.env.SystemRoot + "\\System32\\compmgmt.msc";
          flag = true;
        }
      } else {
        flag = true;
        itemPath = index.getAbsolutePath(item.path);
      }
      if (flag) {
        menuList.push({
          type: "separator",
        });
        menuList.push({
          label: global.currentLanguage.explorerMenu,
          click: () => {
            const mouseEvent = require("../mouse");
            let screen = util.getWindowInScreen();
            let scaleFactor = 1;
            if (!util.arrayIsEmpty(screen)) {
              scaleFactor = screen[0].scaleFactor;
            }
            // 暂停鼠标事件
            mouseEvent.pauseMouseEvents();
            try {
              global.api.ContextMenu(global.mainWindow.getNativeWindowHandle(), itemPath, p.x * scaleFactor, p.y * scaleFactor);
            } finally {
              // 恢复鼠标事件
              mouseEvent.resumeMouseEvents();
            }
          },
        });
      }
    }
    if (
      (!util.arrayIsEmpty(moveSubmenu) || !util.arrayIsEmpty(copySubmenu)) &&
      (p.search == null || !p.search) &&
      (p.searchWindow == null || !p.searchWindow) &&
      !p.isMapDirectory &&
      !p.aggregate
    ) {
      menuList.push({
        type: "separator",
      });
      if (!util.arrayIsEmpty(moveSubmenu)) {
        menuList.push({
          label: global.currentLanguage.moveTo,
          visible: !util.arrayIsEmpty(moveSubmenu),
          type: "submenu",
          submenu: moveSubmenu,
        });
      }
      if (!util.arrayIsEmpty(copySubmenu)) {
        menuList.push({
          label: global.currentLanguage.copyTo,
          visible: !util.arrayIsEmpty(copySubmenu),
          type: "submenu",
          submenu: copySubmenu,
        });
      }
    }
    if ((p.search == null || !p.search) && (p.searchWindow == null || !p.searchWindow) && !p.isMapDirectory && !p.aggregate) {
      menuList.push(
        {
          type: "separator",
        },
        {
          label: global.currentLanguage.newItem,
          click: () => {
            addEditItemMenu(0, p.classificationParentId, p.classificationChildId);
          },
        },
        {
          type: "separator",
        },
        {
          label: global.currentLanguage.edit,
          click: () => {
            addEditItemMenu(1, p.classificationParentId, p.classificationChildId, item.id, item.type);
          },
        },
        {
          label: global.currentLanguage.delete,
          click: () => {
            dialog
              .showMessageBox(global.mainWindow, {
                message: global.currentLanguage.deleteItemMessage,
                buttons: [global.currentLanguage.ok, global.currentLanguage.cancel],
                type: "question",
                noLink: true,
                cancelId: 1,
              })
              .then((r) => {
                if (r.response == 0) {
                  let params = {
                    classificationParentId: p.classificationParentId,
                    classificationChildId: p.classificationChildId,
                    id: item.id,
                  };
                  global.mainWindow.webContents.send("deleteItem", JSON.stringify(params));
                }
              });
          },
        }
      );
    }
    if ((p.search == null || !p.search) && (p.searchWindow == null || !p.searchWindow) && p.isMapDirectory && !p.aggregate) {
      menuList.push({ type: "separator" });
      menuList.push({
        label: global.currentLanguage.hideThisItem,
        click: () => {
          let params = {
            classificationParentId: p.classificationParentId,
            classificationChildId: p.classificationChildId,
            item: item,
          };
          global.mainWindow.webContents.send("hiddenItem", JSON.stringify(params));
        },
      });
    }
    // 菜单
    let m = Menu.buildFromTemplate(menuList);
    util.menuListen(m);
    m.popup();
  });
  // 多选项目右键
  ipcMain.on("multiItemRightMenu", (event, args) => {
    // 菜单列表
    let menuList = [];
    // 全选
    menuList.push({
      label: global.currentLanguage.selectAll,
      click: () => {
        global.mainWindow.webContents.send("batchOperationSelectAll");
      },
    });
    menuList.push({ type: "separator" });
    // 转为菜单
    let moveSubmenu = batchOperationConvertMenu(global.list, true);
    let copySubmenu = batchOperationConvertMenu(global.list, false);
    // 移动 复制
    if (!util.arrayIsEmpty(moveSubmenu) || !util.arrayIsEmpty(copySubmenu)) {
      if (!util.arrayIsEmpty(moveSubmenu)) {
        menuList.push({
          label: global.currentLanguage.moveTo,
          visible: !util.arrayIsEmpty(moveSubmenu),
          type: "submenu",
          submenu: moveSubmenu,
        });
      }
      if (!util.arrayIsEmpty(copySubmenu)) {
        menuList.push({
          label: global.currentLanguage.copyTo,
          visible: !util.arrayIsEmpty(copySubmenu),
          type: "submenu",
          submenu: copySubmenu,
        });
      }
    }
    menuList.push({ type: "separator" });
    menuList.push({
      label: global.currentLanguage.delete,
      click: () => {
        dialog
          .showMessageBox(global.mainWindow, {
            message: global.currentLanguage.batchDeleteItemMessage,
            buttons: [global.currentLanguage.ok, global.currentLanguage.cancel],
            type: "question",
            noLink: true,
            cancelId: 1,
          })
          .then((r) => {
            if (r.response == 0) {
              global.mainWindow.webContents.send("batchDeleteItem");
            }
          });
      },
    });
    menuList.push({ type: "separator" });
    menuList.push({
      label: global.currentLanguage.cancelBatchOperation,
      click: () => {
        global.mainWindow.webContents.send("setBatchOperation", false);
      },
    });
    // 菜单
    let m = Menu.buildFromTemplate(menuList);
    util.menuListen(m);
    m.popup();
  });
  // 运行项目
  ipcMain.on("itemRun", (event, args) => {
    let params = JSON.parse(args);
    index.itemRun(params.item, params.location);
    let setItemDataParams = {
      item: params.item,
      recordQuickSearch: params.recordQuickSearch,
    };
    global.mainWindow.webContents.send("setItemData", JSON.stringify(setItemDataParams));
  });
  // 获取文件图标
  ipcMain.on("getFileIcon", (event, args) => {
    getFileIcon(args, true).then((res) => {
      event.sender.send("getFileBase64", res);
    });
  });
  // 获取网址信息
  ipcMain.on("getUrlInfo", (event, args) => {
    getUrlInfo(args, true);
  });
  // 读取文件
  ipcMain.on("readFiles", (event, args) => {
    let params = JSON.parse(args);
    readFiles(params.path).then((res) => {
      // 主窗口编辑分类
      let itemAddParams = {
        classificationParentId: params.classificationParentId,
        classificationChildId: params.classificationChildId,
        itemList: res,
        clear: false,
      };
      global.mainWindow.webContents.send("itemAdd", JSON.stringify(itemAddParams));
    });
  });
  // 图片转base64
  ipcMain.on("imageToBase64", (event, args) => {
    imageToBase64(args);
  });
  // 清空项目
  ipcMain.on("clearItemDialog", (event, args) => {
    let params = JSON.parse(args);
    dialog
      .showMessageBox(global.mainWindow, {
        message: global.currentLanguage.clearItemMessage,
        buttons: [global.currentLanguage.ok, global.currentLanguage.cancel],
        type: "question",
        noLink: true,
        cancelId: 1,
      })
      .then((r) => {
        if (r.response == 0) {
          clearItemMenu(params.classificationParentId, params.classificationChildId, false);
        }
      });
  });
  // 获取文件后缀
  ipcMain.on("getFileExtension", (event, args) => {
    event.returnValue = path.extname(args);
  });
  // 拖出文件
  ipcMain.on("ondragstart", (event, args) => {
    let params = JSON.parse(args);
    try {
      // 网站和系统不能拖出
      if (params.type == 2 || params.type == 3) {
        // 取消拖出状态
        global.mainWindow.webContents.send("cancelDragOut");
        return;
      }
      let icon;
      // 环境判断
      if (process.env.NODE_ENV !== "production") {
        // 开发
        icon = "./public/images/drag-and-drop.png";
      } else {
        // 正式
        icon = path.join(__dirname, "./images/drag-and-drop.png");
      }
      event.sender.startDrag({
        file: index.getAbsolutePath(params.path),
        icon: icon,
      });
    } finally {
      // 取消拖出状态
      global.mainWindow.webContents.send("cancelDragOut");
    }
  });
  // 获取锁定项目状态
  ipcMain.on("getLockItem", (event, args) => {
    let lockItem = cacheData.cacheStore.get("lockItem");
    event.returnValue = lockItem == null ? false : lockItem;
  });
  // 读取文件夹
  ipcMain.on("readDirectory", (event, args) => {
    let pathArr = JSON.parse(args);
    let resultList = [];
    for (let p of pathArr) {
      try {
        // 获取文件类型
        let stats;
        try {
          // 文件类型
          stats = fs.statSync(p);
        } catch (e) {
          p = p.replace(" (x86)", "");
          try {
            stats = fs.statSync(p);
          } catch (e) {}
        }
        // 只要文件夹
        if (stats != null && stats.isDirectory()) {
          // 读取文件夹下的内容
          let files = fs.readdirSync(p);
          // 组装路径
          let fileList = [];
          for (let file of files) {
            fileList.push(path.join(p, file));
          }
          // 返回信息
          let name = path.basename(p);
          resultList.push({
            name: util.strIsEmpty(name) ? p : name,
            fileList: fileList,
          });
        }
      } catch (e) {
        if (process.env.NODE_ENV !== "production") {
          console.log(e);
        }
      }
    }
    // 返回
    event.returnValue = JSON.stringify(resultList);
  });
  // 校验无效项目
  ipcMain.on("checkInvalidItem", (event, args) => {
    global.mainWindow.webContents.send("checkInvalidItemResult", JSON.stringify(index.checkInvalidItem()));
  });
  // 获取开始菜单程序
  ipcMain.on("getStartMenuProgramList", (event, args) => {
    getStartMenuProgramList().then((res) => {
      // 返回数据
      global.mainWindow.webContents.send("resultStartMenuProgramList", JSON.stringify(res));
    });
  });
  // 获取Appx列表
  ipcMain.on("getAppxList", (event, args) => {
    getAppxList().then((res) => {
      global.mainWindow.webContents.send("returnAppxList", JSON.stringify(res));
    });
  });
  // 初始化映射文件夹
  ipcMain.on("initMapDirectory", (event, args) => {
    // 初始化映射文件夹
    index.initMapDirectory().then((res) => {
      if (res != null) {
        global.mainWindow.webContents.send("returnInitMapDirectory", JSON.stringify(res));
      }
    });
  });
  // 读取映射文件夹
  ipcMain.on("readMapDirectory", (event, args) => {
    let params = JSON.parse(args);
    index.readMapDirectory(params.classificationParentId, params.classificationChildId, params.mapDirectory, true, false, true);
  });
  // 删除文件夹监听
  ipcMain.on("deleteMapDirectoryWatch", (event, args) => {
    let params = JSON.parse(args);
    index.deleteMapDirectoryWatcher(params.classificationParentId, params.classificationChildId);
  });
  // 上传图标
  ipcMain.on("uploadIcon", (event, args) => {
    let ext = path.extname(args);
    if (ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".gif" || ext == ".ico" || ext == ".svg") {
      // 图片
      imageToBase64(args);
    } else {
      // 获取文件图标
      getFileIcon(args, true).then((res) => {
        event.sender.send("getFileBase64", res);
      });
    }
  });
  // 下载图片
  ipcMain.on("downloadImage", (event, args) => {
    downloadImage(args);
  });
}
