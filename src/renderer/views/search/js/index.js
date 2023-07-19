import PinyinMatch from "pinyin-match";
import CommonJS from "@/common";
import ItemJS from "@/views/item/js/index";
import ClassificationJS from "@/views/classification/js/index";
import store from "@/store";

/**
 * 判断是否有中文
 * @param str
 * @returns {boolean}
 */
function hasChinese(str) {
  const pattern = /[\u4e00-\u9fa5]/; // 中文字符的 Unicode 范围
  return pattern.test(str);
}

/**
 * 判断是否是URL
 * @param str
 * @returns {boolean}
 */
function hasURL(str) {
  const pattern = /[a-zA-Z]+:\/\/[^\\s]*/;
  return pattern.test(str);
}

export default {
  convertToMap(list) {
    let itemMap = new Map();
    // 将数据转为Map
    for (let i of list) {
      if (i.excludeSearch == null || !i.excludeSearch) {
        if (!CommonJS.arrayIsEmpty(i.childList)) {
          for (let c of i.childList) {
            if (c.excludeSearch == null || !c.excludeSearch) {
              this.setMap(itemMap, c.itemList, i.id + "-" + c.id, ClassificationJS.getIcon(i) + i.name + "/" + ClassificationJS.getIcon(c) + c.name);
            }
          }
        } else {
          this.setMap(itemMap, i.itemList, i.id, ClassificationJS.getIcon(i) + i.name);
        }
      }
    }
    return itemMap;
  },
  /**
   * 放数据
   */
  setMap(itemMap, itemList, classificationIds, classificationName) {
    if (!CommonJS.arrayIsEmpty(itemList)) {
      for (let t of itemList) {
        // 设置信息
        let item = JSON.parse(JSON.stringify(t));
        item.classificationName = classificationName;
        item.classificationIds = classificationIds;
        // 名称
        let name = ItemJS.getName(item.name).toLowerCase();
        let list = itemMap.get(name);
        if (CommonJS.arrayIsEmpty(list)) {
          list = [];
        }
        list.push(item);
        itemMap.set(name, list);
        // 缩写
        if (!CommonJS.strIsEmpty(t.abbr)) {
          let abbr = t.abbr.toLowerCase();
          let abbrList = itemMap.get(abbr);
          if (CommonJS.arrayIsEmpty(abbrList)) {
            abbrList = [];
          }
          abbrList.push(item);
          itemMap.set(abbr, abbrList);
        }
        // 网址
        if (t.type == 2 && !CommonJS.strIsEmpty(t.url)) {
          let url = t.url.toLowerCase();
          let urlList = itemMap.get(url);
          if (CommonJS.arrayIsEmpty(urlList)) {
            urlList = [];
          }
          urlList.push(item);
          itemMap.set(url, urlList);
        }
        // 备注搜索
        if (store.state.setting.quickSearch.matchingConditionsRemark) {
          if (!CommonJS.strIsEmpty(t.remark)) {
            let remark = t.remark.toLowerCase();
            let remarkList = itemMap.get(remark);
            if (CommonJS.arrayIsEmpty(remarkList)) {
              remarkList = [];
            }
            remarkList.push(item);
            itemMap.set(remark, remarkList);
          }
        }
      }
    }
  },
  /**
   * 搜索
   */
  search(name, itemMap) {
    let resultList = [];
    if (!CommonJS.strIsEmpty(name)) {
      let n = name.toLowerCase();
      for (let [key, value] of itemMap.entries()) {
        let flag = false;
        if (hasURL(key)) {
          // 网址
          flag = key.indexOf(n) >= 0;
        } else if (hasChinese(key)) {
          // 包含中文
          let match = PinyinMatch.match(key, n);
          if (match != null && match.length > 0) {
            flag = true;
          }
        } else {
          // 其他情况
          flag = key.indexOf(n) >= 0;
        }
        if (flag) {
          for (let v of value) {
            let flag = false;
            if (v.id != null && v.classificationIds != null) {
              for (let r of resultList) {
                if (v.classificationIds == r.classificationIds && v.id == r.id) {
                  flag = true;
                  break;
                }
              }
            } else {
              for (let r of resultList) {
                if (v.name == r.name) {
                  flag = true;
                  break;
                }
              }
            }
            if (!flag) {
              resultList.push(v);
            }
          }
        }
      }
    }
    resultList.sort((a, b) => a.name.localeCompare(b.name));
    return resultList;
  },
};
