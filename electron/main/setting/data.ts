import { Setting } from "../../../types/setting";
import { getSetting } from "../../../commons/utils/setting";
import { getDataSqlite3 } from "../../commons/betterSqlite3";
import { app } from "electron";

// 获取数据库
let db = getDataSqlite3();

// 设置表名
let settingTableName = "setting";

/**
 * 初始化
 */
function init() {
  // sql
  let sql = `CREATE TABLE IF NOT EXISTS ${settingTableName} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            setting TEXT NOT NULL)`;
  // 运行
  db.exec(sql);
  // 如果无数据的话，初始化
  let setting = select();
  if (setting) {
    global.setting = setting;
  } else {
    setting = getSetting(null);
    if (add(setting)) {
      global.setting = setting;
    }
  }
}

/**
 * 查询
 */
function select() {
  // sql
  let sql = `SELECT setting FROM ${settingTableName} WHERE id = 1`;
  // 运行
  let row: any = db.prepare(sql).get();
  // 返回
  if (row && row.setting) {
    return getSetting(JSON.parse(row.setting));
  } else {
    return null;
  }
}

/**
 * 添加
 */
function add(setting: Setting) {
  // 首次添加，判断系统语言
  if (app.getLocale().toLowerCase().indexOf("zh-") === 0) {
    // 简体中文
    setting.general.language = "SimplifiedChinese";
  } else {
    // 英文
    setting.general.language = "English";
  }
  // SQL
  let sql = `INSERT INTO ${settingTableName} 
            (id, setting) 
            VALUES (?, ?)`;
  // 运行
  let id = db.prepare(sql).run(1, JSON.stringify(setting)).lastInsertRowid;
  if (id) {
    global.setting = setting;
    return true;
  }
  return false;
}

/**
 * 更新
 */
function update(setting: Setting) {
  // SQL
  let sql = `UPDATE ${settingTableName} 
            SET setting = ?
            WHERE id = ?`;
  // 运行
  let res = db.prepare(sql).run(JSON.stringify(setting), 1).changes > 0;
  if (res) {
    global.setting = setting;
  }
  return res;
}

export { init, select, add, update };
