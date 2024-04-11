import { BrowserWindow, shell, dialog, app } from "electron";
import { join, dirname } from "node:path";
import { parsePath, getURLParams } from "../../commons/utils";
import { Item } from "../../../types/item";
import {
  batchAdd,
  deleteByClassificationId,
  list,
  selectById,
  selectByIdList,
  updateData,
  updateOrder,
} from "./data";
import { writeFile, statSync, readFileSync } from "node:fs";
import mime from "mime";
import {
  deleteExtname,
  getItemName,
  isAbsolutePath,
} from "../../../commons/utils/common";
import { iconExts } from "../../commons/utils";
import { addAssociateFolderWatcher } from "../classification";
import {
  closeWindow,
  convertPath,
  getMainBackgorunColor,
  sendToWebContent,
} from "../commons/index";
import { fork } from "../../commons/utilityProcessUtils";
import { exec } from "node:child_process";

// 窗口
let itemAddEditWindow: BrowserWindow | null = null;
let itemNetworkIconWindow: BrowserWindow | null = null;
let itemSVGIconWindow: BrowserWindow | null = null;

/**
 * 添加/修改窗口
 * @param id
 * @param classificationId
 */
async function createAddEditWindow(
  id: number | null,
  classificationId: number | null
) {
  // 如果窗口存在先关闭窗口
  closeWindow(itemAddEditWindow);
  // 创建窗口
  itemAddEditWindow = global.itemAddEditWindow = new BrowserWindow({
    title: "Dawn Launcher",
    frame: false,
    parent: global.mainWindow,
    height: 500,
    width: 600,
    maximizable: false,
    minimizable: false,
    resizable: false,
    fullscreenable: false,
    focusable: true,
    show: false,
    backgroundColor: getMainBackgorunColor(),
    webPreferences: {
      spellcheck: false,
      preload: join(__dirname, "../preload/index.js"),
      devTools: process.env.NODE_ENV === "development",
    },
  });
  // 参数
  let params = new Map();
  if (id) {
    params.set("id", id);
  }
  if (classificationId) {
    params.set("classificationId", classificationId);
  }
  if (process.env.VITE_DEV_SERVER_URL) {
    itemAddEditWindow.loadURL(
      process.env.VITE_DEV_SERVER_URL + "item/AddEdit" + getURLParams(params)
    );
  } else {
    itemAddEditWindow.loadFile(join(process.env.DIST, "index.html"), {
      hash: "/item/AddEdit",
      search: getURLParams(params),
    });
  }
  itemAddEditWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // 禁用标题栏右键
  itemAddEditWindow.hookWindowMessage(278, function (e) {
    // 窗口禁用
    itemAddEditWindow.setEnabled(false);
    // 延时太快会立刻启动，太慢会妨碍窗口其他操作，可自行测试最佳时间
    setTimeout(() => {
      itemAddEditWindow.setEnabled(true);
    }, 100);
    return true;
  });
}

/**
 * 网络图标窗口
 */
