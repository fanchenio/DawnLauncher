use base64::{engine::general_purpose, Engine as _};
use clipboard_win::{formats, get_clipboard};
use image::{imageops::flip_vertical, ImageBuffer, ImageFormat, Rgba};
use napi::{
    threadsafe_function::{ThreadsafeFunction, ThreadsafeFunctionCallMode},
    JsFunction,
};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    io::Cursor,
    process::Command,
    sync::atomic::{AtomicBool, Ordering},
};
use windows::Management::Deployment::PackageManager;
use windows::{
    core::{ComInterface, HSTRING, PCSTR, PCWSTR},
    Win32::{
        Foundation::{HWND, LPARAM, LRESULT, MAX_PATH, POINT, RECT, SIZE, WPARAM},
        Graphics::{
            Dwm::{DwmSetWindowAttribute, DWMWA_TRANSITIONS_FORCEDISABLED},
            Gdi::{
                GetMonitorInfoW, GetObjectW, MonitorFromWindow, BITMAP, MONITORINFO,
                MONITOR_DEFAULTTONEAREST,
            },
        },
        Storage::FileSystem::SearchPathW,
        System::{
            Com::{
                CoCreateInstance, CoInitializeEx, CoUninitialize, IPersistFile,
                CLSCTX_INPROC_SERVER, COINIT_APARTMENTTHREADED, STGM_READ,
            },
            Environment::GetEnvironmentVariableW,
        },
        UI::{
            Input::Ime::{
                ImmGetContext, ImmReleaseContext, ImmSetConversionStatus, IME_CMODE_ALPHANUMERIC,
                IME_SMODE_AUTOMATIC,
            },
            Shell::{
                BHID_SFUIObject, IContextMenu, IShellItem, IShellItemImageFactory, IShellLinkW,
                SHCreateItemFromParsingName, SHEmptyRecycleBinW, SHQueryUserNotificationState,
                ShellLink, CMF_NORMAL, CMINVOKECOMMANDINFO, QUNS_ACCEPTS_NOTIFICATIONS, QUNS_APP,
                QUNS_BUSY, QUNS_NOT_PRESENT, QUNS_PRESENTATION_MODE, QUNS_QUIET_TIME,
                QUNS_RUNNING_D3D_FULL_SCREEN, SHERB_NOSOUND, SIIGBF_ICONONLY, SLGP_UNCPRIORITY,
            },
            WindowsAndMessaging::{
                CallNextHookEx, CreatePopupMenu, DestroyMenu, FindWindowW, GetClassNameW,
                GetCursorPos, GetForegroundWindow, GetSystemMetrics, GetWindowRect, SendMessageW,
                SetForegroundWindow, SetWindowsHookExW, TrackPopupMenu, WindowFromPoint, HHOOK,
                MSLLHOOKSTRUCT, SC_MONITORPOWER, SM_CXSCREEN, SM_CYSCREEN, SW_NORMAL, TPM_NONOTIFY,
                TPM_RETURNCMD, WH_MOUSE_LL, WM_LBUTTONDOWN, WM_LBUTTONUP, WM_MBUTTONDOWN,
                WM_MBUTTONUP, WM_MOUSEHWHEEL, WM_MOUSEMOVE, WM_MOUSEWHEEL, WM_RBUTTONDOWN,
                WM_RBUTTONUP, WM_SYSCOMMAND,
            },
        },
    },
};

