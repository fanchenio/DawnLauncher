use napi::JsFunction;
use napi_derive::napi;
use std::collections::HashMap;

mod windows;

/**
 * 获取图标
 */
#[allow(dead_code)]
#[napi]
fn get_file_icon(path: String) -> Option<String> {
    windows::get_file_icon(&path)
}

/**
 * 搜索路径
 */
#[allow(dead_code)]
#[napi]
fn search_path(path: String) -> Option<String> {
    windows::search_path(&path)
}

/**
 * 解析快捷方式
 */
#[allow(dead_code)]
#[napi]
fn get_shortcut_file_info(path: String) -> Option<HashMap<String, String>> {
    windows::get_shortcut_file_info(&path)
}

/**
 * 打开文件所在位置
 */
#[allow(dead_code)]
#[napi]
fn open_file_location(path: String) {
    windows::open_file_location(&path)
}

/**
 * 资源管理器菜单
 */
#[allow(dead_code)]
#[napi]
fn explorer_context_menu(window: i32, path: String, x: i32, y: i32) {
    windows::explorer_context_menu(window, &path, x, y)
}

/**
 * 获取环境变量
 */
#[allow(dead_code)]
#[napi]
fn get_env_by_name(name: String) -> Option<String> {
    windows::get_env_by_name(&name)
}

/**
 * 是否是全屏模式
 */
#[allow(dead_code)]
#[napi]
fn is_fullscreen() -> bool {
    windows::is_fullscreen()
}

/**
 * 切换英文输入法
 */
#[allow(dead_code)]
#[napi]
fn switch_english(window: i32) {
    windows::switch_english(window)
}

/**
 * 创建鼠标HOOK
 */
#[allow(dead_code)]
#[napi]
fn create_mouse_hook(callback: JsFunction) {
    windows::create_mouse_hook(callback)
}

/**
 * 启用鼠标HOOK
 */
#[allow(dead_code)]
#[napi]
fn enable_mouse_hook() {
    windows::enable_mouse_hook()
}

/**
 * 禁用鼠标HOOK
 */
#[allow(dead_code)]
#[napi]
fn disable_mouse_hook() {
    windows::disable_mouse_hook()
}

/**
 * 获取鼠标点击的窗口ClassName
 */
#[allow(dead_code)]
#[napi]
fn get_cursor_pos_window_class_name() -> String {
    windows::get_cursor_pos_window_class_name()
}

/**
 * 获取剪切板文件列表
 */
#[allow(dead_code)]
#[napi]
fn get_clipboard_file_list() -> Vec<String> {
    windows::get_clipboard_file_list()
}

/**
 * 剪切板是否存在BITMAP
 */
#[allow(dead_code)]
#[napi]
fn clipboard_has_bitmap() -> bool {
    windows::clipboard_has_bitmap()
}

/**
 * 获取剪切板BITMAP的BASE64
 */
#[allow(dead_code)]
#[napi]
fn get_clipboard_bitmap_base64() -> Option<String> {
    windows::get_clipboard_bitmap_base64()
}

/**
 * 清空回收站
 */
#[allow(dead_code)]
#[napi]
fn empty_recycle_bin(window: i32) {
    windows::empty_recycle_bin(window)
}

/**
 * 去掉窗口动画
 */
#[allow(dead_code)]
#[napi]
fn remove_window_animation(window: i32) {
    windows::remove_window_animation(window);
}

/**
 * 获取APPX列表
 */
#[allow(dead_code)]
#[napi]
fn get_appx_list() -> Vec<HashMap<String, String>> {
    windows::get_appx_list()
}

/**
 * 获取当前鼠标位置
 */
#[allow(dead_code)]
#[napi]
fn get_cursor_point() -> [i32; 2] {
    windows::get_cursor_point()
}

/**
 * 关闭显示器
 */
#[allow(dead_code)]
#[napi]
pub fn turn_off_monitor() {
    windows::turn_off_monitor()
}

/**
 * 运行
 */
#[allow(dead_code)]
#[napi]
fn shell_execute(operation: String, file: String, params: String, start_location: Option<String>) {
    windows::shell_execute(operation, file, params, start_location)
}

/**
 * 运行系统项目
 */
#[allow(dead_code)]
#[napi]
fn system_item_execute(target: String, params: Option<String>) {
    windows::system_item_execute(&target, params.as_deref())
}

/**
 * 判断文件是否有以管理员身份运行权限
 */
#[allow(dead_code)]
#[napi]
fn has_runas(path: String) -> bool {
    windows::has_runas(path)
}
