import { BrowserWindow, shell } from "electron";
import { closeWindow, getMainBackgorunColor } from "../commons";
import { join } from "node:path";
import { getDataSqlite3 } from "../../commons/betterSqlite3";

// 窗口
let backupRestoreDataWindow: BrowserWindow | null = null;

/**
 * 备份/恢复数据窗口
 */
function createBackupRestoreDataWindow() {
  // 如果窗口存在先关闭窗口
  closeWindow(backupRestoreDataWindow);
  // 创建窗口
  backupRestoreDataWindow = global.backupRestoreDataWindow = new BrowserWindow({
    title: "Dawn Launcher",
    frame: false,
    parent: global.mainWindow,
    height: 108,
    width: 400,
    maximizable: false,
    minimizable: false,
    resizable: false,
    fullscreenable: false,
    focusable: true,
    show: false,
    backgroundColor: getMainBackgorunColor(),
    webPreferences: {
      spellcheck: false,
      preload: join(__dirname, "../preload/index.js"),
      devTools: process.env.NODE_ENV === "development",
    },
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    backupRestoreDataWindow.loadURL(
      process.env.VITE_DEV_SERVER_URL + "Data/BackupRestore"
    );
  } else {
    backupRestoreDataWindow.loadFile(join(process.env.DIST, "index.html"), {
      hash: "/Data/BackupRestore",
    });
  }
  backupRestoreDataWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // 禁用标题栏右键
  backupRestoreDataWindow.hookWindowMessage(278, function (e) {
    // 窗口禁用
    backupRestoreDataWindow.setEnabled(false);
    // 延时太快会立刻启动，太慢会妨碍窗口其他操作，可自行测试最佳时间
    setTimeout(() => {
      backupRestoreDataWindow.setEnabled(true);
    }, 100);
    return true;
  });
}

/**
 * 备份数据
 */
function backupData(filePath: string) {
  // 获取数据库
  let db = getDataSqlite3();
  // 备份数据
  return db.backup(filePath);
}

export { createBackupRestoreDataWindow, backupData };
