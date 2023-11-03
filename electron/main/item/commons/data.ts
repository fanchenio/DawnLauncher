import { CommonItem } from "../../../../types/item";
import {
  newCommonItem,
  newCommonItemData,
} from "../../../../commons/utils/common";
import {
  calcIcon,
  fileExplorerIcon,
  networkSharingCenterIcon,
  powerIcon,
} from "../../../commons/constants";
import { getCacheDataSqlite3 } from "../../../commons/betterSqlite3";

// 获取数据库
let db = getCacheDataSqlite3();

// 系统项目表名
let systenItemTableName = "system_item";

// 开始菜单项目表名
let startMenuItemTableName = "start_menu_item";

/**
 * 通用项目
 */
function getCommonItem(row: any): CommonItem {
  let data = JSON.parse(row.data);
  return newCommonItem({
    id: row.id,
    name: row.name,
    data: newCommonItemData({
      target: data.target,
      params: data.params,
      icon: data.icon,
      htmlIcon: data.htmlIcon,
    }),
  });
}

/**
 * 初始化系统项目表
 */
function initSystemItemTable() {
  // sql
  let sql = `CREATE TABLE IF NOT EXISTS ${systenItemTableName} (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            data TEXT NOT NULL,
            \`order\` INTEGER NOT NULL)`;
  // 运行
  db.exec(sql);
}

/**
 * 初始化系统项目
 */
