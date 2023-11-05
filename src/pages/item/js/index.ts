import { CommonItem, Item } from "../../../../types/item";
import { useMainStore } from "../../../store";
import { Classification } from "../../../../types/classification";
import {
  getClassificationById,
  getClassificationChildList,
} from "../../classification/js";
import {
  convert,
  getFileExtname,
  getItemName,
} from "../../../../commons/utils/common";
import { hexToRGBA, removeStyle, setStyle } from "../../../utils/style";
import { pinyin, match } from "pinyin-pro";
// pinia
const store = useMainStore();

/**
 * 设置项目宽度
 */
function setItemWidth() {
  // 获取所有项目列表
  let itemListElementList = document.getElementsByClassName("item-list");
  for (let i = 0; i < itemListElementList.length; i++) {
    let itemListElement = itemListElementList[i];
    // 分类ID
    let classificationId = itemListElement.getAttribute("classification-id");
    // 查询分类
    let classification = classificationId
      ? getClassificationById(parseInt(classificationId))
      : null;
    // 当前项目区域宽度
    let width = itemListElement.getBoundingClientRect().width;
    // 最小宽度
    let minWidth = store.setting.item.width;
    // 获取项目数量
    let itemList = itemListElement.getElementsByClassName("item");
    // 每行数量
    let num = null;
    // 布局
    let layout = getLayout(
      classificationId ? parseInt(classificationId) : null
    );
    // 无名称
    if (store.setting.item.hideItemName) {
      minWidth =
        getIconSize(classificationId ? parseInt(classificationId) : null) + 24;
      num = Math.floor(width / (minWidth + 4));
    } else {
      if (layout === "tile") {
        // 平铺布局
        num = Math.floor(width / (minWidth + 4));
      } else if (layout === "list") {
        // 列表布局
        // 先使用分类布局信息
        if (classification && classification.data.itemColumnNumber) {
          if (classification.data.itemColumnNumber === 1) {
            minWidth = width;
          } else {
            num = classification.data.itemColumnNumber;
          }
        } else {
          // 设置-分类布局信息
          if (store.setting.item.columnNumber === 1) {
            minWidth = width;
          } else {
            num = store.setting.item.columnNumber;
          }
        }
      }
    }
    if (
      num !== null &&
      ((layout === "tile" && itemList.length >= num) || layout === "list")
    ) {
      for (let i = 0; i < itemList.length; i++) {
        let itemElement = itemList[i] as HTMLElement;
        itemElement.style.width = (width - num * 4) / num + "px";
      }
    } else {
      for (let i = 0; i < itemList.length; i++) {
        let itemElement = itemList[i] as HTMLElement;
        itemElement.style.width = minWidth + "px";
      }
    }
  }
}

/**
 * 转换项目列表
 */
function convertItemList(itemList: Array<Item>): Map<number, Array<Item>> {
  let itemMap: Map<number, Array<Item>> = new Map();
  // 根据分类ID将列表转为Map
  itemList.forEach((item) => {
    const { classificationId } = item;
    if (!itemMap.has(classificationId)) {
      itemMap.set(classificationId, []);
    }
    itemMap.get(classificationId)!.push(item);
  });
  return itemMap;
}

/**
 * 获取项目列表
 */
function getItemListByClassificationId(
  classificationId: number | null
): Array<Item> {
  let resultList: Array<Item> = [];
  if (classificationId) {
    if (store.itemMap.has(classificationId)) {
      resultList = store.itemMap.get(classificationId)!;
    } else {
      store.itemMap.set(classificationId, resultList);
    }
  }
  return resultList;
}

/**
 * 获取项目列表
 */
function getShowItemListByClassificationId(classificationId: number | null) {
  let resultList: Array<Item> = [];
  if (classificationId) {
    // 查询分类
    let classification = getClassificationById(classificationId);
    if (classification) {
      if (classification.type === 2) {
        for (const value of store.itemMap.values()) {
          resultList.push(...value);
        }
      } else {
        if (store.itemMap.has(classificationId)) {
          resultList = store.itemMap.get(classificationId)!;
        } else {
          store.itemMap.set(classificationId, resultList);
        }
      }
    }
  }
  return { resultList, id: classificationId };
}

