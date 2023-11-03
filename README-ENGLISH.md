# [简体中文](https://github.com/fanchenio/DawnLauncher) | English

# Update

After disappearing for more than three months, I refactored the `Dawn Launcher` code. Because I had no experience in developing `NodeJS` and `Electron` at the beginning, `Vue` was not well written, and the code was a bit sloppy, so I carried out Code refactoring, the new version uses `Electron26 + Vite + Vue3 + TS`, the UI framework uses `Naive`, regarding the native API, I switched from `C++` to `Rust`, and the database switched from `electron-store` With `SQLite3`, the language has also added `English`.

# Dawn Launcher

The `Windows` quick launch tool helps you organize your messy desktop, manage your desktop shortcuts by category, and keep your desktop clean and tidy.

Supports associated folders (real-time synchronization of folder contents), quick search, relative paths (portable paths), scanning the local start menu, locally scanning the local Appx application list, adding URLs and obtaining URL information with one click.

# Technology Stack

`Electron + Vite + Vue3 + TS`

# Support Platform

`Windows(10/11)`

# Compilation Steps

1. First you need to install `node-gyp`, which is needed to compile local modules.
2. Then run `yarn install` to install the project dependencies (if you modify the `Rust` code, you need to re-run `yarn install`).
3. `yarn run dev` runs the project locally.
4. `yarn run build` packages the project.
5. The portable version and the installation version need to be packaged twice. By modifying `VITE_INSTALL` in `.env.production`, `true` means the installation version and `false` means the portable version.

# Official Website

[dawnlauncher.com](https://dawnlauncher.com/)

# Donate(Wechat)

![Wechat](/images/wechat.png)

# Donate(Alipay)

![Alipay](/images/alipay.png)

# UI

![UI](/images/soft1.png)

## Subclassification

![Subclassification](/images/soft2.png)

## Custom Theme

![Custom Theme](/images/soft3.png)

## Custom Background

![Custom Background](/images/soft4.png)

## Quick Search

![Quick Search](/images/soft5.png)

## Get URL Information with One Click

![Get URL information with one click](/images/soft6.webp)

## Relative Paths (Portable Paths)

![Relative Paths (Portable Paths)](/images/soft7.png)

## Associate Folders

![Associate Folders](/images/soft8.webp)

# License

Apache License Version 2.0
