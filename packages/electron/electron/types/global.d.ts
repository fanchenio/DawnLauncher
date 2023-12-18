import { BrowserWindow, Tray } from "electron";
import { FSWatcher } from "node:fs";
import { Setting } from "../../types/setting";

declare global {
  // addon
  var addon: any;
  // 语言
  var language: any;
  // 主窗口
  var mainWindow: BrowserWindow | null;
  // 快速搜索窗口
  var quickSearchWindow: BrowserWindow | null;
  // 快速搜索窗口是否初始化完成
  var quickSearchWindowInit: Boolean | null;
  // 设置窗口
  var settingWindow: BrowserWindow | null;
  // 分类添加/编辑窗口
  var classificationAddEditWindow: BrowserWindow | null;
  // 分类图标窗口
  var classificationSetIconWindow: BrowserWindow | null;
  // 关联分类窗口
  var classificationAssociateFolderWindow: BrowserWindow | null;
  // 聚合分类窗口
  var classificationAggregateWindow: BrowserWindow | null;
  // 项目添加/编辑窗口
  var itemAddEditWindow: BrowserWindow | null;
  // 项目网络图标窗口
  var itemNetworkIconWindow: BrowserWindow | null;
  // 项目SVG图标窗口
  var itemSVGIconWindow: BrowserWindow | null;
  // 关于窗口
  var aboutWindow: BrowserWindow | null;
  // 备份/恢复数据窗口
  var backupRestoreDataWindow: BrowserWindow | null;
  // 存储关联分类监听
  var associateFolderWatcher: Map<number, AssociateFolderData>;
  // 设置
  var setting: Setting | null;
  // 托盘
  var tray: Tray;
  // 主窗口方向
  var mainWindowDirection: String | null;
  // 停靠在桌面边缘时自动隐藏timer
  var autoHideTimer: NodeJS.Timeout;
  // 需要失去焦点时隐藏
  var blurHide: boolean | null;
  // 双击任务栏显示/隐藏timer
  var doubleClickTaskbarTimer: NodeJS.Timeout;
  // 双击任务栏显示/隐藏counter
  var doubleClickTaskbarCounter: number;
  // 监测无效项目interval
  var checkInvalidItemInterval: NodeJS.Timeout;
  // 存储子进程信息
  var childProcessMap: Map<number, ChildProcessInfo>;
  // 分类右键菜单显示
  var classificationRightMenu: boolean | null;
  // 项目右键菜单显示
  var itemRightMenu: boolean | null;
}

export interface ChildProcessInfo {
  utilityProcess: Electron.UtilityProcess;
  port1: Electron.MessagePortMain;
  port2: Electron.MessagePortMain;
}

export interface AssociateFolderData {
  classificationId: number;
  dir: string;
  hiddenItems: string | null;
  watch: FSWatcher;
}

export {};
