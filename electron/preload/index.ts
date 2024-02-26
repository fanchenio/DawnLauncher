import { contextBridge, ipcRenderer } from "electron";
import { Classification } from "../../types/classification";
import { Item } from "../../types/item";
import { Setting } from "../../types/setting";

contextBridge.exposeInMainWorld("api", {
  // emit
  emit: (windowName: string, listener: string, paylod: any) => {
    ipcRenderer.send("emit", { windowName, listener, paylod });
  },
  // 错误提示框
  showErrorMessageBox: (windowName: string, message: string) => {
    ipcRenderer.send("showErrorMessageBox", { windowName, message });
  },
  // 信息提示框
  showInfoMessageBox: (windowName: string, message: string) => {
    ipcRenderer.send("showInfoMessageBox", { windowName, message });
  },
  // 对话框
  showConfirmBox: (windowName: string, message: string): boolean => {
    return ipcRenderer.sendSync("showConfirmBox", { windowName, message });
  },
  // 选择文件
  selectFile: (
    windowName: string,
    target: boolean,
    defaultPath: string | null
  ): string | null => {
    return ipcRenderer.sendSync("selectFile", {
      windowName,
      target,
      defaultPath,
    });
  },
  // 选择文件夹
  selectDirectory: (
    windowName: string,
    defaultPath: string | null
  ): string | null => {
    return ipcRenderer.sendSync("selectDirectory", {
      windowName,
      defaultPath,
    });
  },
  // 获取图标
  getFileIcon: (windowName: string, path: string) => {
    ipcRenderer.send("getFileIcon", { windowName, path });
  },
  // 监听获取图标
  onGetFileIcon: (callback): Function => {
    ipcRenderer.on("onGetFileIcon", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onGetFileIcon");
    };
  },
  // 下载图片
  downloadImage: (windowName: string, url: string) => {
    ipcRenderer.send("downloadImage", { windowName, url });
  },
  // 监听下载图片
  onDownloadImage: (callback): Function => {
    ipcRenderer.on("onDownloadImage", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onDownloadImage");
    };
  },
  // 获取网址信息
  getURLInfo: (windowName: string, url: string) => {
    ipcRenderer.send("getURLInfo", { windowName, url });
  },
  // 监听获取网址信息
  onGetURLInfo: (callback): Function => {
    ipcRenderer.on("onGetURLInfo", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onGetURLInfo");
    };
  },
  // 转换路径
  convertPath: (path: string): string => {
    return ipcRenderer.sendSync("convertPath", { path });
  },
  // 路径是否存在
  pathExist: (path: string): boolean => {
    return ipcRenderer.sendSync("pathExist", { path });
  },
  // 是否是文件
  isFile: (path: string): boolean => {
    return ipcRenderer.sendSync("isFile", { path });
  },
  // 打开URL
  openURL: (url: string) => {
    ipcRenderer.send("openURL", url);
  },
  // 获取版本
  getVersion: (): string => {
    return ipcRenderer.sendSync("getVersion");
  },
  // 退出
  exit: () => {
    ipcRenderer.send("exit");
  },
  // 运行
  run: (
    operation: string,
    target: string,
    params: string | null,
    startLocation: string | null
  ) => {
    ipcRenderer.send("run", { operation, target, params, startLocation });
  },
});

contextBridge.exposeInMainWorld("main", {
  // 显示窗口
  showWindow: (blurHide: boolean, autoHide: boolean) => {
    ipcRenderer.send("showMainWindow", { blurHide, autoHide });
  },
  // 隐藏窗口
  hideWindow: () => {
    ipcRenderer.send("hideMainWindow");
  },
  // 初始化数据
  initData: () => {
    ipcRenderer.send("mainWindowInitData");
  },
  // 显示窗口之前
  onShowWindowBefore: (callback): Function => {
    ipcRenderer.on("onShowMainWindowBefore", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onShowMainWindowBefore");
    };
  },
});

