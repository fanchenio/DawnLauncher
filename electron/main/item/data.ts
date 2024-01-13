import { Item, ItemData } from "../../../types/item";
import { newItem, newItemData } from "../../../commons/utils/common";
import { list as selectClassificationList } from "../classification/data";
import { getDataSqlite3 } from "../../commons/betterSqlite3";

// 获取数据库
let db = getDataSqlite3();

// 项目表名
let tableName = "item";

// 查询字段
let selectColumn =
  "id, classification_id classificationId, name, type, data, shortcut_key shortcutKey, global_shortcut_key globalShortcutKey, `order`";
let simpleSelectColumn =
  "id, classification_id classificationId, name, type, shortcut_key shortcutKey, global_shortcut_key globalShortcutKey, `order`";

/**
 * 项目
 */
function getItem(row: any): Item {
  return newItem({
    id: row.id,
    classificationId: row.classificationId,
    name: row.name,
    type: row.type,
    data: newItemData(row.data ? JSON.parse(row.data) : {}),
    shortcutKey: row.shortcutKey,
    globalShortcutKey: row.globalShortcutKey === 1,
    order: row.order,
  });
}

/**
 * 初始化项目表
 */
function init() {
  // sql
  let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            classification_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            type INTEGER NOT NULL,
            data TEXT NOT NULL,
            shortcut_key TEXT, 
            global_shortcut_key INTEGER NOT NULL,
            \`order\` INTEGER NOT NULL)`;
  // 运行
  db.exec(sql);
}

/**
 * 添加
 * @param item
 * @param reuseId
 */
