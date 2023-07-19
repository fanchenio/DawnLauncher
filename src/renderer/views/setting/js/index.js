const { ipcRenderer } = window.require("electron");

export default {
  /**
   * 重新设置
   */
  resetSetting(setting) {
    // 开机启动
    ipcRenderer.send("setAutoLaunch", setting.general.startup);
    // 隐藏托盘图标
    ipcRenderer.send("setTray", !setting.general.hideTray);
    // 永远置顶
    ipcRenderer.send("setAlwaysTop", setting.general.alwaysTop);
    // 锁定尺寸
    ipcRenderer.send("setResize", !setting.general.lockSize);
    // 固定位置
    ipcRenderer.send("setFixedPosition", [!setting.general.fixedPosition, setting.general.alwaysCenter]);
    // 永远居中
    ipcRenderer.send("setAlwaysCenter", [setting.general.alwaysCenter, !setting.general.fixedPosition, setting.general.alwaysCenter]);
    // 隐藏任务栏
    ipcRenderer.send("setHideTaskbar", setting.general.hideTaskbar);
    // 设置透明度
    ipcRenderer.send("setOpacity", setting.appearance.transparency);
    // 设置快捷键
    ipcRenderer.send("setShortcutKey", JSON.stringify(setting));
  },
};
