import { shell, dialog, app } from "electron";
import path from "path";
import fs from "fs";
import util from "../util";
import { v4 } from "uuid";
import Jimp from "jimp";
import ClassificationJS from "../classification/index.js";
import data from "../data";
const { exec } = require("child_process");

/**
 * 校验无效项目
 * @param itemList
 */
function checkInvalidItemList(itemList) {
  let list = [];
  if (!util.arrayIsEmpty(itemList)) {
    for (let item of itemList) {
      // 只校验文件和文件夹
      if (item.type == 0 || item.type == 1) {
        // 获取绝对路径
        item.path = getAbsolutePath(item.path);
        try {
          fs.statSync(item.path);
        } catch (e) {
          if (item.classificationParentId != null) {
            list.push(item.classificationParentId + "-" + item.classificationId + "-" + item.id);
          } else {
            list.push(item.classificationId + "-" + item.id);
          }
        }
      }
    }
  }
  return list;
}

/**
 * 校验无效项目
 * @returns {*[]}
 */
function checkInvalidItem() {
  let list = [];
  for (let c of global.list) {
    if (!util.arrayIsEmpty(c.childList)) {
      for (let cc of c.childList) {
        if (util.strIsEmpty(cc.mapDirectory)) {
          list.push(...checkInvalidItemList(cc.itemList));
        }
      }
    } else {
      if (util.strIsEmpty(c.mapDirectory)) {
        list.push(...checkInvalidItemList(c.itemList));
      }
    }
  }
  return list;
}

/**
 * 解析环境变量
 * @param p
 */
function parseEnvPath(p) {
  // 尝试解析环境变量
  let parsedPath = path.parse(p);
  let isBase = false;
  let dirArr;
  if (util.strIsEmpty(parsedPath.dir)) {
    dirArr = parsedPath.base.split("\\");
    isBase = true;
  } else {
    dirArr = parsedPath.dir.split("\\");
  }
  let newPathArr = [];
  const pattern = /^%.*%$/;
  for (let string of dirArr) {
    if (pattern.test(string)) {
      let nString = string.substring(1, string.length - 1);
      if (!util.strIsEmpty(process.env[nString])) {
        newPathArr.push(process.env[nString]);
      } else {
        newPathArr.push(string);
      }
    } else {
      newPathArr.push(string);
    }
  }
  if (!isBase) {
    newPathArr.push(parsedPath.base);
  }
  return newPathArr.join("\\");
}

/**
 * 是否是绝对路径
 * @param p
 */
function isAbsolutePath(p) {
  const regex = /^[a-zA-Z]:\\/;
  return regex.test(p);
}

/**
 * 获取绝对路径
 * @param path
 */
function getAbsolutePath(p) {
  if (!isAbsolutePath(p)) {
    // 尝试解析环境变量
    let newPath = parseEnvPath(p);
    // 判断解析之后的路径是否是绝对路径
    if (isAbsolutePath(newPath)) {
      return newPath;
    } else {
      return path.resolve(process.env.NODE_ENV !== "production" ? path.resolve(".") : path.dirname(process.execPath), p);
    }
  }
  return p;
}

/**
 * 运行项目
 * @param item
 * @param location 是否打开文件所在的位置
 * @param openWith 打开方式
 */