contextBridge.exposeInMainWorld("classification", {
  // 获取分类列表
  list: (): Array<Classification> => {
    return ipcRenderer.sendSync("getClassificationList");
  },
  // 根据ID查询分类
  selectById: (id: number): Classification | null => {
    return ipcRenderer.sendSync("getClassificationById", { id });
  },
  // 新增分类
  add: (
    parentId: number | null,
    name: string,
    shortcutKey: string | null,
    globalShortcutKey: boolean
  ): Classification | null => {
    return ipcRenderer.sendSync("addClassification", {
      parentId,
      name,
      shortcutKey,
      globalShortcutKey,
    });
  },
  // 更新分类
  update: (classifictaion: Classification): boolean => {
    return ipcRenderer.sendSync("updateClassification", classifictaion);
  },
  // 更新序号
  updateOrder: (
    fromId: number,
    toId: number | null,
    parentId: number | null
  ): boolean => {
    return ipcRenderer.sendSync("updateClassificationOrder", {
      fromId,
      toId,
      parentId,
    });
  },
  // 更新图标
  updateIcon: (id: number, icon: string | null): boolean => {
    return ipcRenderer.sendSync("updateClassificationIcon", {
      id,
      icon,
    });
  },
  // 显示新增/修改窗口
  showAddEditWindow: () => {
    ipcRenderer.send("showClassificationAddEditWindow");
  },
  // 关闭新增/修改窗口
  closeAddEditWindow: () => {
    ipcRenderer.send("closeClassificationAddEditWindow");
  },
  // 显示设置图标窗口
  showSetIconWindow: () => {
    ipcRenderer.send("showClassificationSetIconWindow");
  },
  // 关闭设置图标窗口
  closeSetIconWindow: () => {
    ipcRenderer.send("closeClassificationSetIconWindow");
  },
  // 右键菜单
  showRightMenu: (
    classification: Classification | null,
    lockClassification: boolean
  ) => {
    ipcRenderer.send("showClassificationRightMenu", {
      classification,
      lockClassification,
    });
  },
  // 监听新增分类
  onAdd: (callback): Function => {
    ipcRenderer.on("onAddClassification", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onAddClassification");
    };
  },
  // 监听更新分类
  onUpdate: (callback): Function => {
    ipcRenderer.on("onUpdateClassification", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onUpdateClassification");
    };
  },
  // 监听删除分类
  onDelete: (callback): Function => {
    ipcRenderer.on("onDeleteClassification", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onDeleteClassification");
    };
  },
  // 监听锁定/解锁分类
  onLock: (callback): Function => {
    ipcRenderer.on("onLockClassification", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onLockClassification");
    };
  },
  // 更新分类图标
  onUpdateIcon: (callback): Function => {
    ipcRenderer.on("onUpdateClassificationIcon", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onUpdateClassificationIcon");
    };
  },
  // 显示关联文件夹窗口
  showAssociateFolderWindow: () => {
    ipcRenderer.send("showClassificationAssociateFolderWindow");
  },
  // 关闭关联文件夹窗口
  closeAssociateFolderWindow: () => {
    ipcRenderer.send("closeClassificationAssociateFolderWindow");
  },
  // 设置关联文件夹
  setAssociateFolder: (
    id: number,
    dir: string | null,
    hiddenItems: string | null
  ): Classification => {
    return ipcRenderer.sendSync("setClassificationAssociateFolder", {
      id,
      dir,
      hiddenItems,
    });
  },
  // 监听更新关联文件夹
  onUpdateAssociateFolder: (callback): Function => {
    ipcRenderer.on("onUpdateAssociateFolderClassification", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onUpdateAssociateFolderClassification");
    };
  },
  // 是否拥有子分类
  hasChildClassification: (id: number): boolean => {
    return ipcRenderer.sendSync("hasChildClassification", id);
  },
  // 监听收起子分类
  onCollapseSubClassification: (callback) => {
    ipcRenderer.on("onCollapseSubClassification", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onCollapseSubClassification");
    };
  },
  // 修改项目布局
  onUpdateItemLayout: (callback) => {
    ipcRenderer.on("onUpdateItemLayout", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onUpdateItemLayout");
    };
  },
  // 修改项目排序
  onUpdateItemSort: (callback) => {
    ipcRenderer.on("onUpdateItemSort", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onUpdateItemSort");
    };
  },
  // 修改项目列数
  onUpdateItemColumnNumber: (callback) => {
    ipcRenderer.on("onUpdateItemColumnNumber", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onUpdateItemColumnNumber");
    };
  },
  // 修改项目图标
  onUpdateItemIconSize: (callback) => {
    ipcRenderer.on("onUpdateItemIconSize", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onUpdateItemIconSize");
    };
  },
  // 根据文件夹创建分类
  addClassificationByDirectory: (pathList: Array<string>) => {
    ipcRenderer.send("addClassificationByDirectory", pathList);
  },
  // 监听根据文件夹创建分类
  onAddClassificationByDirectory: (callback) => {
    ipcRenderer.on("onAddClassificationByDirectory", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onAddClassificationByDirectory");
    };
  },
  // 修改项目显示
  onUpdateItemShowOnly: (callback) => {
    ipcRenderer.on("onUpdateItemShowOnly", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onUpdateItemShowOnly");
    };
  },
  // 修改固定分类
  onUpdateFixed: (callback) => {
    ipcRenderer.on("onUpdateClassificationFixed", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onUpdateClassificationFixed");
    };
  },
  // 将排序为打开次数的分类修改为默认排序
  onUpdateItemOpenNumberSortToDefualt: (callback) => {
    ipcRenderer.on("onUpdateItemOpenNumberSortToDefualt", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onUpdateItemOpenNumberSortToDefualt");
    };
  },
  // 显示聚合分类窗口
  showAggregateWindow: () => {
    ipcRenderer.send("showClassificationAggregateWindow");
  },
  // 关闭聚合分类窗口
  closeAggregateWindow: () => {
    ipcRenderer.send("closeClassificationAggregateWindow");
  },
  // 更新聚合分类
  updateAggregate: (id: number, sort: string, itemCount: number): boolean => {
    return ipcRenderer.sendSync("updateClassificationAggregate", {
      id,
      sort,
      itemCount,
    });
  },
  // 监听更新聚合分类
  onUpdateAggregate: (callback) => {
    ipcRenderer.on("onUpdateClassificationAggregate", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onUpdateClassificationAggregate");
    };
  },
  // 监听修改排除搜索
  onUpdateExcludeSearch: (callback) => {
    ipcRenderer.on("onUpdateClassificationExcludeSearch", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onUpdateClassificationExcludeSearch");
    };
  },
});

