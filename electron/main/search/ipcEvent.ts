import { ipcMain } from "electron";
import { hideQuickSearchWindow, showQuickSearchWindow } from ".";

export default function () {
  // 快速搜索初始化完成
  ipcMain.on("quickSearchInitFinished", () => {
    global.quickSearchWindowInit = true;
  });
  // 显示快速搜索窗口
  ipcMain.on("showQuickSearchWindow", () => {
    showQuickSearchWindow();
  });
  // 隐藏快速搜索窗口
  ipcMain.on("hideQuickSearchWindow", () => {
    hideQuickSearchWindow();
  });
  // 设置快速搜索窗口高度
  ipcMain.on("setQuickSearchWindowHeight", (event, args) => {
    global.quickSearchWindow.setBounds({ height: args });
  });
}
