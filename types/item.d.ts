// 通用项目
export interface CommonItem {
  // id
  id: number;
  // 名称
  name: string | null;
  // 数据
  data: CommonItemData;
  // 顺序
  order: number;
}

// 通用项目数据
export interface CommonItemData {
  // 目标
  target: string | null;
  // 参数
  params: string | null;
  // 图标
  icon: string | null;
  // html图标
  htmlIcon: string | null;
}

// 项目
export interface Item {
  // id
  id: number;
  // 分类ID
  classificationId: number;
  // 名称
  name: string | null;
  // 类型 0:文件 1:文件夹 2:网址 3:系统 4:Appx 5:多项目
  type: number;
  // 数据
  data: ItemData;
  // 快捷键
  shortcutKey: string | null;
  // 全局快捷键
  globalShortcutKey: boolean;
  // 顺序
  order: number;
}

// 项目数据
export interface ItemData {
  // 起始位置
  startLocation: string | null;
  // 目标
  target: string | null;
  // 参数
  params: string | null;
  // 以管理员身份运行
  runAsAdmin: boolean;
  // 图标
  icon: string | null;
  // html图标
  htmlIcon: string | null;
  // 备注
  remark: string | null;
  // 图标背景
  iconBackgroundColor: boolean;
  // 固定图标
  fixedIcon: boolean;
  // 打开次数
  openNumber: number;
  // 最后打开时间
  lastOpen: number;
  // 快速搜索-打开次数
  quickSearchOpenNumber: number;
  // 快速搜索-最后打开时间
  quickSearchLastOpen: number;
  // 多项目时间间隔(毫秒)
  multiItemsTimeInterval: number;
}
