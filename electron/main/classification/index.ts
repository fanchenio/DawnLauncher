import { BrowserWindow, MenuItem, shell } from "electron";
import { join, basename } from "node:path";
import { getURLParams } from "../../commons/utils";
import {
  add,
  hasChildClassification,
  list,
  selectById,
  update,
  updateData,
} from "./data";
import { watch, statSync, Stats, readdirSync } from "node:fs";
import { getDirectoryList } from "../item";
import { AssociateFolderData } from "../../types/global";
import { Classification } from "../../../types/classification";
import {
  closeWindow,
  getDot,
  getMainBackgorunColor,
  sendToWebContent,
} from "../commons/index";
import { deleteByClassificationId } from "../item/data";

// 窗口
let classificationAddEditWindow: BrowserWindow | null = null;
let classificationSetIconWindow: BrowserWindow | null = null;
let classificationAssociateFolderWindow: BrowserWindow | null = null;
let classificationAggregateWindow: BrowserWindow | null = null;

/**
 * 添加/修改窗口
 * @param id
 * @param parentId
 */
function createAddEditWindow(id: number | null, parentId: number | null) {
  // 如果窗口存在先关闭窗口
  closeWindow(classificationAddEditWindow);
  // 创建窗口
  classificationAddEditWindow = global.classificationAddEditWindow =
    new BrowserWindow({
      title: "Dawn Launcher",
      frame: false,
      parent: global.mainWindow,
      height: 174,
      width: 400,
      maximizable: false,
      minimizable: false,
      resizable: false,
      fullscreenable: false,
      focusable: true,
      show: false,
      transparent: global.setting.appearance.transparency < 1,
      backgroundColor:
        global.setting.appearance.transparency === 1
          ? getMainBackgorunColor()
          : null,
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
  if (parentId) {
    params.set("parentId", parentId);
  }
  if (process.env.VITE_DEV_SERVER_URL) {
    classificationAddEditWindow.loadURL(
      process.env.VITE_DEV_SERVER_URL +
        "Classification/AddEdit" +
        getURLParams(params)
    );
  } else {
    classificationAddEditWindow.loadFile(join(process.env.DIST, "index.html"), {
      hash: "/Classification/AddEdit",
      search: getURLParams(params),
    });
  }
  classificationAddEditWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // 禁用标题栏右键
  classificationAddEditWindow.hookWindowMessage(278, function (e) {
    // 窗口禁用
    classificationAddEditWindow.setEnabled(false);
    // 延时太快会立刻启动，太慢会妨碍窗口其他操作，可自行测试最佳时间
    setTimeout(() => {
      classificationAddEditWindow.setEnabled(true);
    }, 100);
    return true;
  });
}

/**
 * 设置图标窗口
 * @param id
 */
function createSetIconWindow(id: number) {
  // 如果窗口存在先关闭窗口
  closeWindow(classificationSetIconWindow);
  // 创建窗口
  classificationSetIconWindow = global.classificationSetIconWindow =
    new BrowserWindow({
      title: "Dawn Launcher",
      frame: false,
      parent: global.mainWindow,
      height: 500,
      width: 358,
      maximizable: false,
      minimizable: false,
      resizable: false,
      fullscreenable: false,
      focusable: true,
      show: false,
      transparent: global.setting.appearance.transparency < 1,
      backgroundColor:
        global.setting.appearance.transparency === 1
          ? getMainBackgorunColor()
          : null,
      webPreferences: {
        spellcheck: false,
        preload: join(__dirname, "../preload/index.js"),
        devTools: process.env.NODE_ENV === "development",
      },
    });
  // 参数
  let params = new Map();
  params.set("id", id);
  if (process.env.VITE_DEV_SERVER_URL) {
    classificationSetIconWindow.loadURL(
      process.env.VITE_DEV_SERVER_URL +
        "Classification/SetIcon" +
        getURLParams(params)
    );
  } else {
    classificationSetIconWindow.loadFile(join(process.env.DIST, "index.html"), {
      hash: "/Classification/SetIcon",
      search: getURLParams(params),
    });
  }
  classificationSetIconWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // 禁用标题栏右键
  classificationSetIconWindow.hookWindowMessage(278, function (e) {
    // 窗口禁用
    classificationSetIconWindow.setEnabled(false);
    // 延时太快会立刻启动，太慢会妨碍窗口其他操作，可自行测试最佳时间
    setTimeout(() => {
      classificationSetIconWindow.setEnabled(true);
    }, 100);
    return true;
  });
}

/**
 * 关联文件夹窗口
 * @param id
 */
function createAssociateFolderWindow(id: number) {
  // 如果窗口存在先关闭窗口
  closeWindow(classificationAssociateFolderWindow);
  // 创建窗口
  classificationAssociateFolderWindow =
    global.classificationAssociateFolderWindow = new BrowserWindow({
      title: "Dawn Launcher",
      frame: false,
      parent: global.mainWindow,
      height: 249,
      width: 400,
      maximizable: false,
      minimizable: false,
      resizable: false,
      fullscreenable: false,
      focusable: true,
      show: false,
      transparent: global.setting.appearance.transparency < 1,
      backgroundColor:
        global.setting.appearance.transparency === 1
          ? getMainBackgorunColor()
          : null,
      webPreferences: {
        spellcheck: false,
        preload: join(__dirname, "../preload/index.js"),
        devTools: process.env.NODE_ENV === "development",
      },
    });
  // 参数
  let params = new Map();
  params.set("id", id);
  if (process.env.VITE_DEV_SERVER_URL) {
    classificationAssociateFolderWindow.loadURL(
      process.env.VITE_DEV_SERVER_URL +
        "Classification/AssociateFolder" +
        getURLParams(params)
    );
  } else {
    classificationAssociateFolderWindow.loadFile(
      join(process.env.DIST, "index.html"),
      {
        hash: "/Classification/AssociateFolder",
        search: getURLParams(params),
      }
    );
  }
  classificationAssociateFolderWindow.webContents.setWindowOpenHandler(
    ({ url }) => {
      if (url.startsWith("https:")) shell.openExternal(url);
      return { action: "deny" };
    }
  );
  // 禁用标题栏右键
  classificationAssociateFolderWindow.hookWindowMessage(278, function (e) {
    // 窗口禁用
    classificationAssociateFolderWindow.setEnabled(false);
    // 延时太快会立刻启动，太慢会妨碍窗口其他操作，可自行测试最佳时间
    setTimeout(() => {
      classificationAssociateFolderWindow.setEnabled(true);
    }, 100);
    return true;
  });
}

/**
 * 聚合分类窗口
 * @param id
 */
function createAggregateWindow(id: number) {
  // 如果窗口存在先关闭窗口
  closeWindow(classificationAggregateWindow);
  // 创建窗口
  classificationAggregateWindow = global.classificationAggregateWindow =
    new BrowserWindow({
      title: "Dawn Launcher",
      frame: false,
      parent: global.mainWindow,
      height: 144,
      width: 400,
      maximizable: false,
      minimizable: false,
      resizable: false,
      fullscreenable: false,
      focusable: true,
      show: false,
      transparent: global.setting.appearance.transparency < 1,
      backgroundColor:
        global.setting.appearance.transparency === 1
          ? getMainBackgorunColor()
          : null,
      webPreferences: {
        spellcheck: false,
        preload: join(__dirname, "../preload/index.js"),
        devTools: process.env.NODE_ENV === "development",
      },
    });
  // 参数
  let params = new Map();
  params.set("id", id);
  if (process.env.VITE_DEV_SERVER_URL) {
    classificationAggregateWindow.loadURL(
      process.env.VITE_DEV_SERVER_URL +
        "Classification/Aggregate" +
        getURLParams(params)
    );
  } else {
    classificationAggregateWindow.loadFile(
      join(process.env.DIST, "index.html"),
      {
        hash: "/Classification/Aggregate",
        search: getURLParams(params),
      }
    );
  }
  classificationAggregateWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // 禁用标题栏右键
  classificationAggregateWindow.hookWindowMessage(278, function (e) {
    // 窗口禁用
    classificationAggregateWindow.setEnabled(false);
    // 延时太快会立刻启动，太慢会妨碍窗口其他操作，可自行测试最佳时间
    setTimeout(() => {
      classificationAggregateWindow.setEnabled(true);
    }, 100);
    return true;
  });
}

/**
 * 新建文件夹监听
 */
function addAssociateFolderWatcher(
  classificationId: number,
  dir: string,
  hiddenItems: string | null
) {
  // 先删除原有监听
  deleteAssociateFolderWatcher(classificationId);
  // 新建监听
  let data: AssociateFolderData = {
    classificationId,
    dir,
    hiddenItems,
    watch: null,
  };
  // 定时器
  let timer: NodeJS.Timeout | null = null;
  let dirWatch = watch(dir, () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    // 启动定时器，在指定的时间间隔后发送合并后的通知
    timer = setTimeout(() => {
      getDirectoryList(classificationId, dir, hiddenItems, false, true);
      clearTimeout(timer);
      timer = null;
    }, 2000);
  });
  dirWatch.on("error", () => {
    dirWatch.close();
    global.associateFolderWatcher.delete(classificationId);
  });
  // 保存
  data.watch = dirWatch;
  if (!global.associateFolderWatcher) {
    global.associateFolderWatcher = new Map();
  }
  global.associateFolderWatcher.set(classificationId, data);
}

/**
 * 删除关联文件夹监听
 */
function deleteAssociateFolderWatcher(classificationId: number) {
  if (global.associateFolderWatcher) {
    if (global.associateFolderWatcher.has(classificationId)) {
      let data = global.associateFolderWatcher.get(classificationId);
      if (data.watch) {
        data.watch.close();
        data.watch = null;
      }
      global.associateFolderWatcher.delete(classificationId);
    }
  } else {
    global.associateFolderWatcher = new Map();
  }
}

/**
 * 设置关联文件夹
 * @param id
 * @param dir
 * @param hiddenItems
 */
function setAssociateFolder(
  id: number,
  dir: string | null,
  hiddenItems: string | null
) {
  // 查询分类
  let classification = selectById(id);
  if (classification) {
    // 类型
    if (!dir) {
      classification.type = 0;
      classification.data.associateFolderPath = null;
    } else {
      classification.type = 1;
      classification.data.associateFolderPath = dir;
    }
    classification.data.associateFolderHiddenItems = hiddenItems;
    // 更新
    let res = update(classification);
    if (res) {
      // 如果类型为1，开始读取文件夹的文件
      if (classification.type === 1) {
        // 读取文件夹并创建监听
        getDirectoryList(classification.id, dir, hiddenItems, true, true);
      } else {
        // 删除监听
        deleteAssociateFolderWatcher(classification.id);
      }
      return classification;
    }
  }
  return null;
}

/**
 * 初始化关联文件夹
 */
function initAssociateFolder() {
  // 初始化Map
  global.associateFolderWatcher = new Map();
  // 查询分类
  let classificationList = list(null);
  // 初始化
  for (const classification of classificationList) {
    if (classification.type === 1) {
      // 读取文件夹并创建监听
      getDirectoryList(
        classification.id,
        classification.data.associateFolderPath,
        classification.data.associateFolderHiddenItems,
        true,
        true
      );
    }
  }
}

/**
 * 获取项目布局菜单
 * @param classification
 * @returns
 */
function getItemLayoutMenu(classification: Classification) {
  // 是否拥有子级
  let hasChild = hasChildClassification(classification.id);
  // 菜单
  let submenus: any = [
    new MenuItem({
      label: global.language.default,
      icon:
        classification.data.itemLayout === "default" && !hasChild
          ? getDot()
          : null,
      click: () => {
        updateItemLayout(classification, "default");
      },
    }),
    new MenuItem({
      label: global.language.tile,
      icon:
        classification.data.itemLayout === "tile" && !hasChild
          ? getDot()
          : null,
      click: () => {
        updateItemLayout(classification, "tile");
      },
    }),
    new MenuItem({
      label: global.language.list,
      icon:
        classification.data.itemLayout === "list" && !hasChild
          ? getDot()
          : null,
      click: () => {
        updateItemLayout(classification, "list");
      },
    }),
  ];
  return new MenuItem({
    label: global.language.layout,
    submenu: submenus,
  });
}

/**
 * 修改项目布局
 * @param classification
 * @param layout
 */
function updateItemLayout(
  classification: Classification,
  layout: "default" | "tile" | "list"
) {
  let resultList = [];
  // 尝试获取子级分类
  let childList = list(classification.id);
  let idList = [];
  // 如果有子级分类的话，连同子级分类一起修改
  if (childList && childList.length > 0) {
    idList.push(...childList.map((c) => c.id));
  }
  idList.push(classification.id);
  // 修改
  for (const id of idList) {
    // 查询分类
    let classification = selectById(id);
    if (classification) {
      classification.data.itemLayout = layout;
      if (updateData(classification.id, classification.data)) {
        resultList.push({
          id,
          layout,
        });
      }
    }
  }
  // 通知页面
  sendToWebContent("mainWindow", "onUpdateItemLayout", resultList);
}

/**
 * 获取项目排序菜单
 * @param classification
 * @returns
 */
function getItemSortMenu(classification: Classification) {
  // 是否拥有子级
  let hasChild = hasChildClassification(classification.id);
  // 菜单
  let submenus: any = [
    new MenuItem({
      label: global.language.default,
      icon:
        classification.data.itemSort === "default" && !hasChild
          ? getDot()
          : null,
      click: () => {
        updateItemSort(classification, "default");
      },
    }),
    new MenuItem({
      label: global.language.byInitialLetter,
      icon:
        classification.data.itemSort === "initial" && !hasChild
          ? getDot()
          : null,
      click: () => {
        updateItemSort(classification, "initial");
      },
    }),
    new MenuItem({
      label: global.language.byLastOpen,
      icon:
        classification.data.itemSort === "lastOpen" && !hasChild
          ? getDot()
          : null,
      click: () => {
        updateItemSort(classification, "lastOpen");
      },
    }),
  ];
  if (global.setting.item.openNumber) {
    submenus.push(
      new MenuItem({
        label: global.language.byOpenCount,
        icon:
          classification.data.itemSort === "openNumber" && !hasChild
            ? getDot()
            : null,
        click: () => {
          updateItemSort(classification, "openNumber");
        },
      })
    );
  }
  return new MenuItem({
    label: global.language.sort,
    submenu: submenus,
  });
}

/**
 * 修改项目排序
 * @param classification
 * @param sort
 */
function updateItemSort(
  classification: Classification,
  sort: "default" | "initial" | "openNumber" | "lastOpen"
) {
  let resultList = [];
  // 尝试获取子级分类
  let childList = list(classification.id);
  let idList = [];
  // 如果有子级分类的话，连同子级分类一起修改
  if (childList && childList.length > 0) {
    idList.push(...childList.map((c) => c.id));
  }
  idList.push(classification.id);
  // 修改
  for (const id of idList) {
    // 查询分类
    let classification = selectById(id);
    if (classification && classification.type !== 2) {
      classification.data.itemSort = sort;
      if (updateData(classification.id, classification.data)) {
        resultList.push({
          id,
          sort,
        });
      }
    }
  }
  // 通知页面
  sendToWebContent("mainWindow", "onUpdateItemSort", resultList);
}

/**
 * 获取项目列数菜单
 * @param classification
 * @returns
 */
function getItemColumnNumber(classification: Classification) {
  // 菜单
  let submenus: any = [
    new MenuItem({
      label: global.language.default,
      icon: !classification.data.itemColumnNumber ? getDot() : null,
      click: () => {
        updateItemColumnNumber(classification, null);
      },
    }),
  ];
  for (let i = 0; i < 20; i++) {
    submenus.push({
      label: (i + 1).toString(),
      icon:
        classification.data.itemColumnNumber &&
        classification.data.itemColumnNumber === i + 1
          ? getDot()
          : null,
      click: () => {
        updateItemColumnNumber(classification, i + 1);
      },
    });
  }
  return new MenuItem({
    label: global.language.columnNumber,
    submenu: submenus,
  });
}

/**
 * 修改项目列数
 * @param classification
 * @param columnNumber
 */
function updateItemColumnNumber(
  classification: Classification,
  columnNumber: number | null
) {
  // 查询分类
  let curClassification = selectById(classification.id);
  if (curClassification) {
    curClassification.data.itemColumnNumber = columnNumber;
    if (updateData(curClassification.id, curClassification.data)) {
      // 通知页面
      sendToWebContent("mainWindow", "onUpdateItemColumnNumber", {
        id: curClassification.id,
        columnNumber: columnNumber,
      });
    }
  }
}

/**
 * 获取项目图标大小菜单
 * @param classification
 * @returns
 */
function getItemIconSize(classification: Classification) {
  // 是否拥有子级
  let hasChild = hasChildClassification(classification.id);
  // 菜单
  let submenus: any = [
    new MenuItem({
      label: global.language.default,
      icon: !classification.data.itemIconSize && !hasChild ? getDot() : null,
      click: () => {
        updateItemIconSize(classification, null);
      },
    }),
    new MenuItem({
      label: global.language.extraLarge,
      icon:
        classification.data.itemIconSize === 48 && !hasChild ? getDot() : null,
      click: () => {
        updateItemIconSize(classification, 48);
      },
    }),
    new MenuItem({
      label: global.language.large,
      icon:
        classification.data.itemIconSize === 40 && !hasChild ? getDot() : null,
      click: () => {
        updateItemIconSize(classification, 40);
      },
    }),
    new MenuItem({
      label: global.language.medium,
      icon:
        classification.data.itemIconSize === 32 && !hasChild ? getDot() : null,
      click: () => {
        updateItemIconSize(classification, 32);
      },
    }),
    new MenuItem({
      label: global.language.small,
      icon:
        classification.data.itemIconSize === 24 && !hasChild ? getDot() : null,
      click: () => {
        updateItemIconSize(classification, 24);
      },
    }),
  ];
  return new MenuItem({
    label: global.language.icon,
    submenu: submenus,
  });
}

/**
 * 修改项目图标大小
 * @param classification
 * @param iconSize
 */
function updateItemIconSize(
  classification: Classification,
  iconSize: number | null
) {
  let resultList = [];
  // 尝试获取子级分类
  let childList = list(classification.id);
  let idList = [];
  // 如果有子级分类的话，连同子级分类一起修改
  if (childList && childList.length > 0) {
    idList.push(...childList.map((c) => c.id));
  }
  idList.push(classification.id);
  // 修改
  for (const id of idList) {
    // 查询分类
    let classification = selectById(id);
    if (classification) {
      classification.data.itemIconSize = iconSize;
      if (updateData(classification.id, classification.data)) {
        resultList.push({
          id,
          iconSize,
        });
      }
    }
  }
  // 通知页面
  sendToWebContent("mainWindow", "onUpdateItemIconSize", resultList);
}

/**
 * 根据文件夹创建分类
 * @param pathList
 */
function addClassificationByDirectory(pathList: Array<string>) {
  // 返回信息
  let resultList = [];
  // 循环每个路径
  for (let path of pathList) {
    try {
      // 获取文件类型
      let stats: Stats | null = null;
      try {
        stats = statSync(path);
      } catch (e) {
        path = path.replace(" (x86)", "");
        try {
          stats = statSync(path);
        } catch (e) {}
      }
      // 只要文件夹
      if (stats && stats.isDirectory()) {
        // 文件夹名称
        let name = basename(path);
        // 添加分类
        let classification = add(null, name, null, false);
        if (classification) {
          // 读取文件夹下的内容
          let files = readdirSync(path);
          // 组装路径
          let fileList = [];
          for (let file of files) {
            fileList.push(join(path, file));
          }
          // 返回信息
          resultList.push({
            classification,
            fileList,
          });
        }
      }
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.log(e);
      }
    }
  }
  return resultList;
}

