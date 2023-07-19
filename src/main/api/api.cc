#include <napi.h>
#include <windows.h>
#include <atlimage.h>
#include <iostream>
#include <shobjidl.h>
#include <shlguid.h>
#include <string>
#include <atomic>
#include <shlobj.h>
#include <imm.h>
#pragma comment(lib, "imm32.lib")

std::string UTF8ToGBK(const char *source)
{
    int length = MultiByteToWideChar(CP_UTF8, 0, source, -1, NULL, 0);
    wchar_t *wcGBK = new wchar_t[length + 1];
    memset(wcGBK, 0, length * 2 + 2);
    MultiByteToWideChar(CP_UTF8, 0, source, -1, wcGBK, length);
    length = WideCharToMultiByte(CP_ACP, 0, wcGBK, -1, NULL, 0, NULL, NULL);
    char *cGBK = new char[length + 1];
    memset(cGBK, 0, length + 1);
    WideCharToMultiByte(CP_ACP, 0, wcGBK, -1, cGBK, length, NULL, NULL);
    std::string strTemp(cGBK);
    if (wcGBK)
        delete[] wcGBK;
    if (cGBK)
        delete[] cGBK;
    return strTemp;
}

std::string GBKToUTF8(const char *source)
{
    int length = MultiByteToWideChar(CP_ACP, 0, source, -1, NULL, 0);
    wchar_t *wStr = new wchar_t[length + 1];
    memset(wStr, 0, length + 1);
    MultiByteToWideChar(CP_ACP, 0, source, -1, wStr, length);
    length = WideCharToMultiByte(CP_UTF8, 0, wStr, -1, NULL, 0, NULL, NULL);
    char *str = new char[length + 1];
    memset(str, 0, length + 1);
    WideCharToMultiByte(CP_UTF8, 0, wStr, -1, str, length, NULL, NULL);
    std::string strTemp = str;
    if (wStr)
        delete[] wStr;
    if (str)
        delete[] str;
    return strTemp;
}

LPCWSTR StringToLPCWSTR(std::string source)
{
    size_t size = source.length();
    int wLen = ::MultiByteToWideChar(CP_UTF8,
                                     0,
                                     source.c_str(),
                                     -1,
                                     NULL,
                                     0);
    wchar_t *buffer = new wchar_t[wLen + 1];
    memset(buffer, 0, (wLen + 1) * sizeof(wchar_t));
    MultiByteToWideChar(CP_ACP, 0, source.c_str(), size, (LPWSTR)buffer, wLen);
    return buffer;
}

Napi::Number SaveIcon(std::string source, std::string target, int size, Napi::Env env)
{
    CoInitialize(NULL);
    IShellItemImageFactory *itemImageFactory;
    HBITMAP bitmap;
    SIZE s = {size, size};
    if (SUCCEEDED(SHCreateItemFromParsingName(StringToLPCWSTR(source), NULL, IID_PPV_ARGS(&itemImageFactory))))
    {
        itemImageFactory->GetImage(s, SIIGBF_ICONONLY, &bitmap);
        itemImageFactory->Release();
    }
    CoUninitialize();
    if (NULL == &bitmap)
    {
        return Napi::Number::New(env, 0);
    }
    else
    {
        CImage image;
        image.Attach(bitmap);
        image.SetHasAlphaChannel(1);
        image.Save(target.c_str());
        return Napi::Number::New(env, 1);
    }
}

Napi::Number GetFileIcon(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    std::string source = info[0].ToString().Utf8Value();
    std::string target = info[1].ToString().Utf8Value();
    int size = info[2].As<Napi::Number>().Int32Value();
    return SaveIcon(UTF8ToGBK(source.c_str()), UTF8ToGBK(target.c_str()), size, env);
}

