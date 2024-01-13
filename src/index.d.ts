import { Classification } from "../types/classification";
import { Item } from "../types/item";

type Callback = (param: any) => void;

declare global {
  interface Window {
    api: {
      emit: (windowName: string, listener: string, paylod: any) => void;
      showErrorMessageBox: (windowName: string, message: string) => void;
      showInfoMessageBox: (windowName: string, message: string) => void;
      showConfirmBox: (windowName: string, message: string) => boolean;
      selectFile: (
        windowName: string,
        target: boolean,
        defaultPath: string | null
      ) => string | null;
      selectDirectory: (
        windowName: string,
        defaultPath: string | null
      ) => string | null;
      getFileIcon: (windowName: string, path: string) => void;
      onGetFileIcon: (callback: Callback) => Function;
      downloadImage: (windowName: string, url: string) => void;
      onDownloadImage: (callback: Callback) => Function;
      getURLInfo: (windowName: string, url: string) => void;
      onGetURLInfo: (callback: Callback) => Function;
      convertPath: (path: string) => string;
      pathExist: (path: string) => boolean;
      isFile: (path: string) => boolean;
      openURL: (url: string) => void;
      getVersion: () => string;
      exit: () => void;
      run: (
        operation: string,
        target: string,
        params: string | null,
        startLocation: string | null
      ) => void;
    };
    main: {
      showWindow: (blurHide: boolean) => void;
      hideWindow: () => void;
      initData: () => void;
      onShowWindowBefore: (callback: Callback) => Function;
    };
    classification: {
      list: () => Array<Classification>;
      selectById: (id: number) => Classification | null;
      add: (
        parentId: number | null,
        name: string,
        shortcutKey: string | null,
        globalShortcutKey: boolean
      ) => Classification | null;
      update: (classifictaion: Classification) => boolean;
      updateOrder: (
        fromId: number,
        toId: number | null,
        parentId: number | null
      ) => boolean;
      updateIcon: (id: number, icon: string | null) => boolean;
      showAddEditWindow: () => void;
      closeAddEditWindow: () => void;
      showSetIconWindow: () => void;
      closeSetIconWindow: () => void;
      showRightMenu: (
        classification: Classification | null,
        lockClassification: boolean
      ) => void;
      onAdd: (callback: Callback) => Function;
      onUpdate: (callback: Callback) => Function;
      onDelete: (callback: Callback) => Function;
      onLock: (callback: Callback) => Function;
      onUpdateIcon: (callback: Callback) => Function;
      showAssociateFolderWindow: () => void;
      closeAssociateFolderWindow: () => void;
      setAssociateFolder: (
        id: number,
        dir: string | null,
        hiddenItems: string | null
      ) => Classification;
      onUpdateAssociateFolder: (callback: Callback) => Function;
      hasChildClassification: (id: number) => boolean;
      onCollapseSubClassification: (callback: Callback) => Function;
      onUpdateItemLayout: (callback: Callback) => Function;
      onUpdateItemSort: (callback: Callback) => Function;
      onUpdateItemColumnNumber: (callback: Callback) => Function;
      onUpdateItemIconSize: (callback: Callback) => Function;
      addClassificationByDirectory: (pathList: Array<string>) => void;
      onAddClassificationByDirectory: (callback: Callback) => Function;
      onUpdateItemShowOnly: (callback: Callback) => Function;
      onUpdateFixed: (callback: Callback) => Function;
      onUpdateItemOpenNumberSortToDefualt: (callback: Callback) => Function;
      showAggregateWindow: () => void;
      closeAggregateWindow: () => void;
      updateAggregate: (id: number, sort: string, itemCount: number) => boolean;
      onUpdateAggregate: (callback: Callback) => Function;
      onUpdateExcludeSearch: (callback: Callback) => Function;
    };
    item: {
      showAddEditWindow: () => void;
      closeAddEditWindow: () => void;
      list: () => Array<Item>;
      simpleList: () => Array<Item>;
      selectById: (id: number) => Item | null;
      add: (item: Item) => Item | null;
      update: (item: Item) => boolean;
      updateOrder: (
        fromIdList: Array<number>,
        toClassificationId: number,
        newIndex: number | null
      ) => boolean;
      showRightMenu: (params: any) => void;
      createNetworkIconWindow: () => void;
      showNetworkIconWindow: () => void;
      closeNetworkIconWindow: () => void;
      onNetworkIcon: (callback: Callback) => Function;
      createSVGIconWindow: () => void;
      showSVGIconWindow: () => void;
      closeSVGIconWindow: () => void;
      onSVGIcon: (callback: Callback) => Function;
      getSystemItemList: () => void;
      onGetSystemItemList: (callback: Callback) => Function;
      getStartMenuItemList: () => void;
      onGetStartMenuItemList: (callback: Callback) => Function;
      getAppxItemList: () => void;
      onGetAppxItemList: (callback: Callback) => Function;
      onAdd: (callback: Callback) => Function;
      onUpdate: (callback: Callback) => Function;
      onDelete: (callback: Callback) => Function;
      onLock: (callback: Callback) => Function;
      drop: (classificationId: number, pathList: Array<string>) => void;
      onBatchOperation: (callback: Callback) => Function;
      run: (type: string, operation: string, item: Item) => void;
      onConvertPath: (callback: Callback) => Function;
      onRefreshIcon: (callback: Callback) => Function;
      onMove: (callback: Callback) => Function;
      onBatchOperationSelectAll: (callback: Callback) => Function;
      onRightMenuClose: (callback: Callback) => Function;
      onExplorerMenu: (callback: Callback) => Function;
      dragOut: (item: Item) => void;
      onCancelDragOut: (callback: Callback) => Function;
      onUpdateOpenInfo: (callback: Callback) => Function;
      onCheckInvalid: (callback: Callback) => Function;
      updateOpenInfo: (type: string, id: number) => void;
    };
    setting: {
      createWindow: () => void;
      showWindow: () => void;
      closeWindow: () => void;
      select: () => Setting | null;
      add: (setting: Setting) => boolean;
      update: (setting: Setting) => boolean;
      onUpdate: (callback: Callback) => Function;
      setStartup: (value: boolean) => void;
      setTray: (show: boolean) => void;
      setTaskbar: (show: boolean) => void;
      setShortcutKey: (setting: Setting) => void;
      setAlwaysTop: (value: boolean) => void;
      setLockSize: (value: boolean) => void;
      setFixedPosition: (fixedPosition: boolean, alwaysCenter: boolean) => void;
      setAlwaysCenter: (fixedPosition: boolean, alwaysCenter: boolean) => void;
      setEdgeAdsorb: (value: boolean) => void;
      uploadBackgrounImage: () => any;
      onSetBacngroundImage: (callback: Callback) => Function;
      getBackgroundImage: (name: string, windowName: string) => void;
      setCheckInvalidItem: (value: boolean) => void;
      setOpenNumber: (value: boolean) => void;
    };
    quickSearch: {
      initFinished: () => void;
      showWindow: () => void;
      hideWindow: () => void;
      onShowWindowBefore: (callback: Callback) => Function;
      onClearData: (callback: Callback) => Function;
      setWindowHeight: (height: number) => void;
      setWindowWidth: (width: number) => void;
    };
    about: {
      createWindow: () => void;
      showWindow: () => void;
      closeWindow: () => void;
    };
    data: {
      createBackupRestoreDataWindow: () => void;
      showBackupRestoreDataWindow: () => void;
      closeBackupRestoreDataWindow: () => void;
      backupData: () => void;
      restoreData: () => void;
    };
  }
}
