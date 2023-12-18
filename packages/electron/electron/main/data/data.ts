import Database from "better-sqlite3-multiple-ciphers";
import {
  getCustomDataSqlite3,
  getDataSqlite3,
} from "../../commons/betterSqlite3";
import Store from "electron-store";
import { extname, parse } from "node:path";
import {
  newClassification,
  newClassificationData,
  newItem,
  newItemData,
} from "../../../commons/utils/common";
import { add as addClassification } from "../classification/data";
import { add as addItem } from "../item/data";
import { getSetting } from "../../../commons/utils/setting";
import { add as addSetting } from "../setting/data";

/**
 * 恢复数据
 * @param filePath
 */
function restore(filePath: string) {
  // 获取文件后缀
  let ext = extname(filePath);
  if (ext.toLowerCase() === ".db") {
    // 数据库文件
    return databaseRestore(filePath);
  } else if (ext.toLowerCase() === ".json") {
    // 旧版JSON
    return jsonRestore(filePath);
  }
  return false;
}

/**
 * 数据库恢复数据
 * @param filePath
 * @returns
 */
function databaseRestore(filePath: string) {
  try {
    // 获取导入DB
    let importDB = getCustomDataSqlite3(filePath);
    // 查询分类数据
    let classificationList = importDB
      .prepare("SELECT * FROM classification")
      .all();
    // 查询项目数据
    let itemList = importDB.prepare("SELECT * FROM item").all();
    // 查询设置数据
    let setting = importDB.prepare("SELECT * FROM setting").all();
    // 查询ID索引表数据
    let sequence = importDB.prepare("SELECT * FROM sqlite_sequence").all();
    // 获取当前DB
    let db = getDataSqlite3();
    // 开启事务
    db.transaction(() => {
      // 清空并导入数据
      clearAndInsert(db, "classification", classificationList);
      clearAndInsert(db, "item", itemList);
      clearAndInsert(db, "setting", setting);
      clearAndInsert(db, "sqlite_sequence", sequence);
    })();
    return true;
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.log(e);
    }
  }
  return false;
}

/**
 * 清空并插入数据
 * @param tableName
 * @param list
 */
function clearAndInsert(
  db: Database.Database,
  tableName: string,
  list: Array<any>
) {
  // 清空数据
  db.prepare(`DELETE FROM ${tableName}`).run();
  // 插入数据
  list.forEach((row) => {
    const keys = Object.keys(row);
    const columns = keys.map((key) => `\`${key}\``);
    const placeholders = keys.map(() => "?").join(",");
    const values = keys.map((key) => row[key]);
    db.prepare(
      `INSERT INTO ${tableName} (${columns.join(",")}) VALUES (${placeholders})`
    ).run(values);
  });
}

/**
 * JSON恢复数据
 * @param filePath
 * @returns
 */
function jsonRestore(filePath: string) {
  try {
    // 获取当前DB
    let db = getDataSqlite3();
    // 解析路径
    let pathParse = parse(filePath);
    // 读取JSON
    const store = new Store({
      name: pathParse.name,
      cwd: pathParse.dir,
      fileExtension: pathParse.ext.replace(".", ""),
      encryptionKey: "0b52eb58-4c0f-5ff1-b062-031546a8d269",
    });
    // 开启事务
    db.transaction(() => {
      // 图标数据
      let iconData = store.get("iconData") as Array<any>;
      // 清空数据
      db.prepare(`DELETE FROM classification`).run();
      db.prepare(`DELETE FROM item`).run();
      db.prepare(`DELETE FROM setting`).run();
      db.prepare(`DELETE FROM sqlite_sequence`).run();
      // 导入数据
      let list = store.get("list") as Array<any>;
      if (list && list.length > 0) {
        for (let i = 0; i < list.length; i++) {
          let parent = list[i];
          // 添加分类
          let classification = jsonAddClassification(parent, null);
          if (classification) {
            if (parent.childList && parent.childList.length > 0) {
              // 子分类
              for (let j = 0; j < parent.childList.length; j++) {
                const child = parent.childList[j];
                let childClassification = jsonAddClassification(
                  child,
                  classification.id
                );
                if (
                  childClassification &&
                  child.itemList &&
                  child.itemList.length > 0
                ) {
                  // 项目
                  for (let k = 0; k < child.itemList.length; k++) {
                    jsonAddItem(
                      child.itemList[k],
                      child,
                      childClassification.id,
                      iconData
                    );
                  }
                }
              }
            } else {
              if (parent.itemList && parent.itemList.length > 0) {
                // 项目
                for (let k = 0; k < parent.itemList.length; k++) {
                  jsonAddItem(
                    parent.itemList[k],
                    parent,
                    classification.id,
                    iconData
                  );
                }
              }
            }
          }
        }
      }
      // 设置
      if (store.get("setting")) {
        jsonAddSetting(store.get("setting"));
      }
    })();
    return true;
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.log(e);
    }
  }
  return false;
}

