import store from "@/store";
import CommonJS from "@/common";
const { ipcRenderer } = window.require("electron");

export default {
  /**
   * 运行项目
   * @param item
   * @param location
   * @param recordQuickSearch 记录快速搜索数据
   */
  itemRun(item, location, recordQuickSearch) {
    if (item.type == 4) {
      if (!CommonJS.arrayIsEmpty(item.itemList)) {
        for (let iItem of item.itemList) {
          ipcRenderer.send(
            "itemRun",
            JSON.stringify({
              item: iItem,
              location: false,
              recordQuickSearch: recordQuickSearch != null ? recordQuickSearch : false,
            })
          );
        }
      }
    } else {
      ipcRenderer.send(
        "itemRun",
        JSON.stringify({
          item: item,
          location: location,
          recordQuickSearch: recordQuickSearch != null ? recordQuickSearch : false,
        })
      );
    }
    if (store.state.setting.item.openAfterHideMainInterface == true) {
      ipcRenderer.send("hideMainWindow");
    }
  },
  /**
   * 查询项目
   * @param classification
   * @param id
   */
  getItemById(classification, id) {
    for (let item of classification.itemList) {
      if (item.id == id) {
        return item;
      }
    }
    return null;
  },
  /**
   * 设置项目分类ID
   * @param item
   * @param classificationParentId
   * @param classificationChildId
   */
  setItemClassificationId(item, classificationParentId, classificationChildId) {
    if (classificationChildId != null) {
      item.classificationParentId = classificationParentId;
      item.classificationId = classificationChildId;
    } else {
      item.classificationId = classificationParentId;
      item.classificationParentId = null;
    }
    return item;
  },
  /**
   * 获取标题
   * @param item
   */
  getItemTitle(item) {
    let name = this.$store.state.currentLanguage.name + this.$store.state.currentLanguage.colon + item.name.replace(/\\n/g, " ");
    if (this.$store.state.setting.item.openNumber) {
      name += "\n" + this.$store.state.currentLanguage.openNumber + this.$store.state.currentLanguage.colon + (item.openNumber == null ? 0 : item.openNumber);
    }
    if (!CommonJS.strIsEmpty(item.remark)) {
      name += "\n" + this.$store.state.currentLanguage.remark + this.$store.state.currentLanguage.colon + item.remark;
    }
    return name;
  },
  /**
   * 设置拼音
   */
  setPinyin(item) {
    // if (hasChinese(item.name)) {
    //   // 拼音
    //   let pinyin = cnchar.spell(item.name, "array", "poly");
    //   let pinyinList = [];
    //   if (pinyin != null && pinyin.length > 0) {
    //     for (let py of pinyin) {
    //       let newList = [];
    //       let list = py.replace("(", "").replace(")", "").split("|");
    //       for (let str of list) {
    //         if (!newList.some((nStr) => str == nStr)) {
    //           newList.push(str);
    //         }
    //       }
    //       pinyinList.push(newList);
    //     }
    //   }
    //   if (pinyinList.length > 0) {
    //     item.pinyin = merge(pinyinList);
    //   }
    //   // 首字母
    //   let pinyinFirst = cnchar.spell(item.name, "array", "poly", "first");
    //   let pinyinFirstList = [];
    //   if (pinyinFirst != null && pinyinFirst.length > 0) {
    //     for (let py of pinyinFirst) {
    //       let newList = [];
    //       let list = py.replace("(", "").replace(")", "").split("|");
    //       for (let str of list) {
    //         if (!newList.some((nStr) => str == nStr)) {
    //           newList.push(str);
    //         }
    //       }
    //       pinyinFirstList.push(newList);
    //     }
    //   }
    //   if (pinyinFirstList.length > 0) {
    //     item.initial = merge(pinyinFirstList);
    //   }
    // }
  },
  /**
   * 设置缩写
   * @param item
   */
  setAbbr(item) {
    if (!CommonJS.strIsEmpty(item.name)) {
      let name = item.name.replace(/\\n/g, " ");
      let split = name.split(" ");
      let abbr = "";
      for (let i = 0; i < split.length; i++) {
        if (!CommonJS.strIsEmpty(split[i])) {
          abbr += split[i].slice(0, 1);
        }
      }
      item.abbr = abbr;
    }
  },
  /**
   * 获取名称
   */
  getName(name) {
    return name.replace(/\\n/g, " ");
  },
  /**
   * 排序
   * @param type
   * @param key
   */
  sort(itemList, type, key) {
    if (type == "initial") {
      return itemList.sort((x, y) => {
        let xn, yn;
        if (!CommonJS.strIsEmpty(x.pinyin)) {
          xn = x.pinyin.toLowerCase().charAt(0);
        } else {
          xn = x.name.toLowerCase().charAt(0);
        }
        if (!CommonJS.strIsEmpty(y.pinyin)) {
          yn = y.pinyin.toLowerCase().charAt(0);
        } else {
          yn = y.name.toLowerCase().charAt(0);
        }
        // 判断是否是数字
        if (isNaN(xn) == false && isNaN(yn) == true) {
          // xn是数字而yn不是，返回1
          return 1;
        }
        if (isNaN(yn) == false && isNaN(xn) == true) {
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
          if (x.name < y.name) {
            return -1;
          }
          if (x.name < y.name) {
            return 1;
          }
        }
        return 0;
      });
    } else if (type == "openNumber" || type == "lastOpen") {
      return itemList.sort((x, y) => {
        let xn = x[key] == null ? 0 : x[key];
        let yn = y[key] == null ? 0 : y[key];
        if (xn < yn) {
          return -1;
        }
        if (xn > yn) {
          return 1;
        }
        if (xn == yn) {
          if (x.name < y.name) {
            return -1;
          }
          if (x.name < y.name) {
            return 1;
          }
        }
        return 0;
      });
    }
  },
  /**
   * 是否是绝对路径
   */
  isAbsolutePath(path) {
    const regex = /^[a-zA-Z]:\\/;
    return regex.test(path);
  },
};
