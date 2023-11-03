import { dialog, ipcMain } from "electron";
import { backupData, createBackupRestoreDataWindow } from ".";
import { closeWindow, relaunch, showErrorMessageBox } from "../commons";
import { restore } from "./data";

export default function () {
  // 创建备份/恢复数据窗口
  ipcMain.on("createBackupRestoreDataWindow", (event, args) => {
    createBackupRestoreDataWindow();
  });
  // 显示备份/恢复数据窗口
  ipcMain.on("showBackupRestoreDataWindow", (event, args) => {
    if (global.backupRestoreDataWindow) {
      global.backupRestoreDataWindow.show();
    }
  });
  // 关闭备份/恢复数据窗口
  ipcMain.on("closeBackupRestoreDataWindow", (event, args) => {
    closeWindow(global.backupRestoreDataWindow);
  });
  // 备份数据
  ipcMain.on("backupData", () => {
    try {
      let filePath = dialog.showSaveDialogSync(global.backupRestoreDataWindow, {
        defaultPath: "Data",
        filters: [{ name: "DB", extensions: ["db"] }],
      });
      if (filePath && filePath.trim() !== "") {
        backupData(filePath).finally(() => {
          // 关闭备份/恢复窗口
          closeWindow(global.backupRestoreDataWindow);
        });
      }
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.log(e);
      }
    }
  });
  // 恢复数据
  ipcMain.on("restoreData", () => {
    try {
      let filePathList = dialog.showOpenDialogSync(
        global.backupRestoreDataWindow,
        {
          filters: [{ name: "Data", extensions: ["db", "json"] }],
        }
      );
      if (filePathList && filePathList.length > 0) {
        let filePath = filePathList[0];
        if (restore(filePath)) {
          // 清空localStorage
          global.mainWindow.webContents.session.clearStorageData({
            storages: ["localstorage"],
          });
          // 重新启动程序
          relaunch();
        } else {
          showErrorMessageBox(
            "backupRestoreDataWindow",
            global.language.restoreDataPrompt
          );
        }
      }
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.log(e);
      }
      showErrorMessageBox(
        "backupRestoreDataWindow",
        global.language.restoreDataPrompt
      );
    }
  });
}
