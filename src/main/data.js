import ClassificationJS from "./classification/index";
const Store = require("electron-store");
const store = new Store({ name: "data", encryptionKey: "0b52eb58-4c0f-5ff1-b062-031546a8d269", clearInvalidConfig: true });

/**
 * 默认初始化
 * @returns {Promise<void>}
 */
function initData() {
  let list = store.get("list");
  if (list == null || list.length == 0) {
    list = [
      {
        id: 1,
        name: "新分类",
        order: 0,
      },
    ];
    store.set("list", list);
  }
  global.list = list;
}

/**
 * 分离数据
 */
function splitData() {
  let iconData = store.get("iconData");
  if (iconData == null) {
    iconData = [];
    for (let c of global.list) {
      if (c.childList != null) {
        for (let cc of c.childList) {
          if (cc.itemList != null) {
            for (let item of cc.itemList) {
              let icon = {
                classificationParentId: item.classificationParentId,
                classificationChildId: item.classificationId,
                itemId: item.id,
                icon: item.icon,
              };
              item.icon = null;
              iconData.push(icon);
            }
          }
        }
      } else {
        if (c.itemList != null) {
          for (let item of c.itemList) {
            let icon = {
              classificationParentId: item.classificationId,
              classificationChildId: null,
              itemId: item.id,
              icon: item.icon,
            };
            item.icon = null;
            iconData.push(icon);
          }
        }
      }
    }
    store.set("iconData", iconData);
    store.set("list", global.list);
  }
}

/**
 * 校验数据
 */
function validData() {
  let iconData = store.get("iconData");
  if (iconData != null) {
    let newIconData = [];
    for (let icon of iconData) {
      let classification = ClassificationJS.getClassificationById(icon.classificationParentId, icon.classificationChildId);
      if (classification != null && classification.itemList != null && classification.itemList.length > 0) {
        for (let item of classification.itemList) {
          if (icon.itemId == item.id) {
            newIconData.push(icon);
            break;
          }
        }
      }
    }
    store.set("iconData", newIconData);
  }
}

/**
 * 获取分类数据
 * @returns {Promise<T[string]>}
 */
function getList() {
  this.initData();
  let list = store.get("list");
  global.list = list;
  return list;
}

/**
 * 保存
 * @param list
 * @returns {Promise<void>}
 */
function setList(list) {
  store.set("list", list);
  global.list = list;
}

/**
 * 获取图标
 * @returns {Promise<T[string]>}
 */
function getIconData() {
  return store.get("iconData");
}

export default {
  store,
  initData,
  splitData,
  validData,
  getList,
  setList,
  getIconData,
};