// 获取图标并转为BASE64
pub fn get_file_icon(path: &str) -> Option<String> {
    // 返回信息
    let mut base64 = None;
    // HSTRING
    let path = HSTRING::from(path);
    // PCWSTR
    let path: PCWSTR = PCWSTR(path.as_ptr());
    // unsafe
    unsafe {
        // Init
        let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);
    }
    // IShellItemImageFactory
    let result = unsafe {
        SHCreateItemFromParsingName::<PCWSTR, Option<_>, IShellItemImageFactory>(path, None)
    };
    if let Ok(shell_item_image_factory) = result {
        if let Some(mut image_buffer) = get_file_icon_image_buffer(&shell_item_image_factory, 256) {
            // 判断像素点，是否是小图标
            let mut transparency: f64 = 0_f64;
            let mut non_transparency: f64 = 0_f64;
            for y in 0..image_buffer.height() {
                for x in 0..image_buffer.width() {
                    let pixel = image_buffer.get_pixel(x, y);
                    let alpha = pixel[3]; // 获取像素的 Alpha 通道值
                    if alpha == 0 {
                        // 透明
                        transparency += 1_f64;
                    } else {
                        // 不透明
                        non_transparency += 1_f64;
                    }
                }
            }
            // 计算如果透明区域大于百分之70就代表是小图标
            let proportion =
                (transparency / (transparency + non_transparency) * 100_f64).round() as u32;
            if proportion >= 70 {
                // 获取小图标
                if let Some(image_buffer_small) =
                    get_file_icon_image_buffer(&shell_item_image_factory, 48)
                {
                    image_buffer = image_buffer_small;
                }
            }
            // 翻转图片
            image_buffer = flip_vertical(&image_buffer);
            // 转码
            base64 = Some(image_buffer_to_base64(image_buffer));
        }
    }
    unsafe {
        // UnInit
        CoUninitialize();
    }
    base64
}

// 获取图标并转为ImageBuffer
fn get_file_icon_image_buffer(
    shell_item_image_factory: &IShellItemImageFactory,
    size: i32,
) -> Option<ImageBuffer<Rgba<u8>, Vec<u8>>> {
    // 获取图片
    let result =
        unsafe { shell_item_image_factory.GetImage(SIZE { cx: size, cy: size }, SIIGBF_ICONONLY) };
    if let Ok(h_bitmap) = result {
        // 转为BITMAP
        let mut bitmap: BITMAP = BITMAP::default();
        unsafe {
            GetObjectW(
                h_bitmap,
                std::mem::size_of::<BITMAP>() as i32,
                Some(&mut bitmap as *mut _ as _),
            );
        }
        // 转换ImageBuffer
        let width: u32 = bitmap.bmWidth as u32;
        let height = bitmap.bmHeight as u32;
        let pixel_data: &[u8] = unsafe {
            std::slice::from_raw_parts(bitmap.bmBits as *const u8, (width * height * 4) as usize)
        };
        let result = ImageBuffer::<Rgba<u8>, _>::from_raw(width, height, pixel_data.to_vec());
        if let Some(mut image_buffer) = result {
            // 将ImageBuffer的颜色通道顺序从BGRA转为RGB
            for pixel in image_buffer.pixels_mut() {
                let b = pixel[0];
                let r = pixel[2];
                pixel[0] = r;
                pixel[2] = b;
            }
            return Some(image_buffer);
        }
    }
    None
}

/**
 * imageBuffer转BASE64
 */
fn image_buffer_to_base64(image_buffer: ImageBuffer<Rgba<u8>, Vec<u8>>) -> String {
    // imageBufferData
    let mut image_buffer_data = Cursor::new(Vec::new());
    // write
    image_buffer
        .write_to(&mut image_buffer_data, ImageFormat::Png)
        .unwrap();
    // 转码
    format!(
        "data:image/png;base64,{}",
        general_purpose::STANDARD.encode(image_buffer_data.into_inner())
    )
}

/**
 * 获取快捷方式信息
 */
