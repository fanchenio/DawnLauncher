import { Menu, MenuItem, ipcMain } from "electron";
import { Classification } from "../../../types/classification";
import {
  createAddEditWindow,
  createAssociateFolderWindow,
  createSetIconWindow,
  getItemLayoutMenu,
  getItemSortMenu,
  getItemColumnNumber,
  setAssociateFolder,
  getItemIconSize,
  addClassificationByDirectory,
  getItemShowOnly,
  createAggregateWindow,
  updateAggregate,
  updateExcludeSearch,
} from "./index";
import {
  add,
  del,
  list,
  selectById,
  update,
  updateOrder,
  updateIcon,
  hasChildClassification,
  batchUpdateFixed,
} from "./data";
import { setShortcutKey } from "../setting";
import {
  closeWindow,
  getDot,
  sendToWebContent,
  showMessageBoxSync,
} from "../commons/index";

export default function () {
  // 获取分类列表
  ipcMain.on("getClassificationList", (event) => {
    event.returnValue = list(null);
  });
  // 根据ID查询分类
  ipcMain.on("getClassificationById", (event, args) => {
    event.returnValue = selectById(args.id);
  });
  // 添加分类
  ipcMain.on("addClassification", (event, args) => {
    let classification = add(
      args.parentId,
      args.name,
      args.shortcutKey,
      args.globalShortcutKey
    );
    setShortcutKey();
    event.returnValue = classification;
  });
  // 更新分类
  ipcMain.on("updateClassification", (event, args) => {
    let res = update(args);
    setShortcutKey();
    event.returnValue = res;
  });
  // 更新序号
  ipcMain.on("updateClassificationOrder", (event, args) => {
    event.returnValue = updateOrder(args.fromId, args.toId, args.parentId);
  });
  // 更新图标
  ipcMain.on("updateClassificationIcon", (event, args) => {
    event.returnValue = updateIcon(args.id, args.icon);
  });
  // 显示新增/修改窗口
  ipcMain.on("showClassificationAddEditWindow", () => {
    if (global.classificationAddEditWindow) {
      global.classificationAddEditWindow.show();
    }
  });
  // 关闭新增/修改窗口
  ipcMain.on("closeClassificationAddEditWindow", () => {
    closeWindow(global.classificationAddEditWindow);
  });
  // 显示设置图标窗口
  ipcMain.on("showClassificationSetIconWindow", () => {
    if (global.classificationSetIconWindow) {
      global.classificationSetIconWindow.show();
    }
  });
  // 关闭设置图标窗口
  ipcMain.on("closeClassificationSetIconWindow", () => {
    closeWindow(global.classificationSetIconWindow);
  });
  // 右键菜单
  ipcMain.on("showClassificationRightMenu", (event, args) => {
    // 锁定/解锁分类
    let lockClassification: boolean = args.lockClassification;
    // 分类
    let classification: Classification | null = args.classification;
    // 菜单
    let menuList: Array<MenuItem> = [];
    // 组装菜单
    if (!classification) {
      menuList.push(
        new MenuItem({
          label: global.language.newClassification,
          click: () => {
            // 创建窗口
            createAddEditWindow(null, null);
          },
        }),
        new MenuItem({ type: "separator" }),
        new MenuItem({
          label: !lockClassification
            ? global.language.lockClassification
            : global.language.unlockClassification,
          click: () => {
            sendToWebContent("mainWindow", "onLockClassification", []);
          },
        })
      );
    } else {
      if (!classification.parentId && classification.type === 0) {
        menuList.push(
          new MenuItem({
            label: global.language.newSubclassification,
            click: () => {
              // 创建窗口
              createAddEditWindow(null, classification.id);
            },
          }),
          new MenuItem({ type: "separator" })
        );
      }
      menuList.push(
        new MenuItem({
          label: global.language.fixedClassification,
          icon: classification.data.fixed ? getDot() : null,
          click: () => {
            batchUpdateFixed(
              classification.data.fixed ? null : classification.id
            );
            sendToWebContent(
              "mainWindow",
              "onUpdateClassificationFixed",
              classification.data.fixed ? null : classification.id
            );
          },
        })
      );
      if (classification.type === 0 || classification.type === 1) {
        menuList.push(
          new MenuItem({
            label: global.language.excludeSearch,
            icon: classification.data.excludeSearch ? getDot() : null,
            click: () => {
              updateExcludeSearch(
                classification.id,
                !classification.data.excludeSearch
              );
              sendToWebContent(
                "mainWindow",
                "onUpdateClassificationExcludeSearch",
                {
                  id: classification.id,
                  value: !classification.data.excludeSearch,
                }
              );
            },
          })
        );
      }
      menuList.push(new MenuItem({ type: "separator" }));
      menuList.push(
        new MenuItem({
          label: global.language.setIcon,
          click: () => {
            // 创建窗口
            createSetIconWindow(classification.id);
          },
        }),
        new MenuItem({
          label: global.language.deleteIcon,
          click: () => {
            let res = updateIcon(classification.id, null);
            if (res) {
              sendToWebContent("mainWindow", "onUpdateClassificationIcon", {
                id: classification.id,
                icon: null,
              });
            }
          },
        })
      );
      // 子分类、没有子分类的父级分类可以显示
      if (
        classification.parentId ||
        (!classification.parentId && !hasChildClassification(classification.id))
      ) {
        menuList.push(new MenuItem({ type: "separator" }));
        if (classification.type === 0 || classification.type === 1) {
          menuList.push(
            new MenuItem({
              label: global.language.associateFolder,
              click: () => {
                // 创建窗口
                createAssociateFolderWindow(classification.id);
              },
            })
          );
        }
        if (classification.type === 0 || classification.type === 2) {
          menuList.push(
            new MenuItem({
              label: global.language.aggregateClassification,
              click: () => {
                // 创建窗口
                createAggregateWindow(classification.id);
              },
            })
          );
        }
      }
      // 分割线
      menuList.push(new MenuItem({ type: "separator" }));
      if (classification.type !== 2) {
        // 排序
        menuList.push(getItemSortMenu(classification));
      }
      // 布局
      menuList.push(getItemLayoutMenu(classification));
      // 列数
      if (
        !hasChildClassification(classification.id) &&
        (classification.data.itemLayout === "list" ||
          (global.setting.item.layout === "list" &&
            classification.data.itemLayout === "default"))
      ) {
        // 只有子级分类或没有子级分类的父级分类并且布局是列表的才显示列数
        menuList.push(getItemColumnNumber(classification));
      }
      // 图标
      menuList.push(getItemIconSize(classification));
      // 显示
      menuList.push(getItemShowOnly(classification));
      // 编辑/删除
      menuList.push(
        new MenuItem({ type: "separator" }),
        new MenuItem({
          label: global.language.edit,
          click: () => {
            // 创建窗口
            createAddEditWindow(classification.id, null);
          },
        }),
        new MenuItem({
          label: global.language.delete,
          click: () => {
            let res = showMessageBoxSync(
              "mainWindow",
              global.language.deleteClassificationPrompt,
              "question",
              [global.language.ok, global.language.cancel]
            );
            if (res === 0) {
              // 删除数据
              if (del(classification.id)) {
                // 快捷键
                setShortcutKey();
                // 通知前端删除数据
                sendToWebContent(
                  "mainWindow",
                  "onDeleteClassification",
                  classification.id
                );
              }
            }
          },
        })
      );
    }
    // 载入菜单
    let menu = Menu.buildFromTemplate(menuList);
    // 菜单显示
    menu.on("menu-will-show", () => {
      global.classificationRightMenu = true;
    });
    // 菜单关闭
    menu.on("menu-will-close", () => {
      global.classificationRightMenu = false;
    });
    // 显示
    menu.popup();
  });
  // 显示关联文件夹窗口
  ipcMain.on("showClassificationAssociateFolderWindow", () => {
    if (global.classificationAssociateFolderWindow) {
      global.classificationAssociateFolderWindow.show();
    }
  });
  // 关闭关联文件夹窗口
  ipcMain.on("closeClassificationAssociateFolderWindow", () => {
    closeWindow(global.classificationAssociateFolderWindow);
  });
  // 设置关联文件夹
  ipcMain.on("setClassificationAssociateFolder", (event, args) => {
    // 分类ID
    let id: number = args.id;
    // 文件夹路径
    let dir: string | null = args.dir;
    if (!dir || dir.trim() === "") {
      dir = null;
    }
    // 隐藏项
    let hiddenItems: string | null = args.hiddenItems;
    // 设置
    event.returnValue = setAssociateFolder(id, dir, hiddenItems);
  });
  // 是否拥有子分类
  ipcMain.on("hasChildClassification", (event, args) => {
    event.returnValue = hasChildClassification(args);
  });
  // 根据文件夹创建分类
  ipcMain.on("addClassificationByDirectory", (event, args) => {
    let res = addClassificationByDirectory(args);
    // 通知页面
    sendToWebContent("mainWindow", "onAddClassificationByDirectory", res);
  });
  // 显示聚合分类窗口
  ipcMain.on("showClassificationAggregateWindow", () => {
    if (global.classificationAggregateWindow) {
      global.classificationAggregateWindow.show();
    }
  });
  // 关闭聚合分类窗口
  ipcMain.on("closeClassificationAggregateWindow", () => {
    closeWindow(global.classificationAggregateWindow);
  });
  // 更新聚合分类
  ipcMain.on("updateClassificationAggregate", (event, args) => {
    event.returnValue = updateAggregate(args.id, args.sort, args.itemCount);
  });
}