Napi::Object GetShortcutFile(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    std::string source = info[0].ToString().Utf8Value();
    source = UTF8ToGBK(source.c_str());
    Napi::Object shortcutFileInfo;
    CoInitialize(NULL);
    CHAR target[MAX_PATH];
    CHAR arguments[MAX_PATH];
    WIN32_FIND_DATA fd;
    IShellLink *shellLink;
    HRESULT result = CoCreateInstance(CLSID_ShellLink, NULL, CLSCTX_INPROC_SERVER, IID_IShellLink, (void **)&shellLink);
    if (SUCCEEDED(result))
    {
        IPersistFile *persistFile;
        result = shellLink->QueryInterface(IID_IPersistFile, (void **)&persistFile);
        if (SUCCEEDED(result))
        {
            result = persistFile->Load(StringToLPCWSTR(source), STGM_READ);
            if (SUCCEEDED(result))
            {
                shellLink->GetPath(target, MAX_PATH, &fd, SLGP_UNCPRIORITY);
                shellLink->GetArguments(arguments, MAX_PATH);
                shortcutFileInfo = Napi::Object::New(env);
                shortcutFileInfo.Set(Napi::String::New(env, "target"), Napi::String::New(env, GBKToUTF8(target)));
                shortcutFileInfo.Set(Napi::String::New(env, "arguments"), Napi::String::New(env, GBKToUTF8(arguments)));
            }
        }
        if (NULL != persistFile)
        {
            persistFile->Release();
        }
    }
    if (NULL != shellLink)
    {
        shellLink->Release();
    }
    CoUninitialize();
    return shortcutFileInfo;
}

Napi::Number RunItem(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    std::string type = info[0].ToString().Utf8Value();
    std::string source = info[1].ToString().Utf8Value();
    std::string parameters = info[2].ToString().Utf8Value();
    LPCWSTR ldir;
    if (info[3] != NULL)
    {
        std::string dir = info[3].ToString().Utf8Value();
        ldir = StringToLPCWSTR(UTF8ToGBK(dir.c_str()));
    }
    return Napi::Number::New(env, (unsigned long)ShellExecuteW(NULL, StringToLPCWSTR(type), StringToLPCWSTR(UTF8ToGBK(source.c_str())), StringToLPCWSTR(UTF8ToGBK(parameters.c_str())), ldir, SW_SHOWDEFAULT));
}

Napi::ThreadSafeFunction _tsfn;
HANDLE _hThread;
std::atomic_bool captureMouseMove = false;
// PostThreadMessage races with the actual thread; we'll get a thread ID
// and won't be able to post to it because it's "invalid" during the early
// lifecycle of the thread. To ensure that immediate pauses don't get dropped,
// we'll use this flag instead of distinct message IDs.
std::atomic_bool installEventHook = false;
DWORD dwThreadID = 0;

struct MouseEventContext
{
public:
    int nCode;
    WPARAM wParam;
    LONG ptX;
    LONG ptY;
    DWORD mouseData;
};

void onMainThread(Napi::Env env, Napi::Function function, MouseEventContext *pMouseEvent)
{
    auto nCode = pMouseEvent->nCode;
    auto wParam = pMouseEvent->wParam;
    auto ptX = pMouseEvent->ptX;
    auto ptY = pMouseEvent->ptY;
    auto nMouseData = pMouseEvent->mouseData;

    delete pMouseEvent;

    if (nCode >= 0)
    {
        auto name = "";
        auto button = -1;

        // Isolate mouse movement, as it's more CPU intensive
        if (wParam == WM_MOUSEMOVE)
        {
            // Is mouse movement
            if (captureMouseMove.load())
            {
                name = "mousemove";
            }
        }
        else
        {
            // Is not mouse movement

            // Determine event type
            if (wParam == WM_LBUTTONUP || wParam == WM_RBUTTONUP || wParam == WM_MBUTTONUP)
            {
                name = "mouseup";
            }
            else if (wParam == WM_LBUTTONDOWN || wParam == WM_RBUTTONDOWN || wParam == WM_MBUTTONDOWN)
            {
                name = "mousedown";
            }
            else if (wParam == WM_MOUSEWHEEL || wParam == WM_MOUSEHWHEEL)
            {
                name = "mousewheel";
            }

            // Determine button
            if (wParam == WM_LBUTTONUP || wParam == WM_LBUTTONDOWN)
            {
                button = 1;
            }
            else if (wParam == WM_RBUTTONUP || wParam == WM_RBUTTONDOWN)
            {
                button = 2;
            }
            else if (wParam == WM_MBUTTONUP || wParam == WM_MBUTTONDOWN)
            {
                button = 3;
            }
            else if (wParam == WM_MOUSEWHEEL)
            {
                button = 0;
            }
            else if (wParam == WM_MOUSEHWHEEL)
            {
                button = 1;
            }
        }

        // Only proceed if an event was identified
        if (name != "")
        {
            Napi::HandleScope scope(env);

            auto x = Napi::Number::New(env, ptX);
            auto y = Napi::Number::New(env, ptY);

            auto mouseData = Napi::Number::New(env, nMouseData);

            // Yell back to NodeJS
            function.Call(env.Global(),
                          {Napi::String::New(env, name), x, y,
                           Napi::Number::New(env, button), mouseData});
        }
    }
}