function initSystemItem() {
  // 初始化表
  initSystemItemTable();
  // 初始化数据
  // 计算机
  let computer = selectById(systenItemTableName, 1);
  if (!computer) {
    let icon: string | null = global.addon.getFileIcon(
      "shell:MyComputerFolder"
    );
    if (icon) {
      add(
        systenItemTableName,
        newCommonItem({
          id: 1,
          name: global.language.computer,
          data: newCommonItemData({
            target: "shell:MyComputerFolder",
            icon: icon,
          }),
          order: 1,
        })
      );
    }
  }
  // 文档
  let document = selectById(systenItemTableName, 2);
  if (!document) {
    let icon: string | null = global.addon.getFileIcon("shell:Local Documents");
    if (icon) {
      add(
        systenItemTableName,
        newCommonItem({
          id: 2,
          name: global.language.documents,
          data: newCommonItemData({
            target: "shell:Local Documents",
            icon: icon,
          }),
          order: 2,
        })
      );
    }
  }
  // 控制面板
  let controlPanel = selectById(systenItemTableName, 3);
  if (!controlPanel) {
    let icon: string | null = global.addon.getFileIcon(
      "shell:ControlPanelFolder"
    );
    if (icon) {
      add(
        systenItemTableName,
        newCommonItem({
          id: 3,
          name: global.language.controlPanel,
          data: newCommonItemData({
            target: "shell:ControlPanelFolder",
            icon: icon,
          }),
          order: 3,
        })
      );
    }
  }
  // 网络和共享中心
  let networkSharingCenter = selectById(systenItemTableName, 4);
  if (!networkSharingCenter) {
    add(
      systenItemTableName,
      newCommonItem({
        id: 4,
        name: global.language.networkShareCenter,
        data: newCommonItemData({
          target: "control.exe",
          params: "/name Microsoft.NetworkAndSharingCenter",
          icon: networkSharingCenterIcon,
        }),
        order: 4,
      })
    );
  }
  // 回收站
  let recyleBin = selectById(systenItemTableName, 5);
  if (!recyleBin) {
    let icon: string | null = global.addon.getFileIcon(
      "shell:RecycleBinFolder"
    );
    if (icon) {
      add(
        systenItemTableName,
        newCommonItem({
          id: 5,
          name: global.language.recycleBin,
          data: newCommonItemData({
            target: "shell:RecycleBinFolder",
            icon: icon,
          }),
          order: 5,
        })
      );
    }
  }
  // 文件资源管理器
  let fileExplorer = selectById(systenItemTableName, 6);
  if (!fileExplorer) {
    add(
      systenItemTableName,
      newCommonItem({
        id: 6,
        name: global.language.fileExplorer,
        data: newCommonItemData({
          target: "control.exe",
          params: "folders",
          icon: fileExplorerIcon,
        }),
        order: 6,
      })
    );
  }
  // 程序和功能
  let programFeatures = selectById(systenItemTableName, 7);
  if (!programFeatures) {
    let icon: string | null = global.addon.getFileIcon(
      "shell:ChangeRemoveProgramsFolder"
    );
    if (icon) {
      add(
        systenItemTableName,
        newCommonItem({
          id: 7,
          name: global.language.programsFeatures,
          data: newCommonItemData({
            target: "shell:ChangeRemoveProgramsFolder",
            icon: icon,
          }),
          order: 7,
        })
      );
    }
  }
  // 文件资源管理器
  let calc = selectById(systenItemTableName, 8);
  if (!calc) {
    add(
      systenItemTableName,
      newCommonItem({
        id: 8,
        name: global.language.calculator,
        data: newCommonItemData({
          target: "calc.exe",
          icon: calcIcon,
        }),
        order: 8,
      })
    );
  }
  // 服务
  let services = selectById(systenItemTableName, 9);
  if (!services) {
    let path: string | null = global.addon.searchPath("services.msc");
    if (path) {
      let icon: string | null = global.addon.getFileIcon(path);
      if (icon) {
        add(
          systenItemTableName,
          newCommonItem({
            id: 9,
            name: global.language.services,
            data: newCommonItemData({
              target: "services.msc",
              icon: icon,
            }),
            order: 9,
          })
        );
      }
    }
  }
  // 命令提示符
  let cmd = selectById(systenItemTableName, 10);
  if (!cmd) {
    let path: string | null = global.addon.searchPath("cmd.exe");
    if (path) {
      let icon: string | null = global.addon.getFileIcon(path);
      if (icon) {
        add(
          systenItemTableName,
          newCommonItem({
            id: 10,
            name: global.language.commandPrompt,
            data: newCommonItemData({
              target: "cmd.exe",
              icon: icon,
            }),
            order: 10,
          })
        );
      }
    }
  }
  // 任务管理器
  let taskmgr = selectById(systenItemTableName, 11);
  if (!taskmgr) {
    let path: string | null = global.addon.searchPath("taskmgr.exe");
    if (path) {
      let icon: string | null = global.addon.getFileIcon(path);
      if (icon) {
        add(
          systenItemTableName,
          newCommonItem({
            id: 11,
            name: global.language.taskManager,
            data: newCommonItemData({
              target: "taskmgr.exe",
              icon: icon,
            }),
            order: 11,
          })
        );
      }
    }
  }
  // 注册表编辑
  let regedit = selectById(systenItemTableName, 12);
  if (!regedit) {
    let path: string | null = global.addon.searchPath("regedit.exe");
    if (path) {
      let icon: string | null = global.addon.getFileIcon(path);
      if (icon) {
        add(
          systenItemTableName,
          newCommonItem({
            id: 12,
            name: global.language.registryEditor,
            data: newCommonItemData({
              target: "regedit.exe",
              icon: icon,
            }),
            order: 12,
          })
        );
      }
    }
  }
  // 电源选项
  let powercfg = selectById(systenItemTableName, 13);
  if (!powercfg) {
    add(
      systenItemTableName,
      newCommonItem({
        id: 13,
        name: global.language.powerOptions,
        data: newCommonItemData({
          target: "control.exe",
          params: "powercfg.cpl",
          icon: powerIcon,
        }),
        order: 13,
      })
    );
  }
  // 资源监视器
  let perfmon = selectById(systenItemTableName, 14);
  if (!perfmon) {
    let path: string | null = global.addon.searchPath("perfmon.exe");
    if (path) {
      let icon: string | null = global.addon.getFileIcon(path);
      if (icon) {
        add(
          systenItemTableName,
          newCommonItem({
            id: 14,
            name: global.language.resourceMonitor,
            data: newCommonItemData({
              target: "perfmon.exe",
              params: "/res",
              icon: icon,
            }),
            order: 14,
          })
        );
      }
    }
  }
  // 计算机管理
  let compmgmt = selectById(systenItemTableName, 15);
  if (!compmgmt) {
    let path: string | null = global.addon.searchPath("compmgmt.msc");
    if (path) {
      let icon: string | null = global.addon.getFileIcon(path);
      if (icon) {
        add(
          systenItemTableName,
          newCommonItem({
            id: 15,
            name: global.language.computerManagement,
            data: newCommonItemData({
              target: "compmgmt.msc",
              params: "/s",
              icon: icon,
            }),
            order: 15,
          })
        );
      }
    }
  }
  // 关机
  let shutdown = selectById(systenItemTableName, 16);
  if (!shutdown) {
    add(
      systenItemTableName,
      newCommonItem({
        id: 16,
        name: global.language.shutdown,
        data: newCommonItemData({
          target: "shutdown",
          params: "-s -t 0",
          htmlIcon:
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" style="width: 100%; height: 100%;"><path d="M12 3c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1zm5.14 2.86a.99.99 0 0 0-.01 1.39c1.13 1.2 1.83 2.8 1.87 4.57c.09 3.83-3.08 7.13-6.91 7.17A6.981 6.981 0 0 1 5 12c0-1.84.71-3.51 1.87-4.76c.37-.39.37-1-.01-1.38a.993.993 0 0 0-1.43.02A8.92 8.92 0 0 0 3 11.74c-.14 4.88 3.83 9.1 8.71 9.25c5.1.16 9.29-3.93 9.29-9c0-2.37-.92-4.51-2.42-6.11c-.38-.41-1.04-.42-1.44-.02z" fill="currentColor"></path></svg>',
        }),
        order: 16,
      })
    );
  }
  // 重启
  let restart = selectById(systenItemTableName, 17);
  if (!restart) {
    add(
      systenItemTableName,
      newCommonItem({
        id: 17,
        name: global.language.restart,
        data: newCommonItemData({
          target: "shutdown",
          params: "-r -t 0",
          htmlIcon:
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" style="width: 100%; height: 100%;"><path d="M12 4V2.21c0-.45-.54-.67-.85-.35l-2.8 2.79c-.2.2-.2.51 0 .71l2.79 2.79c.32.31.86.09.86-.36V6c3.31 0 6 2.69 6 6c0 .79-.15 1.56-.44 2.25c-.15.36-.04.77.23 1.04c.51.51 1.37.33 1.64-.34c.37-.91.57-1.91.57-2.95c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6c0-.79.15-1.56.44-2.25c.15-.36.04-.77-.23-1.04c-.51-.51-1.37-.33-1.64.34C4.2 9.96 4 10.96 4 12c0 4.42 3.58 8 8 8v1.79c0 .45.54.67.85.35l2.79-2.79c.2-.2.2-.51 0-.71l-2.79-2.79a.5.5 0 0 0-.85.36V18z" fill="currentColor"></path></svg>',
        }),
        order: 17,
      })
    );
  }
  // 睡眠
  let sleep = selectById(systenItemTableName, 18);
  if (!sleep) {
    add(
      systenItemTableName,
      newCommonItem({
        id: 18,
        name: global.language.sleep,
        data: newCommonItemData({
          target: "rundll32.exe",
          params: "powrprof.dll, SetSuspendState Sleep",
          htmlIcon:
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" style="width: 100%; height: 100%;"><path d="M14 4c.34 0 .68.02 1.01.07C13.1 6.23 12 9.05 12 12s1.1 5.77 3.01 7.93c-.33.05-.67.07-1.01.07c-4.41 0-8-3.59-8-8s3.59-8 8-8m0-2C8.48 2 4 6.48 4 12s4.48 10 10 10c1.82 0 3.53-.5 5-1.35c-2.99-1.73-5-4.95-5-8.65s2.01-6.92 5-8.65A9.973 9.973 0 0 0 14 2z" fill="currentColor"></path></svg>',
        }),
        order: 18,
      })
    );
  }
  // 锁定
  let lock = selectById(systenItemTableName, 19);
  if (!lock) {
    add(
      systenItemTableName,
      newCommonItem({
        id: 19,
        name: global.language.lock,
        data: newCommonItemData({
          target: "rundll32.exe",
          params: "user32.dll LockWorkStation",
          htmlIcon:
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" style="width: 100%; height: 100%;"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2z" fill="currentColor"></path></svg>',
        }),
        order: 19,
      })
    );
  }
  // 关闭显示器
  let turnOffMonitor = selectById(systenItemTableName, 20);
  if (!turnOffMonitor) {
    add(
      systenItemTableName,
      newCommonItem({
        id: 20,
        name: global.language.turnOffMonitor,
        data: newCommonItemData({
          target: "static:TurnOffMonitor",
          htmlIcon:
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" style="width: 100%; height: 100%;"><path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3c-.55.55-1 .87-1 1.59c0 .78.63 1.41 1.41 1.41h9.17c.78 0 1.41-.63 1.41-1.41c0-.72-.44-1.03-1-1.59h3c1.1 0 2-.9 2-2V5C22 3.9 21.1 3 20 3zm0 13H4V5h16v11z" fill="currentColor"></path></svg>',
        }),
        order: 20,
      })
    );
  }
}

