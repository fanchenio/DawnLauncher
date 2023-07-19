const { defineConfig } = require("@vue/cli-service");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = defineConfig({
  transpileDependencies: true,
  assetsDir: "public",
  productionSourceMap: false,
  configureWebpack: {
    entry: "./src/renderer/main.js",
    resolve: {
      extensions: [".js", ".vue", ".json", ".ts", ".less"],
      alias: {
        "@": resolve("src/renderer"),
      },
    },
    optimization: {
      usedExports: true,
      splitChunks: {
        chunks: "all",
      },
      minimizer: [
        new TerserPlugin({
          extractComments: false, // 禁止生成license.txt文件
          terserOptions: {
            compress: {
              drop_console: true, // 删除console.log
              drop_debugger: true, // 删除debugger
            },
          },
        }),
      ],
    },
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        // 应用名称
        productName: "Dawn Launcher",
        // 压缩级别
        compression: "maximum",
        // 包含api目录
        extraFiles: ["build"],
        // 图片
        extraResources: [{ from: "./public/images", to: "images" }],
        // windows
        win: {
          // appId
          appId: "com.dawnlauncher.application",
          target: [
            {
              target: "nsis",
              // ia32 x64
              arch: ["x64"],
            },
          ],
          icon: "public/images/logo.ico",
        },
        nsis: {
          // 安装文件名称
          artifactName: "${productName}-${version}.${ext}",
          // 是否一键安装，建议为false，可以让用户点击下一步、下一步、下一步的形式安装程序，如果为true，当用户双击构建好的程序，自动安装程序并打开，即：一键安装（one-click installer）
          oneClick: false,
          // 允许请求提升，如果为false，则用户必须使用提升的权限重新启动安装程序。
          allowElevation: true,
          // 允许修改安装目录，建议为true，是否允许用户改变安装目录，默认是不允许。
          allowToChangeInstallationDirectory: true,
          // 创建桌面图标
          createDesktopShortcut: true,
          // 创建开始菜单图标
          createStartMenuShortcut: true,
        },
      },
      mainProcessFile: "src/main/main.js",
      mainProcessWatch: ["src/main"],
    },
  },
});
