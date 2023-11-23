import {
  Appearance,
  Classification,
  CommandLine,
  General,
  Item,
  Network,
  Proxy,
  QuickSearch,
  Setting,
  SubClassification,
  Theme,
  WebSearch,
  WebSearchSource,
} from "../../types/setting";
import { convert } from "./common";
import { themeList } from "../data/theme";
import { webSearchSourceList } from "../data/webSearchSource";

/**
 * 常规
 * @returns
 */
function getGeneral({
  startup = false,
  startupTray = false,
  showHideShortcutKey = null,
  language = "SimplifiedChinese",
  alwaysTop = false,
  edgeAdsorb = true,
  edgeAutoHide = false,
  lockSize = false,
  hideLoseFocus = false,
  hideTray = false,
  hideTaskbar = true,
  fixedPosition = false,
  alwaysCenter = false,
  showHideMouseWheelClick = false,
  showFollowMousePosition = false,
  notDisturb = false,
  showHideDoubleClickTaskbar = false,
  delayDisplayMs = 0,
  delayHideMs = 0,
  switchEnglish = false,
  searchShowHideShortcutKey = "TAB",
  checkUpdates = true,
}: {
  startup?: boolean | null;
  startupTray?: boolean | null;
  showHideShortcutKey?: string | null;
  language?: string | null;
  alwaysTop?: boolean | null;
  edgeAdsorb?: boolean | null;
  edgeAutoHide?: boolean | null;
  lockSize?: boolean | null;
  hideLoseFocus?: boolean | null;
  hideTray?: boolean | null;
  hideTaskbar?: boolean | null;
  fixedPosition?: boolean | null;
  alwaysCenter?: boolean | null;
  showHideMouseWheelClick?: boolean | null;
  showFollowMousePosition?: boolean | null;
  notDisturb?: boolean | null;
  showHideDoubleClickTaskbar?: boolean | null;
  delayDisplayMs?: number | null;
  delayHideMs?: number | null;
  switchEnglish?: boolean | null;
  searchShowHideShortcutKey?: string | null;
  checkUpdates?: boolean | null;
}): General {
  return {
    startup: startup ?? false,
    startupTray: startupTray ?? false,
    showHideShortcutKey: showHideShortcutKey ?? null,
    language: language ?? "SimplifiedChinese",
    alwaysTop: alwaysTop ?? false,
    edgeAdsorb: edgeAdsorb ?? true,
    edgeAutoHide: edgeAutoHide ?? false,
    lockSize: lockSize ?? false,
    hideLoseFocus: hideLoseFocus ?? false,
    hideTray: hideTray ?? false,
    hideTaskbar: hideTaskbar ?? true,
    fixedPosition: fixedPosition ?? false,
    alwaysCenter: alwaysCenter ?? false,
    showHideMouseWheelClick: showHideMouseWheelClick ?? false,
    showFollowMousePosition: showFollowMousePosition ?? false,
    notDisturb: notDisturb ?? false,
    showHideDoubleClickTaskbar: showHideDoubleClickTaskbar ?? false,
    delayDisplayMs: delayDisplayMs ?? 0,
    delayHideMs: delayHideMs ?? 0,
    switchEnglish: switchEnglish ?? false,
    searchShowHideShortcutKey: searchShowHideShortcutKey ?? null,
    checkUpdates: checkUpdates ?? true,
  };
}

/**
 * 外观
 * @returns
 */
function getAppearance({
  theme = convert<Theme, Theme>(themeList[0]),
  transparency = 1,
  backgroundImage = null,
  backgroundImageTransparency = 1,
  backgroundImageMode = "repeat",
  backgroundImagePosition = "default",
  fontShadow = false,
  fontShadowColor = "#000000",
  windowRounded = false,
  title = "Dawn Launcher",
}: {
  theme?: Theme | null;
  transparency?: number | null;
  backgroundImage?: string | null;
  backgroundImageTransparency?: number | null;
  backgroundImageMode?: string | null;
  backgroundImagePosition?: string | null;
  fontShadow?: boolean | null;
  fontShadowColor?: string | null;
  windowRounded?: boolean | null;
  title?: string | null;
}): Appearance {
  return {
    theme: theme ?? convert<Theme, Theme>(themeList[0]),
    transparency: transparency ?? 1,
    backgroundImage: backgroundImage ?? null,
    backgroundImageTransparency: backgroundImageTransparency ?? 1,
    backgroundImageMode: backgroundImageMode ?? "repeat",
    backgroundImagePosition: backgroundImagePosition ?? "default",
    fontShadow: fontShadow ?? false,
    fontShadowColor: fontShadowColor ?? "#000000",
    windowRounded: windowRounded ?? false,
    title: title ?? "Dawn Launcher",
  };
}