/**
 * 添加项目
 */
function addItem(item: Item) {
  let itemList = getItemListByClassificationId(item.classificationId);
  itemList.push(item);
  // 重新排序
  itemList.sort((a, b) => a.order! - b.order!);
}

/**
 * 根据ID查询
 */
function getItemById(id: number): Item | null {
  for (let value of store.itemMap.values()) {
    for (let item of value) {
      if (item.id === id) {
        return item;
      }
    }
  }
  return null;
}

/**
 * 更新项目
 */
function updateItem(item: Item) {
  // 查询项目
  let curItem = getItemById(item.id);
  if (curItem) {
    curItem.name = item.name;
    curItem.shortcutKey = item.shortcutKey;
    curItem.globalShortcutKey = item.globalShortcutKey;
    if (curItem.data) {
      curItem.data.startLocation = item.data.startLocation;
      curItem.data.target = item.data.target;
      curItem.data.params = item.data.params;
      curItem.data.runAsAdmin = item.data.runAsAdmin;
      curItem.data.icon = item.data.icon;
      curItem.data.htmlIcon = item.data.htmlIcon;
      curItem.data.remark = item.data.remark;
      curItem.data.iconBackgroundColor = item.data.iconBackgroundColor;
      curItem.data.fixedIcon = item.data.fixedIcon;
    }
  }
}

/**
 * 删除项目
 */
function deleteItem(id: number) {
  for (let value of store.itemMap.values()) {
    // index
    let index: number | null = null;
    // 当前项目
    let item: Item | null = null;
    for (let i = 0; i < value.length; i++) {
      if (value[i].id === id) {
        index = i;
        item = value[i];
        break;
      }
    }
    if (index !== null && item) {
      // 删除
      value.splice(index, 1);
      // 更新目标分类下其他项目序号
      for (let i of value) {
        if (i.order >= item.order) {
          i.order -= 1;
        }
      }
      break;
    }
  }
}

/**
 * 根据分类ID删除项目
 */
function deleteItemByClassificationId(classificationId: number | null) {
  if (classificationId && store.itemMap.has(classificationId)) {
    store.itemMap.delete(classificationId);
  }
}

/**
 * 根据ID查询列表
 */
function getItemByIdList(idList: Array<number>): Array<Item> {
  let itemList = [];
  for (const id of idList) {
    let item = getItemById(id);
    if (item) {
      itemList.push(item);
    }
  }
  // 返回列表
  let resultList = [];
  // 根据传入的参数排序
  for (const id of idList) {
    for (const item of itemList) {
      if (id === item.id) {
        resultList.push(item);
        break;
      }
    }
  }
  return resultList;
}

/**
 * 项目排序
 */
function updateItemOrder(
  fromIdList: Array<number>,
  toClassificationId: number,
  newIndex: number | null
) {
  // 查询来源项目
  let fromItemList = getItemByIdList(fromIdList);
  if (fromItemList.length > 0) {
    // 删除来源项目原有位置
    for (const item of fromItemList) {
      deleteItem(item.id);
    }
    // 查询目标分类是否是父级分类，如果是父级分类的话，获取他下面的第一个子分类
    let childClassificationList =
      getClassificationChildList(toClassificationId);
    if (childClassificationList.length > 0) {
      toClassificationId = childClassificationList[0].id;
    }
    // 记录来源项目都是来源于哪些分类，需要重新排序
    let fromClassificationIdList = [];
    for (const item of fromItemList) {
      if (
        item.classificationId != toClassificationId &&
        fromClassificationIdList.indexOf(item.classificationId) < 0
      ) {
        fromClassificationIdList.push(item.classificationId);
      }
    }
    // 查询目标项目列表
    let toItemList = getItemListByClassificationId(toClassificationId);
    // 将来源项目插入到目标项目列表
    if (newIndex !== null) {
      toItemList.splice(newIndex, 0, ...fromItemList);
    } else {
      toItemList.push(...fromItemList);
    }
    // 目标分类重新排序和修改分类信息
    for (let i = 0; i < toItemList.length; i++) {
      toItemList[i].order = i + 1;
      toItemList[i].classificationId = toClassificationId;
    }
    // 重新排序
    toItemList.sort((a, b) => a.order - b.order);
    // 重排序其来源分类项目列表
    for (const id of fromClassificationIdList) {
      let itemList = getItemListByClassificationId(id);
      for (let i = 0; i < itemList.length; i++) {
        itemList[i].order = i + 1;
      }
      // 重新排序
      itemList.sort((a, b) => a.order - b.order);
    }
  }
}

