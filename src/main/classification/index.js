import util from "../util"

/**
 * 获取分类
 * @param parentId
 * @param childId
 * @returns {*|null|{childList}|any|any}
 */
function getClassificationById(parentId, childId) {
  if (parentId != null) {
    let classificationParent;
    for (let c of global.list) {
      if (c.id == parentId) {
        classificationParent = c;
        break;
      }
    }
    if (classificationParent != null && childId != null) {
      if (!util.arrayIsEmpty(classificationParent.childList)) {
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
}

/**
 * 转换ID
 * @param id
 * @param parentId
 */
function convertClassificationId(id, parentId) {
  return { classificationParentId: parentId != null ? parentId : id, classificationChildId: parentId != null ? id : null };
}

export default {
  getClassificationById,
  convertClassificationId,
};