/**
 * 添加分类
 * @param oldClassification
 * @param parentId
 * @returns
 */
function jsonAddClassification(
  oldClassification: any,
  parentId: number | null
) {
  // 排序
  let itemSort: "default" | "initial" | "openNumber" | "lastOpen" = "default";
  // 如果是聚合分类的话，获取聚合分类排序，否则就获取普通排序
  if (
    oldClassification.aggregateSort &&
    oldClassification.aggregateSort.trim() != "" &&
    (oldClassification.aggregateSort == "initial" ||
      oldClassification.aggregateSort == "openNumber" ||
      oldClassification.aggregateSort == "lastOpen")
  ) {
    // 聚合分类
    itemSort = oldClassification.aggregateSort;
  } else if (
    oldClassification.sort == "initial" ||
    oldClassification.sort == "openNumber" ||
    oldClassification.sort == "lastOpen"
  ) {
    // 普通
    itemSort = oldClassification.sort;
  }
  let data = newClassificationData({
    icon: oldClassification.icon,
    excludeSearch: oldClassification.excludeSearch,
    itemLayout:
      oldClassification.layout == "tile" || oldClassification.layout == "list"
        ? oldClassification.layout
        : "default",
    itemSort: itemSort,
    itemColumnNumber: oldClassification.columnNumber,
    itemIconSize: oldClassification.iconSize,
    itemShowOnly:
      oldClassification.showOnly == "file" ||
      oldClassification.showOnly == "folder"
        ? oldClassification.showOnly
        : "default",
    associateFolderHiddenItems: oldClassification.hiddenItem,
    associateFolderPath: oldClassification.mapDirectory,
    aggregateItemCount: oldClassification.aggregateItemNumber,
  });
  // 类型 0:普通分类 1:关联文件夹 2:聚合分类
  let type = 0;
  if (
    oldClassification.mapDirectory &&
    oldClassification.mapDirectory.trim() != ""
  ) {
    // 关联文件夹
    type = 1;
  } else if (
    oldClassification.aggregateSort &&
    oldClassification.aggregateSort.trim() != ""
  ) {
    // 聚合分类
    type = 2;
  }
  let classification = newClassification({
    parentId,
    name: oldClassification.name,
    type,
    data,
    shortcutKey: oldClassification.shortcutKey,
    globalShortcutKey: oldClassification.globalShortcutKey,
  });
  return addClassification(
    classification.parentId,
    classification.name,
    classification.shortcutKey,
    classification.globalShortcutKey,
    classification.data,
    classification.type
  );
}

/**
 * 添加项目
 * @param oldItem
 * @param oldClassification
 * @param classificationId
 * @param iconData
 */