/**
 * 获取项目显示菜单
 * @param classification
 * @returns
 */
function getItemShowOnly(classification: Classification) {
  // 是否拥有子级
  let hasChild = hasChildClassification(classification.id);
  // 菜单
  let submenus: any = [
    new MenuItem({
      label: global.language.all,
      icon:
        classification.data.itemShowOnly === "default" && !hasChild
          ? getDot()
          : null,
      click: () => {
        updateItemShowOnly(classification, "default");
      },
    }),
    new MenuItem({
      label: global.language.showOnlyFiles,
      icon:
        classification.data.itemShowOnly === "file" && !hasChild
          ? getDot()
          : null,
      click: () => {
        updateItemShowOnly(classification, "file");
      },
    }),
    new MenuItem({
      label: global.language.showOnlyFolders,
      icon:
        classification.data.itemShowOnly === "folder" && !hasChild
          ? getDot()
          : null,
      click: () => {
        updateItemShowOnly(classification, "folder");
      },
    }),
  ];
  return new MenuItem({
    label: global.language.show,
    submenu: submenus,
  });
}

/**
 * 修改项目显示
 * @param classification
 * @param iconSize
 */
function updateItemShowOnly(
  classification: Classification,
  showOnly: "default" | "file" | "folder"
) {
  let resultList = [];
  // 尝试获取子级分类
  let childList = list(classification.id);
  let idList = [];
  // 如果有子级分类的话，连同子级分类一起修改
  if (childList && childList.length > 0) {
    idList.push(...childList.map((c) => c.id));
  }
  idList.push(classification.id);
  // 修改
  for (const id of idList) {
    // 查询分类
    let classification = selectById(id);
    if (classification) {
      classification.data.itemShowOnly = showOnly;
      if (updateData(classification.id, classification.data)) {
        resultList.push({
          id,
          showOnly,
        });
      }
    }
  }
  // 通知页面
  sendToWebContent("mainWindow", "onUpdateItemShowOnly", resultList);
}

