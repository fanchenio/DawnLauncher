import store from "@/store";
import CommonJS from "@/common";

export default {
  /**
   * 根据ID获取分类
   * @param parentId
   * @param childId
   * @returns {null|*}
   */
  getClassificationById(parentId, childId) {
    if (parentId != null) {
      let classificationParent;
      for (let c of store.state.list) {
        if (c.id == parentId) {
          classificationParent = c;
          break;
        }
      }
      if (classificationParent != null && childId != null) {
        if (!CommonJS.arrayIsEmpty(classificationParent.childList)) {
          let classificationChild;
          for (let c of classificationParent.childList) {
            if (c.id == childId) {
              classificationChild = c;
              break;
            }
          }
          return classificationChild;
        } else {
          return classificationParent;
        }
      } else {
        return classificationParent;
      }
    }
    return null;
  },
  /**
   * 转换ID
   * @param id
   * @param parentId
   */
  convertClassificationId(id, parentId) {
    return { classificationParentId: parentId != null ? parentId : id, classificationChildId: parentId != null ? id : null };
  },
  /**
   * 获取分类图标
   * @param c
   * @returns {string}
   */
  getIcon(c) {
    if (c.icon != null) {
      return c.icon + " ";
    } else {
      return "";
    }
  },
};