/**
 * 根据分类ID移动项目
 */
function moveItemByClassificationId(
  oldClassificationId: number,
  newClassificationId: number
) {
  if (store.itemMap.has(oldClassificationId)) {
    store.itemMap.set(
      newClassificationId,
      store.itemMap.get(oldClassificationId)!
    );
    deleteItemByClassificationId(oldClassificationId);
  } else {
    store.itemMap.set(newClassificationId, []);
  }
}

/**
 * 获取名称缩写
 */
function getAbbr(name: string): string | null {
  let split = getItemName(name).split(" ");
  let abbr = "";
  if (split.length > 1) {
    for (let i = 0; i < split.length; i++) {
      abbr += split[i].slice(0, 1);
    }
  }
  return abbr === "" ? null : abbr;
}

/**
 * 获取搜索Map
 */
function getItemSearchMap(
  itemList: Array<CommonItem | Item>,
  remark: boolean = false
): Map<string, Array<CommonItem | Item>> {
  // 搜索Map
  let searchMap: Map<string, Array<CommonItem | Item>> = new Map();
  // 循环每一个项目提取名字和缩写找到相同的放到同一个列表中
  for (const item of itemList) {
    if (!item.name) {
      continue;
    }
    // 名称
    let name = item.name.toLowerCase();
    let nameList = searchMap.get(name);
    if (!nameList) {
      nameList = [];
    }
    nameList.push(item);
    searchMap.set(name, nameList);
    // 缩写
    let abbr = getAbbr(item.name);
    if (abbr) {
      abbr = abbr.toLowerCase();
      let abbrList = searchMap.get(abbr);
      if (!abbrList) {
        abbrList = [];
      }
      abbrList.push(item);
      searchMap.set(abbr, abbrList);
    }
    // 网址
    if ((item as Item).type && (item as Item).type === 2) {
      let target = (item as Item).data.target;
      if (target) {
        let url = target.toLowerCase();
        let urlList = searchMap.get(url);
        if (!urlList) {
          urlList = [];
        }
        urlList.push(item);
        searchMap.set(url, urlList);
      }
    }
    // 备注
    if (remark) {
      let r = (item as Item).data.remark;
      if (r && r.trim() !== "") {
        r = r.toLowerCase();
        let remarkList = searchMap.get(r);
        if (!remarkList) {
          remarkList = [];
        }
        remarkList.push(item);
        searchMap.set(r, remarkList);
      }
    }
  }
  return searchMap;
}

/**
 * 判断是否有中文
 */
function hasChinese(str: string): boolean {
  const pattern = /[\u4e00-\u9fa5]/; // 中文字符的 Unicode 范围
  return pattern.test(str);
}

/**
 * 搜索通用项目
 */
function searchItem(
  text: string,
  searchMap: Map<string, Array<CommonItem | Item>>,
  maxLength: number | null = null
): Array<CommonItem | Item> {
  // 返回列表
  let resultList: Array<CommonItem | Item> = [];
  // 转换为小写
  text = text.toLowerCase();
  // 循环搜索Map搜索项目
  for (const [key, value] of searchMap.entries()) {
    let found = false;
    if (hasChinese(key)) {
      // 包含中文
      let res: Array<any> = match(key, text, {
        continuous: true,
        space: "preserve",
      });
      if (res && res.length > 0) {
        found = true;
      }
    } else {
      // 其他情况
      found = key.indexOf(text) >= 0;
    }
    if (found) {
      // 去重并添加
      for (let vItem of value) {
        let exists = false;
        for (let rItem of resultList) {
          if (vItem.id === rItem.id) {
            exists = true;
            break;
          }
        }
        if (!exists) {
          resultList.push(vItem);
        }
      }
    }
  }
  // 最大长度
  if (maxLength) {
    resultList = resultList.slice(0, maxLength);
  }
  return resultList;
}