function itemRun(item, location, openWith) {
  // 系统
  if (item.type == 3) {
    if (item.shell.indexOf("shell:") >= 0) {
      shell.openExternal(item.shell);
    } else {
      if (item.shell == "cmd") {
        if (item.admin) {
          exec('powershell -Command "Start-Process cmd -Verb RunAs"', (error, stdout, stderr) => {});
        } else {
          exec("start cmd.exe", (error, stdout, stderr) => {});
        }
      } else if (item.shell == "turnOffMonitor") {
        global.api.TurnOffMonitor();
      } else {
        exec(item.shell, (error, stdout, stderr) => {});
      }
    }
    return;
  } else if (item.type == 5) {
    exec("start " + item.shell, (error, stdout, stderr) => {});
    return;
  }
  // 如果是类型是0或者1并且是相对路径的话，恢复为绝对路径
  if (item.type == 0 || item.type == 1) {
    // 获取路径
    item.path = getAbsolutePath(item.path);
  }
  let t = item.path;
  let params = !util.strIsEmpty(item.params) ? item.params.trim() : "";
  if (openWith != null && openWith && item.type == 0) {
    exec("RUNDLL32.EXE SHELL32.DLL,OpenAs_RunDLL " + t + "", (error, stdout, stderr) => {});
  } else {
    let type = "open";
    if (item.type == 0) {
      if (location) {
        // 如果是打开文件所在位置
        exec('start %windir%\\explorer.exe /select, "' + item.path + '"', (error, stdout, stderr) => {});
        return;
      } else {
        // 以管理员身份运行
        if (item.admin && (item.extension == ".exe" || item.extension == ".bat")) {
          type = "runas";
        }
      }
    } else if (item.type == 2) {
      // 网址
      t = item.url;
    }
    if (item.type == 0 || item.type == 1) {
      // 判断文件或文件夹是否存在
      try {
        fs.accessSync(t);
        global.api.RunItem(type, t, params, item.type == 0 && !util.strIsEmpty(item.startLocation) ? item.startLocation : path.dirname(item.path));
      } catch (e) {
        let message;
        if (item.type == 0 && !location) {
          message = global.currentLanguage.notFoundFileMessage;
        } else {
          message = global.currentLanguage.notFoundFolderMessage;
        }
        message += '"' + t + '"。';
        dialog.showMessageBox(global.mainWindow, {
          title: "Dawn Launcher",
          message: message,
          buttons: [global.currentLanguage.ok],
          type: "error",
          noLink: true,
        });
      }
    } else {
      global.api.RunItem(type, t, params, null);
    }
  }
}

/**
 * 返回排序菜单
 * @param classificationParentId
 * @param classificationChildId
 * @param haveClassificationChild
 * @param sort
 */
function itemSortMenu(classificationParentId, classificationChildId, haveClassificationChild, sort) {
  let submenu = [
    {
      label: global.currentLanguage.default,
      click: () => {
        let params = {
          classificationParentId: classificationParentId,
          classificationChildId: classificationChildId,
          sort: "default",
        };
        global.mainWindow.webContents.send("itemSort", JSON.stringify(params));
      },
      icon: (sort == null || sort == "default") && !haveClassificationChild ? util.getDot() : null,
    },
    {
      label: global.currentLanguage.byInitial,
      type: "normal",
      click: () => {
        let params = {
          classificationParentId: classificationParentId,
          classificationChildId: classificationChildId,
          sort: "initial",
        };
        global.mainWindow.webContents.send("itemSort", JSON.stringify(params));
      },
      icon: sort != null && sort == "initial" ? util.getDot() : null,
    },
  ];
  if (global.setting.item.openNumber) {
    submenu.push({
      label: global.currentLanguage.byOpenNumber,
      type: "normal",
      click: () => {
        let params = {
          classificationParentId: classificationParentId,
          classificationChildId: classificationChildId,
          sort: "openNumber",
        };
        global.mainWindow.webContents.send("itemSort", JSON.stringify(params));
      },
      icon: sort != null && sort == "openNumber" ? util.getDot() : null,
    });
  }
  return {
    label: global.currentLanguage.sort,
    type: "submenu",
    submenu: submenu,
  };
}

/**
 * 返回布局和图标大小
 * @param classificationParentId
 * @param classificationChildId
 * @param haveClassificationChild
 * @param layout
 * @param iconSize
 */