pub fn get_shortcut_file_info(path: &str) -> Option<HashMap<String, String>> {
    // HSTRING
    let path = HSTRING::from(path);
    unsafe {
        // Init
        let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);
    }
    // IShellLinkW
    let shell_link_result: Result<IShellLinkW, windows::core::Error> =
        unsafe { CoCreateInstance(&ShellLink, None, CLSCTX_INPROC_SERVER) };
    if let Ok(shell_link) = shell_link_result {
        // IPersistFile
        let persist_file_result: Result<IPersistFile, windows::core::Error> = shell_link.cast();
        if let Ok(persist_file) = persist_file_result {
            let load_result = unsafe {
                // 加载路径
                persist_file.Load(PCWSTR(path.as_ptr()), STGM_READ)
            };
            if let Ok(()) = load_result {
                // 获取目标
                let mut target_buffer = [0u16; MAX_PATH as usize];
                let _ = unsafe {
                    shell_link.GetPath(
                        &mut target_buffer,
                        std::ptr::null_mut(),
                        SLGP_UNCPRIORITY.0 as u32,
                    )
                };
                // 获取参数
                let mut arguments_buffer = [0u16; MAX_PATH as usize];
                let _ = unsafe { shell_link.GetArguments(&mut arguments_buffer) };
                // map
                let mut map = HashMap::with_capacity(2);
                map.insert(String::from("target"), u16_to_string(&target_buffer));
                map.insert(String::from("arguments"), u16_to_string(&arguments_buffer));
                return Some(map);
            }
        }
    }
    unsafe {
        // UnInit
        CoUninitialize();
    }
    None
}

/**
 * 关闭显示器
 */
pub fn turn_off_monitor() {
    unsafe {
        let _ = SendMessageW(
            FindWindowW(PCWSTR::null(), PCWSTR::null()),
            WM_SYSCOMMAND,
            WPARAM(SC_MONITORPOWER as usize),
            LPARAM(2),
        );
    }
}

/**
 * 打开文件所在位置
 */
pub fn open_file_location(path: &str) {
    let _ = Command::new("explorer").arg("/select,").arg(path).spawn();
}

/**
 * 资源管理器菜单
 */
pub fn explorer_context_menu(window: i32, path: &str, x: i32, y: i32) {
    // IShellItem
    let path = HSTRING::from(path);
    if let Ok(shell_item) =
        unsafe { SHCreateItemFromParsingName::<_, _, IShellItem>(PCWSTR(path.as_ptr()), None) }
    {
        // IContextMenu
        if let Ok(context_menu) =
            unsafe { shell_item.BindToHandler::<_, IContextMenu>(None, &BHID_SFUIObject) }
        {
            // Menu
            if let Ok(menu) = unsafe { CreatePopupMenu() } {
                // 写入菜单
                if let Ok(()) =
                    unsafe { context_menu.QueryContextMenu(menu, 0, 1, 0x7FFF, CMF_NORMAL) }
                {
                    // HWND
                    let hwnd = HWND(window as isize);
                    // 弹出菜单
                    let res = unsafe {
                        SetForegroundWindow(hwnd);
                        TrackPopupMenu(menu, TPM_RETURNCMD | TPM_NONOTIFY, x, y, 0, hwnd, None)
                    };
                    unsafe {
                        DestroyMenu(menu);
                    }
                    if res.as_bool() {
                        let mut info = CMINVOKECOMMANDINFO::default();
                        info.cbSize = std::mem::size_of::<CMINVOKECOMMANDINFO>() as u32;
                        info.hwnd = hwnd;
                        info.lpVerb = PCSTR((res.0 - 1) as *mut u8);
                        info.nShow = SW_NORMAL.0 as i32;
                        let _ = unsafe { context_menu.InvokeCommand(&info) };
                    }
                }
            }
        }
    }
}

/**
 * 搜索路径
 */
pub fn search_path(name: &str) -> Option<String> {
    let name = HSTRING::from(name);
    let mut buffer = [0u16; MAX_PATH as usize];
    let result = unsafe {
        SearchPathW(
            PCWSTR::null(),
            PCWSTR(name.as_ptr()),
            PCWSTR::null(),
            Some(&mut buffer),
            None,
        )
    };
    if result > 0 {
        Some(u16_to_string(&buffer))
    } else {
        None
    }
}

/**
 * 数组转String
 */
fn u16_to_string(slice: &[u16]) -> String {
    let mut vec = vec![];
    for s in slice {
        if *s > 0 {
            vec.push(*s);
        }
    }
    String::from_utf16_lossy(&vec)
}

/**
 * 获取环境变量
 */