/**
 * 初始化开始菜单项目表
 */
function initStartMenuItemTable() {
  // sql
  let sql = `CREATE TABLE IF NOT EXISTS ${startMenuItemTableName} (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            data TEXT NOT NULL,
            \`order\` INTEGER NOT NULL)`;
  // 运行
  db.exec(sql);
}

/**
 * 列表
 * @param table
 */
function list(table: string) {
  // sql
  let sql = `SELECT id, name, data, \`order\` FROM ${table}`;
  // 查询
  let list = db.prepare(sql).all();
  // 返回
  return list.map((row) => {
    return getCommonItem(row);
  });
}

/**
 * 根据ID查询
 * @param table
 * @param id
 */
function selectById(table: string, id: number): CommonItem | null {
  // SQL
  let sql = `SELECT id, name, data, \`order\` FROM ${table} WHERE id = ?`;
  // 运行
  let row = db.prepare(sql).get(id);
  // 返回
  if (row) {
    return getCommonItem(row);
  } else {
    return null;
  }
}

/**
 * 添加
 * @param table
 * @param commonItem
 * @returns
 */
function add(table: string, commonItem: CommonItem) {
  // SQL
  let sql = `INSERT INTO ${table} (id, name, data, \`order\`) VALUES (?, ?, ?, ?)`;
  // 运行
  db.prepare(sql).run(
    commonItem.id,
    commonItem.name,
    JSON.stringify(commonItem.data),
    commonItem.order
  );
}

/**
 * 删除所有数据
 * @param table
 */
function deleteAll(table: string) {
  // SQL
  let sql = `DELETE FROM ${table}`;
  // 运行
  db.prepare(sql).run();
}

/**
 * 批量添加
 * @param list
 */
function batchAdd(list: Array<CommonItem>) {
  // 开启事务
  db.transaction(() => {
    // SQL
    let sql = `INSERT INTO ${startMenuItemTableName} VALUES(?, ?, ?, ?)`;
    // 添加到缓存表中
    for (let i = 0; i < list.length; i++) {
      db.prepare(sql).run(
        i + 1,
        list[i].name,
        JSON.stringify(list[i].data),
        i + 1
      );
    }
  })();
}

export {
  systenItemTableName,
  startMenuItemTableName,
  initSystemItem,
  initStartMenuItemTable,
  list,
  deleteAll,
  batchAdd,
};