function itemLayoutIconSize(classificationParentId, classificationChildId, haveClassificationChild, layout, iconSize) {
  let menuList = [
    {
      label: global.currentLanguage.layout,
      type: "submenu",
      submenu: [
        {
          label: global.currentLanguage.default,
          click: () => {
            let params = {
              classificationParentId: classificationParentId,
              classificationChildId: classificationChildId,
              type: "default",
            };
            global.mainWindow.webContents.send("itemTile", JSON.stringify(params));
          },
          icon: (layout == null || layout == "default") && !haveClassificationChild ? util.getDot() : null,
        },
        {
          label: global.currentLanguage.tile,
          click: () => {
            let params = {
              classificationParentId: classificationParentId,
              classificationChildId: classificationChildId,
              type: "tile",
            };
            global.mainWindow.webContents.send("itemTile", JSON.stringify(params));
          },
          icon: layout != null && layout == "tile" ? util.getDot() : null,
        },
        {
          label: global.currentLanguage.list,
          click: () => {
            let params = {
              classificationParentId: classificationParentId,
              classificationChildId: classificationChildId,
              type: "list",
            };
            global.mainWindow.webContents.send("itemTile", JSON.stringify(params));
          },
          icon: layout != null && layout == "list" ? util.getDot() : null,
        },
      ],
    },
  ];
  menuList.push({
    label: global.currentLanguage.iconSize,
    type: "submenu",
    submenu: [
      {
        label: global.currentLanguage.default,
        click: () => {
          let params = {
            classificationParentId: classificationParentId,
            classificationChildId: classificationChildId,
            type: null,
          };
          global.mainWindow.webContents.send("itemIconSize", JSON.stringify(params));
        },
        icon: iconSize == null && !haveClassificationChild ? util.getDot() : null,
      },
      {
        label: global.currentLanguage.extraLarge,
        click: () => {
          let params = {
            classificationParentId: classificationParentId,
            classificationChildId: classificationChildId,
            type: 48,
          };
          global.mainWindow.webContents.send("itemIconSize", JSON.stringify(params));
        },
        icon: iconSize != null && iconSize == 48 ? util.getDot() : null,
      },
      {
        label: global.currentLanguage.large,
        click: () => {
          let params = {
            classificationParentId: classificationParentId,
            classificationChildId: classificationChildId,
            type: 40,
          };
          global.mainWindow.webContents.send("itemIconSize", JSON.stringify(params));
        },
        icon: iconSize != null && iconSize == 40 ? util.getDot() : null,
      },
      {
        label: global.currentLanguage.medium,
        click: () => {
          let params = {
            classificationParentId: classificationParentId,
            classificationChildId: classificationChildId,
            type: 32,
          };
          global.mainWindow.webContents.send("itemIconSize", JSON.stringify(params));
        },
        icon: iconSize != null && iconSize == 32 ? util.getDot() : null,
      },
      {
        label: global.currentLanguage.small,
        click: () => {
          let params = {
            classificationParentId: classificationParentId,
            classificationChildId: classificationChildId,
            type: 24,
          };
          global.mainWindow.webContents.send("itemIconSize", JSON.stringify(params));
        },
        icon: iconSize != null && iconSize == 24 ? util.getDot() : null,
      },
    ],
  });
  return menuList;
}

/**
 * 返回显示菜单
 * @param classificationParentId
 * @param classificationChildId
 * @param haveClassificationChild
 * @param showOnly
 */
