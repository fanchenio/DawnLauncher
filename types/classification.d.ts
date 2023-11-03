// 分类
export interface Classification {
  // ID
  id: number;
  // 父级ID
  parentId: number | null;
  // 名称
  name: string | null;
  // 类型 0:普通分类 1:关联文件夹 2:聚合分类
  type: number;
  // 数据
  data: ClassificationData;
  // 快捷键
  shortcutKey: string | null;
  // 全局快捷键
  globalShortcutKey: boolean;
  // 顺序
  order: number;
  // 子级分类
  childList: Array<Classification> | null;
}

// 分类数据
export interface ClassificationData {
  // 图标
  icon: string | null;
  // 关联文件夹路径
  associateFolderPath: string | null;
  // 关联文件夹隐藏项
  associateFolderHiddenItems: string | null;
  // 项目布局
  itemLayout: "default" | "tile" | "list";
  // 项目排序
  itemSort: "default" | "initial" | "openNumber" | "lastOpen";
  // 项目列数
  itemColumnNumber: number | null;
  // 项目图标大小
  itemIconSize: number | null;
  // 只显示...
  itemShowOnly: "default" | "file" | "folder";
  // 固定分类
  fixed: boolean;
  // 聚合分类项目数量
  aggregateItemCount: number;
  // 排除搜索
  excludeSearch: boolean;
}
