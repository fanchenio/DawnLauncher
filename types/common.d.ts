// 快捷方式信息
export interface ShortcutInfo {
  target: string | null;
  arguments: string | null;
}

// 返回结果
export interface Result {
  status: boolean;
  message: string | null;
  icon: string | null;
  name: string | null;
}
