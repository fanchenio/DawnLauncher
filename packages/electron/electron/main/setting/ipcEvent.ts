import { app, dialog, ipcMain } from "electron";
import {
  closeWindow,
  getUserDataPath,
  relaunch,
  sendToWebContent,
} from "../commons/index";
import { createSettingWindow, setFixedPosition, setShortcutKey } from ".";
import { add, select, update } from "./data";
import { basename } from "node:path";
import { edgeAdsorb } from "../main";
import { sendAllWindows } from "../commons";
import { parse } from "node:path";
import { statSync, mkdirSync, copyFileSync, readFileSync } from "node:fs";
import mime from "mime";
import { checkInvalid } from "../item";
import { updateItemOpenNumberSortToDefualt } from "../classification";

export default function () {
  // 创建设置窗口
  ipcMain.on("createSettingWindow", () => {
    createSettingWindow();
  });
  // 显示设置窗口
  ipcMain.on("showSettingWindow", () => {
    if (global.settingWindow) {
      global.settingWindow.show();
    }
  });
  // 关闭设置窗口
  ipcMain.on("closeSettingWindow", () => {
    closeWindow(global.settingWindow);
  });
  // 查询设置
  ipcMain.on("selectSetting", (event, args) => {
    event.returnValue = select();
  });
  // 添加设置
  ipcMain.on("addSetting", (event, args) => {
    event.returnValue = add(args);
  });
  // 更新设置
  ipcMain.on("updateSetting", (event, args) => {
    // 记录旧透明度
    let oldTransparency = global.setting.appearance.transparency;
    // 记录旧语言
    let oldLanguage = global.setting.general.language;
    // 更新
    event.returnValue = update(args);
    // 判断是否需要重启主界面
    if (
      (oldTransparency === 1 && global.setting.appearance.transparency < 1) ||
      (oldTransparency < 1 && global.setting.appearance.transparency === 1)
    ) {
      // 重新启动程序
      relaunch();
      return;
    } else if (global.setting.general.language !== oldLanguage) {
      // 重新启动程序
      relaunch();
      return;
    }
    // 通知所有窗口
    sendAllWindows("onUpdateSetting", args);
  });
  // 开机启动
  ipcMain.on("startup", (event, args) => {
    if (process.env.NODE_ENV !== "development") {
      const exeName = basename(process.execPath);
      app.setLoginItemSettings({
        openAtLogin: args,
        openAsHidden: false,
        path: process.execPath,
        args: ["--processStart", `"${exeName}"`],
      });
    }
  });
  // 设置快捷键
  ipcMain.on("setShortcutKey", (event, args) => {
    setShortcutKey(args);
  });
  // 永远置顶
  ipcMain.on("setAlwaysTop", (event, args) => {
    if (args) {
      global.mainWindow.setAlwaysOnTop(true, "screen-saver");
    } else {
      global.mainWindow.setAlwaysOnTop(false);
    }
  });
  // 锁定尺寸
  ipcMain.on("setLockSize", (event, args) => {
    global.mainWindow.setResizable(!args);
  });
  // 固定位置
  ipcMain.on("setFixedPosition", (event, args) => {
    setFixedPosition(args.fixedPosition, args.alwaysCenter);
  });
  // 永远居中
  ipcMain.on("setAlwaysCenter", (event, args) => {
    if (args.alwaysCenter) {
      global.mainWindow.center();
      global.mainWindow.setMovable(false);
    } else {
      setFixedPosition(args.fixedPosition, args.alwaysCenter);
    }
  });
  // 边缘吸附
  ipcMain.on("setEdgeAdsorb", (event, args) => {
    if (args) {
      global.setting.general.edgeAdsorb = true;
      edgeAdsorb(null);
    }
  });
  // 上传背景图
  ipcMain.on("uploadBackgrounImage", (event, args) => {
    // 打开文件对话框
    let filePathList = dialog.showOpenDialogSync(global.settingWindow, {
      filters: [
        {
          name: "Images",
          extensions: ["jpg", "jpeg", "png", "gif", "ico", "svg", "webp"],
        },
      ],
    });
    if (filePathList && filePathList.length > 0) {
      // 获取文件路径
      let filePath = filePathList[0];
      // 解析路径
      let parsedPath = parse(filePath);
      // 拷贝的路径
      let destPath = getUserDataPath() + "\\images";
      // 不存在目录，创建目录
      try {
        statSync(destPath);
      } catch (e) {
        mkdirSync(destPath);
      }
      // 图片名
      let name = "backgroundImage" + parsedPath.ext;
      // 全路径
      let copyFullPath = destPath + "\\" + name;
      try {
        // 拷贝
        copyFileSync(filePath, copyFullPath);
        // 图片转base64
        let buffer = readFileSync(copyFullPath);
        let image =
          "data:" +
          mime.getType(copyFullPath) +
          ";base64," +
          buffer.toString("base64");
        // 返回base64
        event.returnValue = {
          name,
          image,
        };
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          console.log(e);
        }
        event.returnValue = null;
      }
    } else {
      event.returnValue = null;
    }
  });
  // 获取背景图
  ipcMain.on("getBackgroundImage", (event, args) => {
    // 图片名
    let name: string = args.name;
    // 窗口
    let windowName: string = args.windowName;
    try {
      // 读取图片转为BASE64
      let data = readFileSync(getUserDataPath() + "\\images\\" + name);
      let buffer = Buffer.from(data);
      let image =
        "data:" + mime.getType(name) + ";base64," + buffer.toString("base64");
      // 通知窗口
      sendToWebContent(windowName, "onSetBacngroundImage", image);
    } catch (e) {}
  });
  // 检测无效项目
  ipcMain.on("setCheckInvalidItem", (event, args) => {
    if (args) {
      if (!global.checkInvalidItemInterval) {
        // 五分钟检测一次
        global.checkInvalidItemInterval = setInterval(() => {
          checkInvalid();
        }, 300000);
        // 执行一次
        checkInvalid();
      }
    } else {
      // 清空定时
      clearInterval(global.checkInvalidItemInterval);
      global.checkInvalidItemInterval = null;
    }
  });
  // 项目打开次数
  ipcMain.on("setItemOpenNumber", (event, args) => {
    if (!args) {
      // 将排序为打开次数的分类修改为默认排序
      updateItemOpenNumberSortToDefualt();
    }
  });
}
