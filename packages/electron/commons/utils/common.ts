import { Classification, ClassificationData } from "../../types/classification";
import { CommonItem, CommonItemData, Item, ItemData } from "../../types/item";

/**
 * 转换
 */
function convert<F, T>(from: F): T {
  return JSON.parse(JSON.stringify(from)) as T;
}

/**
 * 是否是绝对路径
 * @param path
 * @returns
 */
function isAbsolutePath(path: string) {
  const regex = /^[a-zA-Z]:\\/;
  return regex.test(path);
}

/**
 * 删除文件后缀
 * @param name
 * @returns
 */
function deleteExtname(name: string | null) {
  if (name && name.trim() !== "") {
    if (name.indexOf(".") > 0) {
      return name.substring(0, name.lastIndexOf("."));
    } else {
      return name;
    }
  }
  return null;
}

/**
 * 获取文件名
 * @param path
 * @returns
 */
function getFileName(path: string | null) {
  if (path && path.trim() !== "") {
    let split = path.split("\\");
    return split[split.length - 1];
  } else {
    return null;
  }
}

/**
 * 获取文件拓展名
 * @param path
 * @returns
 */
function getFileExtname(path: string | null) {
  // 获取文件名
  let fileName = getFileName(path);
  if (fileName && fileName.trim() !== "") {
    if (fileName.indexOf(".") >= 0) {
      return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }
  }
  return null;
}

/**
 * 初始化CLassification
 * @returns
 */
function newClassification({
  id = null,
  parentId = null,
  name = null,
  type = null,
  data = null,
  shortcutKey = null,
  globalShortcutKey = false,
  order = null,
  childList = null,
}: {
  id?: number | null;
  parentId?: number | null;
  name?: string | null;
  type?: number | null;
  data?: ClassificationData | null;
  shortcutKey?: string | null;
  globalShortcutKey?: boolean | null;
  order?: number | null;
  childList?: Array<Classification> | null;
}): Classification {
  return {
    id: id ?? 0,
    parentId: parentId ?? null,
    name: name ?? null,
    type: type ?? 0,
    data: data ? newClassificationData(data) : newClassificationData({}),
    shortcutKey: shortcutKey ?? null,
    globalShortcutKey: globalShortcutKey ?? false,
    order: order ?? 0,
    childList: childList ?? null,
  };
}

/**
 * 初始化ClassificationData
 * @returns
 */
function newClassificationData({
  icon = null,
  associateFolderPath = null,
  associateFolderHiddenItems = null,
  itemLayout = "default",
  itemSort = "default",
  itemColumnNumber = null,
  itemIconSize = null,
  itemShowOnly = "default",
  fixed = false,
  aggregateItemCount = 50,
  excludeSearch = false,
}: {
  icon?: string | null;
  associateFolderPath?: string | null;
  associateFolderHiddenItems?: string | null;
  itemLayout?: "default" | "tile" | "list";
  itemSort?: "default" | "initial" | "openNumber" | "lastOpen";
  itemColumnNumber?: number | null;
  itemIconSize?: number | null;
  itemShowOnly?: "default" | "file" | "folder";
  fixed?: boolean | null;
  aggregateItemCount?: number | null;
  excludeSearch?: boolean | null;
}): ClassificationData {
  return {
    icon: icon ?? null,
    associateFolderPath: associateFolderPath ?? null,
    associateFolderHiddenItems: associateFolderHiddenItems ?? null,
    itemLayout: itemLayout ?? "default",
    itemSort: itemSort ?? "default",
    itemColumnNumber: itemColumnNumber ?? null,
    itemIconSize: itemIconSize ?? null,
    itemShowOnly: itemShowOnly ?? "default",
    fixed: fixed ?? false,
    aggregateItemCount: aggregateItemCount ?? 50,
    excludeSearch: excludeSearch ?? false,
  };
}

/**
 * 初始化CommonItem
 * @returns
 */
function newCommonItem({
  id = null,
  name = null,
  data = null,
  order = null,
}: {
  id?: number | null;
  name?: string | null;
  data?: CommonItemData | null;
  order?: number | null;
}): CommonItem {
  return {
    id: id ?? 0,
    name: name ?? null,
    data: data ? newCommonItemData(data) : newCommonItemData({}),
    order: order ?? 0,
  };
}

/**
 * 初始化CommonItemData
 * @returns
 */
function newCommonItemData({
  target = null,
  params = null,
  icon = null,
  htmlIcon = null,
}: {
  target?: string | null;
  params?: string | null;
  icon?: string | null;
  htmlIcon?: string | null;
}): CommonItemData {
  return {
    target: target ?? null,
    params: params ?? null,
    icon: icon ?? null,
    htmlIcon: htmlIcon ?? null,
  };
}

/**
 * 初始化Item
 * @returns
 */
function newItem({
  id = null,
  classificationId,
  name = null,
  type = null,
  data = null,
  shortcutKey = null,
  globalShortcutKey = false,
  order = null,
}: {
  id?: number | null;
  classificationId: number;
  name?: string | null;
  type?: number | null;
  data?: ItemData | null;
  shortcutKey?: string | null;
  globalShortcutKey?: boolean | null;
  order?: number | null;
}): Item {
  return {
    id: id ?? 0,
    classificationId,
    name: name ?? null,
    type: type ?? 0,
    data: data ? newItemData(data) : newItemData({}),
    shortcutKey: shortcutKey ?? null,
    globalShortcutKey: globalShortcutKey ?? false,
    order: order ?? 0,
  };
}

/**
 * 初始化ItemData
 * @returns
 */
function newItemData({
  startLocation = null,
  target = null,
  params = null,
  runAsAdmin = false,
  icon = null,
  htmlIcon = null,
  remark = null,
  iconBackgroundColor = false,
  fixedIcon = false,
  openNumber = 0,
  lastOpen = 0,
  quickSearchOpenNumber = 0,
  quickSearchLastOpen = 0,
  multiItemsTimeInterval = 0,
}: {
  startLocation?: string | null;
  target?: string | null;
  params?: string | null;
  runAsAdmin?: boolean | null;
  icon?: string | null;
  htmlIcon?: string | null;
  remark?: string | null;
  iconBackgroundColor?: boolean | null;
  fixedIcon?: boolean | null;
  openNumber?: number | null;
  lastOpen?: number | null;
  quickSearchOpenNumber?: number | null;
  quickSearchLastOpen?: number | null;
  multiItemsTimeInterval?: number | null;
}): ItemData {
  return {
    startLocation: startLocation ?? null,
    target: target ?? null,
    params: params ?? null,
    runAsAdmin: runAsAdmin ?? false,
    icon: icon ?? null,
    htmlIcon: htmlIcon ?? null,
    remark: remark ?? null,
    iconBackgroundColor: iconBackgroundColor ?? false,
    fixedIcon: fixedIcon ?? false,
    openNumber: openNumber ?? 0,
    lastOpen: lastOpen ?? 0,
    quickSearchOpenNumber: quickSearchOpenNumber ?? 0,
    quickSearchLastOpen: quickSearchLastOpen ?? 0,
    multiItemsTimeInterval: multiItemsTimeInterval ?? 0,
  };
}

/**
 * 获取项目名
 * @param name
 * @returns
 */
function getItemName(name: string | null) {
  if (name) {
    return name.replace(/\\n/g, " ");
  }
  return "";
}

export {
  convert,
  isAbsolutePath,
  deleteExtname,
  getFileName,
  getFileExtname,
  newClassification,
  newClassificationData,
  newCommonItem,
  newCommonItemData,
  newItem,
  newItemData,
  getItemName,
};
