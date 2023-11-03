import { Classification } from "../../../../types/classification";
import { useMainStore } from "../../../store";
import {
  deleteItemByClassificationId,
  moveItemByClassificationId,
} from "../../item/js";

// pinia
const store = useMainStore();

/**
 * 转换分类列表
 */
function convertClassificationList(
  classificationList: Array<Classification>
): Array<Classification> {
  // 获取父级
  let parentList = classificationList.filter((c) => !c.parentId);
  // 获取子级
  let childList = classificationList.filter((c) => c.parentId);
  // 关联父子级
  for (let parent of parentList) {
    for (const child of childList) {
      if (parent.id === child.parentId) {
        if (!parent.childList) {
          parent.childList = [];
        }
        parent.childList.push(child);
      }
    }
  }
  return parentList;
}

/**
 * 根据ID查询分类
 */
function getClassificationById(id: number): Classification | null {
  for (let classification of store.classificationList) {
    if (classification.id === id) {
      return classification;
    } else {
      if (classification.childList) {
        for (let childClassification of classification.childList) {
          if (childClassification.id === id) {
            return childClassification;
          }
        }
      }
    }
  }
  return null;
}

/**
 * 添加分类
 */
function addClassification(classification: Classification) {
  // 判断是否是子级分类
  if (!classification.parentId) {
    // 父级 添加
    store.classificationList.push(classification);
  } else {
    // 子级
    // 寻找父级分类
    let parentClassification = getClassificationById(classification.parentId);
    if (parentClassification) {
      if (!parentClassification.childList) {
        parentClassification.childList = [];
      }
      // 添加
      parentClassification.childList.push(classification);
      // 将父级项目移动到子级
      moveItemByClassificationId(classification.parentId, classification.id);
    }
  }
}

/**
 * 更新分类
 * @param classification
 */
function updateClassification(classification: Classification) {
  // 查询分类
  let curClassification = getClassificationById(classification.id);
  // 更新字段
  if (curClassification) {
    curClassification.name = classification.name;
    curClassification.type = classification.type;
    curClassification.data = classification.data;
    curClassification.shortcutKey = classification.shortcutKey;
    curClassification.globalShortcutKey = classification.globalShortcutKey;
  }
}

/**
 * 删除分类
 * @param id
 */
function deleteClassification(id: number) {
  // func
  const del = (list: Array<Classification>, id: number) => {
    // index
    let index: number | null = null;
    // 当前分类
    let classification: Classification | null = null;
    // 寻找需要删除的分类下标
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        // 下标
        index = i;
        classification = list[i];
        break;
      }
    }
    if (index !== null && classification) {
      // 删除
      list.splice(index, 1);
      // 删除项目
      deleteItemByClassificationId(id);
      // 如果有子分类，删除子分类下所有项目
      if (classification.childList && classification.childList.length > 0) {
        for (const child of classification.childList) {
          deleteItemByClassificationId(child.id);
        }
      }
      // 更新分类序号
      for (let i = 0; i < list.length; i++) {
        list[i].order = i + 1;
      }
    }
  };
  // 查询分类
  let classification = getClassificationById(id);
  if (classification) {
    // 是否有父级，如果有父级就先寻找父级，在父级列表中删除当前子分类
    if (classification.parentId) {
      let parentClassification = getClassificationById(classification.parentId);
      if (
        parentClassification &&
        parentClassification.childList &&
        parentClassification.childList.length > 0
      ) {
        del(parentClassification.childList, id);
      }
    } else {
      del(store.classificationList, id);
    }
  }
}

/**
 * 判断分类是否有子分类
 * @param id
 * @returns
 */
function hasChildClassification(id: number | null): boolean {
  if (id) {
    let classification = getClassificationById(id);
    if (
      classification &&
      classification.childList &&
      classification.childList.length > 0
    ) {
      return true;
    }
  }
  return false;
}

/**
 * 查询子分类列表
 * @param id
 * @returns
 */
function getClassificationChildList(id: number | null): Array<Classification> {
  if (id) {
    let classification = getClassificationById(id);
    if (
      classification &&
      classification.childList &&
      classification.childList.length > 0
    ) {
      return classification.childList;
    }
  }
  return [];
}

