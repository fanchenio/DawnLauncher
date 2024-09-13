import {
  Menu,
  MenuItem,
  ipcMain,
  clipboard,
  MenuItemConstructorOptions,
} from "electron";
import { parsePath } from "../../commons/utils";
import {
  convertTarget,
  createAddEditWindow,
  createNetworkIconWindow,
  createSVGIconWindow,
  createShortcut,
  drop,
  exportIcon,
  refreshIcon,
  run,
  copy,
  move,
  getClipboardImageFile,
  pasteIcon,
  updateOpenInfo,
  deleteQuickSearchHistory,
} from ".";
import {
  getAppxItemList,
  getStartMenuItemList,
  getSystemItemList,
} from "./commons";
import { add, del, list, selectById, update, updateOrder } from "./data";
import { Item } from "../../../types/item";
import { getFileExtname, isAbsolutePath } from "../../../commons/utils/common";
import {
  list as selectClassificationList,
  selectById as selectClassificationById,
  hasChildClassification,
} from "../classification/data";
import { getWindowInScreen } from "../main/index";
import {
  getItemLayoutMenu,
  getItemSortMenu,
  getItemColumnNumber,
  getItemIconSize,
  getItemShowOnly,
} from "../classification";
import { join } from "node:path";
import { setShortcutKey } from "../setting";
import {
  closeWindow,
  openAfterHideWindow,
  sendToWebContent,
  showMessageBoxSync,
} from "../commons/index";

/**
 * 获取复制/移动菜单
 * @param idList
 * @param type
 * @returns
 */
function getCopyMoveMenuItems(
  idList: Array<number>,
  type: "MoveItem" | "CopyItem"
) {
  // 菜单
  let menuItems: Array<MenuItemConstructorOptions> = [];
  // 查询分类
  let classificationList = selectClassificationList(null);
  for (const parent of classificationList) {
    if (parent.parentId || parent.type !== 0) {
      continue;
    }
    let submenus: Array<MenuItemConstructorOptions> = [];
    // 子分类
    for (const child of classificationList) {
      if (parent.id === child.parentId && child.type === 0) {
        submenus.push({
          label: child.name,
          click: () => {
            if (type === "CopyItem") {
              copy(idList, child.id);
            } else {
              move(idList, child.id);
            }
          },
        });
      }
    }
    if (submenus.length > 0) {
      menuItems.push({
        label: parent.name,
        submenu: submenus,
      });
    } else {
      menuItems.push({
        label: parent.name,
        click: () => {
          if (type === "CopyItem") {
            copy(idList, parent.id);
          } else {
            move(idList, parent.id);
          }
        },
      });
    }
  }
  return menuItems;
}

