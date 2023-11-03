import { ipcMain } from "electron";
import { createWindow } from ".";
import { closeWindow } from "../commons";

export default function () {
  // 创建窗口
  ipcMain.on("createAboutWindow", (event, args) => {
    createWindow();
  });
  // 显示窗口
  ipcMain.on("showAboutWindow", (event, args) => {
    if (global.aboutWindow) {
      global.aboutWindow.show();
    }
  });
  // 关闭窗口
  ipcMain.on("closeAboutWindow", (event, args) => {
    closeWindow(global.aboutWindow);
  });
}