pub fn get_env_by_name(name: &str) -> Option<String> {
    let name = HSTRING::from(name);
    let mut buffer = [0u16; MAX_PATH as usize];
    let result = unsafe { GetEnvironmentVariableW(PCWSTR(name.as_ptr()), Some(&mut buffer)) };
    if result > 0 {
        Some(u16_to_string(&buffer))
    } else {
        None
    }
}

/**
 * 是否有全屏窗口
 */
fn is_fullscreen_window() -> bool {
    // 获取当前活动窗口的句柄
    let foreground_window = unsafe { GetForegroundWindow() };
    // 获取活动窗口的位置信息
    let mut window_rect = RECT::default();
    unsafe { GetWindowRect(foreground_window, &mut window_rect) };
    // 获取包含活动窗口的显示器句柄
    let monitor = unsafe { MonitorFromWindow(foreground_window, MONITOR_DEFAULTTONEAREST) };
    // 获取显示器信息
    let mut monitor_info = MONITORINFO::default();
    monitor_info.cbSize = std::mem::size_of::<MONITORINFO>() as u32;
    unsafe { GetMonitorInfoW(monitor, &mut monitor_info) };
    // 获取屏幕的尺寸
    let screen_width = unsafe { GetSystemMetrics(SM_CXSCREEN) };
    let screen_height = unsafe { GetSystemMetrics(SM_CYSCREEN) };
    // 比较窗口位置和显示器尺寸来判断是否处于全屏模式
    if window_rect.left <= 0
        && window_rect.top <= 0
        && window_rect.right >= screen_width
        && window_rect.bottom >= screen_height
        && monitor_info.rcMonitor.left == 0
        && monitor_info.rcMonitor.top == 0
        && monitor_info.rcMonitor.right == screen_width
        && monitor_info.rcMonitor.bottom == screen_height
    {
        // 获取窗口类名
        let mut buffer = [0u16; MAX_PATH as usize];
        unsafe { GetClassNameW(foreground_window, &mut buffer) };
        // 转为String
        let name = u16_to_string(&buffer);
        if name != "WorkerW" {
            return true;
        }
    }
    false
}

/**
 * 是否是全屏模式
 */
pub fn is_fullscreen() -> bool {
    if let Ok(state) = unsafe { SHQueryUserNotificationState() } {
        if state == QUNS_NOT_PRESENT {
            // 非全屏（机器锁定/屏幕保护程序/用户切换）
            return false;
        } else if state == QUNS_BUSY {
            // 全屏（F11 全屏，我试过的所有视频游戏都使用它）
            return is_fullscreen_window();
        } else if state == QUNS_RUNNING_D3D_FULL_SCREEN {
            // 全屏（Direct3D 应用程序以独占模式运行，即全屏）
            return true;
        } else if state == QUNS_PRESENTATION_MODE {
            // 全屏（一种用于显示全屏演示文稿的特殊模式）
            return true;
        } else if state == QUNS_ACCEPTS_NOTIFICATIONS {
            // 不是全屏
            return false;
        } else if state == QUNS_QUIET_TIME {
            // 不是全屏
            return false;
        } else if state == QUNS_APP {
            // 不是全屏
            return false;
        }
    }
    false
}

/**
 * 切换英文输入法
 */
pub fn switch_english(window: i32) {
    // 窗口句柄
    let hwnd = HWND(window as isize);
    // 获取输入法上下文
    let imc = unsafe { ImmGetContext(hwnd) };
    // 设置输入法的首选转换模式为英文
    unsafe { ImmSetConversionStatus(imc, IME_CMODE_ALPHANUMERIC, IME_SMODE_AUTOMATIC) };
    // 释放输入法上下文
    unsafe { ImmReleaseContext(hwnd, imc) };
}

// 是否回调
static mut MOUSE_HOOK_CALL: AtomicBool = AtomicBool::new(false);
// ThreadsafeFunction
static mut TSFN: Option<ThreadsafeFunction<String>> = None;
// 全局鼠标HOOK
static mut MOUSE_HOOK: Option<HHOOK> = None;

// 鼠标事件
#[derive(Debug, Serialize, Deserialize)]
struct MouseEvent {
    event: String,
    x: i32,
    y: i32,
    button: i32,
    mouse_data: u32,
    class_name: String,
}