function itemShowOnly(classificationParentId, classificationChildId, haveClassificationChild, showOnly) {
  let submenu = [
    {
      label: global.currentLanguage.default,
      click: () => {
        let params = {
          classificationParentId: classificationParentId,
          classificationChildId: classificationChildId,
          showOnly: "default",
        };
        global.mainWindow.webContents.send("itemShowOnly", JSON.stringify(params));
      },
      icon: (showOnly == null || showOnly == "default") && !haveClassificationChild ? util.getDot() : null,
    },
    {
      label: global.currentLanguage.showOnlyFiles,
      type: "normal",
      click: () => {
        let params = {
          classificationParentId: classificationParentId,
          classificationChildId: classificationChildId,
          showOnly: "file",
        };
        global.mainWindow.webContents.send("itemShowOnly", JSON.stringify(params));
      },
      icon: showOnly != null && showOnly == "file" ? util.getDot() : null,
    },
    {
      label: global.currentLanguage.showOnlyFolders,
      type: "normal",
      click: () => {
        let params = {
          classificationParentId: classificationParentId,
          classificationChildId: classificationChildId,
          showOnly: "folder",
        };
        global.mainWindow.webContents.send("itemShowOnly", JSON.stringify(params));
      },
      icon: showOnly != null && showOnly == "folder" ? util.getDot() : null,
    },
  ];
  return {
    label: global.currentLanguage.show,
    type: "submenu",
    submenu: submenu,
  };
}

/**
 * 返回列数菜单
 * @param classificationParentId
 * @param classificationChildId
 * @param haveClassificationChild
 * @param columnNumber
 */
function itemColumnNumber(classificationParentId, classificationChildId, haveClassificationChild, columnNumber) {
  let submenu = [
    {
      label: global.currentLanguage.default,
      click: () => {
        let params = {
          classificationParentId: classificationParentId,
          classificationChildId: classificationChildId,
          columnNumber: 0,
        };
        global.mainWindow.webContents.send("itemColumnNumber", JSON.stringify(params));
      },
      icon: (columnNumber == null || columnNumber == 0) && !haveClassificationChild ? util.getDot() : null,
    },
  ];
  for (let i = 0; i < 20; i++) {
    submenu.push({
      label: (i + 1).toString(),
      click: () => {
        let params = {
          classificationParentId: classificationParentId,
          classificationChildId: classificationChildId,
          columnNumber: i + 1,
        };
        global.mainWindow.webContents.send("itemColumnNumber", JSON.stringify(params));
      },
      icon: columnNumber != null && columnNumber == i + 1 ? util.getDot() : null,
    });
  }
  return {
    label: global.currentLanguage.numberOfColumns,
    type: "submenu",
    submenu: submenu,
  };
}

/**
 * 获取文件图标
 * @param target
 * @param message
 */
async function getFileIcon(target, message) {
  // 获取绝对路径
  target = getAbsolutePath(target);
  let size = 256;
  try {
    // 先获取一下文件判断是否存在，不存在抛出异常
    let stats = fs.statSync(target);
    // 图标临时地址
    let tempPath = app.getPath("temp") + "\\" + v4() + ".png";
    // 获取图标
    let result = global.api.GetFileIcon(target, tempPath, size);
    // 1为成功
    if (result == 1) {
      // 读取图标文件
      let buffer = fs.readFileSync(tempPath);
      // 如果透明区域占比大于80代表这个图标没有超大图标，那么就获取48*48图标
      let tempResult = await Jimp.read(tempPath);
      let zero = 0;
      let color = 0;
      for (const { x, y, image } of tempResult.scanIterator(0, 0, tempResult.bitmap.width, tempResult.bitmap.height)) {
        if (image.getPixelColor(x, y) == 0) {
          zero++;
        } else {
          color++;
        }
      }
      // 计算占比
      let proportion = Math.round((zero / (zero + color)) * 100);
      // 删除临时文件
      fs.unlink(tempPath, (err) => {});
      // 透明区域大于80，获取48*48图标
      if (proportion >= 80) {
        // 图标临时地址
        tempPath = app.getPath("temp") + "\\" + v4() + ".png";
        // 获取48*48图标
        result = global.api.GetFileIcon(target, tempPath, 48);
        // 1成功
        if (result == 1) {
          // 读取图标文件
          buffer = fs.readFileSync(tempPath);
          // 删除文件
          fs.unlink(tempPath, (err) => {});
        }
      }
      // 图标
      let base64 = "data:image/png;base64," + buffer.toString("base64");
      // 返回base64
      return base64;
    }
  } catch (e) {
    if (message) {
      dialog.showMessageBox(global.mainWindow, {
        title: "Dawn Launcher",
        message: global.currentLanguage.targetNotExist + '"' + target + '"。',
        buttons: [global.currentLanguage.ok],
        type: "error",
        noLink: true,
        cancelId: 1,
      });
    }
  }
  return null;
}