/**
 * 将排序为打开次数的分类修改为默认排序
 */
function updateItemOpenNumberSortToDefualt() {
  let resultList = [];
  // 查询分类
  let classificationList = list();
  // 筛选出来排序是打开次数的分类
  let filterList = classificationList.filter(
    (c) => c.data.itemSort === "openNumber" && (c.type === 0 || c.type === 1)
  );
  // 修改
  for (const classification of filterList) {
    classification.data.itemSort = "default";
    if (updateData(classification.id, classification.data)) {
      resultList.push(classification.id);
    }
  }
  // 通知页面
  sendToWebContent(
    "mainWindow",
    "onUpdateItemOpenNumberSortToDefualt",
    resultList
  );
}

/**
 * 更新聚合分类
 * @param id
 * @param sort
 * @param itemCount
 */
function updateAggregate(
  id: number,
  sort: "default" | "initial" | "openNumber" | "lastOpen",
  itemCount: number
) {
  let classification = selectById(id);
  if (classification) {
    classification.type = 2;
    classification.data.itemSort = sort;
    classification.data.aggregateItemCount = itemCount;
    let res = update(classification);
    if (res) {
      deleteByClassificationId(id);
    }
    return res;
  }
  return false;
}

/**
 * 更新排除搜索
 * @param id
 * @param value
 */
function updateExcludeSearch(id: number, value: boolean) {
  // 查询分类
  let classification = selectById(id);
  if (classification) {
    classification.data.excludeSearch = value;
    updateData(id, classification.data);
  }
}

export {
  createAddEditWindow,
  createSetIconWindow,
  createAssociateFolderWindow,
  createAggregateWindow,
  setAssociateFolder,
  addAssociateFolderWatcher,
  initAssociateFolder,
  deleteAssociateFolderWatcher,
  getItemSortMenu,
  getItemLayoutMenu,
  getItemColumnNumber,
  getItemIconSize,
  addClassificationByDirectory,
  getItemShowOnly,
  updateItemOpenNumberSortToDefualt,
  updateAggregate,
  updateExcludeSearch,
};
