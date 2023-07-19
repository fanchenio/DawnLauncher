import { dialog, ipcMain, Menu } from "electron";
import data from "../data";
import ItemJS from "../item/index";
import cacheData from "../cache/data";
import util from "../util";

/**
 * 删除分类提示
 * @param params
 * @param callback
 */
function classificationDeleteDialog(params, callback) {
  let name = params.classificationChildId != null ? params.classificationChildName : params.classificationParentName;
  dialog
    .showMessageBox(global.mainWindow, {
      message: global.currentLanguage.deleteClassificationMessage,
      buttons: [global.currentLanguage.ok, global.currentLanguage.cancel],
      type: "question",
      noLink: true,
      cancelId: 1,
    })
    .then((r) => {
      if (r.response == 0) {
        callback(params);
      }
    });
}

export default function () {
  // 分类空白处右键菜单
  ipcMain.on("classificationContentRightMenu", (event, args) => {
    let m = Menu.buildFromTemplate([
      {
        label: global.currentLanguage.newClassification,
        click: () => {
          let params = {
            type: 0,
          };
          global.mainWindow.webContents.send("showClassificationAddEditWindow", JSON.stringify(params));
        },
      },
    ]);
    util.menuListen(m);
    m.popup();
  });
  // 某个父级分类上右键菜单
  ipcMain.on("classificationRightMenu", (event, args) => {
    let p = JSON.parse(args);
    let menuList = [
      {
        label: global.currentLanguage.newSubClassification,
        click: () => {
          let params = {
            type: 0,
            parentId: p.classificationParentId,
          };
          global.mainWindow.webContents.send("showClassificationAddEditWindow", JSON.stringify(params));
        },
      },
      { type: "separator" },
      {
        label: global.currentLanguage.newClassification,
        click: () => {
          let params = {
            type: 0,
          };
          global.mainWindow.webContents.send("showClassificationAddEditWindow", JSON.stringify(params));
        },
      },
      { type: "separator" },
    ];
    // 固定分类
    let fixedClassificationData = data.store.get("fixedClassification");
    let selected =
      fixedClassificationData != null &&
      fixedClassificationData.classificationParentId == p.classificationParentId &&
      fixedClassificationData.classificationChildId == null;
    menuList.push({
      label: global.currentLanguage.fixedClassification,
      icon: selected ? util.getDot() : null,
      click: () => {
        if (selected) {
          data.store.set("fixedClassification", null);
        } else {
          data.store.set("fixedClassification", { classificationParentId: p.classificationParentId });
        }
      },
    });
    if (!p.aggregate) {
      menuList.push({
        label: global.currentLanguage.excludeSearch,
        icon: p.excludeSearch ? util.getDot() : null,
        click: () => {
          let params = {
            classificationParentId: p.classificationParentId,
          };
          global.mainWindow.webContents.send("classificationExcludeSearch", JSON.stringify(params));
        },
      });
    }
    menuList.push({ type: "separator" });
    if (!p.haveClassificationChild) {
      if (!p.aggregate) {
        // 关联文件夹
        menuList.push({
          label: global.currentLanguage.associatedFolder,
          click: () => {
            let params = {
              id: p.classificationParentId,
            };
            global.mainWindow.webContents.send("showClassificationAssociatedFolderWindow", JSON.stringify(params));
          },
        });
      }
      if (!p.isMapDirectory) {
        menuList.push({
          label: "聚合分类",
          click: () => {
            let params = {
              id: p.classificationParentId,
            };
            global.mainWindow.webContents.send("showClassificationAggregateWindow", JSON.stringify(params));
          },
        });
      }
      menuList.push({ type: "separator" });
    }
    menuList.push({
      label: global.currentLanguage.setIcon,
      click: () => {
        let params = {
          id: p.classificationParentId,
        };
        global.mainWindow.webContents.send("showSetClassificationIconWindow", JSON.stringify(params));
      },
    });
    menuList.push({
      label: global.currentLanguage.deleteIcon,
      click: () => {
        let params = {
          id: p.classificationParentId,
        };
        global.mainWindow.webContents.send("deleteSetClassificationIcon", JSON.stringify(params));
      },
    });
    menuList.push({ type: "separator" });
    if (!p.aggregate) {
      menuList.push(ItemJS.itemSortMenu(p.classificationParentId, null, p.haveClassificationChild, p.sort));
    }
    menuList.push(...ItemJS.itemLayoutIconSize(p.classificationParentId, p.classificationChildId, p.haveClassificationChild, p.layout, p.iconSize));
    menuList.push(ItemJS.itemShowOnly(p.classificationParentId, null, p.haveClassificationChild, p.showOnly));
    if (
      !p.haveClassificationChild &&
      ((p.layout != null && p.layout == "list") || (global.setting.item.layout == "list" && (p.layout == null || p.layout == "default")))
    ) {
      menuList.push(ItemJS.itemColumnNumber(p.classificationParentId, null, p.haveClassificationChild, p.columnNumber));
    }
    menuList.push({ type: "separator" });
    menuList.push(
      {
        label: global.currentLanguage.edit,
        click: () => {
          let params = {
            type: 1,
            id: p.classificationParentId,
          };
          global.mainWindow.webContents.send("showClassificationAddEditWindow", JSON.stringify(params));
        },
      },
      {
        label: global.currentLanguage.delete,
        click: () => {
          classificationDeleteDialog(p, (p) => {
            let params = {
              id: p.classificationParentId,
            };
            global.mainWindow.webContents.send("classificationDelete", JSON.stringify(params));
          });
        },
      }
    );
    menuList.push({ type: "separator" });
    menuList.push({
      label: p.lockClassification ? global.currentLanguage.unlockClassification : global.currentLanguage.lockClassification,
      click: () => {
        global.mainWindow.webContents.send("setLockClassification", !p.lockClassification);
        cacheData.cacheStore.set("lockClassification", !p.lockClassification);
      },
    });
    let m = Menu.buildFromTemplate(menuList);
    util.menuListen(m);
    m.popup();
  });
  // 某个子级分类上右键菜单
  ipcMain.on("classificationChildRightMenu", (event, args) => {
    let p = JSON.parse(args);
    let menuList = [];
    // 固定分类
    let fixedClassificationData = data.store.get("fixedClassification");
    let selected =
      fixedClassificationData != null &&
      fixedClassificationData.classificationParentId == p.classificationParentId &&
      fixedClassificationData.classificationChildId == p.classificationChildId;
    menuList.push({
      label: global.currentLanguage.fixedClassification,
      icon: selected ? util.getDot() : null,
      click: () => {
        if (selected) {
          data.store.set("fixedClassification", null);
        } else {
          data.store.set("fixedClassification", { classificationParentId: p.classificationParentId, classificationChildId: p.classificationChildId });
        }
      },
    });
    if (!p.aggregate) {
      menuList.push({
        label: global.currentLanguage.excludeSearch,
        icon: p.excludeSearch ? util.getDot() : null,
        click: () => {
          let params = {
            classificationParentId: p.classificationParentId,
            classificationChildId: p.classificationChildId,
          };
          global.mainWindow.webContents.send("classificationExcludeSearch", JSON.stringify(params));
        },
      });
    }
    menuList.push({ type: "separator" });
    if (!p.aggregate) {
      // 关联文件夹
      menuList.push({
        label: global.currentLanguage.associatedFolder,
        click: () => {
          let params = {
            id: p.classificationChildId,
            parentId: p.classificationParentId,
          };
          global.mainWindow.webContents.send("showClassificationAssociatedFolderWindow", JSON.stringify(params));
        },
      });
    }
    if (!p.isMapDirectory) {
      menuList.push({
        label: "聚合分类",
        click: () => {
          let params = {
            id: p.classificationChildId,
            parentId: p.classificationParentId,
          };
          global.mainWindow.webContents.send("showClassificationAggregateWindow", JSON.stringify(params));
        },
      });
    }
    menuList.push({ type: "separator" });
    menuList.push({
      label: global.currentLanguage.setIcon,
      click: () => {
        let params = {
          id: p.classificationChildId,
          parentId: p.classificationParentId,
        };
        global.mainWindow.webContents.send("showSetClassificationIconWindow", JSON.stringify(params));
      },
    });
    menuList.push({
      label: global.currentLanguage.deleteIcon,
      click: () => {
        let params = {
          id: p.classificationChildId,
          parentId: p.classificationParentId,
        };
        global.mainWindow.webContents.send("deleteSetClassificationIcon", JSON.stringify(params));
      },
    });
    menuList.push({ type: "separator" });
    if (!p.aggregate) {
      menuList.push(ItemJS.itemSortMenu(p.classificationParentId, p.classificationChildId, p.haveClassificationChild, p.sort));
    }
    menuList.push(...ItemJS.itemLayoutIconSize(p.classificationParentId, p.classificationChildId, p.haveClassificationChild, p.layout, p.iconSize));
    menuList.push(ItemJS.itemShowOnly(p.classificationParentId, p.classificationChildId, p.haveClassificationChild, p.showOnly));
    if (
      !p.haveClassificationChild &&
      ((p.layout != null && p.layout == "list") || (global.setting.item.layout == "list" && (p.layout == null || p.layout == "default")))
    ) {
      menuList.push(ItemJS.itemColumnNumber(p.classificationParentId, p.classificationChildId, p.haveClassificationChild, p.columnNumber));
    }
    menuList.push({ type: "separator" });
    menuList.push(
      {
        label: global.currentLanguage.edit,
        click: () => {
          let params = {
            type: 1,
            id: p.classificationChildId,
            parentId: p.classificationParentId,
          };
          global.mainWindow.webContents.send("showClassificationAddEditWindow", JSON.stringify(params));
        },
      },
      {
        label: global.currentLanguage.delete,
        click: () => {
          classificationDeleteDialog(p, (p) => {
            let params = {
              id: p.classificationChildId,
              parentId: p.classificationParentId,
            };
            global.mainWindow.webContents.send("classificationDelete", JSON.stringify(params));
          });
        },
      }
    );
    menuList.push({ type: "separator" });
    menuList.push({
      label: p.lockClassification ? global.currentLanguage.unlockClassification : global.currentLanguage.lockClassification,
      click: () => {
        global.mainWindow.webContents.send("setLockClassification", !p.lockClassification);
        cacheData.cacheStore.set("lockClassification", !p.lockClassification);
      },
    });
    let m = Menu.buildFromTemplate(menuList);
    util.menuListen(m);
    m.popup();
  });
  // 获取锁定分类状态
  ipcMain.on("getLockClassification", (event, args) => {
    let lockClassification = cacheData.cacheStore.get("lockClassification");
    event.returnValue = lockClassification == null ? false : lockClassification;
  });
  // 获取固定分类
  ipcMain.on("getFixedClassification", (event, args) => {
    event.returnValue = data.store.get("fixedClassification");
  });
  // 设置固定分类
  ipcMain.on("setFixedClassification", (event, args) => {
    data.store.set("fixedClassification", args);
  });
}
