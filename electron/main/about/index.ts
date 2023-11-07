import { BrowserWindow, shell } from "electron";
import { closeWindow, getMainBackgorunColor } from "../commons";
import { join } from "node:path";

// 窗口
let aboutWindow: BrowserWindow | null = null;

/**
 * 关于窗口
 */
function createWindow() {
  // 如果窗口存在先关闭窗口
  closeWindow(aboutWindow);
  // 创建窗口
  aboutWindow = global.aboutWindow = new BrowserWindow({
    title: "Dawn Launcher",
    frame: false,
    parent: global.mainWindow,
    height: 212,
    width: 600,
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
    aboutWindow.loadURL(process.env.VITE_DEV_SERVER_URL + "About");
  } else {
    aboutWindow.loadFile(join(process.env.DIST, "index.html"), {
      hash: "/About",
    });
  }
  aboutWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // 禁用标题栏右键
  aboutWindow.hookWindowMessage(278, function (e) {
    // 窗口禁用
    aboutWindow.setEnabled(false);
    // 延时太快会立刻启动，太慢会妨碍窗口其他操作，可自行测试最佳时间
    setTimeout(() => {
      aboutWindow.setEnabled(true);
    }, 100);
    return true;
  });
}

export { createWindow };