export default function () {
  // 显示新增/修改窗口
  ipcMain.on("showItemAddEditWindow", () => {
    if (global.itemAddEditWindow) {
      global.itemAddEditWindow.show();
    }
  });
  // 关闭新增/修改窗口
  ipcMain.on("closeItemAddEditWindow", () => {
    closeWindow(global.itemAddEditWindow);
  });
  // 获取项目列表
  ipcMain.on("getItemList", (event) => {
    event.returnValue = list();
  });
  // 获取简单项目列表
  ipcMain.on("getSimpleItemList", (event) => {
    event.returnValue = list(true);
  });
  // 根据ID查询项目
  ipcMain.on("getItemById", (event, args) => {
    event.returnValue = selectById(args.id);
  });
  // 添加项目
  ipcMain.on("addItem", (event, args) => {
    let item = add(args);
    setShortcutKey();
    event.returnValue = item;
  });
  // 更新项目
  ipcMain.on("updateItem", (event, args) => {
    let res = update(args);
    setShortcutKey();
    event.returnValue = res;
  });
  // 项目排序
  ipcMain.on("updateItemOrder", (event, args) => {
    event.returnValue = updateOrder(
      args.fromIdList,
      args.toClassificationId,
      args.newIndex
    );
  });
  // 右键菜单
  ipcMain.on("showItemRightMenu", (event, args) => {
    // 类型 main:主界面 search:搜索模块
    let type: string = args.type;
    // 项目
    let item: Item | null = args.item;
    // 锁定/解锁项目
    let lockItem: boolean = type === "main" ? args.lockItem : false;
    // 批量操作
    let batchOperation: boolean = type === "main" ? args.batchOperation : false;
    // 批量操作ID列表
    let batchSelectedIdList: Array<number> =
      type === "main" ? args.batchSelectedIdList : [];
    // 分类ID
    let classificationId: number =
      type === "main" ? args.classificationId : item.classificationId;
    // 查询分类信息
    let classification = selectClassificationById(classificationId);
    if (!classification) {
      return;
    }
    // 鼠标位置
    let point = global.addon.getCursorPoint();
    // 菜单
    let menuList: Array<MenuItem> = [];
    // 组装菜单
    if (!batchOperation) {
      if (item) {
        // 查询页面分类信息
        let pageClassification = selectClassificationById(
          args.pageClassificationId
        );
        if (!pageClassification && type === "main") {
          return;
        }
        // 后缀
        let ext: string | null = null;
        // 排除
        if (item.type === 0) {
          ext = getFileExtname(item.data.target);
        }
        // "打开"菜单
        let openMenu = false;
        if (
          (item.type === 0 &&
            global.addon.hasRunas(parsePath(item.data.target))) ||
          item.type === 4 ||
          (item.type === 3 && item.data.target === "cmd.exe")
        ) {
          menuList.push(
            new MenuItem({
              label: global.language.runAsAdministrator,
              click: () => {
                // 运行
                run(type, "runas", item);
                openAfterHideWindow(type);
              },
            })
          );
          openMenu = true;
        }
        if (item.type === 0 || item.type === 1) {
          menuList.push(
            new MenuItem({
              label: global.language.openFileLocation,
              click: () => {
                // 运行
                run(type, "openFileLocation", item);
                openAfterHideWindow(type);
              },
            })
          );
          openMenu = true;
        }
        if (item.type === 3 && item.data.target === "shell:RecycleBinFolder") {
          menuList.push(
            new MenuItem({
              label: global.language.emptyRecycleBin,
              click: () => {
                global.addon.emptyRecycleBin(
                  global.mainWindow.getNativeWindowHandle().readInt32LE(0)
                );
              },
            })
          );
          openMenu = true;
        }
        if (
          item.type === 0 ||
          item.type === 1 ||
          (item.type === 3 && item.data.target.indexOf("shell:") >= 0)
        ) {
          menuList.push(
            new MenuItem({
              label: global.language.explorerMenu,
              click: () => {
                // 获取当前窗口所在屏幕
                let display = getWindowInScreen(
                  type === "main" ? global.mainWindow : global.quickSearchWindow
                );
                let scaleFactor = 1;
                if (display && display.length > 0) {
                  scaleFactor = display[0].scaleFactor;
                }
                // 弹出资源管理器菜单
                sendToWebContent(
                  type === "quickSearch" ? "quickSearchWindow" : "mainWindow",
                  "onItemExplorerMenu",
                  {
                    type: type,
                    id: item.id,
                  }
                );
                // 禁用鼠标HOOK
                global.addon.disableMouseHook();
                // 弹出资源管理器菜单
                global.addon.explorerContextMenu(
                  (type === "main"
                    ? global.mainWindow
                    : global.quickSearchWindow
                  )
                    .getNativeWindowHandle()
                    .readInt32LE(0),
                  item.type === 0 || item.type === 1
                    ? parsePath(item.data.target)
                    : item.data.target,
                  point[0],
                  point[1]
                );
                // 开启鼠标HOOK
                global.addon.enableMouseHook();
                sendToWebContent(
                  type === "quickSearch" ? "quickSearchWindow" : "mainWindow",
                  "onItemRightMenuClose",
                  {}
                );
              },
            })
          );
          openMenu = true;
        }
        if (openMenu) {
          menuList.push(new MenuItem({ type: "separator" }));
        }
        // "路径"菜单
        let pathMenu = false;
        if (item.type === 0 || item.type === 1 || item.type === 2) {
          menuList.push(
            new MenuItem({
              label: global.language.copyFullPath,
              click: () => {
                clipboard.writeText(
                  item.type === 0 || item.type === 1
                    ? parsePath(item.data.target)
                    : item.data.target
                );
              },
            })
          );
          pathMenu = true;
        }
        if (
          type === "main" &&
          (item.type === 0 || item.type === 1) &&
          classification.type === 0 &&
          pageClassification.type === 0
        ) {
          menuList.push(
            new MenuItem({
              label: isAbsolutePath(item.data.target)
                ? global.language.convertRelativePath
                : global.language.convertAbsolutePath,
              click: () => {
                convertTarget(
                  [item.id],
                  isAbsolutePath(item.data.target) ? "Relative" : "Absolute"
                );
              },
            })
          );
          pathMenu = true;
        }
        if (item.type === 0 || item.type === 1) {
          menuList.push(
            new MenuItem({
              label: global.language.createShortcut,
              click: () => {
                createShortcut(item);
              },
            })
          );
          pathMenu = true;
        }
        if (pathMenu) {
          menuList.push(new MenuItem({ type: "separator" }));
        }
        if (
          type === "main" &&
          classification.type === 0 &&
          pageClassification.type === 0
        ) {
          // "图标"菜单
          let existPasteIcon = false;
          // 获取剪切板图片文件
          let imageFile = getClipboardImageFile();
          if (imageFile) {
            existPasteIcon = true;
          } else {
            // 判断剪切板中的BITMAP是否存在
            let hasBitmap = global.addon.clipboardHasBitmap();
            if (hasBitmap) {
              existPasteIcon = true;
            }
          }
          if (existPasteIcon) {
            menuList.push(
              new MenuItem({
                label: global.language.pasteIcon,
                click: () => {
                  pasteIcon(item.id);
                },
              })
            );
          }
        }
        menuList.push(
          new MenuItem({
            label: global.language.exportIcon,
            click: () => {
              exportIcon(item);
            },
          })
        );
        if (
          type === "main" &&
          (item.type === 0 || item.type === 1) &&
          !item.data.fixedIcon &&
          classification.type === 0 &&
          pageClassification.type === 0
        ) {
          menuList.push(
            new MenuItem({
              label: global.language.refreshIcon,
              click: () => {
                refreshIcon([item.id]);
              },
            })
          );
        }
        if (
          type === "main" &&
          classification.type === 0 &&
          pageClassification.type === 0
        ) {
          menuList.push(new MenuItem({ type: "separator" }));
          menuList.push(
            new MenuItem({
              label: global.language.moveTo,
              submenu: getCopyMoveMenuItems([item.id], "MoveItem"),
            })
          );
          menuList.push(
            new MenuItem({
              label: global.language.copyTo,
              submenu: getCopyMoveMenuItems([item.id], "CopyItem"),
            })
          );
          menuList.push(new MenuItem({ type: "separator" }));
          // 项目通用
          menuList.push(
            new MenuItem({
              label: global.language.edit,
              click: () => {
                // 创建窗口
                createAddEditWindow(item.id, null);
              },
            }),
            new MenuItem({
              label: global.language.delete,
              click: () => {
                let res = showMessageBoxSync(
                  "mainWindow",
                  global.language.deleteItemPrompt,
                  "question",
                  [global.language.ok, global.language.cancel]
                );
                if (res === 0) {
                  // 删除数据
                  del(item.id);
                  // 快捷键
                  setShortcutKey();
                  // 通知前端删除数据
                  sendToWebContent("mainWindow", "onDeleteItem", [item.id]);
                }
              },
            })
          );
        }
      } else {
        // 尝试查询分类下有没有子分类
        let classificationList = selectClassificationList(classificationId);
        // 添加项目选项
        if (classificationList && classificationList.length > 0) {
          let submenus = [];
          for (const classification of classificationList) {
            if (classification.type === 0) {
              submenus.push(
                new MenuItem({
                  label: classification.name,
                  click: () => {
                    // 创建窗口
                    createAddEditWindow(null, classification.id);
                  },
                })
              );
            }
          }
          if (submenus.length > 0) {
            menuList.push(
              new MenuItem({
                label: global.language.newItem,
                submenu: submenus,
              })
            );
          }
        } else {
          if (classification.type === 0) {
            menuList.push(
              new MenuItem({
                label: global.language.newItem,
                click: () => {
                  // 创建窗口
                  createAddEditWindow(null, classificationId);
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
          !hasChildClassification(classificationId) &&
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
        // 只有普通分类可以锁定/解锁分类
        if (classification.type === 0) {
          menuList.push(
            new MenuItem({ type: "separator" }),
            new MenuItem({
              label: !lockItem
                ? global.language.lockItem
                : global.language.unlockItem,
              click: () => {
                sendToWebContent("mainWindow", "onLockItem", {});
              },
            })
          );
        }
      }
    } else {
      if (classification.type === 0) {
        menuList.push(
          new MenuItem({
            label: global.language.selectAll,
            click: () => {
              sendToWebContent(
                "mainWindow",
                "onItembatchOperationSelectAll",
                {}
              );
            },
          }),
          new MenuItem({ type: "separator" }),
          new MenuItem({
            label: global.language.batchMoveTo,
            submenu: getCopyMoveMenuItems(batchSelectedIdList, "MoveItem"),
          }),
          new MenuItem({
            label: global.language.batchCopyTo,
            submenu: getCopyMoveMenuItems(batchSelectedIdList, "CopyItem"),
          }),
          new MenuItem({ type: "separator" }),
          new MenuItem({
            label: global.language.batchConvertRelativePath,
            click: () => {
              convertTarget(batchSelectedIdList, "Relative");
            },
          }),
          new MenuItem({
            label: global.language.batchConvertAbsolutePath,
            click: () => {
              convertTarget(batchSelectedIdList, "Absolute");
            },
          }),
          new MenuItem({ type: "separator" }),
          new MenuItem({
            label: global.language.batchRefreshIcon,
            click: () => {
              refreshIcon(batchSelectedIdList);
            },
          }),
          new MenuItem({ type: "separator" }),
          new MenuItem({
            label: global.language.batchDelete,
            click: () => {
              let res = showMessageBoxSync(
                "mainWindow",
                global.language.batchDeletePrompt,
                "question",
                [global.language.ok, global.language.cancel]
              );
              if (res === 0) {
                for (const id of batchSelectedIdList) {
                  // 删除数据
                  del(id);
                  // 快捷键
                  setShortcutKey();
                }
                // 通知前端删除数据
                sendToWebContent(
                  "mainWindow",
                  "onDeleteItem",
                  batchSelectedIdList
                );
              }
            },
          })
        );
      }
    }
    // 非锁定项目下可以批量操作
    if (type === "main" && !lockItem && classification.type === 0) {
      menuList.push(
        new MenuItem({ type: "separator" }),
        new MenuItem({
          label: !batchOperation
            ? global.language.batchOperation
            : global.language.cancelBatchOperation,
          click: () => {
            sendToWebContent(
              "mainWindow",
              "onItemBatchOperation",
              !batchOperation
            );
          },
        })
      );
    }
    if (menuList.length > 0) {
      // 载入菜单
      let menu = Menu.buildFromTemplate(menuList);
      // 菜单显示
      menu.on("menu-will-show", () => {
        global.itemRightMenu = true;
      });
      // 菜单关闭
      menu.on("menu-will-close", () => {
        global.itemRightMenu = false;
        sendToWebContent(
          type === "quickSearch" ? "quickSearchWindow" : "mainWindow",
          "onItemRightMenuClose",
          []
        );
      });
      // 显示
      menu.popup();
    }
  });
  // 创建网络图标窗口
  ipcMain.on("createItemNetworkIconWindow", () => {
    createNetworkIconWindow();
  });
  // 显示网络图标窗口
  ipcMain.on("showItemNetworkIconWindow", () => {
    if (global.itemNetworkIconWindow) {
      global.itemNetworkIconWindow.show();
    }
  });
  // 关闭网络图标窗口
  ipcMain.on("closeItemNetworkIconWindow", () => {
    closeWindow(global.itemNetworkIconWindow);
  });
  // 创建SVG图标窗口
  ipcMain.on("createItemSVGIconWindow", () => {
    createSVGIconWindow();
  });
  // 显示SVG图标窗口
  ipcMain.on("showItemSVGIconWindow", () => {
    if (global.itemSVGIconWindow) {
      global.itemSVGIconWindow.show();
    }
  });
  // 关闭SVG图标窗口
  ipcMain.on("closeItemSVGIconWindow", () => {
    closeWindow(global.itemSVGIconWindow);
  });
  // 获取系统项目
  ipcMain.on("getSystemItemList", (event, args) => {
    let res = getSystemItemList();
    sendToWebContent("itemAddEditWindow", "onGetSystemItemList", res);
  });
  // 获取开始菜单项目
  ipcMain.on("getStartMenuItemList", (event, args) => {
    getStartMenuItemList();
  });
  // 获取APPX项目
  ipcMain.on("getAppxItemList", (event, args) => {
    getAppxItemList();
  });
  // 拖入项目
  ipcMain.on("dropItem", (event, args) => {
    drop(args.classificationId, args.pathList);
  });
  // 运行项目
  ipcMain.on("runItem", (event, args) => {
    run(args.type, args.operation, args.item);
  });
  // 项目拖出
  ipcMain.on("itemDragOut", (event, args) => {
    let item: Item = args;
    try {
      // 网站和系统不能拖出
      if (item.type === 2 || item.type === 3) {
        // 取消拖出状态
        sendToWebContent("mainWindow", "onItemCancelDragOut", {});
        return;
      }
      let icon = join(process.env.VITE_PUBLIC, "drag-and-drop.png");
      event.sender.startDrag({
        file: parsePath(item.data.target),
        icon: icon,
      });
    } finally {
      // 取消拖出状态
      sendToWebContent("mainWindow", "onItemCancelDragOut", {});
    }
  });
  // 更新打开信息
  ipcMain.on("updateItemOpenInfo", (event, args) => {
    updateOpenInfo(args.type, args.id);
  });
  // 删除历史记录
  ipcMain.on("deleteQuickSearchHistory", (event, args) => {
    deleteQuickSearchHistory(args);
  });
}