/**
 * HOOK回调方法
 */
unsafe extern "system" fn mouse_proc(code: i32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
    if code >= 0 && MOUSE_HOOK_CALL.load(Ordering::Relaxed) {
        // 鼠标坐标
        let msll_struct = lparam.0 as *const MSLLHOOKSTRUCT;
        let x = (*msll_struct).pt.x;
        let y = (*msll_struct).pt.y;
        let mouse_data = (*msll_struct).mouseData;
        // 类名
        let mut class_name = String::new();
        // 参数
        let param = wparam.0 as u32;
        // 事件
        let mut event = String::from("");
        // 按键类型
        let mut button = -1;
        // 判断事件
        if param == WM_MOUSEMOVE {
            // 鼠标移动
            event.push_str("mousemove");
        } else {
            // 鼠标操作
            if param == WM_LBUTTONUP || param == WM_RBUTTONUP || param == WM_MBUTTONUP {
                event.push_str("mouseup");
                class_name.push_str(&get_foreground_window_class_name());
            } else if param == WM_LBUTTONDOWN || param == WM_RBUTTONDOWN || param == WM_MBUTTONDOWN
            {
                event.push_str("mousedown");
                class_name.push_str(&get_foreground_window_class_name());
            } else if param == WM_MOUSEWHEEL || param == WM_MOUSEHWHEEL {
                event.push_str("mousewheel");
                class_name.push_str(&get_foreground_window_class_name());
            }
            // 按键类型
            if param == WM_LBUTTONUP || param == WM_LBUTTONDOWN {
                button = 1;
            } else if param == WM_RBUTTONUP || param == WM_RBUTTONDOWN {
                button = 2;
            } else if param == WM_MBUTTONUP || param == WM_MBUTTONDOWN {
                button = 3;
            } else if param == WM_MOUSEWHEEL {
                button = 0;
            } else if param == WM_MOUSEHWHEEL {
                button = 1;
            }
        }
        if event != "" {
            if let Some(func) = TSFN.as_ref() {
                let mouse_event = MouseEvent {
                    event,
                    x,
                    y,
                    mouse_data,
                    button,
                    class_name,
                };
                func.call(
                    Ok(serde_json::to_string(&mouse_event).unwrap()),
                    ThreadsafeFunctionCallMode::NonBlocking,
                );
            }
        }
    }
    return CallNextHookEx(MOUSE_HOOK.unwrap(), code, wparam, lparam);
}

/**
 * 创建鼠标hook
 */
pub fn create_mouse_hook(callback: JsFunction) {
    // 创建回调
    if let Ok(threadsafe_function) =
        callback.create_threadsafe_function(0, |ctx| Ok(vec![ctx.value]))
    {
        unsafe { TSFN = Some(threadsafe_function) };
        // 创建鼠标HOOK
        if let Ok(hook) = unsafe { SetWindowsHookExW(WH_MOUSE_LL, Some(mouse_proc), None, 0) } {
            unsafe {
                MOUSE_HOOK = Some(hook);
                MOUSE_HOOK_CALL.store(true, Ordering::Relaxed);
            };
        }
    }
}

/**
 * 启用鼠标HOOK
 */
pub fn enable_mouse_hook() {
    unsafe { MOUSE_HOOK_CALL.store(true, Ordering::Relaxed) }
}

/**
 * 禁用鼠标HOOK
 */
pub fn disable_mouse_hook() {
    unsafe { MOUSE_HOOK_CALL.store(false, Ordering::Relaxed) }
}

/**
 * 获取鼠标点击的窗口ClassName
 */
pub fn get_cursor_pos_window_class_name() -> String {
    // 获取鼠标位置
    let mut point: POINT = POINT::default();
    unsafe {
        GetCursorPos(&mut point);
    }
    // 获取鼠标所在的窗口句柄
    let hwnd = unsafe { WindowFromPoint(point) };
    // 获取窗口的ClassName
    let mut buffer = [0u16; MAX_PATH as usize];
    unsafe {
        GetClassNameW(hwnd, &mut buffer);
    };
    // 返回
    u16_to_string(&buffer)
}

