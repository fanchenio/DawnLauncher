# Dawn Launcher
Windows快捷启动工具，帮助您整理杂乱无章的桌面，分门别类管理您的桌面快捷方式，让您的桌面保持干净整洁。

支持相对路径（便携路径），支持扫描本机开始菜单、本地Appx应用列表添加项目、支持多项目添加，一次启动多个项目、支持添加网址并一键获取网址信息。
# 开发框架
Electron
# 支持平台
Windows
# 编译步骤
1. 需要配置 node-gyp 环境，这个可以自行搜索一下。
2. yarn install 安装依赖。
3. node-gyp rebuild --arch=x64 或 node-gyp rebuild --arch=ia32 编译64位或32位DLL。
4. yarn electron:serve 本地运行项目。
5. yarn electron:build 打包项目，打包64位和32位的时候，需要分两次打包，将 vue.config.js 配置中的 pluginOptions.electronBuilder.builderOptions.win.target.arch 修改为x64或者ia32。
# 官网
[dawnlauncher.com](https://dawnlauncher.com/)
# 捐赠
![微信](/images/wechat.png)
![支付宝](/images/alipay.png)
# 界面
![界面](/images/界面.png)
## 子分类
![子分类](/images/子分类.png)
## 自定义主题
![自定义主题](/images/自定义主题.png)
## 自定义背景
![自定义背景](/images/自定义背景.png)
## 快速搜索
![快速搜索](/images/快速搜索.gif)
## 一键获取网址信息
![一键获取网址信息](/images/一键获取网址信息.gif)
## 相对路径（便携路径）
![相对路径（便携路径）](/images/相对路径.png)
## 关联文件夹
![关联文件夹](/images/关联文件夹.gif)
# License
Apache License Version 2.0
