import { resolve, dirname, parse } from "node:path";
import { isAbsolutePath } from "../../commons/utils/common";
import mime from "mime";
import { readFileSync } from "node:fs";

// 图标格式
const iconExts = ["jpg", "jpeg", "png", "gif", "ico", "svg", "webp"];

/**
 * 随机user-agent
 */
function getRandomUserAgent() {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/89.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/89.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.123",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/76.0.4017.123",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/89.0",
  ];
  const randomIndex = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomIndex];
}

/**
 * 组装参数
 * @param paramsMap
 * @returns
 */
function getURLParams(paramsMap: Map<string, any>) {
  let res = "";
  if (paramsMap.size > 0) {
    res += "?";
    let params: string | null = null;
    paramsMap.forEach((value, key) => {
      if (params) {
        params += "&" + key + "=" + value;
      } else {
        params = key + "=" + value;
      }
    });
    res += params;
  }
  return res;
}

/**
 * 解析环境变量
 * @param path
 */
function parseEnvPath(path: string) {
  // 尝试解析路径中的环境变量
  let parsedPath = parse(path);
  let isBase = false;
  let pathArr: Array<string> = [];
  if (!parsedPath.dir || parsedPath.dir.trim() === "") {
    pathArr = parsedPath.base.split("\\");
    isBase = true;
  } else {
    pathArr = parsedPath.dir.split("\\");
  }
  // 新路径
  let newPathArr: Array<string> = [];
  // 正则提取环境变量 %{path}% 提取中间的path名称
  const pattern = /^%.*%$/;
  for (let string of pathArr) {
    // 符合环境变量正则
    if (pattern.test(string)) {
      // 尝试获取
      let env: string | null = global.addon.getEnvByName(
        string.substring(1, string.length - 1)
      );
      // 如果提取到环境变量了就使用环境变量路径，如果没有就使用原路径
      if (env && env.trim() !== "") {
        newPathArr.push(env);
      } else {
        newPathArr.push(string);
      }
    } else {
      // 没有匹配到正则，使用原路径
      newPathArr.push(string);
    }
  }
  // 根据上方解析，如果拥有dir的话，需要追加base变量
  if (!isBase) {
    newPathArr.push(parsedPath.base);
  }
  // 拼接并返回
  return newPathArr.join("\\");
}

/**
 * 获取绝对路径
 * @param path
 */
function getAbsolutePath(path: string) {
  if (!isAbsolutePath(path)) {
    // 尝试解析环境变量
    let newPath = parseEnvPath(path);
    // 判断解析之后的路径是否是绝对路径
    if (isAbsolutePath(newPath)) {
      return newPath;
    } else {
      return resolve(
        process.env.NODE_ENV === "development"
          ? resolve(".")
          : dirname(process.execPath),
        path
      );
    }
  }
  return path;
}

/**
 * 获取文件图标
 * @param filePath
 */
function getFileIcon(filePath: string | null) {
  // 图标
  let icon: string | null = null;
  if (filePath) {
    // 获取后缀
    let ext = mime.getExtension(mime.getType(filePath));
    if (iconExts.includes(ext)) {
      // 读取文件
      let buffer = readFileSync(filePath);
      icon =
        "data:" +
        mime.getType(filePath) +
        ";base64," +
        buffer.toString("base64");
    } else {
      // 获取图标
      icon = global.addon.getFileIcon(filePath);
    }
  }
  return icon;
}

export {
  getURLParams,
  getAbsolutePath,
  getFileIcon,
  iconExts,
  getRandomUserAgent,
};