LRESULT CALLBACK HookCallback(int nCode, WPARAM wParam, LPARAM lParam)
{

    // If not WM_MOUSEMOVE or WM_MOUSEMOVE has been requested, process event
    if (!(wParam == WM_MOUSEMOVE && !captureMouseMove.load()))
    {
        // Prepare data to be processed
        MSLLHOOKSTRUCT *data = (MSLLHOOKSTRUCT *)lParam;
        auto pMouseEvent = new MouseEventContext();
        pMouseEvent->nCode = nCode;
        pMouseEvent->wParam = wParam;
        pMouseEvent->ptX = data->pt.x;
        pMouseEvent->ptY = data->pt.y;
        pMouseEvent->mouseData = data->mouseData;

        // Process event on non-blocking thread
        _tsfn.NonBlockingCall(pMouseEvent, onMainThread);
    }

    // Let Windows continue with this event as normal
    return CallNextHookEx(NULL, nCode, wParam, lParam);
}

DWORD WINAPI MouseHookThread(LPVOID lpParam)
{
    MSG msg;
    HHOOK hook = installEventHook.load() ? SetWindowsHookEx(WH_MOUSE_LL, HookCallback, NULL, 0) : NULL;

    while (GetMessage(&msg, NULL, 0, 0) > 0)
    {
        if (msg.message != WM_USER)
            continue;
        if (!installEventHook.load() && hook != NULL)
        {
            if (!UnhookWindowsHookEx(hook))
                break;
            hook = NULL;
        }
        else if (installEventHook.load() && hook == NULL)
        {
            hook = SetWindowsHookEx(WH_MOUSE_LL, HookCallback, NULL, 0);
            if (hook == NULL)
                break;
        }
    }

    _tsfn.Release();
    return GetLastError();
}

Napi::Boolean createMouseHook(const Napi::CallbackInfo &info)
{
    _hThread = CreateThread(NULL, 0, MouseHookThread, NULL, CREATE_SUSPENDED, &dwThreadID);
    _tsfn = Napi::ThreadSafeFunction::New(
        info.Env(),
        info[0].As<Napi::Function>(),
        "WH_MOUSE_LL Hook Thread",
        512,
        1,
        [](Napi::Env)
        { CloseHandle(_hThread); });

    ResumeThread(_hThread);
    return Napi::Boolean::New(info.Env(), true);
}

void enableMouseMove(const Napi::CallbackInfo &info)
{
    captureMouseMove = true;
}

void disableMouseMove(const Napi::CallbackInfo &info)
{
    captureMouseMove = false;
}

Napi::Boolean pauseMouseEvents(const Napi::CallbackInfo &info)
{
    BOOL bDidPost = FALSE;
    if (dwThreadID != 0)
    {
        installEventHook = false;
        bDidPost = PostThreadMessageW(dwThreadID, WM_USER, NULL, NULL);
    }
    return Napi::Boolean::New(info.Env(), bDidPost);
}

Napi::Boolean resumeMouseEvents(const Napi::CallbackInfo &info)
{
    BOOL bDidPost = FALSE;
    if (dwThreadID != 0)
    {
        installEventHook = true;
        bDidPost = PostThreadMessageW(dwThreadID, WM_USER, NULL, NULL);
    }
    return Napi::Boolean::New(info.Env(), bDidPost);
}

Napi::Boolean IsFullscreenSize(const Napi::CallbackInfo &info)
{
    // 获取当前活动窗口的句柄
    HWND foregroundWindow = GetForegroundWindow();
    // 获取活动窗口的位置信息
    RECT windowRect;
    GetWindowRect(foregroundWindow, &windowRect);
    // 获取包含活动窗口的显示器句柄
    HMONITOR monitor = MonitorFromWindow(foregroundWindow, MONITOR_DEFAULTTONEAREST);
    // 获取显示器信息
    MONITORINFO monitorInfo = { sizeof(MONITORINFO) };
    GetMonitorInfo(monitor, &monitorInfo);
    // 获取屏幕的尺寸
    int screenWidth = GetSystemMetrics(SM_CXSCREEN);
    int screenHeight = GetSystemMetrics(SM_CYSCREEN);
    // 比较窗口位置和显示器尺寸来判断是否处于全屏模式
    if (windowRect.left <= 0 && windowRect.top <= 0 &&
        windowRect.right >= screenWidth && windowRect.bottom >= screenHeight &&
        monitorInfo.rcMonitor.left == 0 && monitorInfo.rcMonitor.top == 0 &&
        monitorInfo.rcMonitor.right == screenWidth && monitorInfo.rcMonitor.bottom == screenHeight)
    {
        // 获取窗口类名
        char className[256];
        GetClassName(foregroundWindow, className, sizeof(className));
        std::string classNameStr(className);
        if (classNameStr != "WorkerW")
        {
            return Napi::Boolean::New(info.Env(), true);
        }
    }
    return Napi::Boolean::New(info.Env(), false);
}

