const Store = require("electron-store");
const settingStore = new Store({ name: "setting", encryptionKey: "732b6562-c2dd-56c7-8fe9-ef3ed6646128", clearInvalidConfig: true });
const store = new Store({ name: "data", encryptionKey: "0b52eb58-4c0f-5ff1-b062-031546a8d269", clearInvalidConfig: true });

module.exports = {
  initData() {
    let setting = store.get("setting");
    if (setting == null) {
      let ss = settingStore.get("setting");
      if (ss == null) {
        setting = {
          general: {
            // 开机启动
            startup: false,
            // 启动后最小化到系统托盘
            startupTray: false,
            // 显示/隐藏快捷键
            showHideShortcutKey: null,
            // 语言
            language: "chinese",
            // 永远置顶
            alwaysTop: false,
            // 停靠在桌面边缘时自动隐藏
            edgeAutoHide: true,
            // 锁定尺寸
            lockSize: false,
            // 失去焦点后隐藏
            hideLosingFocus: false,
            // 隐藏托盘图标
            hideTray: false,
            // 中间单击
            showHideMouseWheelClick: false,
            // 固定位置
            fixedPosition: false,
            // 永远居中
            alwaysCenter: false,
            // 显示时跟随鼠标位置
            showFollowMousePosition: false,
            // 隐藏任务栏
            hideTaskbar: false,
            // 勿扰模式
            notDisturb: false,
            // 双击任务栏
            doubleClickTaskbar: false,
            // 延迟显示(毫秒)
            delayDisplayMS: 0,
            // 延迟隐藏(毫秒)
            delayHidingMS: 0,
            // 显示窗口时将输入法切换为英文模式
            switchEnglish: false,
          },
          appearance: {
            // 主题
            theme: {
              name: "#FFFFFF",
              fontBasic: "#505050",
              fontHover: "#FFFFFF",
              mainBackground: "#FFFFFF",
              minorBackground: "#999999",
              border: "#F0F0F0",
            },
            // 窗口透明度
            transparency: 1,
            // 背景透明度
            backgroundTransparency: 1,
            // 使用字体阴影
            useFontShadow: false,
            // 文字阴影
            fontShadow: "#000000",
            // 背景图
            backgroundImage: null,
            // 背景图模式
            backgroundImageMode: "repeat",
            // 背景图定位
            backgroundImagePosition: "default",
            // 背景图透明度
            backgroundImageTransparency: 1,
            // 窗口圆角
            windowRoundedCorners: false,
            // 标题
            title: "Dawn Launcher",
          },
          classification: {
            // 宽度
            width: 140,
            // 布局
            layout: "left",
            // 鼠标悬停切换
            mouseHover: false,
            // 悬停毫秒
            mouseHoverMS: 1000,
            // 滚轮切换
            mouseWheel: false,
            // 记住选择状态
            rememberSelectionState: false,
            // 名称对齐
            nameAlign: "left",
            // 模式
            mode: "normal",
            // 项目列表滚动到底部或顶部时自动切换分类
            autoSwitchClassification: false,
            // 隐藏窗口时折叠子分类
            hideWindowFoldChildClassification: false,
            // 切换分类时收起其他子分类
            switchClassificationCollapseOtherSubClassification: false,
          },
          item: {
            // 布局
            layout: "tile",
            // 图标大小
            iconSize: 40,
            // 搜索快捷键
            searchShortcutKey: "TAB",
            // 双击运行项目
            doubleClickRunItem: false,
            // 打开后隐藏主界面
            openAfterHideMainInterface: false,
            // 从程序外拖动文件到项目图标上时用此项目打开文件
            useItemOpen: false,
            // 记录打开次数
            openNumber: false,
            // 隐藏项目名称
            hideItemName: false,
            // 隐藏省略号
            hideEllipsis: false,
            // 项目名称行数
            itemNameRowCount: 2,
            // 宽度
            width: 100,
            // 列数 单列多列
            columnNumber: 1,
            // 检测无效项目
            checkInvalidItem: true,
            // 字体大小
            fontSize: 14,
            // 字体粗细
            fontWeight: 400,
            // 字体行高
            fontLineHeight: 1.25,
          },
          quickSearch: {
            // 开启
            enable: true,
            // 快捷键
            showHideShortcutKey: "Alt + Enter",
            // 打开快捷键
            openShortcutKey: "none",
            // 失去焦点后隐藏
            hideLosingFocus: false,
            // 仅剩一项时立即打开
            openNow: false,
            // 显示历史记录
            showHistory: false,
            // 历史记录排序
            showHistorySort: "lastOpen",
            // 从程序外拖动文件到项目图标上时用此项目打开文件
            useItemOpen: false,
            // 打开后隐藏快速搜索窗口
            openAfterHideQuickSearchWindow: true,
            // 匹配条件
            matchingConditionsRemark: false,
          },
          webSearch: {
            // 模式
            mode: 0,
            // 搜索源
            searchSourceList: [
              {
                id: 1,
                keyword: "g",
                name: "Google",
                URL: "https://www.google.com/search?q={w}",
              },
              {
                id: 2,
                keyword: "b",
                name: "Baidu",
                URL: "https://www.baidu.com/s?wd={w}",
              },
              {
                id: 3,
                keyword: "bing",
                name: "Bing",
                URL: "https://cn.bing.com/search?q={w}",
              },
              {
                id: 4,
                keyword: "so",
                name: "360",
                URL: "https://www.so.com/s?q={w}",
              },
              {
                id: 5,
                keyword: "sogou",
                name: "Sogou",
                URL: "https://www.sogou.com/web?query={w}",
              },
            ],
          },
          network: {
            // 使用代理
            useProxy: false,
            // 代理信息
            proxy: {
              // address
              address: null,
              // 用户名
              username: null,
              // 密码
              password: null,
            },
          },
          // 子分类
          subClassification: {
            // 名称字体(项目区域)
            itemAreaNameFontSize: 14,
            // 名称粗细(项目区域)
            itemAreaNameFontWeight: 700,
            // 名称字体行高(项目区域)
            itemAreaNameFontLineHeight: 1.25,
          },
        };
      } else {
        setting = ss;
      }
    }
    if (setting.general.language == null) {
      setting.general.language = "chinese";
    }
    if (setting.general.alwaysTop == null) {
      setting.general.alwaysTop = false;
    }
    if (setting.general.fixedPosition == null) {
      setting.general.fixedPosition = false;
    }
    if (setting.general.alwaysCenter == null) {
      setting.general.alwaysCenter = false;
    }
    if (setting.general.showFollowMousePosition == null) {
      setting.general.showFollowMousePosition = false;
    }
    if (setting.general.edgeAutoHide == null) {
      setting.general.edgeAutoHide = true;
    }
    if (setting.general.startupTray == null) {
      setting.general.startupTray = false;
    }
    if (setting.general.lockSize == null) {
      setting.general.lockSize = false;
    }
    if (setting.general.hideLosingFocus == null) {
      setting.general.hideLosingFocus = false;
    }
    if (setting.general.hideTray == null) {
      setting.general.hideTray = false;
    }
    if (setting.general.showHideMouseWheelClick == null) {
      setting.general.showHideMouseWheelClick = false;
    }
    if (setting.general.hideTaskbar == null) {
      setting.general.hideTaskbar = false;
    }
    if (setting.general.notDisturb == null) {
      setting.general.notDisturb = false;
    }
    if (setting.general.doubleClickTaskbar == null) {
      setting.general.doubleClickTaskbar = false;
    }
    if (setting.general.delayDisplayMS == null) {
      setting.general.delayDisplayMS = 0;
    }
    if (setting.general.delayHidingMS == null) {
      setting.general.delayHidingMS = 0;
    }
    if (setting.general.switchEnglish == null) {
      setting.general.switchEnglish = false;
    }
    if (setting.item.layout == null) {
      setting.item.layout = "tile";
    }
    if (setting.item.iconSize == null) {
      setting.item.iconSize = 40;
    }
    if (setting.item.openAfterHideMainInterface == null) {
      setting.item.openAfterHideMainInterface = false;
    }
    if (setting.item.useItemOpen == null) {
      setting.item.useItemOpen = false;
    }
    if (setting.item.openNumber == null) {
      setting.item.openNumber = false;
    }
    if (setting.item.hideItemName == null) {
      setting.item.hideItemName = false;
    }
    if (setting.item.hideEllipsis == null) {
      setting.item.hideEllipsis = false;
    }
    if (setting.item.itemNameRowCount == null) {
      setting.item.itemNameRowCount = 2;
    }
    if (setting.item.width == null) {
      setting.item.width = 100;
    }
    if (setting.item.columnNumber == null) {
      setting.item.columnNumber = 1;
    } else if (setting.item.columnNumber != null && setting.item.columnNumber == "single") {
      setting.item.columnNumber = 1;
    } else if (setting.item.columnNumber != null && setting.item.columnNumber == "multiple") {
      setting.item.columnNumber = 2;
    }
    if (setting.item.checkInvalidItem == null) {
      setting.item.checkInvalidItem = true;
    }
    if (setting.item.fontSize == null) {
      setting.item.fontSize = 14;
    }
    if (setting.item.fontWeight == null) {
      setting.item.fontWeight = 400;
    }
    if (setting.item.fontLineHeight == null) {
      setting.item.fontLineHeight = 1.25;
    }
    if (setting.classification == null) {
      setting.classification = {};
    }
    if (setting.classification.width == null) {
      setting.classification.width = 140;
    }
    if (setting.classification.layout == null) {
      setting.classification.layout = "left";
    }
    if (setting.classification.mouseHover == null) {
      setting.classification.mouseHover = false;
    }
    if (setting.classification.mouseHoverMS == null) {
      setting.classification.mouseHoverMS = 1000;
    }
    if (setting.classification.mouseWheel == null) {
      setting.classification.mouseWheel = false;
    }
    if (setting.classification.rememberSelectionState == null) {
      setting.classification.rememberSelectionState = false;
    }
    if (setting.classification.nameAlign == null) {
      setting.classification.nameAlign = "left";
    }
    if (setting.classification.mode == null) {
      setting.classification.mode = "normal";
    }
    if (setting.classification.autoSwitchClassification == null) {
      setting.classification.autoSwitchClassification = false;
    }
    if (setting.classification.hideWindowFoldChildClassification == null) {
      setting.classification.hideWindowFoldChildClassification = false;
    }
    if (setting.classification.switchClassificationCollapseOtherSubClassification == null) {
      setting.classification.switchClassificationCollapseOtherSubClassification = false;
    }
    if (setting.appearance.theme.name.toUpperCase() == "#FFFFFF") {
      setting.appearance.theme = {
        name: "#FFFFFF",
        fontBasic: "#505050",
        fontHover: "#FFFFFF",
        mainBackground: "#FFFFFF",
        minorBackground: "#999999",
        border: "#F0F0F0",
      };
    }
    if (setting.appearance.theme.name.toUpperCase() == "#2B2B2B") {
      setting.appearance.theme = {
        name: "#2B2B2B",
        fontBasic: "#BBBBBB",
        fontHover: "#BBBBBB",
        mainBackground: "#2B2B2B",
        minorBackground: "#3C3F41",
        border: "#3C3F41",
      };
    }
    if (setting.appearance.transparency == null) {
      setting.appearance.transparency = 1;
    }
    if (setting.appearance.backgroundTransparency == null) {
      setting.appearance.backgroundTransparency = 1;
    }
    if (setting.appearance.useFontShadow == null) {
      setting.appearance.useFontShadow = false;
    }
    if (setting.appearance.fontShadow == null) {
      setting.appearance.fontShadow = "#000000";
    }
    if (setting.appearance.backgroundImageMode == null) {
      setting.appearance.backgroundImageMode = "repeat";
    }
    if (setting.appearance.backgroundImagePosition == null) {
      setting.appearance.backgroundImagePosition = "default";
    }
    if (setting.appearance.backgroundImageTransparency == null) {
      setting.appearance.backgroundImageTransparency = 1;
    }
    if (setting.appearance.windowRoundedCorners == null) {
      setting.appearance.windowRoundedCorners = false;
    }
    if (setting.appearance.title == null) {
      setting.appearance.title = "Dawn Launcher";
    }
    if (setting.quickSearch == null) {
      setting.quickSearch = {};
    }
    if (setting.quickSearch.enable == null) {
      setting.quickSearch.enable = true;
    }
    if (setting.quickSearch.showHideShortcutKey == null) {
      setting.quickSearch.showHideShortcutKey = "Alt + Enter";
    }
    if (setting.quickSearch.openShortcutKey == null) {
      setting.quickSearch.openShortcutKey = "none";
    }
    if (setting.quickSearch.hideLosingFocus == null) {
      setting.quickSearch.hideLosingFocus = false;
    }
    if (setting.quickSearch.openNow == null) {
      setting.quickSearch.openNow = false;
    }
    if (setting.quickSearch.showHistory == null) {
      setting.quickSearch.showHistory = false;
    }
    if (setting.quickSearch.showHistorySort == null) {
      setting.quickSearch.showHistorySort = "lastOpen";
    }
    if (setting.quickSearch.useItemOpen == null) {
      setting.quickSearch.useItemOpen = false;
    }
    if (setting.quickSearch.openAfterHideQuickSearchWindow == null) {
      setting.quickSearch.openAfterHideQuickSearchWindow = true;
    }
    if (setting.quickSearch.matchingConditionsRemark == null) {
      setting.quickSearch.matchingConditionsRemark = false;
    }
    if (setting.webSearch == null) {
      setting.webSearch = {};
    }
    if (setting.webSearch.mode == null) {
      setting.webSearch.mode = 0;
    }
    if (setting.webSearch.searchSourceList == null || setting.webSearch.searchSourceList.length == 0) {
      setting.webSearch.searchSourceList = [
        {
          id: 1,
          keyword: "g",
          name: "Google",
          URL: "https://www.google.com/search?q={w}",
        },
        {
          id: 2,
          keyword: "b",
          name: "Baidu",
          URL: "https://www.baidu.com/s?wd={w}",
        },
        {
          id: 3,
          keyword: "bing",
          name: "Bing",
          URL: "https://cn.bing.com/search?q={w}",
        },
        {
          id: 4,
          keyword: "so",
          name: "360",
          URL: "https://www.so.com/s?q={w}",
        },
        {
          id: 5,
          keyword: "sogou",
          name: "Sogou",
          URL: "https://www.sogou.com/web?query={w}",
        },
      ];
    }
    if (setting.network == null) {
      setting.network = {};
    }
    if (setting.network.useProxy == null) {
      setting.network.useProxy = false;
    }
    if (setting.subClassification == null) {
      setting.subClassification = {};
    }
    if (setting.subClassification.itemAreaNameFontSize == null) {
      setting.subClassification.itemAreaNameFontSize = 14;
    }
    if (setting.subClassification.itemAreaNameFontWeight == null) {
      setting.subClassification.itemAreaNameFontWeight = 700;
    }
    if (setting.subClassification.itemAreaNameFontLineHeight == null) {
      setting.subClassification.itemAreaNameFontLineHeight = 1.25;
    }
    this.set(setting);
    global.setting = setting;
  },
  /**
   * get
   */
  get() {
    this.initData();
    return store.get("setting");
  },
  /**
   * set
   * @param setting
   */
  set(setting) {
    store.set("setting", setting);
    global.setting = setting;
  },
};
