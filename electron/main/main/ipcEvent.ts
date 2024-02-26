import { ipcMain } from "electron";
import { createTray, hideMainWindow, showMainWindow } from "./index";
import { initAssociateFolder } from "../classification";
import { checkInvalid } from "../item";
import { getWindow } from "../commons";

export default function () {
  // 显示窗口
  ipcMain.on("showMainWindow", (event, args) => {
    showMainWindow(args.blurHide, args.autoHide);
  });
  // 隐藏窗口
  ipcMain.on("hideMainWindow", () => {
    hideMainWindow();
  });
  // 托盘
  ipcMain.on("setTray", (event, args) => {
    createTray(args);
  });
  // 任务栏
  ipcMain.on("setTaskbar", (event, args) => {
    let window = getWindow("mainWindow");
    if (window) {
      window.setSkipTaskbar(args);
    }
  });
  // 初始化数据
  ipcMain.on("mainWindowInitData", () => {
    // 初始化关联文件夹
    initAssociateFolder();
    // 检测无效项目
    if (global.setting.item.checkInvalidItem) {
      // 五分钟检测一次
      global.checkInvalidItemInterval = setInterval(() => {
        checkInvalid();
      }, 300000);
      // 初始化执行一次
      checkInvalid();
    }
  });
}