contextBridge.exposeInMainWorld("item", {
  // 显示新增/修改窗口
  showAddEditWindow: () => {
    ipcRenderer.send("showItemAddEditWindow");
  },
  // 关闭新增/修改窗口
  closeAddEditWindow: () => {
    ipcRenderer.send("closeItemAddEditWindow");
  },
  // 获取项目列表
  list: (): Array<Item> => {
    return ipcRenderer.sendSync("getItemList");
  },
  // 获取简单项目列表
  simpleList: (): Array<Item> => {
    return ipcRenderer.sendSync("getSimpleItemList");
  },
  // 根据ID查询分类
  selectById: (id: number): Item | null => {
    return ipcRenderer.sendSync("getItemById", { id });
  },
  // 新增项目
  add: (item: Item): Item | null => {
    return ipcRenderer.sendSync("addItem", item);
  },
  // 更新项目
  update: (item: Item): boolean => {
    return ipcRenderer.sendSync("updateItem", item);
  },
  // 项目排序
  updateOrder: (
    fromIdList: Array<number>,
    toClassificationId: number,
    newIndex: number | null
  ): boolean => {
    return ipcRenderer.sendSync("updateItemOrder", {
      fromIdList,
      toClassificationId,
      newIndex,
    });
  },
  // 右键菜单
  showRightMenu: (params: any) => {
    ipcRenderer.send("showItemRightMenu", params);
  },
  // 创建网络图标窗口
  createNetworkIconWindow: () => {
    ipcRenderer.send("createItemNetworkIconWindow");
  },
  // 显示网络图标窗口
  showNetworkIconWindow: () => {
    ipcRenderer.send("showItemNetworkIconWindow");
  },
  // 关闭网络图标窗口
  closeNetworkIconWindow: () => {
    ipcRenderer.send("closeItemNetworkIconWindow");
  },
  // 监听网络图标
  onNetworkIcon: (callback): Function => {
    ipcRenderer.on("onItemNetworkIcon", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onItemNetworkIcon");
    };
  },
  // 创建SVG图标窗口
  createSVGIconWindow: () => {
    ipcRenderer.send("createItemSVGIconWindow");
  },
  // 显示SVG图标窗口
  showSVGIconWindow: () => {
    ipcRenderer.send("showItemSVGIconWindow");
  },
  // 关闭SVG图标窗口
  closeSVGIconWindow: () => {
    ipcRenderer.send("closeItemSVGIconWindow");
  },
  // 监听SVG图标
  onSVGIcon: (callback): Function => {
    ipcRenderer.on("onItemSVGIcon", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onItemSVGIcon");
    };
  },
  // 获取系统项目
  getSystemItemList: () => {
    ipcRenderer.send("getSystemItemList");
  },
  // 监听获取系统项目
  onGetSystemItemList: (callback): Function => {
    ipcRenderer.on("onGetSystemItemList", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onGetSystemItemList");
    };
  },
  // 获取开始菜单项目
  getStartMenuItemList: () => {
    ipcRenderer.send("getStartMenuItemList");
  },
  // 监听获取开始菜单项目
  onGetStartMenuItemList: (callback): Function => {
    ipcRenderer.on("onGetStartMenuItemList", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onGetStartMenuItemList");
    };
  },
  // 获取APPX项目
  getAppxItemList: () => {
    ipcRenderer.send("getAppxItemList");
  },
  // 监听APPX项目
  onGetAppxItemList: (callback): Function => {
    ipcRenderer.on("onGetAppxItemList", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onGetAppxItemList");
    };
  },
  // 监听新增项目
  onAdd: (callback): Function => {
    ipcRenderer.on("onAddItem", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onAddItem");
    };
  },
  // 监听更新项目
  onUpdate: (callback): Function => {
    ipcRenderer.on("onUpdateItem", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onUpdateItem");
    };
  },
  // 监听删除项目
  onDelete: (callback): Function => {
    ipcRenderer.on("onDeleteItem", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onDeleteItem");
    };
  },
  // 监听锁定/解锁项目
  onLock: (callback): Function => {
    ipcRenderer.on("onLockItem", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onLockItem");
    };
  },
  // 拖入项目
  drop: (classificationId: number, pathList: Array<string>) => {
    ipcRenderer.send("dropItem", {
      classificationId,
      pathList,
    });
  },
  // 监听批量操作
  onBatchOperation: (callback): Function => {
    ipcRenderer.on("onItemBatchOperation", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onItemBatchOperation");
    };
  },
  // 运行项目
  run: (type: string, operation: string, item: Item) => {
    ipcRenderer.send("runItem", { operation, item, type });
  },
  // 监听转换路径
  onConvertPath: (callback): Function => {
    ipcRenderer.on("onConvertPath", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onConvertPath");
    };
  },
  // 监听刷新图标
  onRefreshIcon: (callback): Function => {
    ipcRenderer.on("onRefreshItemIcon", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onRefreshItemIcon");
    };
  },
  // 监听移动项目
  onMove: (callback): Function => {
    ipcRenderer.on("onMoveItem", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onMoveItem");
    };
  },
  // 监听批量操作全选
  onBatchOperationSelectAll: (callback): Function => {
    ipcRenderer.on("onItembatchOperationSelectAll", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onItembatchOperationSelectAll");
    };
  },
  // 监听项目右键菜单关闭
  onRightMenuClose: (callback): Function => {
    ipcRenderer.on("onItemRightMenuClose", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onItemRightMenuClose");
    };
  },
  // 监听项目资源管理器菜单
  onExplorerMenu: (callback): Function => {
    ipcRenderer.on("onItemExplorerMenu", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onItemExplorerMenu");
    };
  },
  // 项目拖出
  dragOut: (item: Item) => {
    ipcRenderer.send("itemDragOut", item);
  },
  // 取消项目拖出
  onCancelDragOut: (callback): Function => {
    ipcRenderer.on("onItemCancelDragOut", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onItemCancelDragOut");
    };
  },
  // 监听更新打开信息
  onUpdateOpenInfo: (callback): Function => {
    ipcRenderer.on("onUpdateOpenInfo", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onUpdateOpenInfo");
    };
  },
  // 监听无效项目
  onCheckInvalid: (callback): Function => {
    ipcRenderer.on("onCheckInvalidItem", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onCheckInvalidItem");
    };
  },
  // 更新打开信息
  updateOpenInfo: (type: string, id: number) => {
    ipcRenderer.send("updateItemOpenInfo", { type, id });
  },
});