/**
 * 获取剪切板文件列表
 */
pub fn get_clipboard_file_list() -> Vec<String> {
    match get_clipboard(formats::FileList) {
        Ok(vec) => vec,
        Err(_) => vec![],
    }
}

/**
 * 剪切板是否存在BITMAP
 */
pub fn clipboard_has_bitmap() -> bool {
    match get_clipboard(formats::Bitmap) {
        Ok(_) => true,
        Err(_) => false,
    }
}

/**
 * 获取剪切板BITMAP的BASE64
 */
pub fn get_clipboard_bitmap_base64() -> Option<String> {
    match get_clipboard(formats::Bitmap) {
        Ok(data) => Some(format!(
            "data:image/bmp;base64,{}",
            general_purpose::STANDARD.encode(data)
        )),
        Err(_) => None,
    }
}

/**
 * 清空回收站
 */
pub fn empty_recycle_bin(window: i32) {
    // HWND
    let hwnd = HWND(window as isize);
    // 清空回收站
    unsafe {
        let _ = SHEmptyRecycleBinW(hwnd, None, SHERB_NOSOUND);
    };
}

/**
 * 去掉窗口动画
 */
pub fn remove_window_animation(window: i32) {
    // HWND
    let hwnd = HWND(window as isize);
    let pvattribute = &mut true as *mut _ as *const _;
    unsafe {
        let _ = DwmSetWindowAttribute(
            hwnd,
            DWMWA_TRANSITIONS_FORCEDISABLED,
            pvattribute,
            std::mem::size_of_val(&pvattribute) as u32,
        );
    };
}

/**
 * 获取APPX列表
 */
pub fn get_appx_list() -> Vec<HashMap<String, String>> {
    let mut result_list = vec![];
    let package_manager: Result<PackageManager, windows::core::Error> = PackageManager::new();
    if package_manager.is_err() {
        return result_list;
    }
    let packages = package_manager
        .unwrap()
        .FindPackagesByUserSecurityId(&HSTRING::default());
    if packages.is_err() {
        return result_list;
    }
    for package in packages.unwrap() {
        let mut map = HashMap::new();
        if let Ok(diaplay_name) = package.DisplayName() {
            map.insert(String::from("displayName"), diaplay_name.to_string());
        }
        if let Ok(path) = package.InstalledPath() {
            map.insert(String::from("path"), path.to_string());
        }
        if let Ok(id) = package.Id() {
            if let Ok(family_name) = id.FamilyName() {
                map.insert(String::from("familyName"), family_name.to_string());
            }
        }
        if let Ok(logo) = package.Logo() {
            if let Ok(path) = logo.Path() {
                map.insert(String::from("logo"), path.to_string());
            }
        }
        if let Ok(app_list) = package.GetAppListEntriesAsync() {
            if let Ok(app_list) = app_list.get() {
                for (index, app) in app_list.into_iter().enumerate() {
                    if app.DisplayInfo().is_err()
                        || app.DisplayInfo().unwrap().DisplayName().is_err()
                    {
                        continue;
                    }
                    map.insert(
                        format!("appName{}", index),
                        app.DisplayInfo()
                            .unwrap()
                            .DisplayName()
                            .unwrap()
                            .to_string(),
                    );
                }
            }
        }
        result_list.push(map);
    }
    result_list
}

/**
 * 获取当前活跃窗口的类名
 */
fn get_foreground_window_class_name() -> String {
    let hwnd = unsafe { GetForegroundWindow() };
    // 获取窗口的ClassName
    let mut buffer = [0u16; MAX_PATH as usize];
    unsafe {
        GetClassNameW(hwnd, &mut buffer);
    };
    // 返回
    u16_to_string(&buffer)
}

/**
 * 获取当前鼠标位置
 */
pub fn get_cursor_point() -> [i32; 2] {
    let mut point = POINT::default();
    unsafe {
        GetCursorPos(&mut point);
    };
    [point.x, point.y]
}
