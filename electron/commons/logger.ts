import { app } from "electron";
import Logger from "electron-log";
import { join, dirname } from "node:path";

// 名称
let date = new Date();
let logName =
  date.getFullYear() +
  "-" +
  (date.getMonth() + 1 < 10
    ? "0" + (date.getMonth() + 1)
    : date.getMonth() + 1) +
  "-" +
  date.getDate();

// 日志
if (
  process.env.NODE_ENV !== "development" &&
  import.meta.env.VITE_INSTALL === "false"
) {
  Logger.transports.file.resolvePathFn = () =>
    join(dirname(process.execPath), "data", "logs", logName + ".log");
} else {
  Logger.transports.file.resolvePathFn = () =>
    join(app.getPath("userData"), "logs", logName + ".log");
}

export default {
  error(content: any) {
    Logger.error(content);
  },
};
