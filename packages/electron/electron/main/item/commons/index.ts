import { release } from "node:os";
import {
  batchAdd,
  deleteAll,
  initStartMenuItemTable,
  initSystemItem,
  list,
  startMenuItemTableName,
  systenItemTableName,
} from "./data";
import { CommonItem } from "../../../../types/item";
import { fork } from "../../../commons/utilityProcessUtils";
import { sendToWebContent } from "../../commons";

/**
 * 获取系统项目
 */
function getSystemItemList() {
  initSystemItem();
  return list(systenItemTableName);
}

/**
 * 获取开始菜单项目列表
 */
function getStartMenuItemList() {
  // 初始化表
  initStartMenuItemTable();
  // 查询缓存
  let cacheList = list(startMenuItemTableName);
  // 清空表
  deleteAll(startMenuItemTableName);
  // 子进程
  fork("getStartMenuItemList", cacheList, (resultList: Array<CommonItem>) => {
    // 添加缓存
    batchAdd(resultList);
    // 发送消息到页面
    sendToWebContent("itemAddEditWindow", "onGetStartMenuItemList", resultList);
  });
}

/**
 * APPX项目
 */
function getAppxItemList() {
  // 大于win10才有APPX
  let releaseArr = release().split(".");
  if (Number(releaseArr[0]) >= 10) {
    // 子进程
    fork("getAppxItemList", {}, (resultList: Array<CommonItem>) => {
      // 发送消息到页面
      sendToWebContent("itemAddEditWindow", "onGetAppxItemList", resultList);
    });
  } else {
    // 发送消息到页面
    sendToWebContent("itemAddEditWindow", "onGetAppxItemList", []);
  }
}

export { getSystemItemList, getStartMenuItemList, getAppxItemList };
