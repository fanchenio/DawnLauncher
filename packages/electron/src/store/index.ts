import { defineStore } from "pinia";
import { Setting } from "../../types/setting";
import { Classification } from "../../types/classification";
import { getSetting } from "../../commons/utils/setting";
import { Item } from "../../types/item";
import { getLanguage } from "../../commons/data/languages";

export interface State {
  // 设置
  setting: Setting;
  // 分类列表
  classificationList: Array<Classification>;
  // 项目数据
  itemMap: Map<number, Array<Item>>;
  // 当前选中的父级分类ID
  selectedClassificationParentId: number | null;
  // 当前选中的子级分类ID
  selectedClassificationChildId: number | null;
  // 鼠标悬浮在分类上时的分类ID
  mouseoverClassificationId: number | null;
  // 分类是否在拖拽中
  classificationSorting: boolean;
  // 滚轮切换分类事件
  classificationWheelEvent: WheelEvent | null;
  // 项目是否在拖拽中
  itemSorting: boolean;
  // 项目是否再拖出中
  itemDragOut: boolean;
  // 项目拖出数据
  itemDragOutData: Item | null;
  // 项目批量操作
  itemBatchOperation: boolean;
  // 项目批量操作存储已选中项目
  itemBatchOperationDataArray: Array<number>;
  // 项目区域右键ID
  itemRightMenuItemId: number | null;
  // 无效项目
  invalidItemIdList: Array<number>;
  // 背景图
  backgroundImage: string | null;
  // 重新加载项目列表标识
  reloadItemList: boolean;
  // 搜索显示/隐藏标识
  search: boolean;
  // 搜索功能项目区域右键ID
  searchItemRightMenuItemId: number | null;
  // 快速搜索功能项目区域右键ID
  quickSearchItemRightMenuItemId: number | null;
  // 当前语言
  language: any;
}

export const useMainStore = defineStore("main", {
  state: (): State => {
    return {
      setting: getSetting(null),
      classificationList: [],
      itemMap: new Map(),
      selectedClassificationParentId: null,
      selectedClassificationChildId: null,
      mouseoverClassificationId: null,
      classificationSorting: false,
      classificationWheelEvent: null,
      itemSorting: false,
      itemDragOut: false,
      itemDragOutData: null,
      itemBatchOperation: false,
      itemBatchOperationDataArray: [],
      itemRightMenuItemId: null,
      invalidItemIdList: [],
      backgroundImage: null,
      reloadItemList: false,
      search: false,
      searchItemRightMenuItemId: null,
      quickSearchItemRightMenuItemId: null,
      language: getLanguage(null),
    };
  },
});
