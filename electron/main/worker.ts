import mime from "mime";
import {
  deleteExtname,
  getFileName,
  newItem,
} from "../../commons/utils/common";
import { CommonItem, Item } from "../../types/item";
import { parse, join, extname } from "node:path";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import xml2js from "xml2js";
import { newCommonItem, newCommonItemData } from "../../commons/utils/common";
import { ShortcutInfo } from "../../types/common";
import { parsePath, getFileIcon } from "../commons/utils";

// AppxInfo
export interface AppxInfo {
  id: string | null;
  icon: string | null;
  name: string | null;
}

// addon
global.addon = require("../../native/addon.node");

// 接收消息
process.parentPort.once("message", async (event) => {
  // 参数
  let data = event.data;
  // 通道
  let port = event.ports[0];
  try {
    // 转为实体
    let params = JSON.parse(data);
    // 获取数据参数
    let dataParamStr = readFileSync(params.data.filePath, {
      encoding: "utf-8",
    });
    // 转为JSON
    let dataParam = JSON.parse(dataParamStr);
    // 返回信息
    let res = null;
    if (params.name === "getStartMenuItemList") {
      res = await getStartMenuItemList(dataParam);
    } else if (params.name === "getAppxItemList") {
      res = await getAppxItemList();
    } else if (params.name === "getDropItemInfo") {
      res = await getDropItemInfo(
        dataParam.classificationId,
        dataParam.pathList
      );
    } else if (params.name === "refreshItemIcon") {
      res = await refreshItemIcon(dataParam);
    } else if (params.name === "getDirectoryItemList") {
      res = await getDirectoryItemList(
        dataParam.classificationId,
        dataParam.dir,
        dataParam.hiddenItems,
        dataParam.oldList
      );
    } else if (params.name === "checkInvalidItem") {
      res = checkInvalidItem(dataParam);
    }
    // 写入结果
    writeFileSync(params.data.filePath, JSON.stringify(res));
    port.postMessage(params.data.filePath);
  } catch (e) {
    process.exit();
  }
});

/**
 * 读取路径下的文件
 * @param dir
 */
function getFiles(dir: string) {
  let resultList: Array<string> = [];
  try {
    // 读取开始菜单下所有内容
    let pathList = readdirSync(dir);
    // 循环判断文件类型
    for (let path of pathList) {
      // 完整路径
      let fullPath = dir + "\\" + path;
      // 判断文件类型
      let stats;
      try {
        // 文件类型
        stats = statSync(fullPath);
        // 如果是文件夹继续向下读取，如果是文件则添加到返回列表
        if (stats.isDirectory()) {
          // 文件夹
          resultList.push(...getFiles(fullPath));
        } else {
          // 文件
          resultList.push(fullPath);
        }
      } catch (e) {}
    }
  } catch (e) {}
  return resultList;
}
/**
 * 获取开始菜单项目
 * @param cacheList
 */
async function getStartMenuItemList(cacheList: Array<CommonItem>) {
  // 返回列表
  let resultList: Array<CommonItem> = [];
  // appData
  let appDataPathList = getFiles(
    process.env["AppData"] + "\\Microsoft\\Windows\\Start Menu\\Programs"
  );
  // programData
  let programDataPathList = getFiles(
    process.env["ProgramData"] + "\\Microsoft\\Windows\\Start Menu\\Programs"
  );
  // 文件列表
  let filePathList: Array<string> = [];
  filePathList.push(...appDataPathList);
  filePathList.push(...programDataPathList);
  // 循环组装数据
  for (let filePath of filePathList) {
    // 获取后缀，必须是快捷方式
    if (mime.getType(filePath) === "application/x-ms-shortcut") {
      // 获取名称去掉后缀
      let name = deleteExtname(getFileName(filePath));
      // 参数
      let params = null;
      // 获取真实文件路径和参数
      let shortcutInfo: ShortcutInfo | null =
        global.addon.getShortcutFileInfo(filePath);
      if (shortcutInfo) {
        // 路径
        if (shortcutInfo.target) {
          filePath = shortcutInfo.target;
        }
        // 参数
        if (shortcutInfo.arguments) {
          params = shortcutInfo.arguments;
        }
      }
      // 查重
      let flag = false;
      for (let item of resultList) {
        if (item.data.target.toLowerCase() === filePath.toLowerCase()) {
          flag = true;
          break;
        }
      }
      if (!flag) {
        let exist = false;
        // 是否存在如果存在的话不需要重新获取图标
        if (cacheList && cacheList.length > 0) {
          for (let cacheItem of cacheList) {
            if (filePath === cacheItem.data.target) {
              resultList.push(newCommonItem(cacheItem));
              exist = true;
              break;
            }
          }
        }
        if (!exist) {
          // item
          let item = newCommonItem({
            name,
            data: newCommonItemData({
              target: filePath,
              icon: await getFileIcon(filePath),
              params,
            }),
          });
          // push
          resultList.push(item);
        }
      }
    }
  }
  return resultList;
}

