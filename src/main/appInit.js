import { app } from "electron";
import fs from "fs";
import path from "path";

function getDawnLauncherProfilePath() {
  let p;
  if (process.env.NODE_ENV !== "production") {
    p = path.resolve(".");
  } else {
    p = path.dirname(process.execPath);
  }
  p = path.resolve(p, "..");
  p = path.join(p, ".dawn_launcher_profile");
  return p;
}

try {
  // 安装版
  // 记录一下默认目录
  global.defaultAppDataPath = app.getPath("appData");
  // 获取数据目录配置文件地址
  let dataDirPath = getDawnLauncherProfilePath();
  // 读取文件内容
  let r = fs.readFileSync(dataDirPath);
  if (r != null) {
    let appDataPath = r.toString();
    fs.statSync(appDataPath);
    app.setPath("appData", appDataPath);
  }
  // 免安装版
  // app.setPath("appData", process.env.NODE_ENV !== "production" ? path.resolve(".") + "/data" : path.dirname(process.execPath) + "/data");
} catch (e) {}