/**
 * 显示项目列表
 * @param itemList
 * @param classification
 * @returns
 */
function showItemList(
  itemList: Array<Item>,
  classification: Classification | null
) {
  // 返回数据
  let resultList = [];
  // 隐藏项
  let hiddenItemArr: Array<string> = [];
  if (
    classification &&
    classification.type === 1 &&
    classification.data.associateFolderHiddenItems
  ) {
    hiddenItemArr = classification.data.associateFolderHiddenItems
      .toLowerCase()
      .split(",");
  }
  // 过滤
  for (const item of itemList) {
    let extName = getFileExtname(item.data.target);
    if (
      // 判断隐藏项
      (hiddenItemArr.length === 0 ||
        !extName ||
        (extName && hiddenItemArr.indexOf(extName.toLowerCase()) < 0)) &&
      // 判断显示项
      (!classification ||
        (classification &&
          (classification.data.itemShowOnly === "default" ||
            (classification.data.itemShowOnly === "file" && item.type !== 1) ||
            (classification.data.itemShowOnly === "folder" &&
              item.type === 1))))
    ) {
      resultList.push(item);
    }
  }
  // 排序
  if (classification && classification.data.itemSort !== "default") {
    let sortList = sort(resultList, classification.data.itemSort);
    if (sortList) {
      resultList = sortList;
    }
  }
  // 聚合分类
  if (classification && classification.type === 2) {
    // 截取数据
    resultList = resultList.slice(0, classification.data.aggregateItemCount);
  }
  // 返回
  return resultList;
}

/**
 * 排序
 * @param list
 * @param type
 * @param key
 */
function sort(
  list: Array<Item>,
  type:
    | "default"
    | "initial"
    | "openNumber"
    | "lastOpen"
    | "quickSearchOpenNumber"
    | "quickSearchLastOpen"
) {
  if (type === "initial") {
    return list.sort((x, y) => {
      let xn: any, yn: any;
      if (x.name) {
        xn = pinyin(x.name, { toneType: "none", type: "array" })
          .join("")
          .charAt(0)
          .toLowerCase();
      } else {
        xn = "";
      }
      if (y.name) {
        yn = pinyin(y.name, { toneType: "none", type: "array" })
          .join("")
          .charAt(0)
          .toLowerCase();
      } else {
        yn = "";
      }
      // 判断是否是数字
      if (!isNaN(xn) && isNaN(yn)) {
        // xn是数字而yn不是，返回1
        return 1;
      }
      if (!isNaN(yn) && isNaN(xn)) {
        // yn是数字而xn不是，返回-1
        return -1;
      }
      if (xn < yn) {
        return -1;
      }
      if (xn > yn) {
        return 1;
      }
      if (xn == yn) {
        if (x.name && y.name) {
          if (x.name < y.name) {
            return -1;
          }
          if (x.name < y.name) {
            return 1;
          }
        }
      }
      return 0;
    });
  } else if (
    type === "openNumber" ||
    type === "lastOpen" ||
    type === "quickSearchOpenNumber" ||
    type === "quickSearchLastOpen"
  ) {
    return list
      .sort((x, y) => {
        let xn = x.data[type] ?? 0;
        let yn = y.data[type] ?? 0;
        if (xn < yn) {
          return -1;
        }
        if (xn > yn) {
          return 1;
        }
        if (xn === yn) {
          if (x.name && y.name) {
            if (x.name < y.name) {
              return -1;
            }
            if (x.name < y.name) {
              return 1;
            }
          }
        }
        return 0;
      })
      .reverse();
  }
}

/**
 * 运行项目
 * @param type
 * @param operation
 * @param item
 */
function run(type: string, operation: string, item: Item) {
  let itemList: Array<Item> = [];
  if (item.type === 5) {
    if (item.data.target) {
      let arr = item.data.target.split(",");
      for (const a of arr) {
        let item = getItemById(parseInt(a));
        if (item) {
          itemList.push(item);
        }
      }
    }
    window.item.updateOpenInfo(type, item.id);
  } else {
    itemList.push(item);
  }
  if (item.type === 5 && item.data.multiItemsTimeInterval > 0) {
    let index = 0;
    const next = () => {
      if (index < itemList.length) {
        window.item.run(type, operation, convert(itemList[index]));
        index = index + 1;
        if (index < itemList.length) {
          setTimeout(next, item.data.multiItemsTimeInterval);
        }
      }
    };
    next();
  } else {
    for (const element of itemList) {
      window.item.run(type, operation, convert(element));
    }
  }
  if (store.setting.item.openAfterHideMainInterface) {
    window.main.hideWindow();
  }
}

