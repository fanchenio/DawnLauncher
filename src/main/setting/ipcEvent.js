import { app, dialog, ipcMain } from "electron";
import data from "./data";
import index from "./index";
import util from "../util";
import fs from "fs";
import path from "path";

/**
 * 判断路径是否一样
 * @param currentAppDataPath
 * @param profileAppDataPath
 */
function pathIsEqual(currentAppDataPath, profileAppDataPath) {
  let c = path.normalize(currentAppDataPath);
  let p = path.normalize(profileAppDataPath);
  return c == p;
}

export default function () {
  // 获取数据
  ipcMain.on("getSetting", (event, args) => {
    event.returnValue = data.get();
  });
  // set数据
  ipcMain.on("setSetting", (event, args) => {
    let params = JSON.parse(args);
    // 保存数据
    data.set(params.setting);
    // 需要通知
    if (params.other.main) {
      if (global.mainWindow != null) {
        global.mainWindow.webContents.send("mainWindowGetData");
      }
    }
    if (params.other.search) {
      if (global.searchWindow != null && !global.searchWindow.isDestroyed() && global.searchWindow.isVisible()) {
        global.searchWindow.webContents.send("searchWindowGetData");
        global.searchWindow.setBackgroundColor(global.setting.appearance.theme.mainBackground.replace("bg-[", "").replace("]", ""));
      }
    }
    if (params.other.setting) {
      if (global.settingWindow != null && !global.settingWindow.isDestroyed() && global.settingWindow.isVisible()) {
        global.settingWindow.webContents.send("settingWindowGetData");
      }
    }
  });
  // 设置快捷键
  ipcMain.on("setShortcutKey", (event, args) => {
    let setting = JSON.parse(args);
    index.setShortcutKey(setting);
  });
  // 设置启动后最小化到系统托盘
  ipcMain.on("setStartupTray", (event, args) => {
    if (args) {
      util.edgeAdsorb();
    }
  });
  // 获取数据目录
  ipcMain.on("getAppDataPath", (event, args) => {
    try {
      // 获取数据目录配置文件地址
      let p = index.getDawnLauncherProfilePath();
      // 读取文件
      let r = fs.readFileSync(p);
      event.returnValue = r.toString();
    } catch (e) {
      event.returnValue = app.getPath("appData");
    }
  });
  // 选择用户数据目录
  ipcMain.on("chooseDataDirectory", (event, args) => {
    dialog.showOpenDialog(global.settingWindow, { properties: ["openDirectory"] }).then((r) => {
      if (r.filePaths.length > 0) {
        event.returnValue = r.filePaths[0];
      } else {
        event.returnValue = null;
      }
    });
  });
  // 提示切换数据目录
  ipcMain.on("promptChangeDataDirectory", (event, args) => {
    dialog
      .showMessageBox(global.mainWindow, {
        message: global.currentLanguage.modifyDataDirectoryMessage,
        buttons: [global.currentLanguage.ok, global.currentLanguage.cancel],
        type: "question",
        noLink: true,
        cancelId: 1,
      })
      .then((r) => {
        if (r.response == 0) {
          // 获取数据目录配置文件地址
          let p = index.getDawnLauncherProfilePath();
          if (util.strIsEmpty(args)) {
            try {
              let profile = fs.readFileSync(p);
              // 路径不一样的话，开始移动和删除文件
              if (!pathIsEqual(global.defaultAppDataPath, profile.toString())) {
                try {
                  // 删除默认路径下的文件
                  fs.rmdirSync(global.defaultAppDataPath + "\\Dawn Launcher");
                } catch (e) {}
                try {
                  // 将现在文件夹的内容移动到默认路径下
                  fs.cpSync(profile.toString() + "\\Dawn Launcher", global.defaultAppDataPath + "\\Dawn Launcher", { recursive: true });
                } catch (e) {}
              }
              // 删除配置数据目录文件
              try {
                fs.rmSync(p);
              } catch (e) {}
            } catch (e) {
              if (process.env.NODE_ENV !== "production") {
                console.log(e);
              }
            }
          } else {
            try {
              // 写入内容
              fs.writeFileSync(p, args);
              try {
                // 删除写入内容文件夹
                fs.rmdirSync(args + "\\Dawn Launcher");
              } catch (e) {}
              try {
                // 将现有文件夹内容移动到写入文件夹内容
                fs.cpSync(app.getPath("appData") + "\\Dawn Launcher", args + "\\Dawn Launcher", { recursive: true });
              } catch (e) {}
            } catch (e) {}
          }
          app.relaunch();
          app.exit();
        }
      });
  });
  // 拷贝背景图
  ipcMain.on("copyBackgroundImage", (event, args) => {
    let parsedPath = path.parse(args);
    let destPath = app.getPath("userData") + "\\images";
    let name = "backgroundImage" + parsedPath.ext;
    try {
      fs.statSync(destPath);
    } catch (e) {
      fs.mkdirSync(destPath);
    }
    try {
      fs.copyFileSync(args, destPath + "\\" + name);
      event.returnValue = name;
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.log(e);
      }
      event.returnValue = null;
    }
  });
  // 关闭设置窗口
  ipcMain.on("closeSettingWindow", (event, args) => {
    if (global.settingWindow != null && !global.settingWindow.isDestroyed()) {
      global.settingWindow.close();
    }
  });
}