function add(item: Item, reuseId: boolean = false) {
  // 获取序号
  let newOrder = getMaxOrder(item.classificationId) + 1;
  // SQL
  let sql = `INSERT INTO ${tableName} 
            (classification_id, name, type, data, shortcut_key, global_shortcut_key, \`order\`) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
  // 参数
  let params = [
    item.classificationId,
    item.name,
    item.type,
    JSON.stringify(item.data),
    item.shortcutKey,
    item.globalShortcutKey ? 1 : 0,
    newOrder,
  ];
  // 重复使用ID
  if (reuseId && item.id) {
    sql = `INSERT INTO ${tableName} 
            (id, classification_id, name, type, data, shortcut_key, global_shortcut_key, \`order\`) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    params.unshift(item.id);
  }
  // 运行
  let id = db.prepare(sql).run(params).lastInsertRowid as number;
  if (id) {
    item.id = id;
    item.order = newOrder;
    return item;
  }
  return null;
}

/**
 * 批量添加
 * @param classificationId
 * @param itemList
 * @param reuseId
 */
function batchAdd(
  classificationId: number,
  itemList: Array<Item>,
  reuseId: boolean = false
) {
  // 返回信息
  let resultList: Array<Item> = [];
  // 事务
  db.transaction(() => {
    // 获取序号
    let newOrder = getMaxOrder(classificationId) + 1;
    // 循环添加
    for (let item of itemList) {
      // SQL
      let sql = `INSERT INTO ${tableName} 
            (classification_id, name, type, data, shortcut_key, global_shortcut_key, \`order\`) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
      // 参数
      let params = [
        classificationId,
        item.name,
        item.type,
        JSON.stringify(item.data),
        item.shortcutKey,
        item.globalShortcutKey ? 1 : 0,
        newOrder,
      ];
      // 重复使用ID
      if (reuseId && item.id) {
        sql = `INSERT INTO ${tableName} 
            (id, classification_id, name, type, data, shortcut_key, global_shortcut_key, \`order\`) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        params.unshift(item.id);
      }
      // 运行
      let id = db.prepare(sql).run(params).lastInsertRowid as number;
      if (id) {
        item.id = id;
        item.order = newOrder;
        resultList.push(item);
      }
      newOrder++;
    }
  })();
  return resultList;
}

/**
 * 更新
 * @param item
 */
function update(item: Item) {
  // SQL
  let sql = `UPDATE ${tableName} 
            SET name = ?, 
            data = ?,
            shortcut_key = ?,
            global_shortcut_key = ?
            WHERE id = ?`;
  // 运行
  return (
    db
      .prepare(sql)
      .run(
        item.name,
        JSON.stringify(item.data),
        item.shortcutKey,
        item.globalShortcutKey ? 1 : 0,
        item.id
      ).changes > 0
  );
}

/**
 * 更新分类ID
 * @param oldClassificationId
 * @param newlassificationId
 */
function updateClassificationId(
  oldClassificationId: number,
  newClassificationId: number
) {
  // SQL
  let sql = `UPDATE ${tableName} 
            SET classification_id = ?
            WHERE classification_id = ?`;
  // 运行
  return (
    db.prepare(sql).run(newClassificationId, oldClassificationId).changes > 0
  );
}

/**
 * 更新数据
 * @param id
 * @param itemData
 */
function updateData(id: number, itemData: ItemData) {
  // SQL
  let sql = `UPDATE ${tableName} 
            SET data = ?
            WHERE id = ?`;
  // 运行
  return db.prepare(sql).run(JSON.stringify(itemData), id).changes > 0;
}

/**
 * 查询最大序号
 * @param classificationId
 */
function getMaxOrder(classificationId: number) {
  // SQL
  let sql = `SELECT MAX(\`order\`) \`order\` FROM ${tableName} WHERE classification_id = ?`;
  // 运行
  let row: any = db.prepare(sql).get(classificationId);
  if (row && row.order) {
    return row.order;
  } else {
    return 0;
  }
}

/**
 * 根据ID查询
 * @param id
 */
function selectById(id: number): Item | null {
  // SQL
  let sql = `SELECT ${selectColumn} FROM ${tableName} WHERE id = ?`;
  // 运行
  let row = db.prepare(sql).get(id);
  // 返回
  if (row) {
    return getItem(row);
  } else {
    return null;
  }
}

/**
 * 列表
 * @param simple
 * @param classificationId
 */
function list(simple: boolean = false, classificationId: number | null = null) {
  // 参数
  let params = [];
  // sql
  let sql = `SELECT ${
    simple ? simpleSelectColumn : selectColumn
  } FROM ${tableName}`;
  if (classificationId) {
    sql += " WHERE classification_id = ?";
    params.push(classificationId);
  }
  sql += " ORDER BY `order` ASC";
  // 查询
  let list = db.prepare(sql).all(params);
  // 返回
  return list.map((row) => {
    return getItem(row);
  });
}

/**
 * 根据ID列表查询
 * @param simple
 * @param idList
 */
function selectByIdList(simple: boolean, idList: Array<number>) {
  // 参数
  let params = [];
  // sql
  let sql = `SELECT ${
    simple ? simpleSelectColumn : selectColumn
  } FROM ${tableName} WHERE id IN (`;
  for (let i = 0; i < idList.length; i++) {
    sql += "?";
    if (i !== idList.length - 1) {
      sql += ",";
    }
    params.push(idList[i]);
  }
  sql += ")";
  // 查询
  let list = db.prepare(sql).all(params);
  // 转为Item
  let itemList = list.map((row) => {
    return getItem(row);
  });
  // 返回列表
  let resultList: Array<Item> = [];
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
 * 删除
 * @param id
 */
function del(id: number) {
  // 查询数据
  let item = selectById(id);
  if (item) {
    // SQL
    let sql = `DELETE FROM ${tableName} WHERE id = ?`;
    // 运行
    let res = db.prepare(sql).run(id).changes > 0;
    if (res) {
      // 更新序号
      reorder(item.classificationId);
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

/**
 * 删除
 * @param classificationId
 */
function deleteByClassificationId(classificationId: number) {
  // SQL
  let sql = `DELETE FROM ${tableName} WHERE classification_id = ?`;
  // 运行
  return db.prepare(sql).run(classificationId).changes > 0;
}

/**
 * 重新排序
 * @param classification_id
 */
function reorder(classification_id: number) {
  // 查询项目列表
  let itemList = list(true, classification_id);
  // 开启事务
  db.transaction(() => {
    // SQL
    let sql = `UPDATE ${tableName} SET \`order\` = ? WHERE id = ?`;
    // 更新序号
    for (let i = 0; i < itemList.length; i++) {
      db.prepare(sql).run(i + 1, itemList[i].id);
    }
  })();
}

/**
 * 项目排序
 * @param fromIdList
 * @param toClassificationId
 * @param toId
 */
function updateOrder(
  fromIdList: Array<number>,
  toClassificationId: number,
  newIndex: number | null
) {
  // 查询来源项目
  let fromItemList = selectByIdList(true, fromIdList);
  if (fromItemList.length > 0) {
    // 查询目标分类是否是父级分类，如果是父级分类的话，获取他下面的第一个子分类
    let classificationList = selectClassificationList(toClassificationId);
    if (classificationList.length > 0) {
      toClassificationId = classificationList[0].id;
    }
    // 记录来源项目都是来源于哪些分类，需要重新排序
    let fromClassificationIdList = [];
    for (const item of fromItemList) {
      if (
        item.classificationId !== toClassificationId &&
        !fromClassificationIdList.includes(item.classificationId)
      ) {
        fromClassificationIdList.push(item.classificationId);
      }
    }
    // 查询目标项目列表
    let toItemList = list(true, toClassificationId);
    // 来源项目分类可能和目标项目分类是一样的，首先先从目标项目列表去掉来源项目
    for (const id of fromIdList) {
      toItemList = toItemList.filter((item) => item.id !== id);
    }
    // 将来源项目插入到目标项目列表
    if (newIndex !== null) {
      toItemList.splice(newIndex, 0, ...fromItemList);
    } else {
      // 尾部追加
      toItemList.push(...fromItemList);
    }
    // 开启事务
    db.transaction(() => {
      // SQL
      let sql = `UPDATE ${tableName} SET \`order\` = ?, classification_id = ? WHERE id = ?`;
      // 更新序号
      for (let i = 0; i < toItemList.length; i++) {
        db.prepare(sql).run(i + 1, toClassificationId, toItemList[i].id);
      }
    })();
    // 重排序其来源分类项目列表
    for (const id of fromClassificationIdList) {
      reorder(id);
    }
    return true;
  }
  return false;
}

export {
  init,
  list,
  add,
  batchAdd,
  update,
  del,
  selectById,
  selectByIdList,
  deleteByClassificationId,
  updateOrder,
  updateData,
  updateClassificationId,
};