/**
 * 新建文件夹监听
 */
function addMapDirectoryWatcher(classificationParentId, classificationChildId, mapDirectory) {
  // key
  let key = classificationParentId + (classificationChildId != null ? "-" + classificationChildId : "");
  // 先删除原有监听
  deleteMapDirectoryWatcher(classificationParentId, classificationChildId);
  // 新建监听
  let data = {
    classificationParentId: classificationParentId,
    classificationChildId: classificationChildId,
    mapDirectory: mapDirectory,
  };
  let timer;
  let watch = fs.watch(mapDirectory, (event, filename) => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    // 启动定时器，在指定的时间间隔后发送合并后的通知
    timer = setTimeout(() => {
      readMapDirectory(classificationParentId, classificationChildId, mapDirectory, false, true, true);
      clearTimeout(timer);
      timer = null;
    }, 1000);
  });
  watch.on("error", (error) => {
    watch.close();
    global.mapDirectoryWatcher.delete(key);
  });
  // 保存
  data.watch = watch;
  global.mapDirectoryWatcher.set(key, data);
}

/**
 * 删除文件夹监听
 */
function deleteMapDirectoryWatcher(classificationParentId, classificationChildId) {
  // 判断是否存在
  let key = classificationParentId + (classificationChildId != null ? "-" + classificationChildId : "");
  let watcherData = global.mapDirectoryWatcher.get(key);
  if (watcherData != null) {
    // 存在
    if (watcherData.watch != null && watcherData.watch) {
      watcherData.watch.close();
      watcherData.watch = null;
    }
    global.mapDirectoryWatcher.delete(key);
  }
}

/**
 * 读取映射文件夹内容
 * @param classificationParentId
 * @param classificationChildId
 * @param mapDirectory
 * @param listener
 * @param old
 * @param notice
 */