/**
 * 分类排序
 * @param fromId
 * @param toId
 * @param parentId
 */
function updateClassificationOrder(
  fromId: number,
  toId: number | null,
  parentId: number | null
) {
  // update
  const update = (
    list: Array<Classification>,
    id: number,
    newOrder: number,
    oldOrder: number
  ) => {
    // 当前分类
    let currentClassification = getClassificationById(id);
    if (currentClassification) {
      // 更新序号
      currentClassification.order = newOrder;
      // 判断新序号和老序号之间的数据是+1还是-1
      for (let classification of list) {
        if (newOrder > oldOrder) {
          if (
            classification.order > oldOrder &&
            classification.order <= newOrder &&
            classification.id !== id
          ) {
            classification.order = classification.order - 1;
          }
        } else {
          if (
            classification.order >= newOrder &&
            classification.order < oldOrder &&
            classification.id !== id
          ) {
            classification.order = classification.order + 1;
          }
        }
      }
      // 重新排序
      list.sort((a, b) => a.order - b.order);
    }
  };
  // 查询来源分类
  let fromClassification = getClassificationById(fromId);
  if (fromClassification) {
    // 新序号
    let newOrder: number | null = null;
    // 如果目标ID不为空获取项目并获取序号
    if (toId) {
      let toClassificationId = getClassificationById(toId);
      if (toClassificationId) {
        newOrder = toClassificationId.order;
      }
    }
    if (!newOrder) {
      // 查询最大序号
      let classificationList = parentId
        ? getClassificationChildList(parentId)
        : store.classificationList;
      if (classificationList.length === 0) {
        newOrder = 1;
      } else {
        newOrder = classificationList[classificationList.length - 1].order + 1;
      }
    }
    // 父级分类ID不为空先查询父级分类
    if (parentId) {
      let parentClassification = getClassificationById(parentId);
      if (parentClassification && parentClassification.childList) {
        // 更新序号
        update(
          parentClassification.childList,
          fromClassification.id,
          newOrder,
          fromClassification.order
        );
      }
    } else {
      // 更新序号
      update(
        store.classificationList,
        fromClassification.id,
        newOrder,
        fromClassification.order
      );
    }
  }
}

/**
 * 更新分类图标
 * @param id
 * @param icon
 */
function updateClassificationIcon(id: number, icon: string | null) {
  // 查询分类
  let classification = getClassificationById(id);
  if (classification) {
    classification.data.icon = icon;
  }
}

/**
 * 获取名称
 */
function getClassificationName(classification: Classification) {
  let name = "";
  if (classification.data.icon && classification.data.icon.trim() !== "") {
    name += classification.data.icon;
  }
  if (store.setting.classification.mode === "normal") {
    if (name.trim() !== "") {
      name += " ";
    }
    name += classification.name;
  } else {
    if (name === "" && classification.name && classification.name.length > 0) {
      name += classification.name.substring(0, 1);
    }
  }
  return name;
}

/**
 * 获取当前选中的ID
 * @returns
 */
function getSelectedClassificationId(): number | null {
  if (store.selectedClassificationParentId) {
    if (store.selectedClassificationChildId) {
      return store.selectedClassificationChildId;
    } else {
      return store.selectedClassificationParentId;
    }
  }
  return null;
}

/**
 * 查询固定分类
 */
function getClassificationFixed(): Classification | null {
  for (let classification of store.classificationList) {
    if (classification.data.fixed) {
      return classification;
    } else {
      if (classification.childList) {
        for (let childClassification of classification.childList) {
          if (childClassification.data.fixed) {
            return childClassification;
          }
        }
      }
    }
  }
  return null;
}

/**
 * 获取分类名称
 * @param id
 * @returns
 */
function getSearchItemClassificationName(id: number) {
  let classification = getClassificationById(id);
  if (classification) {
    return "(" + getClassificationName(classification) + ")";
  } else {
    return "";
  }
}

export {
  convertClassificationList,
  getClassificationById,
  hasChildClassification,
  getClassificationName,
  addClassification,
  deleteClassification,
  updateClassification,
  updateClassificationOrder,
  updateClassificationIcon,
  getSelectedClassificationId,
  getClassificationChildList,
  getClassificationFixed,
  getSearchItemClassificationName,
};