Napi::Boolean IsFullscreen(const Napi::CallbackInfo &info)
{
    QUERY_USER_NOTIFICATION_STATE state;
    HRESULT hr = SHQueryUserNotificationState(&state);
    if (hr == S_OK)
    {
        switch (state)
        {
        case QUNS_NOT_PRESENT:
            // 非全屏（机器锁定/屏幕保护程序/用户切换）
            return Napi::Boolean::New(info.Env(), false);
        case QUNS_BUSY:
            // 全屏（F11 全屏，我试过的所有视频游戏都使用它）
            return IsFullscreenSize(info);
        case QUNS_RUNNING_D3D_FULL_SCREEN:
            // 全屏（Direct3D 应用程序以独占模式运行，即全屏）
            return Napi::Boolean::New(info.Env(), true);
        case QUNS_PRESENTATION_MODE:
            // 全屏（一种用于显示全屏演示文稿的特殊模式）
            return Napi::Boolean::New(info.Env(), true);
        case QUNS_ACCEPTS_NOTIFICATIONS:
            // 不是全屏
            return Napi::Boolean::New(info.Env(), false);
        case QUNS_QUIET_TIME:
            // 不是全屏
            return Napi::Boolean::New(info.Env(), false);
        case QUNS_APP:
            // 不是全屏
            return Napi::Boolean::New(info.Env(), false);
        }
        return Napi::Boolean::New(info.Env(), false);
    }
    else
    {
        return Napi::Boolean::New(info.Env(), false);
    }
}

Napi::Boolean ContextMenu(const Napi::CallbackInfo &info)
{
    // CoInitialize
    CoInitialize(NULL);
    // 获取文件路径
    std::string filePath = info[1].ToString().Utf8Value();
    // 获取文件的 IShellItem 接口
    IShellItem *pItem;
    HRESULT hr = SHCreateItemFromParsingName(StringToLPCWSTR(UTF8ToGBK(filePath.c_str())), NULL, IID_PPV_ARGS(&pItem));
    if (FAILED(hr))
    {
        return Napi::Boolean::New(info.Env(), false);
    }
    // 获取文件的 IContextMenu 接口
    IContextMenu *pContextMenu;
    hr = pItem->BindToHandler(NULL, BHID_SFUIObject, IID_PPV_ARGS(&pContextMenu));
    if (FAILED(hr))
    {
        pItem->Release();
        return Napi::Boolean::New(info.Env(), false);
    }
    // 创建菜单
    HMENU hMenu = CreatePopupMenu();
    if (hMenu == NULL)
    {
        pContextMenu->Release();
        pItem->Release();
        return Napi::Boolean::New(info.Env(), false);
    }
    hr = pContextMenu->QueryContextMenu(hMenu, 0, 1, 0x7FFF, CMF_NORMAL);
    if (FAILED(hr))
    {
        DestroyMenu(hMenu);
        pContextMenu->Release();
        pItem->Release();
        return Napi::Boolean::New(info.Env(), false);
    }
    // 获取当前窗口句柄
    Napi::Buffer<void *> buffer = info[0].As<Napi::Buffer<void *>>();
    HWND hWnd = static_cast<HWND>(*reinterpret_cast<void **>(buffer.Data()));
    if (!IsWindow(hWnd))
    {
        return Napi::Boolean::New(info.Env(), false);
    }
    // 弹出菜单
    int command = TrackPopupMenuEx(hMenu, TPM_RETURNCMD | TPM_NONOTIFY, info[2].As<Napi::Number>(), info[3].As<Napi::Number>(), hWnd, NULL);
    if (command > 0)
    {
        CMINVOKECOMMANDINFOEX info = {0};
        info.cbSize = sizeof(info);
        info.hwnd = hWnd;
        info.lpVerb = MAKEINTRESOURCEA(command - 1);
        info.nShow = SW_NORMAL;
        pContextMenu->InvokeCommand((LPCMINVOKECOMMANDINFO)&info);
    }
    // 释放资源
    DestroyMenu(hMenu);
    pContextMenu->Release();
    pItem->Release();
    // CoUninitialize
    CoUninitialize();
    return Napi::Boolean::New(info.Env(), true);
}

