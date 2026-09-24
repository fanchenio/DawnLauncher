import { app } from "electron";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

if (process.env.NODE_ENV !== "development") {
  const portableDirectory = process.env.PORTABLE_EXECUTABLE_DIR;
  if (portableDirectory || import.meta.env.VITE_INSTALL === "false") {
    const dataPath = join(portableDirectory || dirname(process.execPath), "data");
    mkdirSync(dataPath, { recursive: true });
    app.setPath("appData", dataPath);
    app.setPath("userData", dataPath);
    app.setPath("sessionData", dataPath);
  } else {
    // 定制安装版独立存储，不能读取或覆盖原版不兼容的数据库。
    app.setName("Dawn Launcher Custom");
    const dataPath = join(app.getPath("appData"), app.getName());
    mkdirSync(dataPath, { recursive: true });
    app.setPath("userData", dataPath);
    app.setPath("sessionData", dataPath);
  }
}

// 此模块必须先于业务模块加载，让重复启动在打开数据库之前退出。
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let activationRequested = false;

function activateMainWindow() {
  activationRequested = true;
  const window = global.mainWindow;
  if (!window || window.isDestroyed() || window.webContents.isLoadingMainFrame()) {
    return;
  }
  activationRequested = false;
  if (window.isMinimized()) {
    window.restore();
  }
  window.show();
  window.focus();
  global.blurHide = true;
}

app.on("second-instance", activateMainWindow);

export function showPendingMainWindow() {
  // 快速双击可能早于首页加载，保留唤起请求直到页面可显示。
  if (activationRequested) {
    activateMainWindow();
  }
}
