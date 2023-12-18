/**
 * 获取本地配置
 */
function getLocalSetting<T>(key: string): T | null {
  let value = localStorage.getItem(key);
  if (!value) {
    return null;
  } else {
    return value as T;
  }
}

/**
 * 设置本地配置
 */
function setLocalSetting(key: string, value: string) {
  localStorage.setItem(key, value);
}

/**
 * 删除本地配置
 */
function deleteLocalSetting(key: string) {
  localStorage.removeItem(key);
}

/**
 * 清空本地配置
 */
function clearLocalSetting() {
  localStorage.clear();
}

export {
  getLocalSetting,
  setLocalSetting,
  deleteLocalSetting,
  clearLocalSetting,
};
