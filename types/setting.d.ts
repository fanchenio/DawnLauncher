// 通用
export interface General {
  // 开机启动
  startup: boolean;
  // 启动后最小化到系统托盘
  startupTray: boolean;
  // 快捷键显示/隐藏
  showHideShortcutKey: string | null;
  // 语言
  language: string;
  // 永远置顶
  alwaysTop: boolean;
  // 边缘吸附
  edgeAdsorb: boolean;
  // 停靠在桌面边缘时自动隐藏
  edgeAutoHide: boolean;
  // 锁定尺寸
  lockSize: boolean;
  // 失去焦点后隐藏
  hideLoseFocus: boolean;
  // 隐藏托盘图标
  hideTray: boolean;
  // 隐藏任务栏
  hideTaskbar: boolean;
  // 固定位置
  fixedPosition: boolean;
  // 永远居中
  alwaysCenter: boolean;
  // 中间单击显示/隐藏
  showHideMouseWheelClick: boolean;
  // 显示时跟随鼠标位置
  showFollowMousePosition: boolean;
  // 勿扰模式
  notDisturb: boolean;
  // 双击任务栏显示/隐藏
  showHideDoubleClickTaskbar: boolean;
  // 延迟显示(毫秒)
  delayDisplayMs: number;
  // 延迟隐藏(毫秒)
  delayHideMs: number;
  // 显示窗口时将输入法切换为英文模式
  switchEnglish: boolean;
  // 搜索显示/隐藏快捷键
  searchShowHideShortcutKey: string | null;
  // 检查更新
  checkUpdates: boolean;
}

// 外观
export interface Appearance {
  // 主题
  theme: Theme;
  // 透明度
  transparency: number;
  // 背景图
  backgroundImage: string | null;
  // 背景图透明
  backgroundImageTransparency: number;
  // 背景图模式
  backgroundImageMode: string;
  // 背景图定位
  backgroundImagePosition: string;
  // 字体阴影
  fontShadow: boolean;
  // 字体阴影颜色
  fontShadowColor: string;
  // 窗口圆角
  windowRounded: boolean;
  // 标题
  title: string;
}

// 主题
export interface Theme {
  // 名称
  name: string;
  // 字体主颜色
  mainFontColor: string;
  // 字体次颜色
  secondFontColor: string;
  // 背景主颜色
  mainBackgroundColor: string;
  // 背景次颜色
  secondBackgroundColor: string;
  // 边框颜色
  borderColor: string;
}

// 分类
export interface Classification {
  // 宽度
  width: number;
  // 布局 left top right
  layout: string;
  // 鼠标悬停切换
  mouseHover: boolean;
  // 悬停毫秒
  mouseHoverMs: number;
  // 滚轮切换
  mouseWheel: boolean;
  // 记住选择状态
  rememberSelectionState: boolean;
  // 名称对齐 left center
  nameAlign: string;
  // 模式 normal icon
  mode: string;
  // 项目列表滚动到底部或顶部时自动切换分类
  autoSwitchClassification: boolean;
  // 隐藏窗口时折叠子分类
  hideWindowCollapseSubClassification: boolean;
  // 切换分类时收起其他子分类
  switchClassificationCollapseOtherSubClassification: boolean;
}

// 子分类
export interface SubClassification {
  // 名称字体(项目区域)
  itemAreaNameFontSize: number;
  // 名称粗细(项目区域)
  itemAreaNameFontWeight: number;
  // 名称字体行高(项目区域)
  itemAreaNameFontLineHeight: number;
  // 名称对齐(项目区域)
  itemAreaNameAlign: "left" | "center" | "right";
}

// 项目
export interface Item {
  // 布局 tile list
  layout: string;
  // 图标大小
  iconSize: number;
  // 双击打开项目
  doubleClickOpen: boolean;
  // 打开后隐藏主界面
  openAfterHideMainInterface: boolean;
  // 从程序外拖动文件到项目图标上时用此项目打开文件
  useItemOpen: boolean;
  // 记录打开次数
  openNumber: boolean;
  // 隐藏项目名称
  hideItemName: boolean;
  // 隐藏省略号
  hideEllipsis: boolean;
  // 项目名称行数
  itemNameRowCount: number;
  // 宽度
  width: number;
  // 列数 单列多列
  columnNumber: number;
  // 检测无效项目
  checkInvalidItem: boolean;
  // 字体大小
  fontSize: number;
  // 字体粗细
  fontWeight: number;
  // 字体行高
  fontLineHeight: number;
}

// 快速搜索
export interface QuickSearch {
  // 开启
  enable: boolean;
  // 快捷键
  showHideShortcutKey: string | null;
  // 打开快捷键 numberKey ctrlNumberKey altNumberKey
  openShortcutKey: string;
  // 失去焦点后隐藏
  hideLoseFocus: boolean;
  // 仅剩一项时立即打开
  openNow: boolean;
  // 显示历史记录
  showHistory: boolean;
  // 历史记录排序 lastOpen openNumber
  showHistorySort: string;
  // 从程序外拖动文件到项目图标上时用此项目打开文件
  useItemOpen: boolean;
  // 打开后隐藏快速搜索窗口
  openAfterHideQuickSearchWindow: boolean;
  // 匹配条件：备注
  matchConditionsRemark: boolean;
}

// 网络搜索
export interface WebSearch {
  // 模式 0:冒号 + 关键字 + 空格 1:关键字 + 空格
  mode: number;
  // 搜索源
  searchSourceList: Array<WebSearchSource>;
}

// 网络搜索源
export interface WebSearchSource {
  // ID
  id: number;
  // 关键字
  keyword: string;
  // 名称
  name: string;
  // URL
  url: string;
  // 描述
  description: string | null;
}

// 网络
export interface Network {
  // 使用代理
  useProxy: boolean;
  // 代理信息
  proxy: Proxy;
}

// 代理
export interface Proxy {
  // address
  address: string;
  // 用户名
  username: string | null;
  // 密码
  password: string | null;
}

// 设置
export interface Setting {
  // 常规
  general: General;
  // 外观
  appearance: Appearance;
  // 分类
  classification: Classification;
  // 子分类
  subClassification: SubClassification;
  // 项目
  item: Item;
  // 快速搜索
  quickSearch: QuickSearch;
  // 网络搜索
  webSearch: WebSearch;
  // 网络
  network: Network;
}