/**
 * APPX项目
 */
async function getAppxItemList() {
  // 返回列表
  let resultList: Array<CommonItem> = [];
  try {
    // ID
    let id = 1;
    // 获取APPX信息
    let appxList = global.addon.getAppxList();
    // 临时列表
    let tempList = [];
    // 读取XML获取图标路径和名称
    for (let appx of appxList) {
      tempList.push(...(await getAppxInfo(appx)));
    }
    // 图标转BASE64
    for (let appxInfo of tempList) {
      try {
        let buffer = readFileSync(appxInfo.icon);
        let icon =
          "data:" +
          mime.getType(appxInfo.icon) +
          ";base64," +
          buffer.toString("base64");
        appxInfo.icon = icon;
      } catch (ex) {
        appxInfo.icon = null;
      }
    }
    // 筛选出有图标的数据
    tempList = tempList.filter((e) => e.icon);
    // 返回列表
    for (const appxInfo of tempList) {
      resultList.push(
        newCommonItem({
          id: id++,
          name: appxInfo.name,
          data: newCommonItemData({
            icon: appxInfo.icon,
            target: "Shell:AppsFolder\\" + appxInfo.id,
          }),
        })
      );
    }
    // 排序
    resultList.sort((a, b) => a.name.localeCompare(b.name));
  } catch (e) {}
  return resultList;
}

/**
 * 获取Appx信息
 */
