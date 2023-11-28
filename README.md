# 简体中文 | [English](https://github.com/fanchenio/DawnLauncher/blob/main/README-ENGLISH.md)

# 更新

消失了三个多月，我将`Dawn Launcher`代码进行重构，因为一开始没有开发`NodeJS`和`Electron`的经验，`Vue`也写的不好，代码写的有些潦草，所以进行了代码重构，新版使用了`Electron26 + Vite + Vue3 + TS`，UI 框架使用了`Naive`，关于原生 API 方面，我从`C++`切换到了 `Rust`，数据库从`electron-store`切换到了`SQLite3`，语言也新增了`英语`。

# Dawn Launcher

`Windows`快捷启动工具，帮助您整理杂乱无章的桌面，分门别类管理您的桌面快捷方式，让您的桌面保持干净整洁。

支持关联文件夹（实时同步文件夹内容）、快速搜索、相对路径（便携路径）、扫描本机开始菜单、本地扫描本机 Appx 应用列表、添加网址并一键获取网址信息。

# 技术栈

`Electron + Vite + Vue3 + TS`

# 支持平台

`Windows(10/11)`

# 编译步骤

1. 安装`node-gyp`，编译 SQLite3 需要。
2. 安装`Rust`环境 + `Cargo`，编译 Rust 需要。
3. 然后运行`yarn install`安装项目依赖（如果修改了`Rust`代码也需要重新运行`yarn install`）。
4. `yarn run dev`本地运行项目。
5. `yarn run build`打包项目。
6. 便携版和安装版需要分两次打包，通过修改`.env.production`中的`VITE_INSTALL`，`true`为安装版，`false`为便携版。

# 官网

[dawnlauncher.com](https://dawnlauncher.com/)

# QQ 群

369652112

# 捐赠（微信）

![微信](/images/wechat.png)

# 捐赠（支付宝）

![支付宝](/images/alipay.png)

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