function jsonAddItem(
  oldItem: any,
  oldClassification: any,
  classificationId: number,
  iconData: Array<any>
) {
  // 类型
  let type = oldItem.type;
  if (type == 4) {
    type = 5;
  } else if (type == 5) {
    type = 4;
  }
  // 多项目不导入
  if (type == 5) {
    return null;
  }
  // 合并目标
  let target = oldItem.path;
  if (oldItem.url && oldItem.url.trim() != "") {
    // 网址
    target = oldItem.url;
  } else if (oldItem.shell && oldItem.shell.trim() != "") {
    // 系统
    target = oldItem.shell;
  }
  // 图标
  let icon = oldItem.icon;
  if (iconData) {
    for (let i = 0; i < iconData.length; i++) {
      const data = iconData[i];
      if (oldClassification.parentId) {
        if (
          data.classificationParentId == oldClassification.parentId &&
          data.classificationChildId == oldClassification.id &&
          data.itemId == oldItem.id &&
          data.icon &&
          data.icon.trim() != ""
        ) {
          icon = data.icon;
        }
      } else {
        if (
          data.classificationParentId == oldClassification.id &&
          data.itemId == oldItem.id &&
          data.icon &&
          data.icon.trim() != ""
        ) {
          icon = data.icon;
        }
      }
    }
  }
  let data = newItemData({
    startLocation: oldItem.startLocation,
    target,
    params: oldItem.params,
    runAsAdmin: oldItem.admin,
    icon,
    htmlIcon:
      !oldItem.htmlIcon || oldItem.htmlIcon.trim() == ""
        ? null
        : oldItem.htmlIcon,
    remark: oldItem.remark,
    iconBackgroundColor: oldItem.useAppxBackgroundColor,
    fixedIcon: oldItem.notRefreshIcon,
    openNumber: oldItem.openNumber,
    lastOpen: oldItem.lastOpen,
    quickSearchOpenNumber: oldItem.quickSearchOpenNumber,
    quickSearchLastOpen: oldItem.quickSearchLastOpen,
  });
  let item = newItem({
    classificationId,
    name: oldItem.name,
    type,
    data,
    shortcutKey: oldItem.shortcutKey,
    globalShortcutKey: oldItem.globalShortcutKey,
  });
  return addItem(item, false);
}

/**
 * 添加设置
 * @param oldSetting
 */