async function getAppxInfo(appx: any) {
  // 结果列表
  let resultList = [];
  // buffer, 解析结果
  let buffer: Buffer, result: any;
  try {
    // 解析
    buffer = readFileSync(join(appx.path, "AppxManifest.xml"));
    result = await xml2jsSync(buffer);
    // 循环Application
    if (
      result.Package.Applications &&
      result.Package.Applications[0] &&
      result.Package.Applications[0].Application &&
      result.Package.Applications[0].Application.length > 0
    ) {
      for (
        let i = 0;
        i < result.Package.Applications[0].Application.length;
        i++
      ) {
        // appx信息
        let appxInfo: AppxInfo = {
          id: null,
          icon: null,
          name: null,
        };
        // Application
        const application = result.Package.Applications[0].Application[i];
        // 名称
        if (appx["appName" + i] && appx["appName" + i].trim() !== "") {
          appxInfo.name = appx["appName" + i];
        } else {
          appxInfo.name = appx.displayName;
        }
        // 获取ID
        let id = application.$.Id;
        if (!id || id.trim() === "") {
          continue;
        }
        appxInfo.id = appx.familyName + "!" + id;
        // 图标
        try {
          // targetsize图标
          let targetSizeIcon: string | null = null;
          let targetSizeIconMax: number | null = null;
          // scale图标
          let scaleIcon = null;
          let scaleIconMax = null;
          // 图标
          if (application["uap:VisualElements"]) {
            // logo地址
            let logo = application["uap:VisualElements"][0].$.Square44x44Logo;
            // 解析路径
            let parsedPath = parse(logo);
            // 获取文件夹下所有文件
            let fileNameList = readdirSync(join(appx.path, parsedPath.dir));
            // 筛选出和包含logo名称的文件名
            let filterList = fileNameList.filter(
              (f) => f.indexOf(parsedPath.name) >= 0
            );
            if (filterList.length > 1) {
              // 获取targetsize图片
              let targetSizeList = filterList.filter(
                (f) => f.indexOf(parsedPath.name + ".targetsize") >= 0
              );
              if (targetSizeList.length > 0) {
                // 获取最大图标尺寸
                let max = getMaxIconSize(
                  targetSizeList,
                  parsedPath.name,
                  "targetsize"
                );
                if (max) {
                  // 记录max
                  targetSizeIconMax = max;
                  // 先获取最终图标
                  let defaultList = targetSizeList.filter(
                    (f) =>
                      f ===
                      parsedPath.name +
                        ".targetsize-" +
                        max +
                        "_altform-unplated_devicefamily-colorfulunplated.png"
                  );
                  targetSizeIcon =
                    defaultList.length > 0
                      ? appx.path +
                        "\\" +
                        parsedPath.dir +
                        "\\" +
                        parsedPath.name +
                        ".targetsize-" +
                        max +
                        "_altform-unplated_devicefamily-colorfulunplated.png"
                      : null;
                  if (!targetSizeIcon) {
                    // 获取 名称.targetsize-{max}_altform-unplated.png
                    let defaultUnplatedList = targetSizeList.filter(
                      (f) =>
                        f ===
                        parsedPath.name +
                          ".targetsize-" +
                          max +
                          "_altform-unplated.png"
                    );
                    if (defaultUnplatedList.length > 0) {
                      targetSizeIcon =
                        appx.path +
                        "\\" +
                        parsedPath.dir +
                        "\\" +
                        parsedPath.name +
                        ".targetsize-" +
                        max +
                        "_altform-unplated.png";
                    } else {
                      // 获取 名称.targetsize-{max}_altform.png
                      let defaultAltFormList = targetSizeList.filter(
                        (f) =>
                          f ===
                          parsedPath.name +
                            ".targetsize-" +
                            max +
                            "_altform.png"
                      );
                      if (defaultAltFormList.length > 0) {
                        targetSizeIcon =
                          appx.path +
                          "\\" +
                          parsedPath.dir +
                          "\\" +
                          parsedPath.name +
                          ".targetsize-" +
                          max +
                          "_altform.png";
                      } else {
                        // 获取 名称.targetsize-{max}.png
                        let defaultTargetSizeList = targetSizeList.filter(
                          (f) =>
                            f ===
                            parsedPath.name + ".targetsize-" + max + ".png"
                        );
                        if (defaultTargetSizeList.length > 0) {
                          targetSizeIcon =
                            appx.path +
                            "\\" +
                            parsedPath.dir +
                            "\\" +
                            defaultTargetSizeList[0];
                        }
                      }
                    }
                  }
                }
              }
              // 获取scale图片
              let scaleList = filterList.filter(
                (f) => f.indexOf(parsedPath.name + ".scale") >= 0
              );
              if (scaleList.length > 0) {
                // 获取最大图标尺寸
                let max = getMaxIconSize(scaleList, parsedPath.name, "scale");
                if (max) {
                  // 记录max
                  scaleIconMax = max;
                  // 获取 名称.scale-{max}.png
                  let defaultList = scaleList.filter(
                    (f) => f === parsedPath.name + ".scale-" + max + ".png"
                  );
                  if (defaultList.length > 0) {
                    scaleIcon =
                      appx.path + "\\" + parsedPath.dir + "\\" + defaultList[0];
                  }
                }
              } else {
                scaleList = filterList.filter(
                  (f) => f.indexOf(parsedPath.name + ".Theme-Dark_Scale") >= 0
                );
                if (scaleList.length > 0) {
                  let max = getMaxIconSize(
                    scaleList,
                    parsedPath.name,
                    "Theme-Dark_Scale"
                  );
                  if (max) {
                    // 记录max
                    scaleIconMax = max;
                    // 获取 名称.Theme-Dark_Scale{max}.png
                    let defaultList = scaleList.filter(
                      (f) =>
                        f ===
                        parsedPath.name + ".Theme-Dark_Scale-" + max + ".png"
                    );
                    if (defaultList.length > 0) {
                      scaleIcon =
                        appx.path +
                        "\\" +
                        parsedPath.dir +
                        "\\" +
                        defaultList[0];
                    }
                  }
                }
              }
            } else {
              if (filterList.length === 1) {
                // 只有一张图片
                appxInfo.icon =
                  appx.path + "\\" + parsedPath.dir + "\\" + filterList[0];
              }
            }
          }
          if (!appxInfo.icon) {
            // 判断图标大小
            if (targetSizeIcon && !scaleIcon) {
              appxInfo.icon = targetSizeIcon;
            } else if (!targetSizeIcon && scaleIcon) {
              appxInfo.icon = scaleIcon;
            } else if (targetSizeIcon && scaleIcon) {
              if (
                targetSizeIconMax === 256 ||
                targetSizeIconMax > scaleIconMax
              ) {
                appxInfo.icon = targetSizeIcon;
              } else if (targetSizeIconMax < scaleIconMax) {
                appxInfo.icon = scaleIcon;
              } else {
                appxInfo.icon = targetSizeIcon;
              }
            } else if (!targetSizeIcon && !scaleIcon) {
              let propertiesIcon = getPropertiesIcon(appx.path, result);
              if (propertiesIcon) {
                appxInfo.icon = propertiesIcon;
              }
            }
          }
        } catch (e) {
          if (result) {
            let propertiesIcon = getPropertiesIcon(appx.path, result);
            if (propertiesIcon) {
              appxInfo.icon = propertiesIcon;
            }
          }
        }
        if (
          (!appxInfo.icon || appxInfo.icon.trim() === "") &&
          appx.logo &&
          appx.logo.trim() !== ""
        ) {
          appxInfo.icon = appx.logo;
        }
        if (
          appxInfo.name &&
          appxInfo.name.trim() !== "" &&
          appxInfo.id &&
          appxInfo.id.trim() !== "" &&
          appxInfo.icon &&
          appxInfo.icon.trim() !== ""
        ) {
          resultList.push(appxInfo);
        }
      }
    }
  } catch (ex) {}
  return resultList;
}