/**
 * 项目选中样式
 */
function itemHoverStyle(e: any, className: string) {
  let style: Map<string, string> = new Map();
  style.set(
    "background-color",
    hexToRGBA(store.setting.appearance.theme.secondBackgroundColor, 0.3)
  );
  setStyle(e, className, style);
}

/**
 * 项目移走样式
 */
function itemRemoveStyle(e: any, className: string) {
  let style: Map<string, string | null> = new Map();
  style.set("background-color", null);
  removeStyle(e, className, style);
}

/**
 * 去除所有项目选中效果
 */
function allItemRemoveStyle() {
  let elementList = document.getElementsByClassName("item");
  for (let i = 0; i < elementList.length; i++) {
    itemRemoveStyle(elementList[i], "item");
  }
}

/**
 * 获取布局
 */
function getLayout(classificationId: number | null) {
  if (classificationId) {
    let classification = getClassificationById(classificationId);
    if (classification && classification.data.itemLayout !== "default") {
      return classification.data.itemLayout;
    }
  }
  return store.setting.item.layout;
}

/**
 * 获取图标大小
 */
function getIconSize(classificationId: number | null) {
  if (classificationId) {
    let classification = getClassificationById(classificationId);
    if (classification && classification.data.itemIconSize !== null) {
      return classification.data.itemIconSize;
    }
  }
  return store.setting.item.iconSize;
}

/**
 * 删除无效项目
 * @param id
 */
function removeInvalidItem(id: number) {
  if (store.invalidItemIdList.includes(id)) {
    let index = store.invalidItemIdList.indexOf(id);
    if (index !== -1) {
      store.invalidItemIdList.splice(index, 1);
    }
  }
}

/**
 * 获取名称
 */
function getName(name: string | null) {
  if (name) {
    return name.replace(/\\n/g, " ");
  } else {
    return "";
  }
}

/**
 * 获取项目标题
 * @param item
 * @returns
 */
function getItemTitle(item: Item) {
  let name =
    store.language.name +
    store.language.colon +
    (item.name ? item.name.replace(/\\n/g, " ") : "");
  if (store.setting.item.openNumber) {
    name +=
      "\n" +
      store.language.openNumber +
      store.language.colon +
      (item.data.openNumber ?? 0);
  }
  if (item.data.remark) {
    name +=
      "\n" + store.language.remark + store.language.colon + item.data.remark;
  }
  return name;
}

/**
 * 过滤排除搜索
 * @returns
 */
function filterExcludeSearchItemList() {
  // 项目列表
  let itemList: Array<Item> = [];
  // 记录排除搜索的分类ID
  let excludeSearchIdList = store.classificationList
    .filter((classification) => classification.data.excludeSearch)
    .map((classification) => classification.id);
  for (const [key, value] of store.itemMap.entries()) {
    // 查询分类
    let classification = getClassificationById(key);
    if (
      classification &&
      !classification.data.excludeSearch &&
      !excludeSearchIdList.includes(classification.id) &&
      (!classification.parentId ||
        !excludeSearchIdList.includes(classification.parentId))
    ) {
      itemList.push(...value);
    }
  }
  return itemList;
}

export {
  setItemWidth,
  getAbbr,
  getItemSearchMap,
  searchItem,
  addItem,
  getItemById,
  updateItem,
  deleteItem,
  deleteItemByClassificationId,
  updateItemOrder,
  getItemListByClassificationId,
  getShowItemListByClassificationId,
  convertItemList,
  showItemList,
  run,
  itemHoverStyle,
  itemRemoveStyle,
  allItemRemoveStyle,
  moveItemByClassificationId,
  getLayout,
  getIconSize,
  removeInvalidItem,
  getItemByIdList,
  hasChinese,
  getName,
  getItemTitle,
  filterExcludeSearchItemList,
  sort,
};