/**
 * 分类
 * @returns
 */
function getClassification({
  width = 140,
  layout = "left",
  mouseHover = false,
  mouseHoverMs = 0,
  mouseWheel = false,
  rememberSelectionState = false,
  nameAlign = "left",
  mode = "normal",
  autoSwitchClassification = false,
  hideWindowCollapseSubClassification = false,
  switchClassificationCollapseOtherSubClassification = false,
}: {
  width?: number | null;
  layout?: string | null;
  mouseHover?: boolean | null;
  mouseHoverMs?: number | null;
  mouseWheel?: boolean | null;
  rememberSelectionState?: boolean | null;
  nameAlign?: string | null;
  mode?: string | null;
  autoSwitchClassification?: boolean | null;
  hideWindowCollapseSubClassification?: boolean | null;
  switchClassificationCollapseOtherSubClassification?: boolean | null;
}): Classification {
  return {
    width: width ?? 140,
    layout: layout ?? "left",
    mouseHover: mouseHover ?? false,
    mouseHoverMs: mouseHoverMs ?? 0,
    mouseWheel: mouseWheel ?? false,
    rememberSelectionState: rememberSelectionState ?? false,
    nameAlign: nameAlign ?? "left",
    mode: mode ?? "normal",
    autoSwitchClassification: autoSwitchClassification ?? false,
    hideWindowCollapseSubClassification:
      hideWindowCollapseSubClassification ?? false,
    switchClassificationCollapseOtherSubClassification:
      switchClassificationCollapseOtherSubClassification ?? false,
  };
}

/**
 * 子分类
 * @returns
 */
function getSubClassification({
  itemAreaNameFontSize = 14,
  itemAreaNameFontWeight = 700,
  itemAreaNameFontLineHeight = 1.25,
  itemAreaNameAlign = "left",
}: {
  itemAreaNameFontSize?: number | null;
  itemAreaNameFontWeight?: number | null;
  itemAreaNameFontLineHeight?: number | null;
  itemAreaNameAlign?: "left" | "center" | "right" | null;
}): SubClassification {
  return {
    itemAreaNameFontSize: itemAreaNameFontSize ?? 14,
    itemAreaNameFontWeight: itemAreaNameFontWeight ?? 700,
    itemAreaNameFontLineHeight: itemAreaNameFontLineHeight ?? 1.25,
    itemAreaNameAlign: itemAreaNameAlign ?? "left",
  };
}

/**
 * 项目
 * @returns
 */
function getItem({
  layout = "tile",
  iconSize = 40,
  doubleClickOpen = false,
  openAfterHideMainInterface = false,
  useItemOpen = false,
  openNumber = false,
  hideItemName = false,
  hideEllipsis = false,
  itemNameRowCount = 2,
  width = 85,
  columnNumber = 1,
  checkInvalidItem = false,
  fontSize = 14,
  fontWeight = 400,
  fontLineHeight = 1.25,
}: {
  layout?: string | null;
  iconSize?: number | null;
  doubleClickOpen?: boolean | null;
  openAfterHideMainInterface?: boolean | null;
  useItemOpen?: boolean | null;
  openNumber?: boolean | null;
  hideItemName?: boolean | null;
  hideEllipsis?: boolean | null;
  itemNameRowCount?: number | null;
  width?: number | null;
  columnNumber?: number | null;
  checkInvalidItem?: boolean | null;
  fontSize?: number | null;
  fontWeight?: number | null;
  fontLineHeight?: number | null;
}): Item {
  return {
    layout: layout ?? "tile",
    iconSize: iconSize ?? 40,
    doubleClickOpen: doubleClickOpen ?? false,
    openAfterHideMainInterface: openAfterHideMainInterface ?? false,
    useItemOpen: useItemOpen ?? false,
    openNumber: openNumber ?? false,
    hideItemName: hideItemName ?? false,
    hideEllipsis: hideEllipsis ?? false,
    itemNameRowCount: itemNameRowCount ?? 2,
    width: width ?? 85,
    columnNumber: columnNumber ?? 1,
    checkInvalidItem: checkInvalidItem ?? false,
    fontSize: fontSize ?? 14,
    fontWeight: fontWeight ?? 400,
    fontLineHeight: fontLineHeight ?? 1.25,
  };
}

