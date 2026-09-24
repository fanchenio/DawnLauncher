# 简体中文 | [English](https://github.com/fanchenio/DawnLauncher/blob/main/README-ENGLISH.md)

# Dawn Launcher

`Windows`快捷启动工具，帮助您整理杂乱无章的桌面，分门别类管理您的桌面快捷方式，让您的桌面保持干净整洁。

支持关联文件夹（实时同步文件夹内容）、快速搜索、相对路径（便携路径）、扫描本机开始菜单、本地扫描本机 Appx 应用列表、添加网址并一键获取网址信息。

# 更新记录

## 2026-09-24

- **首页输入即搜索**：首页获得焦点后，直接输入 `A-Z` 字母即可打开搜索，无需先点击搜索图标或按 `Tab`；首字母会保留并立即匹配，支持大写及连续输入。已有分类、项目快捷键优先，普通文本输入控件和 `Ctrl`、`Alt`、`Win` 组合键不会触发此功能。
- **搜索交互保护**：关闭搜索后重新打开不残留上次的首字母；保留搜索图标和快捷键入口，输入法组合输入期间不将选词回车误当作启动搜索结果。
- **单例运行**：同一数据目录只保留一个主实例，在打开数据库前取得实例锁；重复启动会唤起已有窗口，支持隐藏、最小化及首次加载尚未完成的情况。Electron 的渲染、GPU 等子进程不属于重复实例。
- **独立安装版**：提供 Windows x64 安装包，安装名称为 `Dawn Launcher Custom`，默认构建安装版。数据保存在 `%APPDATA%\Dawn Launcher Custom`，与原版分离，不覆盖或自动导入原版数据库。
- **单文件免安装版**：支持双击直接运行，数据保存在外层 exe 旁的 `data` 目录，而不是临时解压目录；启动时不自动覆盖安装版的开机启动项。移动已有数据的免安装版时，请将 exe 与 `data` 目录一起移动。

# 技术栈

`Electron + Vite + Vue3 + TS + Rust`

# 支持平台

`Windows(10/11)`

# 编译步骤

1. 安装`node-gyp`，编译 SQLite3 需要。
2. 安装`Rust`环境 + `Cargo`，编译 Rust 需要。
3. 然后运行`yarn install`安装项目依赖（如果修改了`Rust`代码也需要重新运行`yarn install`）。
4. `yarn run dev`本地运行项目。
5. `yarn run build`默认生成 Windows x64 NSIS 安装包，`.env.production`中的`VITE_INSTALL`默认为`true`。
6. 单文件免安装包使用`yarn run build --win portable --x64`单独打包；启动器会自动识别外层 exe 目录，无需将`VITE_INSTALL`改为`false`。
7. `VITE_INSTALL=false`用于文件夹便携模式，可配合`yarn run build --win --x64 --dir`构建；运行时需要保留完整应用目录，不能只复制其中的 exe。

# 官网

[dawnlauncher.com](https://dawnlauncher.com/)

# QQ 群

369652112

# 界面

![界面](/images/soft1.png)

## 子分类

![子分类](/images/soft2.png)

## 自定义主题

![自定义主题](/images/soft3.png)

## 自定义背景

![自定义背景](/images/soft4.png)

## 快速搜索

![快速搜索](/images/soft5.png)

## 一键获取网址信息

![一键获取网址信息](/images/soft6.webp)

## 相对路径（便携路径）

![相对路径（便携路径）](/images/soft7.png)

## 关联文件夹

![关联文件夹](/images/soft8.webp)

## Stargazers over time

[![Stargazers over time](https://starchart.cc/fanchenio/DawnLauncher.svg)](https://starchart.cc/fanchenio/DawnLauncher)

## License

MIT License
