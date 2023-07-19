import { ipcMain, dialog, Menu, app, shell } from "electron";
import os from "os";
import data from "@/main/data";
import fs from "fs";
import settingIndex from "./setting/index";
import util from "./util";
import retry from "retry";
import request from "request";
import mime from "mime";
import path from "path";

/**
 * 固定位置
 * @param fixedPosition
 * @param alwaysCenter
 */
function setFixedPosition(fixedPosition, alwaysCenter) {
  global.mainWindow.setMovable(fixedPosition);
  if (alwaysCenter) {
    global.mainWindow.setMovable(false);
  }
}

export default function () {
  // 隐藏
  ipcMain.on("hide", (event, args) => {
    global.mainWindow.hide();
  });
  // 隐藏
  ipcMain.on("hideMainWindow", (event, args) => {
    global.mainWindow.webContents.send("hideMainWindowBefore");
  });
  // 关闭
  ipcMain.on("close", (event, args) => {
    global.mainWindow.close();
  });
  // 获取数据
  ipcMain.on("getList", (event) => {
    let list = data.getList();
    event.returnValue = list;
  });
  // 保存数据
  ipcMain.on("setList", (event, args) => {
    let params = JSON.parse(args);
    data.setList(params.list);
    settingIndex.setShortcutKey(global.setting);
    if (params.searchWindowGetData != null && params.searchWindowGetData) {
      if (global.searchWindow != null && !global.searchWindow.isDestroyed()) {
        global.searchWindow.webContents.send("searchWindowGetData");
      }
    }
  });
  // 错误消息
  ipcMain.on("errorMessage", (event, args) => {
    dialog.showMessageBox(global.mainWindow, {
      title: "Dawn Launcher",
      message: args,
      buttons: [global.currentLanguage.ok],
      type: "error",
      noLink: true,
      cancelId: 1,
    });
  });
  // 文本框菜单
  ipcMain.on("textRightMenu", (event, args) => {
    // 菜单
    let m = Menu.buildFromTemplate([
      {
        role: "cut",
        label: global.currentLanguage.cut,
      },
      {
        role: "copy",
        label: global.currentLanguage.copy,
      },
      {
        role: "paste",
        label: global.currentLanguage.paste,
      },
    ]);
    util.menuListen(m);
    m.popup();
  });
  // 获取版本
  ipcMain.on("getVersion", (event) => {
    event.returnValue = app.getVersion();
  });
  // 打开网页
  ipcMain.on("openUrl", (event, args) => {
    shell.openExternal(args);
  });
  // 检查更新
  ipcMain.on("checkUpdate", () => {
    util.checkUpdate("checkUpdate");
  });
  // 统计
  ipcMain.on("statistics", () => {
    try {
      let data = {
        system: os.type(),
        release: os.release(),
        locale: app.getLocale(),
        appVersion: app.getVersion(),
      };
      // 重试
      const operation = retry.operation({
        retries: 5, // 最多重试 5 次
        factor: 1, // 每次重试之间的时间间隔加倍
        minTimeout: 1000, // 第一次重试之前等待的时间
        maxTimeout: 5000, // 最长等待时间
      });
      // 发起请求
      operation.attempt((currentAttempt) => {
        request(
          {
            uri: "https://client.dawnlauncher.com/access/statistics/add",
            method: "POST",
            json: true,
            headers: {
              "content-type": "application/json",
            },
            body: data,
            timeout: 5000,
          },
          function (error, response, body) {
            if (operation.retry(error)) {
              return;
            }
          }
        );
      });
    } catch (e) {}
  });
  // 备份数据
  ipcMain.on("backup", () => {
    try {
      dialog
        .showSaveDialog(global.mainWindow, {
          title: global.currentLanguage.backUpData,
          defaultPath: "data",
          filters: [{ name: "JSON", extensions: ["json"] }],
        })
        .then((r) => {
          if (!r.canceled && !util.strIsEmpty(r.filePath)) {
            fs.copyFileSync(app.getPath("userData") + "\\data.json", r.filePath);
            global.mainWindow.webContents.send("hideBackupRestore");
          }
        });
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.log(e);
      }
    }
  });
  // 恢复数据
  ipcMain.on("restore", () => {
    try {
      dialog
        .showOpenDialog(global.mainWindow, {
          title: global.currentLanguage.restoreData,
          filters: [{ name: "JSON", extensions: ["json"] }],
        })
        .then((r) => {
          if (!r.canceled && !util.arrayIsEmpty(r.filePaths)) {
            if (!util.strIsEmpty(r.filePaths[0])) {
              fs.copyFileSync(r.filePaths[0], app.getPath("userData") + "\\data.json");
              // 清空所有文件映射监听
              if (global.mapDirectoryWatcher != null) {
                for (let value of global.mapDirectoryWatcher.values()) {
                  if (value != null && value.watch != null && value.watch) {
                    value.watch.close();
                  }
                }
                global.mapDirectoryWatcher = new Map();
              }
              // 初始化图标数据
              data.getList();
              data.splitData();
              // 重新获取数据
              global.mainWindow.webContents.send("getAllData");
            }
          }
        });
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.log(e);
      }
    }
  });
  // 设置置顶
  ipcMain.on("setAlwaysTop", (event, args) => {
    if (args) {
      global.mainWindow.setAlwaysOnTop(true, "screen-saver");
    } else {
      global.mainWindow.setAlwaysOnTop(false);
    }
  });
  // 反馈
  ipcMain.on("feedback", () => {
    shell.openExternal("https://support.qq.com/product/487828");
  });
  // 锁定尺寸
  ipcMain.on("setResize", (event, args) => {
    global.mainWindow.setResizable(args);
  });
  // 设置透明度
  ipcMain.on("setOpacity", (event, args) => {
    global.mainWindow.setOpacity(Number(args));
  });
  // 设置固定位置
  ipcMain.on("setFixedPosition", (event, args) => {
    setFixedPosition(args[0], args[1]);
  });
  // 永远居中
  ipcMain.on("setAlwaysCenter", (event, args) => {
    if (args[0]) {
      global.mainWindow.center();
      global.mainWindow.setMovable(false);
    } else {
      setFixedPosition(args[1], args[2]);
    }
  });
  // 打赏赞助
  ipcMain.on("rewardAndSponsorship", () => {
    shell.openExternal("https://dawnlauncher.com/sponsor");
  });
  // 跳转搜索窗口高度
  ipcMain.on("setSearchWindowHeight", (event, args) => {
    global.searchWindow.setBounds({ height: args });
  });
  // 隐藏搜索窗口
  ipcMain.on("hideSearchWindow", () => {
    if (global.searchWindow.isVisible()) {
      global.searchWindow.hide();
    }
  });
  // 窗口设置透明
  ipcMain.on("setSearchWindowOpacity", (event, args) => {
    global.searchWindow.setOpacity(args);
    event.returnValue = null;
  });
  // 获取release
  ipcMain.on("getRelease", (event, args) => {
    event.returnValue = os.release();
  });
  // 获取背景图
  ipcMain.on("getBackgroundImageBase64", (event, args) => {
    let params = JSON.parse(args);
    fs.readFile(app.getPath("userData") + "\\images\\" + params.backgroundImage, (err, data) => {
      if (!err) {
        try {
          let buffer = Buffer.from(data);
          let image = "data:" + mime.getType(params.backgroundImage) + ";base64," + buffer.toString("base64");
          if (params.page == "main") {
            global.mainWindow.webContents.send("returnBackgroundImageBase64", image);
          } else {
            global.settingWindow.webContents.send("returnBackgroundImageBase64", image);
          }
        } catch (e) {
          if (process.env.NODE_ENV !== "production") {
            console.log(e);
          }
        }
      }
    });
  });
  // 通知快速搜索窗口获取数据
  ipcMain.on("noticeSearchWindowGetData", () => {
    if (global.searchWindow != null) {
      global.searchWindow.webContents.send("searchWindowGetData");
    }
  });
  // 获取软件目录
  ipcMain.on("getPath", (event, args) => {
    event.returnValue = process.env.NODE_ENV !== "production" ? path.resolve(".") : path.dirname(process.execPath);
  });
  // 获取图标
  ipcMain.on("getIconData", (event) => {
    let iconData = data.getIconData();
    event.returnValue = iconData;
  });
  // 更新图标
  ipcMain.on("updateIconData", (event, args) => {
    // 参数
    let updateIconData = JSON.parse(args);
    // 获取图标数据
    let iconData = data.store.get("iconData");
    if (iconData != null) {
      // 删除
      if (!util.arrayIsEmpty(updateIconData.delete)) {
        for (let del of updateIconData.delete) {
          let index;
          for (let i = 0; i < iconData.length; i++) {
            if (
              iconData[i].classificationParentId == del.classificationParentId &&
              iconData[i].classificationChildId == del.classificationChildId &&
              iconData[i].itemId == del.itemId
            ) {
              index = i;
              break;
            }
          }
          if (index != null) {
            iconData.splice(index, 1);
          }
        }
      }
      // 添加
      if (!util.arrayIsEmpty(updateIconData.add)) {
        for (let add of updateIconData.add) {
          let icon = {
            classificationParentId: add.classificationParentId,
            classificationChildId: add.classificationChildId,
            itemId: add.itemId,
            icon: add.icon,
          };
          iconData.push(icon);
        }
      }
      // 更新
      if (!util.arrayIsEmpty(updateIconData.update)) {
        for (let update of updateIconData.update) {
          let flag = false;
          for (let icon of iconData) {
            if (
              icon.classificationParentId == update.classificationParentId &&
              icon.classificationChildId == update.classificationChildId &&
              icon.itemId == update.itemId
            ) {
              icon.icon = update.icon;
              flag = true;
              break;
            }
          }
          if (!flag) {
            iconData.push(update);
          }
        }
      }
      // set
      data.store.set("iconData", iconData);
    }
    // 更新搜索框图标数据
    if (global.searchWindow != null && !global.searchWindow.isDestroyed()) {
      global.searchWindow.webContents.send("searchWindowUpdateIconData", args);
    }
  });
  // 通知搜索窗口重新获取图标数据
  ipcMain.on("searchWindowGetIconData", (event, args) => {
    if (global.searchWindow != null && !global.searchWindow.isDestroyed()) {
      global.searchWindow.webContents.send("getIconData");
    }
  });
  // showMessageBoxSync
  ipcMain.on("showMessageBoxSync", (event, args) => {
    let index = dialog.showMessageBoxSync(global.mainWindow, {
      title: "Dawn Launcher",
      message: args,
      buttons: [global.currentLanguage.ok, global.currentLanguage.cancel],
      type: "question",
      noLink: true,
      cancelId: 1,
    });
    event.returnValue = index == 0 ? true : false;
  });
  // 选择文件夹
  ipcMain.on("openDirectory", (event, args) => {
    let params = JSON.parse(args);
    let options = {
      properties: ["openDirectory"],
    };
    if (!util.strIsEmpty(params.defaultPath)) {
      options.defaultPath = params.defaultPath;
    } else {
      options.defaultPath = app.getPath("desktop");
    }
    dialog.showOpenDialog(params.window == "mainWindow" ? global.mainWindow : null, options).then((r) => {
      if (r.filePaths.length > 0) {
        event.returnValue = r.filePaths[0];
      } else {
        event.returnValue = null;
      }
    });
  });
  // 选择文件
  ipcMain.on("openFile", (event, args) => {
    let params = JSON.parse(args);
    let options = {};
    if (!util.strIsEmpty(params.defaultPath)) {
      options.defaultPath = params.defaultPath;
    } else {
      options.defaultPath = app.getPath("desktop");
    }
    dialog.showOpenDialog(params.window == "mainWindow" ? global.mainWindow : null, options).then((r) => {
      if (r.filePaths.length > 0) {
        let filePath = r.filePaths[0];
        if (params.target) {
          if (mime.getType(filePath) == "application/x-ms-shortcut") {
            // 快捷方式
            // 获取真实文件路径和参数
            let shortcutDetail = global.api.GetShortcutFile(filePath);
            if (!util.strIsEmpty(shortcutDetail.target)) {
              // 路径
              filePath = shortcutDetail.target;
            }
          }
        }
        event.returnValue = filePath;
      } else {
        event.returnValue = null;
      }
    });
  });
}
