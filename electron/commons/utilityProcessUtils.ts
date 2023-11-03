import { MessageChannelMain, app, utilityProcess } from "electron";
import { join } from "node:path";
import { writeFileSync, readFileSync, unlink } from "node:fs";
import { ChildProcessInfo } from "../types/global";

/**
 * 子进程
 * @param name
 * @param data
 */
function fork(name: string, data: any, callback: Function) {
  // 随机数
  let min = 1;
  let max = 99999;
  let random = Math.floor(Math.random() * (max - min + 1)) + min;
  // 子进程
  const { port1, port2 } = new MessageChannelMain();
  const childProcess = utilityProcess.fork(join(__dirname, "worker.js"));
  // 存储子进程信息
  if (!global.childProcessMap) {
    global.childProcessMap = new Map();
  }
  global.childProcessMap.set(childProcess.pid, <ChildProcessInfo>{
    utilityProcess: childProcess,
    port1,
    port2,
  });
  // 获取临时目录
  let temp = app.getPath("temp");
  // 参数文件
  let paramFilePath =
    temp + "\\" + random + "." + new Date().getTime() + "." + name + ".txt";
  // 创建文件并写入数据
  writeFileSync(paramFilePath, JSON.stringify(data), {
    encoding: "utf-8",
  });
  // 发送消息
  let params = {
    name,
    data: {
      filePath: paramFilePath,
    },
  };
  // 创建子进程完成后发送消息
  childProcess.once("spawn", () => {
    childProcess.postMessage(JSON.stringify(params), [port1]);
  });
  // 等待接收消息
  port2.start();
  port2.once("message", (event) => {
    let data: string = event.data;
    try {
      if (data !== "exit") {
        // 读取文件
        let res = readFileSync(data, { encoding: "utf-8" });
        // 删除文件
        unlink(data, () => {});
        // 回调
        callback(JSON.parse(res));
      }
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.log(e);
      }
    } finally {
      // 关闭子进程
      childProcess.kill();
    }
  });
  // 监听关闭子进程
  childProcess.once("exit", () => {
    // 关闭通道
    port1.close();
    port2.close();
    // 删除信息
    global.childProcessMap.delete(childProcess.pid);
  });
}

export { fork };
