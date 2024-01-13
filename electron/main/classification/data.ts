import { deleteAssociateFolderWatcher } from ".";
import {
  Classification,
  ClassificationData,
} from "../../../types/classification";
import {
  newClassification,
  newClassificationData,
} from "../../../commons/utils/common";
import { deleteByClassificationId, updateClassificationId } from "../item/data";
import { getDataSqlite3 } from "../../commons/betterSqlite3";

// 获取数据库
let db = getDataSqlite3();

// 分类表名
let tableName = "classification";

// 查询字段
let selectColumn =
  "id, parent_id parentId, name, type, data, shortcut_key shortcutKey, global_shortcut_key globalShortcutKey, `order`";

/**
 * 分类
 */
function getClassification(row: any): Classification {
  return newClassification({
    id: row.id,
    parentId: row.parentId,
    name: row.name,
    type: row.type,
    data: newClassificationData(JSON.parse(row.data)),
    shortcutKey: row.shortcutKey,
    globalShortcutKey: row.globalShortcutKey === 1,
    order: row.order,
  });
}

/**
 * 初始化
 */
function init() {
  // sql
  let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            parent_id INTEGER,
            name TEXT NOT NULL,
            type INTEGER NOT NULL,
            data TEXT NOT NULL,
            shortcut_key TEXT, 
            global_shortcut_key INTEGER NOT NULL,
            \`order\` INTEGER NOT NULL)`;
  // 运行
  db.exec(sql);
  // 查询有多少条数据
  sql = `SELECT COUNT(id) count FROM ${tableName}`;
  let row: any = db.prepare(sql).get();
  let count = row.count as number;
  if (count === 0) {
    // 新增分类
    add(null, global.language.newClassificationName, null, false);
  }
}

/**
 * 列表
 * @param parentId
 */
function list(parentId: number | null = null) {
  // 参数
  let params = [];
  // sql
  let sql = `SELECT ${selectColumn} FROM ${tableName}`;
  if (parentId) {
    sql += " WHERE parent_id = ?";
    params.push(parentId);
  }
  sql += " ORDER BY `order` ASC";
  // 查询
  let list = db.prepare(sql).all(params);
  // 返回
  return list.map((row) => {
    return getClassification(row);
  });
}

/**
 * 添加
 * @param parentId
 * @param name
 * @param shortcutKey
 * @param globalShortcutKey
 * @returns
 */
function add(
  parentId: number | null,
  name: string,
  shortcutKey: string | null,
  globalShortcutKey: boolean,
  data: ClassificationData = newClassificationData({}),
  type: number = 0
): Classification | null {
  // 获取序号
  let newOrder = getMaxOrder(parentId) + 1;
  // SQL
  let sql = `INSERT INTO ${tableName} (parent_id, name, type, data, shortcut_key, global_shortcut_key, \`order\`) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  // 运行
  let id = db
    .prepare(sql)
    .run(
      parentId,
      name,
      type,
      JSON.stringify(data),
      shortcutKey,
      globalShortcutKey ? 1 : 0,
      newOrder
    ).lastInsertRowid as number;
  if (id) {
    let classification = newClassification({
      id,
      name,
      parentId,
      type,
      data,
      shortcutKey,
      globalShortcutKey,
      order: newOrder,
    });
    // 如果是添加子分类，将父级分类下的项目移动到新建的子分类中
    if (parentId) {
      updateClassificationId(parentId, id);
    }
    return classification;
  }
  return null;
}

/**
 * 更新
 * @param id
 * @param name
 * @param shortcutKey
 * @param globalShortcutKey
 * @returns
 */
function update(classification: Classification) {
  // SQL
  let sql = `UPDATE ${tableName} SET name = ?, type = ?, data = ?, shortcut_key = ?, global_shortcut_key = ? WHERE id = ?`;
  // 运行
  return (
    db
      .prepare(sql)
      .run(
        classification.name,
        classification.type,
        JSON.stringify(classification.data),
        classification.shortcutKey,
        classification.globalShortcutKey ? 1 : 0,
        classification.id
      ).changes > 0
  );
}

/**
 * 更新数据
 * @param id
 * @param data
 */
function updateData(id: number, data: ClassificationData) {
  // SQL
  let sql = `UPDATE ${tableName} SET data = ? WHERE id = ?`;
  return db.prepare(sql).run(JSON.stringify(data), id).changes > 0;
}

/**
 * 根据ID查询
 * @param id
 */
function selectById(id: number): Classification | null {
  // SQL
  let sql = `SELECT ${selectColumn} FROM ${tableName} WHERE id = ?`;
  // 运行
  let row = db.prepare(sql).get(id);
  // 返回
  if (row) {
    return getClassification(row);
  } else {
    return null;
  }
}

/**
 * 删除
 * @param id
 */
function del(id: number) {
  // 查询数据
  let classifictaion = selectById(id);
  if (classifictaion) {
    // 查询有无子分类
    let childList = list(classifictaion.id);
    // SQL
    let sql = `DELETE FROM ${tableName} WHERE id = ? or parent_id = ?`;
    // 运行
    let res = db.prepare(sql).run(id, id).changes > 0;
    if (res) {
      // 更新序号
      reorder(classifictaion.parentId);
      // 删除分类下所有项目
      deleteByClassificationId(id);
      // 删除子分类下所有项目
      for (const child of childList) {
        deleteByClassificationId(child.id);
        if (child.type === 1) {
          // 删除关联文件夹
          deleteAssociateFolderWatcher(child.id);
        }
      }
      if (classifictaion.type === 1) {
        // 删除关联文件夹
        deleteAssociateFolderWatcher(classifictaion.id);
      }
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

/**
 * 排序
 * @param fromId
 * @param toId
 * @param parentId
 */
function updateOrder(
  fromId: number,
  toId: number | null,
  parentId: number | null
) {
  // 查询来源分类
  let fromClassification = selectById(fromId);
  if (fromClassification) {
    // 新序号
    let newOrder = 1;
    // 如果目标ID不为空获取项目并获取序号
    if (toId) {
      let toClassification = selectById(toId);
      if (toClassification) {
        newOrder = toClassification.order;
      }
    } else {
      newOrder = getMaxOrder(parentId) + 1;
    }
    // SQL
    let sql = `UPDATE ${tableName} SET \`order\` = ? WHERE id = ?`;
    // 更新排序
    db.prepare(sql).run(newOrder, fromClassification.id);
    // 判断新序号和老序号之间的数据是+1还是-1
    if (newOrder > fromClassification.order) {
      // 新序号和老序号之间数据，序号-1
      let params = [fromClassification.order, newOrder, fromClassification.id];
      sql = `UPDATE ${tableName} SET \`order\` = \`order\` - 1 WHERE \`order\` > ? AND \`order\` <= ? AND id != ?`;
      if (parentId) {
        sql += " AND parent_id = ?";
        params.push(parentId);
      } else {
        sql += " AND parent_id is NULL";
      }
      db.prepare(sql).run(params);
    } else {
      // 新序号和老序号之间数据，序号+1
      let params = [newOrder, fromClassification.order, fromClassification.id];
      sql = `UPDATE ${tableName} SET \`order\` = \`order\` + 1 WHERE \`order\` >= ? AND \`order\` < ? AND id != ?`;
      if (parentId) {
        sql += " AND parent_id = ?";
        params.push(parentId);
      } else {
        sql += " AND parent_id is NULL";
      }
      db.prepare(sql).run(params);
    }
    return true;
  }
  return false;
}

