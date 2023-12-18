import * as Addon from './addon.node'

const {
	getFileIcon,
	searchPath,
	getShortcutFileInfo,
	shellExecute,
	systemItemExecute,
	openFileLocation,
	explorerContextMenu,
	getEnvByName,
	isFullscreen,
	switchEnglish,
	createMouseHook,
	enableMouseHook,
	disableMouseHook,
	getCursorPosWindowClassName,
	getClipboardFileList,
	clipboardHasBitmap,
	getClipboardBitmapBase64,
	emptyRecycleBin,
	removeWindowAnimation,
	getAppxList,
} = Addon

export default Addon

export {
	getFileIcon,
	searchPath,
	getShortcutFileInfo,
	shellExecute,
	systemItemExecute,
	openFileLocation,
	explorerContextMenu,
	getEnvByName,
	isFullscreen,
	switchEnglish,
	createMouseHook,
	enableMouseHook,
	disableMouseHook,
	getCursorPosWindowClassName,
	getClipboardFileList,
	clipboardHasBitmap,
	getClipboardBitmapBase64,
	emptyRecycleBin,
	removeWindowAnimation,
	getAppxList,
}
