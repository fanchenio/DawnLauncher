// 无用，为了tsc编译通过
import { Classification, ClassificationData } from "../../types/classification";
import { CommonItem, CommonItemData, Item, ItemData } from "../../types/item";

export function convert<F, T>(from: F): T;
export function isAbsolutePath(path: string): boolean;
export function deleteExtname(name: string | null): string | null;
export function getFileName(path: string | null): string | null;
export function getFileExtname(path: string | null): string | null;
export function newClassification(data: {
  id?: number | null;
  parentId?: number | null;
  name?: string | null;
  type?: number | null;
  data?: ClassificationData | null;
  shortcutKey?: string | null;
  globalShortcutKey?: boolean | null;
  order?: number | null;
  childList?: Array<Classification> | null;
}): Classification;
export function newClassificationData(data: {
  icon?: string | null;
  associateFolderPath?: string | null;
  associateFolderHiddenItems?: string | null;
  itemLayout?: "default" | "tile" | "list";
  itemSort?: "default" | "initial" | "openNumber" | "lastOpen";
  itemColumnNumber?: number | null;
  itemIconSize?: number | null;
  itemShowOnly?: "default" | "file" | "folder";
  fixed?: boolean | null;
  aggregateItemCount?: number | null;
}): ClassificationData;
export function newCommonItem(data: {
  id?: number | null;
  name?: string | null;
  data?: CommonItemData | null;
  order?: number | null;
}): CommonItem;
export function newCommonItemData(data: {
  target?: string | null;
  params?: string | null;
  icon?: string | null;
  htmlIcon?: string | null;
}): CommonItemData;
export function newItem(data: {
  id?: number | null;
  classificationId: number;
  name?: string | null;
  type?: number | null;
  data?: ItemData | null;
  shortcutKey?: string | null;
  globalShortcutKey?: boolean | null;
  order?: number | null;
}): Item;
export function newItemData(data: {
  startLocation?: string | null;
  target?: string | null;
  params?: string | null;
  runAsAdmin?: boolean | null;
  icon?: string | null;
  htmlIcon?: string | null;
  remark?: string | null;
  iconBackgroundColor?: boolean | null;
  fixedIcon?: boolean | null;
  openNumber?: number | null;
  lastOpen?: number | null;
  quickSearchOpenNumber?: number | null;
  quickSearchLastOpen?: number | null;
  multiItemsTimeInterval?: number | null;
}): ItemData;
export function getItemName(name: string | null): string;