function jsonAddSetting(oldSetting: any) {
  let setting = getSetting(null);
  // 常规
  if (oldSetting.general) {
    setting.general.startup = oldSetting.general.startup;
    setting.general.startupTray = oldSetting.general.startupTray;
    setting.general.showHideShortcutKey =
      oldSetting.general.showHideShortcutKey;
    setting.general.alwaysTop = oldSetting.general.alwaysTop;
    setting.general.edgeAutoHide = oldSetting.general.edgeAutoHide;
    setting.general.lockSize = oldSetting.general.lockSize;
    setting.general.hideLoseFocus = oldSetting.general.hideLosingFocus;
    setting.general.hideTray = oldSetting.general.hideTray;
    setting.general.showHideMouseWheelClick =
      oldSetting.general.showHideMouseWheelClick;
    setting.general.fixedPosition = oldSetting.general.fixedPosition;
    setting.general.alwaysCenter = oldSetting.general.alwaysCenter;
    setting.general.showFollowMousePosition =
      oldSetting.general.showFollowMousePosition;
    setting.general.notDisturb = oldSetting.general.notDisturb;
    setting.general.showHideDoubleClickTaskbar =
      oldSetting.general.doubleClickTaskbar;
    setting.general.delayDisplayMs = oldSetting.general.delayDisplayMS;
    setting.general.delayHideMs = oldSetting.general.delayHidingMS;
    setting.general.switchEnglish = oldSetting.general.switchEnglish;
    if (oldSetting.item) {
      setting.general.searchShowHideShortcutKey =
        oldSetting.item.searchShortcutKey;
    }
  }
  // 分类
  if (oldSetting.classification) {
    setting.classification.width = oldSetting.classification.width;
    setting.classification.layout = oldSetting.classification.layout;
    setting.classification.mouseHover = oldSetting.classification.mouseHover;
    setting.classification.mouseHoverMs =
      oldSetting.classification.mouseHoverMS;
    setting.classification.mouseWheel = oldSetting.classification.mouseWheel;
    setting.classification.rememberSelectionState =
      oldSetting.classification.rememberSelectionState;
    setting.classification.nameAlign = oldSetting.classification.nameAlign;
    setting.classification.mode = oldSetting.classification.mode;
    setting.classification.autoSwitchClassification =
      oldSetting.classification.autoSwitchClassification;
    setting.classification.hideWindowCollapseSubClassification =
      oldSetting.classification.hideWindowFoldChildClassification;
    setting.classification.switchClassificationCollapseOtherSubClassification =
      oldSetting.classification.switchClassificationCollapseOtherSubClassification;
  }
  // 项目
  if (oldSetting.item) {
    setting.item.layout = oldSetting.item.layout;
    setting.item.iconSize = oldSetting.item.iconSize;
    setting.item.doubleClickOpen = oldSetting.item.doubleClickRunItem;
    setting.item.openAfterHideMainInterface =
      oldSetting.item.openAfterHideMainInterface;
    setting.item.useItemOpen = oldSetting.item.useItemOpen;
    setting.item.openNumber = oldSetting.item.openNumber;
    setting.item.hideItemName = oldSetting.item.hideItemName;
    setting.item.hideEllipsis = oldSetting.item.hideEllipsis;
    setting.item.itemNameRowCount = oldSetting.item.itemNameRowCount;
    setting.item.width = oldSetting.item.width;
    setting.item.columnNumber = oldSetting.item.columnNumber;
    setting.item.checkInvalidItem = oldSetting.item.checkInvalidItem;
    setting.item.fontSize = oldSetting.item.fontSize;
    setting.item.fontWeight = oldSetting.item.fontWeight;
    setting.item.fontLineHeight = oldSetting.item.fontLineHeight;
  }
  // 子分类
  if (oldSetting.subClassification) {
    setting.subClassification.itemAreaNameFontSize =
      oldSetting.subClassification.itemAreaNameFontSize;
    setting.subClassification.itemAreaNameFontWeight =
      oldSetting.subClassification.itemAreaNameFontWeight;
    setting.subClassification.itemAreaNameFontLineHeight =
      oldSetting.subClassification.itemAreaNameFontLineHeight;
  }
  // 快速搜索
  if (oldSetting.quickSearch) {
    setting.quickSearch.enable = oldSetting.quickSearch.enable;
    setting.quickSearch.showHideShortcutKey =
      oldSetting.quickSearch.showHideShortcutKey;
    setting.quickSearch.openShortcutKey =
      oldSetting.quickSearch.openShortcutKey;
    setting.quickSearch.hideLoseFocus = oldSetting.quickSearch.hideLosingFocus;
    setting.quickSearch.openNow = oldSetting.quickSearch.openNow;
    setting.quickSearch.showHistory = oldSetting.quickSearch.showHistory;
    setting.quickSearch.showHistorySort =
      oldSetting.quickSearch.showHistorySort;
    setting.quickSearch.useItemOpen = oldSetting.quickSearch.useItemOpen;
    setting.quickSearch.openAfterHideQuickSearchWindow =
      oldSetting.quickSearch.openAfterHideQuickSearchWindow;
    setting.quickSearch.matchConditionsRemark =
      oldSetting.quickSearch.matchingConditionsRemark;
  }
  // 网络搜索
  if (oldSetting.webSearch) {
    setting.webSearch.mode = oldSetting.webSearch.mode;
    if (oldSetting.webSearch.searchSourceList) {
      setting.webSearch.searchSourceList = [];
      for (let i = 0; i < oldSetting.webSearch.searchSourceList.length; i++) {
        const oldSearchSource = oldSetting.webSearch.searchSourceList[i];
        setting.webSearch.searchSourceList.push({
          id: oldSearchSource.id,
          keyword: oldSearchSource.keyword,
          name: oldSearchSource.name,
          url: oldSearchSource.URL,
          description: oldSearchSource.description,
        });
      }
    }
  }
  // 网络
  if (oldSetting.network) {
    setting.network.useProxy = oldSetting.network.useProxy;
    if (oldSetting.network.proxy) {
      setting.network.proxy.address = oldSetting.network.proxy.address;
      setting.network.proxy.username = oldSetting.network.proxy.username;
      setting.network.proxy.password = oldSetting.network.proxy.password;
    }
  }
  return addSetting(getSetting(setting));
}

export { restore };