contextBridge.exposeInMainWorld("setting", {
  // 创建设置窗口
  createWindow: () => {
    ipcRenderer.send("createSettingWindow");
  },
  // 显示设置窗口
  showWindow: () => {
    ipcRenderer.send("showSettingWindow");
  },
  // 关闭设置窗口
  closeWindow: () => {
    ipcRenderer.send("closeSettingWindow");
  },
  // 查询设置
  select: (): Setting | null => {
    return ipcRenderer.sendSync("selectSetting");
  },
  // 新增设置
  add: (setting: Setting): boolean => {
    return ipcRenderer.sendSync("addSetting", setting);
  },
  // 更新设置
  update: (setting: Setting): boolean => {
    return ipcRenderer.sendSync("updateSetting", setting);
  },
  // 监听更新设置
  onUpdate: (callback): Function => {
    ipcRenderer.on("onUpdateSetting", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onUpdateSetting");
    };
  },
  // 开机启动
  setStartup: (value: boolean) => {
    ipcRenderer.send("startup", value);
  },
  // 隐藏托盘图标
  setTray: (show: boolean) => {
    ipcRenderer.send("setTray", show);
  },
  // 隐藏任务栏
  setTaskbar: (show: boolean) => {
    ipcRenderer.send("setTaskbar", show);
  },
  // 设置快捷键
  setShortcutKey: (setting: Setting) => {
    ipcRenderer.send("setShortcutKey", setting);
  },
  // 永远置顶
  setAlwaysTop: (value: boolean) => {
    ipcRenderer.send("setAlwaysTop", value);
  },
  // 锁定尺寸
  setLockSize: (value: boolean) => {
    ipcRenderer.send("setLockSize", value);
  },
  // 固定位置
  setFixedPosition: (fixedPosition: boolean, alwaysCenter: boolean) => {
    ipcRenderer.send("setFixedPosition", {
      fixedPosition,
      alwaysCenter,
    });
  },
  // 永远居中
  setAlwaysCenter: (fixedPosition: boolean, alwaysCenter: boolean) => {
    ipcRenderer.send("setAlwaysCenter", {
      fixedPosition,
      alwaysCenter,
    });
  },
  // 边缘吸附
  setEdgeAdsorb: (value: boolean) => {
    ipcRenderer.send("setEdgeAdsorb", value);
  },
  // 上传背景图
  uploadBackgrounImage: (): any => {
    return ipcRenderer.sendSync("uploadBackgrounImage");
  },
  // 监听设置背景图
  onSetBacngroundImage: (callback) => {
    ipcRenderer.on("onSetBacngroundImage", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onSetBacngroundImage");
    };
  },
  // 获取背景图
  getBackgroundImage: (name: string, windowName: string) => {
    ipcRenderer.send("getBackgroundImage", { name, windowName });
  },
  // 检测无效项目
  setCheckInvalidItem: (value: boolean) => {
    ipcRenderer.send("setCheckInvalidItem", value);
  },
  // 项目打开次数
  setOpenNumber: (value: boolean) => {
    ipcRenderer.send("setItemOpenNumber", value);
  },
});