/**
 * 解析XML同步
 * @param xml
 */
async function xml2jsSync(xml: Buffer) {
  let parser = new xml2js.Parser();
  return new Promise((resolve, reject) => {
    parser.parseString(xml, function (err, json) {
      if (err) reject(err);
      else resolve(json);
    });
  });
}

/**
 * 获取最大图标尺寸
 * @param list
 * @param name
 * @param type
 * @returns
 */
function getMaxIconSize(list: Array<string>, name: string, type: string) {
  // 获取最大图标尺寸
  let max: number | null = null;
  for (let targetSize of list) {
    let size = Number(
      targetSize
        .replace(name + "." + type + "-", "")
        .split("_")[0]
        .replace(".png", "")
    );
    if (!max) {
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
 * 获取AppxPropertiesLogo
 * @param installLocation
 * @param result
 */
function getPropertiesIcon(installLocation: string, result: any) {
  if (result.Package.Properties) {
    if (result.Package.Properties[0].Logo) {
      let logo = result.Package.Properties[0].Logo[0];
      return installLocation + "\\" + logo;
    }
  }
  return null;
}

/**
 * 通过路径获取项目信息
 * @param classificationId
 * @param pathList
 */
async function getDropItemInfo(
  classificationId: number,
  pathList: Array<string>
) {
  // 项目列表
  let itemList: Array<Item> = [];
  // 解析文件信息并添加项目
  for (const path of pathList) {
    try {
      // item
      let item = newItem({ classificationId });
      // 目标
      item.data.target = path;
      // 名称
      item.name = getFileName(item.data.target);
      // 判断是否是快捷方式，如果是的话，需要获取真实路径
      if (mime.getType(path) === "application/x-ms-shortcut") {
        // 快捷方式
        // 获取真实文件路径和参数
        let shortcutInfo: ShortcutInfo | null =
          global.addon.getShortcutFileInfo(path);
        if (shortcutInfo) {
          // 路径
          if (shortcutInfo.target) {
            item.data.target = shortcutInfo.target;
          }
          // 参数
          if (shortcutInfo.arguments) {
            item.data.params = shortcutInfo.arguments;
          }
        }
      }
      // 获取图标
      item.data.icon = await getFileIcon(item.data.target);
      // 获取后缀，判断是否是url
      let ext = extname(item.data.target);
      if (ext && ext.toLowerCase() === ".url") {
        // url
        let url = parseUrlFileContent(readFileSync(item.data.target, "utf-8"));
        if (url && url.trim() !== "") {
          item.data.target = url;
          item.type = 2;
        } else {
          continue;
        }
      } else {
        // 文件类型
        let stats = statSync(item.data.target);
        item.type = stats.isFile() ? 0 : 1;
      }
      // 去掉后缀
      if (item.type === 0 || item.type === 2) {
        item.name = deleteExtname(item.name);
      }
      // push
      itemList.push(item);
    } catch (e) {}
  }
  return itemList;
}

/**
 * 解析.url文件内容以获取URL
 * @param content
 * @returns
 */
function parseUrlFileContent(content: string) {
  if (content) {
    const lines = content.split("\n");
    for (const line of lines) {
      if (line.startsWith("URL=")) {
        const url = line.substring(4).trim();
        return url;
      }
    }
  }
  return null;
}

/**
 * 刷新项目图标
 * @param itemList
 */
async function refreshItemIcon(itemList: Array<Item>) {
  // 返回数据
  let resultList: Array<{
    id: number;
    icon: string;
  }> = [];
  // 刷新图标
  for (const item of itemList) {
    if (item.type === 0 || item.type === 1) {
      let icon: string | null = await getFileIcon(item.data.target);
      if (icon) {
        resultList.push({
          id: item.id,
          icon,
        });
      }
    }
  }
  return resultList;
}

/**
 * 读取文件夹下的项目
 * @param classificationId
 * @param dir
 * @param hiddenItems
 * @param oldList
 * @returns
 */
async function getDirectoryItemList(
  classificationId: number,
  dir: string,
  hiddenItems: string | null,
  oldList: Array<Item>
) {
  // 返回列表
  let resultList: Array<Item> = [];
  // 转map
  let oldMap = new Map(
    oldList.map((item) => [item.data.target.toLowerCase(), item])
  );
  try {
    // 文件类型
    let stats = statSync(dir);
    // 必须是文件夹
    if (stats.isDirectory()) {
      // 转为数组
      let hiddenItemList = [];
      if (hiddenItems && hiddenItems.trim() !== "") {
        hiddenItemList = hiddenItems.split(",");
      }
      // 读取文件夹下面的所有文件
      let nameList = readdirSync(dir);
      for (const name of nameList) {
        try {
          // 判断是否隐藏
          let hidden = false;
          for (let hiddenItem of hiddenItemList) {
            if (hiddenItem.trim().toLowerCase() === name.trim().toLowerCase()) {
              hidden = true;
              break;
            }
          }
          if (hidden) {
            continue;
          }
          // item
          let item: Item | null = null;
          // 组合路径
          let path = join(dir, name);
          // 获取类型 0:文件 1:文件夹
          let type = statSync(path).isDirectory() ? 1 : 0;
          // 是否有旧数据
          if (oldMap.has(path.toLowerCase())) {
            let oldItem = oldMap.get(path.toLowerCase());
            if (oldItem.type === type) {
              item = newItem(oldItem);
            }
          }
          if (!item) {
            item = newItem({ classificationId, type });
            item.name =
              type === 0 ? deleteExtname(getFileName(path)) : getFileName(path);
            item.data.target = path;
            item.data.icon = await getFileIcon(path);
          }
          // push
          resultList.push(item);
        } catch (e) {}
      }
    }
  } catch (e) {}
  return resultList;
}

/**
 * 检查无效项目
 */
function checkInvalidItem(itemList: Array<Item>) {
  // 无效项目ID列表
  let resultList: Array<number> = [];
  // 循环校验每个项目
  for (const item of itemList) {
    // 只校验文件和文件夹
    if (item.type === 0 || item.type === 1) {
      // 获取绝对路径
      let path = parsePath(item.data.target);
      try {
        statSync(path);
      } catch (e) {
        resultList.push(item.id);
      }
    }
  }
  return resultList;
}