/**
 * 重新排序
 * @param parentId
 */
function reorder(parentId: number | null) {
  // 查询分类列表
  let classificationList = list(parentId);
  // 开启事务
  db.transaction(() => {
    // SQL
    let sql = `UPDATE ${tableName} SET \`order\` = ? WHERE id = ?`;
    // 更新序号
    for (let i = 0; i < classificationList.length; i++) {
      db.prepare(sql).run(i + 1, classificationList[i].id);
    }
  })();
}

/**
 * 查询最大序号
 * @param parentId
 */
function getMaxOrder(parentId: number | null) {
  // SQL
  let sql = `SELECT MAX(\`order\`) \`order\` FROM ${tableName}`;
  if (parentId) {
    sql += " WHERE parent_id = ?";
  } else {
    sql += " WHERE parent_id IS NULL";
  }
  // 运行
  let row: any = db.prepare(sql).get(parentId ? [parentId] : []);
  if (!row || !row.order) {
    return 0;
  } else {
    return row.order;
  }
}

/**
 * 更新图标
 * @param id
 * @param icon
 */
function updateIcon(id: number, icon: string | null) {
  // 查询分类
  let classification = selectById(id);
  if (classification) {
    // SQL
    let sql = `UPDATE ${tableName} SET data = ? WHERE id = ?`;
    // 更新图标
    classification.data.icon = icon;
    return (
      db.prepare(sql).run(JSON.stringify(classification.data), id).changes > 0
    );
  }
  return false;
}

/**
 * 是否有子分类
 * @param id
 */
function hasChildClassification(id: number) {
  let classificationList = list(id);
  return classificationList.length > 0;
}

/**
 * 更新固定分类
 * @param classification
 * @param fixed
 */
function updateFixed(classification: Classification, fixed: boolean) {
  classification.data.fixed = fixed;
  updateData(classification.id, classification.data);
}

/**
 * 批量更新固定分类
 * @param id
 */
function batchUpdateFixed(id: number | null = null) {
  // 事务
  db.transaction(() => {
    // 查询所有分类
    let classificationList = list();
    // 更新
    for (const classification of classificationList) {
      updateFixed(classification, id === classification.id);
    }
  })();
}

export {
  init,
  list,
  add,
  del,
  selectById,
  update,
  updateData,
  updateOrder,
  updateIcon,
  hasChildClassification,
  batchUpdateFixed,
};