/**
 * 快速搜索
 * @returns
 */
function getQuickSearch({
  enable = true,
  showHideShortcutKey = "Alt + Space",
  openShortcutKey = "none",
  hideLoseFocus = false,
  openNow = false,
  showHistory = false,
  showHistorySort = "lastOpen",
  useItemOpen = false,
  openAfterHideQuickSearchWindow = true,
  matchConditionsRemark = false,
}: {
  enable?: boolean | null;
  showHideShortcutKey?: string | null;
  openShortcutKey?: string | null;
  hideLoseFocus?: boolean | null;
  openNow?: boolean | null;
  showHistory?: boolean | null;
  showHistorySort?: string | null;
  useItemOpen?: boolean | null;
  openAfterHideQuickSearchWindow?: boolean | null;
  matchConditionsRemark?: boolean | null;
}): QuickSearch {
  return {
    enable: enable ?? true,
    showHideShortcutKey: showHideShortcutKey ?? "Alt + Space",
    openShortcutKey: openShortcutKey ?? "none",
    hideLoseFocus: hideLoseFocus ?? false,
    openNow: openNow ?? false,
    showHistory: showHistory ?? false,
    showHistorySort: showHistorySort ?? "lastOpen",
    useItemOpen: useItemOpen ?? false,
    openAfterHideQuickSearchWindow: openAfterHideQuickSearchWindow ?? true,
    matchConditionsRemark: matchConditionsRemark ?? false,
  };
}

/**
 * 网络搜索
 * @returns
 */
function getWebSearch({
  mode = 0,
  searchSourceList = webSearchSourceList,
}: {
  mode?: number | null;
  searchSourceList?: Array<WebSearchSource> | null;
}): WebSearch {
  return {
    mode: mode ?? 0,
    searchSourceList: searchSourceList ?? webSearchSourceList,
  };
}

/**
 * 命令行
 * @returns
 */
function getCommandLine({
  defaultUse = "cmd",
}: {
  defaultUse?: string | null;
}): CommandLine {
  return {
    defaultUse: defaultUse ?? "cmd",
  };
}

/**
 * 网络
 * @returns
 */
function getNetwork({
  useProxy = false,
  proxy = getProxy({}),
}: {
  useProxy?: boolean | null;
  proxy?: Proxy | null;
}): Network {
  return {
    useProxy: useProxy ?? false,
    proxy: proxy ? getProxy(proxy) : getProxy({}),
  };
}

/**
 * 代理
 * @returns
 */
function getProxy({
  address = "",
  username = null,
  password = null,
}: {
  address?: string | null;
  username?: string | null;
  password?: string | null;
}): Proxy {
  return {
    address: address ?? "",
    username: username ?? null,
    password: password ?? null,
  };
}

/**
 * 设置
 * @returns
 */
function getSetting(setting: Setting | null): Setting {
  return {
    general: getGeneral(setting && setting.general ? setting.general : {}),
    appearance: getAppearance(
      setting && setting.appearance ? setting.appearance : {}
    ),
    classification: getClassification(
      setting && setting.classification ? setting.classification : {}
    ),
    subClassification: getSubClassification(
      setting && setting.subClassification ? setting.subClassification : {}
    ),
    item: getItem(setting && setting.item ? setting.item : {}),
    quickSearch: getQuickSearch(
      setting && setting.quickSearch ? setting.quickSearch : {}
    ),
    webSearch: getWebSearch(
      setting && setting.webSearch ? setting.webSearch : {}
    ),
    commandLine: getCommandLine(
      setting && setting.commandLine ? setting.commandLine : {}
    ),
    network: getNetwork(setting && setting.network ? setting.network : {}),
  };
}

export { getSetting };