async function readMapDirectory(classificationParentId, classificationChildId, mapDirectory, listener, old, notice) {
  let itemList = [];
  try {
    // 判断是否含有环境变量
    mapDirectory = parseEnvPath(mapDirectory);
    // 获取图标数据
    let iconData = data.store.get("iconData");
    let iconDataMap = new Map();
    // 转为Map
    if (!util.arrayIsEmpty(iconData)) {
      for (let icon of iconData) {
        iconDataMap.set(util.getKey(icon.classificationParentId, icon.classificationChildId, icon.itemId), icon);
      }
    }
    // 文件类型
    let stats = fs.statSync(mapDirectory);
    // 必须是文件夹
    if (stats.isDirectory()) {
      // 获取旧列表
      let oldItemList = [];
      let hiddenItem;
      // 分类
      let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
      if (classification != null) {
        if (old != null && old) {
          oldItemList = classification.itemList;
        }
        hiddenItem = classification.hiddenItem;
      }
      // 转为数组
      let hiddenItemArr = [];
      if (!util.strIsEmpty(hiddenItem)) {
        hiddenItemArr = hiddenItem.split(",");
      }
      // 读取文件夹下面的所有文件
      let pathList = fs.readdirSync(mapDirectory);
      let i = 1;
      for (let p of pathList) {
        try {
          // 判断是否隐藏
          let flag = false;
          for (let item of hiddenItemArr) {
            if (item != null && p == item.trim()) {
              flag = true;
              break;
            }
          }
          if (flag) {
            continue;
          }
          // 组合路径
          let np = path.join(mapDirectory, p);
          // 获取类型 0:文件 1:文件夹
          let type = fs.statSync(np).isDirectory() ? 1 : 0;
          // 如果旧数据有的话，获取旧数据
          let icon;
          let openNumber;
          let lastOpen;
          let quickSearchOpenNumber;
          let quickSearchLastOpen;
          if (!util.arrayIsEmpty(oldItemList)) {
            for (let oldItem of oldItemList) {
              if (
                (type == 0 && oldItem.name == util.removeSuffix(p) && oldItem.path == np && oldItem.type == type) ||
                (type == 1 && oldItem.name == p && oldItem.path == np && oldItem.type == type)
              ) {
                // 通过旧数据获取图标
                let oldIcon = iconDataMap.get(util.getKey(classificationParentId, classificationChildId, oldItem.id));
                if (oldIcon != null) {
                  icon = oldIcon.icon;
                }
                openNumber = oldItem.openNumber;
                lastOpen = oldItem.lastOpen;
                quickSearchOpenNumber = oldItem.quickSearchOpenNumber;
                quickSearchLastOpen = oldItem.quickSearchLastOpen;
                break;
              }
            }
          }
          let item = {
            // id
            id: i++,
            // 路径
            path: np,
            // 名称
            name: type == 1 ? p : util.removeSuffix(p),
            // 全称
            fullName: p,
            // 图标
            icon: icon != null ? icon : await getFileIcon(np, false),
            // 类型 0:文件 1:文件夹
            type: type,
            // 打开次数
            openNumber: openNumber,
            // 最近打开
            lastOpen: lastOpen,
            // 快速搜索 打开次数
            quickSearchOpenNumber: quickSearchOpenNumber,
            // 快速搜索 最近打开
            quickSearchLastOpen: quickSearchLastOpen,
          };
          itemList.push(item);
        } catch (e) {
          if (process.env.NODE_ENV !== "production") {
            console.log(e);
          }
        }
      }
      if (listener != null && listener) {
        // 新建监听
        addMapDirectoryWatcher(classificationParentId, classificationChildId, mapDirectory);
      }
      if (notice) {
        let params = {
          classificationParentId: classificationParentId,
          classificationChildId: classificationChildId,
          itemList: itemList,
          clear: true,
        };
        // 添加项目
        global.mainWindow.webContents.send("itemAdd", JSON.stringify(params));
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.log(e);
    }
  }
  return itemList;
}

/**
 * 初始化映射文件夹
 */
async function initMapDirectory() {
  let list = [];
  for (let c of global.list) {
    if (util.arrayIsEmpty(c.childList)) {
      // 没有子级
      if (!util.strIsEmpty(c.mapDirectory)) {
        let { classificationParentId, classificationChildId } = ClassificationJS.convertClassificationId(c.id, c.parentId);
        let itemList = await readMapDirectory(classificationParentId, classificationChildId, c.mapDirectory, true, true, false);
        list.push({
          classificationParentId: classificationParentId,
          itemList: itemList,
        });
      }
    } else {
      for (let cc of c.childList) {
        if (!util.strIsEmpty(cc.mapDirectory)) {
          let { classificationParentId, classificationChildId } = ClassificationJS.convertClassificationId(cc.id, cc.parentId);
          let itemList = await readMapDirectory(classificationParentId, classificationChildId, cc.mapDirectory, true, true, false);
          list.push({
            classificationParentId: classificationParentId,
            classificationChildId: classificationChildId,
            itemList: itemList,
          });
        }
      }
    }
  }
  return list;
}

export default {
  checkInvalidItem,
  isAbsolutePath,
  getAbsolutePath,
  itemRun,
  itemSortMenu,
  itemLayoutIconSize,
  itemShowOnly,
  itemColumnNumber,
  getFileIcon,
  addMapDirectoryWatcher,
  readMapDirectory,
  deleteMapDirectoryWatcher,
  initMapDirectory,
};
