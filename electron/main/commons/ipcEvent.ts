import { app, dialog, ipcMain, OpenDialogSyncOptions, shell } from "electron";
import { getFileIcon } from "../../commons/utils";
import mime from "mime";
import { ShortcutInfo } from "../../../types/common";
import {
  convertPath,
  downloadImage,
  getURLInfo,
  sendToWebContent,
  showErrorMessageBox,
} from ".";
import { statSync } from "node:fs";
import { getWindow } from "../commons/index";

export default function () {
  // emit
  ipcMain.on("emit", (event, args) => {
    sendToWebContent(args.windowName, args.listener, args.paylod);
  });
  // 错误提示框
  ipcMain.on("showErrorMessageBox", (event, args) => {
    showErrorMessageBox(args.windowName, args.message);
  });
  // 信息提示框
  ipcMain.on("showInfoMessageBox", (event, args) => {
    dialog.showMessageBoxSync(getWindow(args.windowName), {
      message: args.message,
      buttons: [global.language.ok],
      type: "info",
      noLink: true,
    });
  });
  // 对话框
  ipcMain.on("showConfirmBox", (event, args) => {
    // 弹出对话框
    let res = dialog.showMessageBoxSync(getWindow(args.windowName), {
      message: args.message,
      buttons: [global.language.ok, global.language.cancel],
      type: "question",
      noLink: true,
      cancelId: 1,
    });
    event.returnValue = res === 0;
  });
  // 选择文件
  ipcMain.on("selectFile", (event, args) => {
    // 窗口名称
    let windowName: string = args.windowName;
    // 是否寻找目标
    let target: boolean = args.target;
    // 默认路径
    let defaultPath: string | null = args.defaultPath;
    // 参数
    let options: OpenDialogSyncOptions = {};
    if (defaultPath && defaultPath.trim() !== "") {
      options.defaultPath = defaultPath;
    } else {
      options.defaultPath = app.getPath("desktop");
    }
    let filePathList = dialog.showOpenDialogSync(
      getWindow(windowName),
      options
    );
    if (filePathList && filePathList.length > 0) {
      let filePath = filePathList[0];
      if (target) {
        if (mime.getType(filePath) === "application/x-ms-shortcut") {
          // 获取真实文件路径和参数
          let shortcutInfo: ShortcutInfo | null =
            global.addon.getShortcutFileInfo(filePath);
          if (shortcutInfo && shortcutInfo.target) {
            // 路径
            filePath = shortcutInfo.target;
          }
        }
      }
      event.returnValue = filePath;
    } else {
      event.returnValue = null;
    }
  });
  // 选择文件夹
  ipcMain.on("selectDirectory", (event, args) => {
    // 窗口名称
    let windowName: string = args.windowName;
    // 默认路径
    let defaultPath: string | null = args.defaultPath;
    // 参数
    let options: OpenDialogSyncOptions = {
      properties: ["openDirectory"],
    };
    if (defaultPath && defaultPath.trim() !== "") {
      options.defaultPath = defaultPath;
    } else {
      options.defaultPath = app.getPath("desktop");
    }
    let dirPathList = dialog.showOpenDialogSync(getWindow(windowName), options);
    if (dirPathList && dirPathList.length > 0) {
      let dirPath = dirPathList[0];
      event.returnValue = dirPath;
    } else {
      event.returnValue = null;
    }
  });
  // 获取图标
  ipcMain.on("getFileIcon", async (event, args) => {
    // 窗口名称
    let windowName: string = args.windowName;
    // 路径
    let filePath: string | null = args.path;
    if (filePath) {
      // 图标
      let icon: string | null = await getFileIcon(filePath);
      // 发送到页面
      sendToWebContent(windowName, "onGetFileIcon", icon);
    }
  });
  // 下载图片
  ipcMain.on("downloadImage", (event, args) => {
    downloadImage(args.windowName, args.url);
  });
  // 获取网址信息
  ipcMain.on("getURLInfo", (event, args) => {
    getURLInfo(args.windowName, args.url, true);
  });
  // 转换路径
  ipcMain.on("convertPath", (event, args) => {
    event.returnValue = convertPath(args.path);
  });
  // 路径是否存在
  ipcMain.on("pathExist", (event, args) => {
    try {
      statSync(args.path);
      event.returnValue = true;
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.log(e);
      }
      event.returnValue = false;
    }
  });
  // 是否是文件
  ipcMain.on("isFile", (event, args) => {
    try {
      const stats = statSync(args.path);
      event.returnValue = stats.isFile();
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.log(e);
      }
      event.returnValue = true;
    }
  });
  // 打开URL
  ipcMain.on("openURL", (event, args) => {
    shell.openExternal(args);
  });
  // 获取版本
  ipcMain.on("getVersion", (event, args) => {
    event.returnValue = app.getVersion();
  });
  // 退出
  ipcMain.on("exit", () => {
    app.quit();
  });
  // 运行
  ipcMain.on("run", (event, args) => {
    global.addon.shellExecute(
      args.operation,
      args.target,
      args.params ?? "",
      app.getPath("home")
    );
  });
}