async function createNetworkIconWindow() {
  // 如果窗口存在先关闭窗口
  closeWindow(itemNetworkIconWindow);
  // 创建窗口
  itemNetworkIconWindow = global.itemNetworkIconWindow = new BrowserWindow({
    title: "Dawn Launcher",
    frame: false,
    parent: global.itemAddEditWindow,
    height: 230,
    width: 400,
    maximizable: false,
    minimizable: false,
    resizable: false,
    fullscreenable: false,
    focusable: true,
    show: false,
    backgroundColor: getMainBackgorunColor(),
    webPreferences: {
      spellcheck: false,
      preload: join(__dirname, "../preload/index.js"),
      devTools: process.env.NODE_ENV === "development",
    },
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    itemNetworkIconWindow.loadURL(
      process.env.VITE_DEV_SERVER_URL + "item/NetworkIcon"
    );
  } else {
    itemNetworkIconWindow.loadFile(join(process.env.DIST, "index.html"), {
      hash: "/item/NetworkIcon",
    });
  }
  itemNetworkIconWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // 禁用标题栏右键
  itemNetworkIconWindow.hookWindowMessage(278, function (e) {
    // 窗口禁用
    itemNetworkIconWindow.setEnabled(false);
    // 延时太快会立刻启动，太慢会妨碍窗口其他操作，可自行测试最佳时间
    setTimeout(() => {
      itemNetworkIconWindow.setEnabled(true);
    }, 100);
    return true;
  });
}

/**
 * SVG图标窗口
 */
async function createSVGIconWindow() {
  // 如果窗口存在先关闭窗口
  closeWindow(itemSVGIconWindow);
  // 创建窗口
  itemSVGIconWindow = global.itemSVGIconWindow = new BrowserWindow({
    title: "Dawn Launcher",
    frame: false,
    parent: global.itemAddEditWindow,
    height: 230,
    width: 400,
    maximizable: false,
    minimizable: false,
    resizable: false,
    fullscreenable: false,
    focusable: true,
    show: false,
    backgroundColor: getMainBackgorunColor(),
    webPreferences: {
      spellcheck: false,
      preload: join(__dirname, "../preload/index.js"),
      devTools: process.env.NODE_ENV === "development",
    },
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    itemSVGIconWindow.loadURL(process.env.VITE_DEV_SERVER_URL + "item/SVGIcon");
  } else {
    itemSVGIconWindow.loadFile(join(process.env.DIST, "index.html"), {
      hash: "/item/SVGIcon",
    });
  }
  itemSVGIconWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // 禁用标题栏右键
  itemSVGIconWindow.hookWindowMessage(278, function (e) {
    // 窗口禁用
    itemSVGIconWindow.setEnabled(false);
    // 延时太快会立刻启动，太慢会妨碍窗口其他操作，可自行测试最佳时间
    setTimeout(() => {
      itemSVGIconWindow.setEnabled(true);
    }, 100);
    return true;
  });
}

/**
 * 复制项目
 * @param idList
 * @param toClassificationId
 */
function copy(idList: Array<number>, toClassificationId: number) {
  // 返回列表
  let resultList: Array<Item> = [];
  // 查询项目
  let itemList = selectByIdList(false, idList);
  if (itemList.length > 0) {
    // 清空打开信息
    itemList.forEach((item) => clearOpenInfo(item));
    // 批量添加
    resultList = batchAdd(toClassificationId, itemList);
  }
  if (resultList.length > 0) {
    // 通知前端
    sendToWebContent("mainWindow", "onAddItem", {
      itemList: resultList,
      clear: false,
      classificationId: null,
    });
  }
}

/**
 * 复制/移动项目
 * @param idList
 * @param toClassificationId
 */
function move(idList: Array<number>, toClassificationId: number) {
  // 移动项目
  let res = updateOrder(idList, toClassificationId, null);
  if (res) {
    // 通知前端
    sendToWebContent("mainWindow", "onMoveItem", {
      idList,
      toClassificationId,
    });
  }
}

/**
 * 拖入项目
 * @param classificationId
 * @param pathList
 */
function drop(classificationId: number, pathList: Array<string>) {
  fork(
    "getDropItemInfo",
    {
      classificationId,
      pathList,
    },
    (resultList: Array<Item>) => {
      // 添加项目
      let itemList = batchAdd(classificationId, resultList);
      // 发送消息到页面
      sendToWebContent("mainWindow", "onAddItem", {
        itemList,
        clear: false,
        classificationId: null,
      });
    }
  );
}

/**
 * 更新项目打开信息
 * @param type
 * @param id
 */
function updateOpenInfo(type: string, id: number) {
  // 查询项目
  let curItem = selectById(id);
  if (curItem) {
    if (type === "main" || type === "search") {
      // 记录打开信息
      curItem.data.lastOpen = new Date().getTime();
      // 记录打开次数
      if (global.setting.item.openNumber) {
        curItem.data.openNumber += 1;
      }
    } else if (type === "quickSearch") {
      // 记录打开信息
      curItem.data.quickSearchLastOpen = new Date().getTime();
      // 记录打开次数
      curItem.data.quickSearchOpenNumber += 1;
    }
    if (updateData(curItem.id, curItem.data)) {
      sendToWebContent("mainWindow", "onUpdateOpenInfo", {
        id: curItem.id,
        openNumber: curItem.data.openNumber,
        lastOpen: curItem.data.lastOpen,
        quickSearchOpenNumber: curItem.data.quickSearchOpenNumber,
        quickSearchLastOpen: curItem.data.quickSearchLastOpen,
        type,
      });
    }
  }
}

/**
 * 运行
 * @param operation
 * @param file
 * @param params
 * @param startLocation
 */
function execute(
  operation: "open" | "runas",
  file: string,
  params: string | null,
  startLocation: string | null = null
) {
  // 工作目录
  let currentDir = startLocation;
  if (!currentDir || currentDir.trim() === "") {
    try {
      let statRes = statSync(file);
      if (statRes.isDirectory()) {
        currentDir = file;
      } else {
        currentDir = dirname(file);
      }
    } catch (e) {
      currentDir = app.getPath("home");
    }
  }
  // 组装命令
  let cmd: string;
  if (operation === "open") {
    cmd = 'start "" "' + file + '"';
    if (params && params.trim() !== "") {
      let paramsList = analysisParams(params);
      for (const param of paramsList) {
        cmd += ' "' + param + '"';
      }
    }
  } else if (operation === "runas") {
    cmd = "powershell Start-Process";
    cmd += " '\"" + file + "\"' ";
    cmd += "-Verb RunAs";
    if (params && params.trim() !== "") {
      cmd += " -ArgumentList ";
      let paramsList = analysisParams(params);
      for (let i = 0; i < paramsList.length; i++) {
        if (i > 0) {
          cmd += ", ";
        }
        cmd += "'\\\"" + paramsList[i] + "\\\"'";
      }
    }
  }
  // 运行
  exec(cmd, { cwd: currentDir });
}

/**
 * 运行项目
 * @param type
 * @param operation
 * @param item
 */
function run(
  type: string,
  operation: "open" | "runas" | "openFileLocation",
  item: Item
) {
  if (item.data) {
    // 更新打开信息
    updateOpenInfo(type, item.id);
    // 判断类型
    if (item.type === 2) {
      // 网址
      shell.openExternal(item.data.target);
    } else if (item.type === 3 || item.type === 4) {
      if (item.data.target.indexOf("shell:") >= 0) {
        // 带有shell:
        exec("explorer " + item.data.target);
      } else if (item.data.target === "static:TurnOffMonitor") {
        // 关闭显示器
        global.addon.turnOffMonitor();
      } else {
        if (item.type === 3) {
          // 带路径的系统软件
          let path = global.addon.searchPath(item.data.target);
          if (!path || path.trim() === "") {
            path = item.data.target;
          }
          let cmd = 'start "" "' + path + '"';
          if (item.data.params && item.data.params.trim() !== "") {
            let paramsList = analysisParams(item.data.params);
            for (const param of paramsList) {
              cmd += ' "' + param + '"';
            }
          }
          exec(cmd, {
            cwd: app.getPath("home"),
          });
        } else {
          // appx
          execute(
            "open",
            item.data.target,
            item.data.params,
            app.getPath("home")
          );
        }
      }
    } else {
      // 获取绝对路径
      if (item.type === 0 || item.type === 1) {
        // 获取路径
        item.data.target = parsePath(item.data.target);
      }
      if (operation === "openFileLocation") {
        // 打开文件所在位置
        global.addon.openFileLocation(item.data.target);
      } else {
        // 运行
        execute(
          operation,
          item.data.target,
          item.data.params ?? "",
          item.data.startLocation
        );
      }
    }
  }
}

/**
 * 解析参数
 * @param params
 */
function analysisParams(params: string) {
  // res
  let resParams = [];
  // 尝试获取带有双引号的参数
  const values = params.trim().match(/"([^"]*)"/g);
  // 添加到结果列表并替换掉原有字符串
  if (values) {
    values.forEach((v) => {
      resParams.push(v.replace(/"/g, ""));
      params = params.replace(v, "");
    });
  }
  // 按空格切分参数
  let split = params.trim().split(" ");
  split.forEach((v) => {
    if (v.trim() !== "") {
      resParams.push(v);
    }
  });
  // 返回
  return resParams;
}

/**
 * 转换目标路径
 * @param idList
 * @param type
 */
function convertTarget(idList: Array<number>, type: "Absolute" | "Relative") {
  // 返回数据
  let resultList = [];
  // 查询数据
  let itemList = selectByIdList(false, idList);
  for (let item of itemList) {
    // 是否是绝对路径
    let isAbsolute = isAbsolutePath(item.data.target);
    // 如果是绝对路径并且type是Relative，就转为相对路径
    // 如果不是绝对路径并且type是Absolute，就转为绝对路径
    if (
      (isAbsolute && type === "Relative") ||
      (!isAbsolute && type === "Absolute")
    ) {
      // 转换路径
      item.data.target = convertPath(item.data.target);
      // 更新
      updateData(item.id, item.data);
      // push
      resultList.push({
        id: item.id,
        target: item.data.target,
      });
    }
  }
  // 通知页面
  sendToWebContent("mainWindow", "onConvertPath", resultList);
}

/**
 * 导出图标
 * @param item
 */
function exportIcon(item: Item) {
  if (item.data.icon || item.data.htmlIcon) {
    // SVG代码图标
    let svgCode = false;
    // 拓展名
    let extensionName: string | null = null;
    // 内容
    let content: string | null = null;
    if (item.data.htmlIcon && item.data.htmlIcon.trim() !== "") {
      // 保存为SVG图片
      svgCode = true;
      extensionName = "svg";
      content = item.data.htmlIcon.trim();
    } else if (item.data.icon && item.data.icon.trim() !== "") {
      // 提取base64类型
      let re = new RegExp("data:(?<ext>.*?);base64,.*");
      let res = re.exec(item.data.icon);
      if (res && res.groups) {
        // 获取拓展名
        extensionName = mime.getExtension(res.groups.ext);
        if (item.data.icon.trim().split(",").length === 2) {
          content = item.data.icon.trim().split(",")[1];
        }
      }
    }
    // 弹出文件对话框保存
    if (extensionName && content) {
      let path = dialog.showSaveDialogSync(global.mainWindow, {
        defaultPath: "icon",
        filters: [
          {
            name: extensionName,
            extensions: [extensionName],
          },
        ],
      });
      // 保存
      if (path) {
        if (svgCode) {
          writeFile(path, content, function (err) {});
        } else {
          let dataBuffer = Buffer.from(content, "base64");
          writeFile(path, dataBuffer, function (err) {});
        }
      }
    }
  }
}

/**
 * 刷新图标
 * @param idList
 */
function refreshIcon(idList: Array<number>) {
  // 查询项目
  let itemList = selectByIdList(false, idList);
  // 过滤掉固定图标项目
  itemList = itemList.filter((item) => !item.data.fixedIcon);
  // 子进程
  fork(
    "refreshItemIcon",
    itemList,
    (resultList: Array<{ id: number; icon: string }>) => {
      // 项目列表
      let itemList: Array<{ id: number; icon: string }> = [];
      // 更新项目图标
      for (const data of resultList) {
        let item = selectById(data.id);
        if (item) {
          item.data.icon = data.icon;
          item.data.htmlIcon = null;
          let res = updateData(item.id, item.data);
          if (res) {
            itemList.push({
              id: item.id,
              icon: item.data.icon,
            });
          }
        }
      }
      // 发送消息到页面
      sendToWebContent("mainWindow", "onRefreshItemIcon", itemList);
    }
  );
}

/**
 * 创建快捷方式
 * @param item
 */
async function createShortcut(item: Item) {
  let target = item.data.target;
  if (item.type === 0 || item.type === 1) {
    // 获取绝对路径
    target = parsePath(target);
  }
  // 保存路径
  let savePath =
    app.getPath("desktop") +
    "\\" +
    deleteExtname(getItemName(item.name)) +
    ".lnk";
  shell.writeShortcutLink(savePath, "create", {
    target: target,
  });
}

/**
 * 读取文件夹下的项目
 * @param classificationId
 * @param dir
 * @param hiddenItems
 * @param listen 是否创建监听
 * @param clear 是否清空原有项目
 */
function getDirectoryList(
  classificationId: number,
  dir: string | null,
  hiddenItems: string | null,
  listen: boolean,
  clear: boolean
) {
  // 校验目录
  if (!dir || dir.trim() === "") {
    return;
  }
  // 校验是否存在，校验是否是文件夹
  try {
    let stats = statSync(dir);
    if (!stats.isDirectory()) {
      return;
    }
  } catch (e) {
    return;
  }
  // 查询旧数据
  let oldList = list(false, classificationId);
  // 子进程
  fork(
    "getDirectoryItemList",
    {
      classificationId,
      dir,
      hiddenItems,
      oldList,
    },
    (resultList: Array<Item>) => {
      if (clear) {
        // 删除旧数据
        deleteByClassificationId(classificationId);
      }
      // 添加项目
      let itemList = batchAdd(classificationId, resultList, true);
      if (listen) {
        // 创建关联文件夹监听
        addAssociateFolderWatcher(classificationId, dir, hiddenItems);
      }
      if (global.mainWindow && !global.mainWindow.isDestroyed()) {
        // 发送消息到页面
        sendToWebContent("mainWindow", "onAddItem", {
          itemList,
          clear,
          classificationId,
        });
      }
    }
  );
}

/**
 * 获取剪切板图片文件
 */
function getClipboardImageFile() {
  // 获取文件列表
  let fileList: Array<string> = global.addon.getClipboardFileList();
  // 多个文件返回空，单个文件返回文件路径
  if (fileList.length === 1) {
    let filePath = fileList[0];
    // 获取后缀
    let ext = mime.getExtension(mime.getType(filePath));
    if (iconExts.includes(ext)) {
      return filePath;
    }
  }
  return null;
}

/**
 * 粘贴图标
 * @param id
 */
function pasteIcon(id: number | null) {
  if (id) {
    // 查询项目
    let item = selectById(id);
    if (item) {
      // 图标
      let icon = null;
      // 获取剪切板图片文件
      let imageFile = getClipboardImageFile();
      if (imageFile) {
        try {
          // 读取文件
          let buffer = readFileSync(imageFile);
          // 图标
          icon =
            "data:" +
            mime.getType(imageFile) +
            ";base64," +
            buffer.toString("base64");
        } catch (e) {
          if (process.env.NODE_ENV === "development") {
            console.log(e);
          }
        }
      } else {
        let bitmap = global.addon.getClipboardBitmapBase64();
        if (bitmap) {
          icon = bitmap;
        }
      }
      if (icon) {
        item.data.icon = icon;
        // 更新
        updateData(item.id, item.data);
        // 通知页面刷新图标
        sendToWebContent("mainWindow", "onRefreshItemIcon", [
          { id, icon: item.data.icon },
        ]);
      }
    }
  }
}

/**
 * 检查无效项目
 */
function checkInvalid() {
  // 查询项目列表
  let itemList = list();
  // 去掉图标
  for (const item of itemList) {
    item.data.icon = null;
  }
  // 子进程
  fork("checkInvalidItem", itemList, (resultList: Array<number>) => {
    // 发送消息到页面
    sendToWebContent("mainWindow", "onCheckInvalidItem", resultList);
  });
}

/**
 * 清空打开信息
 * @param item
 */
function clearOpenInfo(item: Item) {
  item.data.openNumber = 0;
  item.data.lastOpen = 0;
  item.data.quickSearchOpenNumber = 0;
  item.data.quickSearchLastOpen = 0;
}

/**
 * 删除历史记录
 * @param itemId
 */
function deleteQuickSearchHistory(itemId: number) {
  // 查询
  let item = selectById(itemId);
  if (item) {
    // 重置历史记录
    item.data.quickSearchLastOpen = 0;
    item.data.quickSearchOpenNumber = 0;
    // 更新
    updateData(itemId, item.data);
    // 通知主页面
    sendToWebContent("mainWindow", "onUpdateOpenInfo", {
      id: itemId,
      quickSearchOpenNumber: item.data.quickSearchOpenNumber,
      quickSearchLastOpen: item.data.quickSearchLastOpen,
      type: "quickSearch",
    });
    // 通知快速搜索页面
    sendToWebContent("quickSearchWindow", "onUpdateOpenInfo", {
      id: itemId,
      quickSearchOpenNumber: item.data.quickSearchOpenNumber,
      quickSearchLastOpen: item.data.quickSearchLastOpen,
    });
  }
}

export {
  createAddEditWindow,
  createNetworkIconWindow,
  createSVGIconWindow,
  copy,
  move,
  drop,
  updateOpenInfo,
  run,
  convertTarget,
  exportIcon,
  refreshIcon,
  createShortcut,
  getDirectoryList,
  getClipboardImageFile,
  pasteIcon,
  checkInvalid,
  deleteQuickSearchHistory,
  execute,
};