contextBridge.exposeInMainWorld("quickSearch", {
  // 初始化完毕
  initFinished: () => {
    ipcRenderer.send("quickSearchInitFinished");
  },
  // 显示窗口
  showWindow: () => {
    ipcRenderer.send("showQuickSearchWindow");
  },
  // 隐藏窗口
  hideWindow: () => {
    ipcRenderer.send("hideQuickSearchWindow");
  },
  // 显示窗口之前
  onShowWindowBefore: (callback): Function => {
    ipcRenderer.on("onShowQuickSearchWindowBefore", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onShowQuickSearchWindowBefore");
    };
  },
  // 清空数据
  onClearData: (callback): Function => {
    ipcRenderer.on("onQuickSearchClearData", (event, data) => {
      callback(data);
    });
    return () => {
      ipcRenderer.removeAllListeners("onQuickSearchClearData");
    };
  },
  // 设置窗口高度
  setWindowHeight: (height: number) => {
    ipcRenderer.send("setQuickSearchWindowHeight", height);
  },
  // 设置窗口宽度
  setWindowWidth: (width: number) => {
    ipcRenderer.send("setQuickSearchWindowWidth", width);
  },
});

contextBridge.exposeInMainWorld("about", {
  // 创建窗口
  createWindow: () => {
    ipcRenderer.send("createAboutWindow");
  },
  // 显示窗口
  showWindow: () => {
    ipcRenderer.send("showAboutWindow");
  },
  // 关闭窗口
  closeWindow: () => {
    ipcRenderer.send("closeAboutWindow");
  },
});

contextBridge.exposeInMainWorld("data", {
  // 创建备份/恢复数据窗口
  createBackupRestoreDataWindow: () => {
    ipcRenderer.send("createBackupRestoreDataWindow");
  },
  // 显示备份/恢复数据窗口
  showBackupRestoreDataWindow: () => {
    ipcRenderer.send("showBackupRestoreDataWindow");
  },
  // 关闭备份/恢复数据窗口
  closeBackupRestoreDataWindow: () => {
    ipcRenderer.send("closeBackupRestoreDataWindow");
  },
  // 备份数据
  backupData: () => {
    ipcRenderer.send("backupData");
  },
  // 恢复数据
  restoreData: () => {
    ipcRenderer.send("restoreData");
  },
});