Napi::Boolean SwitchEnglish(const Napi::CallbackInfo &info)
{
    // 获取当前窗口句柄
    Napi::Buffer<void *> buffer = info[0].As<Napi::Buffer<void *>>();
    HWND hWnd = static_cast<HWND>(*reinterpret_cast<void **>(buffer.Data()));
    if (!IsWindow(hWnd))
    {
        return Napi::Boolean::New(info.Env(), false);
    }
    // 获取输入法上下文
    HIMC hImc = ImmGetContext(hWnd);
    if (hImc == nullptr)
    {
        return Napi::Boolean::New(info.Env(), false);
    }
    // 设置输入法的首选转换模式为英文
    ImmSetConversionStatus(hImc, IME_CMODE_ALPHANUMERIC, IME_SMODE_AUTOMATIC);
    // 释放输入法上下文
    ImmReleaseContext(hWnd, hImc);
    return Napi::Boolean::New(info.Env(), true);
}

Napi::String getCursorPosWindowClassName(const Napi::CallbackInfo &info)
{
    POINT cursorPos;
    GetCursorPos(&cursorPos);
    HWND windowHandle = WindowFromPoint(cursorPos);
    char className[256];
    GetClassName(windowHandle, className, sizeof(className));
    std::string classNameStr(className);
    return Napi::String::New(info.Env(), className);
}

Napi::Boolean TurnOffMonitor(const Napi::CallbackInfo &info)
{
    // 关闭显示器
    SendMessage(FindWindow(0, 0), WM_SYSCOMMAND, SC_MONITORPOWER, (LPARAM)2);
    return Napi::Boolean::New(info.Env(), true);
}

Napi::Boolean EmptyRecycleBin(const Napi::CallbackInfo &info) {
    // 获取当前窗口句柄
    Napi::Buffer<void *> buffer = info[0].As<Napi::Buffer<void *>>();
    HWND hWnd = static_cast<HWND>(*reinterpret_cast<void **>(buffer.Data()));
    if (!IsWindow(hWnd))
    {
        return Napi::Boolean::New(info.Env(), false);
    }
    SHEmptyRecycleBinW(hWnd, NULL, SHERB_NOSOUND);
    return Napi::Boolean::New(info.Env(), true);
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    exports.Set(Napi::String::New(env, "GetFileIcon"),
                Napi::Function::New(env, GetFileIcon));

    exports.Set(Napi::String::New(env, "GetShortcutFile"),
                Napi::Function::New(env, GetShortcutFile));

    exports.Set(Napi::String::New(env, "RunItem"),
                Napi::Function::New(env, RunItem));

    exports.Set(Napi::String::New(env, "createMouseHook"),
                Napi::Function::New(env, createMouseHook));

    exports.Set(Napi::String::New(env, "enableMouseMove"),
                Napi::Function::New(env, enableMouseMove));

    exports.Set(Napi::String::New(env, "disableMouseMove"),
                Napi::Function::New(env, disableMouseMove));

    exports.Set(Napi::String::New(env, "pauseMouseEvents"),
                Napi::Function::New(env, pauseMouseEvents));

    exports.Set(Napi::String::New(env, "resumeMouseEvents"),
                Napi::Function::New(env, resumeMouseEvents));

    exports.Set(Napi::String::New(env, "IsFullscreen"),
                Napi::Function::New(env, IsFullscreen));

    exports.Set(Napi::String::New(env, "ContextMenu"),
                Napi::Function::New(env, ContextMenu));

    exports.Set(Napi::String::New(env, "SwitchEnglish"),
                Napi::Function::New(env, SwitchEnglish));

    exports.Set(Napi::String::New(env, "getCursorPosWindowClassName"),
                Napi::Function::New(env, getCursorPosWindowClassName));

    exports.Set(Napi::String::New(env, "TurnOffMonitor"),
                Napi::Function::New(env, TurnOffMonitor));

    exports.Set(Napi::String::New(env, "EmptyRecycleBin"),
                Napi::Function::New(env, EmptyRecycleBin));
    return exports;
}

NODE_API_MODULE(hello, Init)
