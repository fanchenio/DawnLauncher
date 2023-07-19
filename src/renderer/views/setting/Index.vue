<template>
  <div
    class="text-sm"
    :style="{
      backgroundColor: setting.appearance.theme.mainBackground,
      color: setting.appearance.theme.fontBasic,
    }"
  >
    <div class="float-left">
      <h1 class="px-2 flex items-center h-[34px] app-region-drag">{{ $store.state.currentLanguage.setting }}</h1>
      <div class="px-[8px] w-[96px]" :style="{ height: height + 'px' }" data-simplebar>
        <div
          v-for="(item, index) of menuList"
          class="mb-1 px-2 flex items-center h-[30px] text-left rounded w-full menu-item"
          :key="'menu-' + item.id + '-' + index"
          :class="[`${setting.classification.nameAlign == 'center' ? 'justify-center' : ''}`]"
          :style="{
            backgroundColor: menuSelected == item.id ? $hexToRGBA(setting.appearance.theme.minorBackground, 1) : null,
            color: menuSelected == item.id ? $hexToRGBA(setting.appearance.theme.fontHover, 1) : null,
          }"
          @mouseover="
            $styleMouseover(
              $event,
              'menu-item',
              ['color', 'background-color'],
              [$hexToRGBA(setting.appearance.theme.fontHover, 1), $hexToRGBA(setting.appearance.theme.minorBackground, 1)]
            )
          "
          @mouseout="$styleMouseout($event, 'menu-item', menuSelected == item.id ? [] : ['color', 'background-color'])"
          @click="(menuSelected = item.id), this.closeSaveSearchSource()"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
    <div class="overflow-hidden">
      <div class="flex">
        <div class="w-full h-[34px] app-region-drag"></div>
        <div class="flex items-center">
          <Close @click="close" :key="'close-' + setting.appearance.theme.name"></Close>
        </div>
      </div>
      <div v-if="menuSelected == 1" class="px-[8px] pb-[8px]" :style="{ height: height + 'px' }" data-simplebar>
        <div>
          <span class="block font-semibold">{{ $store.state.currentLanguage.start }}</span>
          <check-box v-model:value="setting.general.startup" :label="$store.state.currentLanguage.autoStart" class="mt-2" @change="setAutoStart" />
          <check-box v-model:value="setting.general.startupTray" :label="$store.state.currentLanguage.startupTray" class="mt-2" @change="set" />
          <check-box v-model:value="setting.general.hideTray" :label="$store.state.currentLanguage.hideTray" class="mt-2" @change="setHideTray" />
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.showHide }}</span>
          <check-box
            v-model:value="setting.general.showFollowMousePosition"
            :label="$store.state.currentLanguage.showFollowMousePosition"
            class="mt-2"
            @change="set"
          />
          <check-box v-model:value="setting.general.showHideMouseWheelClick" :label="$store.state.currentLanguage.middleClick" class="mt-2" @change="set" />
          <check-box v-model:value="setting.general.doubleClickTaskbar" :label="$store.state.currentLanguage.doubleClickTaskbar" class="mt-2" @change="set" />
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.shortcutKey }}<span v-html="$getColon()"></span></span>
            <Input
              v-model:value="setting.general.showHideShortcutKey"
              @keydown="temp.showHideShortcutKey = setting.general.showHideShortcutKey = setShortcutKey($event, setting.general.showHideShortcutKey, true)"
              @keyup="setShowHideShortcutKey"
            ></Input>
          </div>
          <div class="flex flex-wrap">
            <Button text="Ctrl + Space" class="mt-1 w-[96px] mr-1" type="primary" @click="changeShowHideShortcutKey('Ctrl + Space')"></Button>
            <Button text="Alt + Space" class="mt-1 w-[96px]" type="primary" @click="changeShowHideShortcutKey('Alt + Space')"></Button>
          </div>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.language }}</span>
          <Select
            id="languageSelect"
            class="mt-2"
            :list="languageList"
            v-model:value="setting.general.language"
            :width="120"
            @change="setLanguage"
            :key="setting.general.language"
          ></Select>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.window }}</span>
          <check-box v-model:value="setting.general.alwaysTop" :label="$store.state.currentLanguage.alwaysTop" class="mt-2" @change="setAlwaysTop" />
          <check-box v-model:value="setting.general.lockSize" :label="$store.state.currentLanguage.lockSize" class="mt-2" @change="setLockSize" />
          <check-box
            v-model:value="setting.general.fixedPosition"
            :label="$store.state.currentLanguage.fixedPosition"
            class="mt-2"
            @change="setFixedPosition"
          />
          <check-box v-model:value="setting.general.alwaysCenter" :label="$store.state.currentLanguage.alwaysCenter" class="mt-2" @change="setAlwaysCenter" />
          <check-box v-model:value="setting.general.hideLosingFocus" :label="$store.state.currentLanguage.hideLosingFocus" class="mt-2" @change="set" />
          <check-box v-model:value="setting.general.edgeAutoHide" :label="$store.state.currentLanguage.edgeAutoHide" class="mt-2" @change="set" />
          <div class="mt-2" v-if="setting.general.edgeAutoHide">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.delayDisplayMS }}<span v-html="$getColon()"></span></span>
            <Input v-model:value="setting.general.delayDisplayMS" @blur="setDelayDisplayMS" type="number"></Input>
          </div>
          <div class="mt-2" v-if="setting.general.edgeAutoHide">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.delayHidingMS }}<span v-html="$getColon()"></span></span>
            <Input v-model:value="setting.general.delayHidingMS" @blur="setDelayHidingMS" type="number"></Input>
          </div>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.function }}</span>
          <check-box v-model:value="setting.general.notDisturb" :label="$store.state.currentLanguage.doNotDisturb" class="mt-2" @change="set" />
          <span class="block text-xs mt-2">{{ $store.state.currentLanguage.doNotDisturbNote }}</span>
          <check-box v-model:value="setting.general.switchEnglish" :label="$store.state.currentLanguage.switchEnglish" class="mt-2" @change="set" />
        </div>
      </div>
      <div v-if="menuSelected == 2" class="px-[8px] pb-[8px]" :style="{ height: height + 'px' }" data-simplebar>
        <div>
          <span class="block font-semibold">{{ $store.state.currentLanguage.theme }}</span>
          <div class="flex items-center flex-wrap">
            <div
              v-for="(theme, index) of themeList"
              class="border rounded w-10 h-10 mr-2 mt-2"
              :style="{ backgroundColor: theme.name, borderColor: setting.appearance.theme.border }"
              :key="'theme-' + index"
              @click="changeTheme(theme)"
            >
              <template v-if="theme.name.split(',').length > 1">
                <div class="rounded-l w-1/2 h-full float-left" :style="{ backgroundColor: theme.name.split(',')[0] }"></div>
                <div class="rounded-r w-1/2 h-full float-right" :style="{ backgroundColor: theme.name.split(',')[1] }"></div>
              </template>
              <template v-else>
                <div class="rounded w-full h-full" :style="{ backgroundColor: theme.name }"></div>
              </template>
            </div>
          </div>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.color }}</span>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.mainColor }}<span v-html="$getColon()"></span></span>
            <Color id="mainBackground" v-model:value="setting.appearance.theme.mainBackground" @change="setTheme"></Color>
          </div>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.secondaryColor }}<span v-html="$getColon()"></span></span>
            <Color id="minorBackground" v-model:value="setting.appearance.theme.minorBackground" @change="setTheme"></Color>
          </div>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.mainFontColor }}<span v-html="$getColon()"></span></span>
            <Color id="fontBasic" v-model:value="setting.appearance.theme.fontBasic" @change="setTheme"></Color>
          </div>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.secondaryFontColor }}<span v-html="$getColon()"></span></span>
            <Color id="fontHover" v-model:value="setting.appearance.theme.fontHover" @change="setTheme"></Color>
          </div>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.borderColor }}<span v-html="$getColon()"></span></span>
            <Color id="border" v-model:value="setting.appearance.theme.border" @change="setTheme"></Color>
          </div>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.backgroundImage }}</span>
          <div class="mt-2 flex items-center">
            <input
              ref="backgroundImage"
              type="file"
              class="hidden"
              @change="uploadBackgroundImage"
              accept="image/jpg,image/jpeg,image/png,image/gif,image/x-icon,image/svg"
            />
            <Button :text="$store.state.currentLanguage.select" class="w-20 h-[30px]" type="primary" @click="$refs.backgroundImage.click()"></Button>
            <Button :text="$store.state.currentLanguage.delete" class="w-20 ml-1 h-[30px]" type="primary" @click="deleteBackgroundImage"></Button>
          </div>
          <img v-if="setting.appearance.backgroundImage != null" :src="$store.state.backgroundImage" class="h-[100px] mt-2 rounded" />
        </div>
        <div class="mt-4" v-if="setting.appearance.backgroundImage != null">
          <span class="block font-semibold">{{
            $store.state.currentLanguage.backgroundImageTransparency + "(" + setting.appearance.backgroundImageTransparency + ")"
          }}</span>
          <input
            type="range"
            v-model="setting.appearance.backgroundImageTransparency"
            min="0.1"
            max="1.0"
            step="0.1"
            class="mt-2 w-full range"
            @change="setBackgroundImageTransparency"
          />
        </div>
        <div class="mt-4" v-if="setting.appearance.backgroundImage != null">
          <span class="block font-semibold">{{ $store.state.currentLanguage.backgroundImageMode }}</span>
          <Select
            id="backgroundImageModeSelect"
            class="mt-2"
            :list="backgroundImageModeList"
            v-model:value="setting.appearance.backgroundImageMode"
            :width="120"
            @change="set"
          ></Select>
        </div>
        <div class="mt-4" v-if="setting.appearance.backgroundImage != null">
          <span class="block font-semibold">{{ $store.state.currentLanguage.backgroundImagePosition }}</span>
          <Select
            id="backgroundImagePositionSelect"
            class="mt-2"
            :list="backgroundImagePositionList"
            v-model:value="setting.appearance.backgroundImagePosition"
            :width="120"
            @change="set"
          ></Select>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.transparency + "(" + setting.appearance.transparency + ")" }}</span>
          <input type="range" v-model="setting.appearance.transparency" min="0.1" max="1.00" step="0.01" class="mt-2 w-full range" @change="setTransparency" />
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{
            $store.state.currentLanguage.backgroundTransparency + "(" + setting.appearance.backgroundTransparency + ")"
          }}</span>
          <input
            type="range"
            v-model="setting.appearance.backgroundTransparency"
            min="0.1"
            max="1.00"
            step="0.01"
            class="mt-2 w-full range"
            @change="setBackgroundTransparency"
          />
        </div>
        <div class="mt-4" v-if="setting.appearance.backgroundTransparency < 1">
          <span class="block font-semibold">{{ $store.state.currentLanguage.windowRoundedCorners }} </span>
          <check-box v-model:value="setting.appearance.windowRoundedCorners" :label="$store.state.currentLanguage.enable" class="mt-2" @change="set" />
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.fontShadow }} </span>
          <check-box v-model:value="setting.appearance.useFontShadow" :label="$store.state.currentLanguage.enable" class="mt-2" @change="set" />
          <Color v-if="setting.appearance.useFontShadow" class="mt-2" id="fontShadow" v-model:value="setting.appearance.fontShadow" @change="set"></Color>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.titleBar }} </span>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.title }}<span v-html="$getColon()"></span></span>
            <Input v-model:value="setting.appearance.title" @blur="set"></Input>
          </div>
        </div>
      </div>
      <div v-if="menuSelected == 3" class="px-[8px] pb-[8px]" :style="{ height: height + 'px' }" data-simplebar>
        <div>
          <span class="block font-semibold">{{ $store.state.currentLanguage.layout }}</span>
          <Select id="itemLayoutSelect" class="mt-2" :list="itemLayoutList" v-model:value="setting.item.layout" :width="120" @change="set"></Select>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.iconSize }}</span>
          <Select id="iconSizeSelect" class="mt-2" :list="iconSizeList" v-model:value="setting.item.iconSize" :width="120" @change="set"></Select>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.size }}</span>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.width }}<span v-html="$getColon()"></span></span>
            <Input v-model:value="setting.item.width" @blur="setItemWidth" type="number"></Input>
          </div>
          <span class="block text-xs mt-2">{{ $store.state.currentLanguage.onlyTileTakeEffect }}</span>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.itemNameShowRowCount }}</span>
          <Select id="lineSelect" class="mt-2" :list="lineList" v-model:value="setting.item.itemNameRowCount" :width="120" @change="set"></Select>
          <span class="block text-xs mt-2">{{ $store.state.currentLanguage.onlyTileTakeEffect }}</span>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.numberOfColumns + "(" + setting.item.columnNumber + ")" }}</span>
          <input type="range" v-model="setting.item.columnNumber" min="1" max="20" step="1" class="mt-2 w-full range" @change="set" />
          <span class="block text-xs mt-2">{{ $store.state.currentLanguage.onlyListTakeEffect }}</span>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.name }}</span>
          <check-box v-model:value="setting.item.hideItemName" :label="$store.state.currentLanguage.hideItemName" class="mt-2" @change="set" />
          <check-box v-model:value="setting.item.hideEllipsis" label="隐藏省略号" class="mt-2" @change="set" />
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.fontSize }}<span v-html="$getColon()"></span></span>
            <Input v-model:value="setting.item.fontSize" @blur="setItemFontSize" type="number"></Input>
          </div>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.fontWeight }}<span v-html="$getColon()"></span></span>
            <Select
              id="fontWeightSelect"
              :list="fontWeightList"
              v-model:value="setting.item.fontWeight"
              :width="140"
              @change="set"
              :key="setting.item.fontWeight"
            ></Select>
          </div>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.fontLineHeight }}<span v-html="$getColon()"></span></span>
            <Select
              id="fontLineHeightSelect"
              :list="fontLineHeightList"
              v-model:value="setting.item.fontLineHeight"
              :width="140"
              @change="set"
              :key="setting.item.fontLineHeight"
            ></Select>
          </div>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.search }}</span>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.shortcutKey }}<span v-html="$getColon()"></span></span>
            <Input
              v-model:value="setting.item.searchShortcutKey"
              @keydown="temp.searchShortcutKey = setting.item.searchShortcutKey = setShortcutKey($event, setting.item.searchShortcutKey, true)"
              @keyup="setSearchShortcutKey"
            ></Input>
          </div>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.open }}</span>
          <check-box v-model:value="setting.item.doubleClickRunItem" :label="$store.state.currentLanguage.doubleClickOpen" class="mt-2" @change="set" />
          <check-box
            v-model:value="setting.item.openAfterHideMainInterface"
            :label="$store.state.currentLanguage.openAfterHideMainInterface"
            class="mt-2"
            @change="set"
          />
          <check-box v-model:value="setting.item.useItemOpen" :label="$store.state.currentLanguage.useItemOpen" class="mt-2" @change="set" />
          <check-box v-model:value="setting.item.openNumber" :label="$store.state.currentLanguage.recordOpenNumber" class="mt-2" @change="set" />
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.function }}</span>
          <check-box v-model:value="setting.item.checkInvalidItem" :label="$store.state.currentLanguage.checkInvalidItem" class="mt-2" @change="set" />
        </div>
      </div>
      <div v-if="menuSelected == 4" class="px-[8px] pb-[8px]" :style="{ height: height + 'px' }" data-simplebar>
        <div>
          <span class="block font-semibold">{{ $store.state.currentLanguage.size }}</span>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.width }}<span v-html="$getColon()"></span></span>
            <Input v-model:value="setting.classification.width" @blur="setClassificationWidth" type="number"></Input>
          </div>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.layout }}</span>
          <Select
            id="classificationLayoutSelect"
            class="mt-2"
            :list="classificationLayoutList"
            v-model:value="setting.classification.layout"
            :width="120"
            @change="set"
          ></Select>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.mode }}</span>
          <Select
            id="classificationModeSelect"
            class="mt-2"
            :list="classificationModeList"
            v-model:value="setting.classification.mode"
            :width="120"
            @change="set"
          ></Select>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.nameAlign }}</span>
          <Select id="alignSelect" class="mt-2" :list="alignList" v-model:value="setting.classification.nameAlign" :width="120" @change="set"></Select>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.switch }}</span>
          <check-box class="mt-2" v-model:value="setting.classification.mouseHover" :label="$store.state.currentLanguage.mouseHover" @change="set" />
          <div class="mt-2 flex items-center" v-if="setting.classification.mouseHover">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.hoverMS }}<span v-html="$getColon()"></span></span
            ><Input v-model:value="setting.classification.mouseHoverMS" @blur="setMouseHoverMS" type="number" />
          </div>
          <check-box v-model:value="setting.classification.mouseWheel" :label="$store.state.currentLanguage.mouseWheel" class="mt-2" @change="set" />
          <check-box
            v-model:value="setting.classification.autoSwitchClassification"
            :label="$store.state.currentLanguage.autoSwitchClassification"
            class="mt-2"
            @change="set"
          />
          <check-box
            v-model:value="setting.classification.switchClassificationCollapseOtherSubClassification"
            :label="$store.state.currentLanguage.switchClassificationCollapseOtherSubClassification"
            class="mt-2"
            @change="set"
          />
        </div>
        <div class="mt-4">
          <span class="block font-semibold">功能</span>
          <check-box
            v-model:value="setting.classification.rememberSelectionState"
            :label="$store.state.currentLanguage.rememberSelectionState"
            class="mt-2"
            @change="set"
          />
          <check-box
            v-model:value="setting.classification.hideWindowFoldChildClassification"
            :label="$store.state.currentLanguage.hideWindowFoldChildClassification"
            class="mt-2"
            @change="set"
          />
        </div>
      </div>
      <div v-if="menuSelected == 6" class="px-[8px] pb-[8px]" :style="{ height: height + 'px' }" data-simplebar>
        <div>
          <span class="block font-semibold">{{ $store.state.currentLanguage.dataDirectory }}</span>
          <div class="mt-2 flex items-center">
            <Input v-model:value="appDataPath" readonly></Input>
          </div>
          <div class="mt-2 flex">
            <Button :text="$store.state.currentLanguage.select" class="w-20 h-[30px]" type="primary" @click="chooseDataDirectory"></Button>
            <Button :text="$store.state.currentLanguage.default" class="w-20 ml-1 h-[30px]" type="primary" @click="defaultDataDirectory"></Button>
          </div>
          <span class="block text-xs mt-2">{{ $store.state.currentLanguage.dataDirectoryNote }}</span>
        </div>
      </div>
      <div v-if="menuSelected == 7" class="px-[8px] pb-[8px]" :style="{ height: height + 'px' }" data-simplebar>
        <div>
          <span class="block font-semibold">{{ $store.state.currentLanguage.enable }}</span>
          <check-box v-model:value="setting.quickSearch.enable" :label="$store.state.currentLanguage.enable" class="mt-2" @change="setEnableQuickSearch" />
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.showHide }}</span>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.shortcutKey }}<span v-html="$getColon()"></span></span>
            <Input
              v-model:value="setting.quickSearch.showHideShortcutKey"
              @keydown="
                temp.quickSearchShortcutKey = setting.quickSearch.showHideShortcutKey = setShortcutKey($event, setting.quickSearch.showHideShortcutKey, true)
              "
              @keyup="setQuickSearchShowHideShortcutKey"
            ></Input>
          </div>
          <div class="flex flex-wrap">
            <Button text="Ctrl + Space" class="mt-1 w-[96px] mr-1" type="primary" @click="changeQuickSearchShowHideShortcutKey('Ctrl + Space')"></Button>
            <Button text="Alt + Space" class="mt-1 w-[96px]" type="primary" @click="changeQuickSearchShowHideShortcutKey('Alt + Space')"></Button>
          </div>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.shortcutKey }}</span>
          <Select
            id="quickSearchOpenShortcutKeySelect"
            class="mt-2"
            :list="quickSearchOpenShortcutKeyList"
            v-model:value="setting.quickSearch.openShortcutKey"
            :width="140"
            @change="set"
            :key="setting.quickSearch.openShortcutKey"
          ></Select>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.window }}</span>
          <check-box v-model:value="setting.quickSearch.hideLosingFocus" :label="$store.state.currentLanguage.hideLosingFocus" class="mt-2" @change="set" />
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.open }}</span>
          <check-box v-model:value="setting.quickSearch.openNow" :label="$store.state.currentLanguage.openNow" class="mt-2" @change="set" />
          <check-box v-model:value="setting.quickSearch.useItemOpen" :label="$store.state.currentLanguage.useItemOpen" class="mt-2" @change="set" />
          <check-box
            v-model:value="setting.quickSearch.openAfterHideQuickSearchWindow"
            :label="$store.state.currentLanguage.openAfterHideQuickSearchWindow"
            class="mt-2"
            @change="set"
          />
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.historyRecord }}</span>
          <check-box v-model:value="setting.quickSearch.showHistory" :label="$store.state.currentLanguage.show" class="mt-2" @change="set" />
          <Select
            v-if="setting.quickSearch.showHistory"
            id="showHistorySortSelect"
            class="mt-2"
            :list="showHistorySortList"
            v-model:value="setting.quickSearch.showHistorySort"
            :width="140"
            @change="set"
            :key="setting.quickSearch.showHistorySort"
          ></Select>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.matchingConditions }}</span>
          <check-box v-model:value="setting.quickSearch.matchingConditionsRemark" :label="$store.state.currentLanguage.remark" class="mt-2" @change="set" />
        </div>
      </div>
      <div v-if="menuSelected == 8" class="px-[8px] pb-[8px]" :style="{ height: height + 'px' }" data-simplebar>
        <div>
          <span class="block font-semibold">{{ $store.state.currentLanguage.mode }}</span>
          <Select
            id="webSearchModeSelect"
            class="mt-2"
            :list="webSearchModeList"
            v-model:value="setting.webSearch.mode"
            :width="180"
            @change="set"
            :key="setting.webSearch.mode"
          ></Select>
          <span class="block text-xs mt-2">{{ $store.state.currentLanguage.webSearchPrompt }}</span>
        </div>
        <div class="mt-4">
          <span class="block font-semibold">{{ $store.state.currentLanguage.searchSource }}</span>
          <table class="mt-2 table-fixed border w-full border-collapse text-center" :style="{ borderColor: setting.appearance.theme.border }">
            <thead :style="{ backgroundColor: $hexToRGBA(setting.appearance.theme.minorBackground, 0.8), color: setting.appearance.theme.fontHover }">
              <tr>
                <th class="border py-0.5" :style="{ borderColor: setting.appearance.theme.border }">{{ $store.state.currentLanguage.keyword }}</th>
                <th class="border py-0.5" :style="{ borderColor: setting.appearance.theme.border }">{{ $store.state.currentLanguage.name }}</th>
                <th class="border py-0.5" :style="{ borderColor: setting.appearance.theme.border }">{{ $store.state.currentLanguage.description }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                class="table-item"
                v-for="(item, index) of setting.webSearch.searchSourceList"
                :key="'search-source-' + item.id + '-' + index"
                :style="{
                  backgroundColor: searchSourceId == item.id ? $hexToRGBA(setting.appearance.theme.minorBackground, 0.8) : null,
                  color: searchSourceId == item.id ? setting.appearance.theme.fontHover : null,
                }"
                @mouseover="
                  $styleMouseover(
                    $event,
                    'table-item',
                    ['background-color', 'color'],
                    [$hexToRGBA(setting.appearance.theme.minorBackground, 0.8), setting.appearance.theme.fontHover]
                  )
                "
                @mouseout="$styleMouseout($event, 'table-item', searchSourceId == item.id ? [] : ['background-color', 'color'])"
                @click="showEditSearchSource(item.id, item.keyword, item.name, item.URL, item.description)"
              >
                <td class="border py-0.5" :style="{ borderColor: setting.appearance.theme.border }">{{ item.keyword }}</td>
                <td class="border py-0.5" :style="{ borderColor: setting.appearance.theme.border }">{{ item.name }}</td>
                <td class="border py-0.5" :style="{ borderColor: setting.appearance.theme.border }">{{ item.description }}</td>
              </tr>
            </tbody>
          </table>
          <div class="flex mt-2">
            <Button :text="$store.state.currentLanguage.add" class="w-20 mr-2" type="primary" @click="showAddSearchSource"></Button>
            <Button :text="$store.state.currentLanguage.delete" class="w-20" type="cancel" @click="deleteSearchSource" v-if="searchSourceId != null"></Button>
          </div>
        </div>
        <div class="mt-4" v-if="searchSourceType != null">
          <span class="block font-semibold">{{ searchSourceType == "add" ? $store.state.currentLanguage.add : $store.state.currentLanguage.edit }}</span>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.keyword }}<span v-html="$getColon()"></span></span>
            <Input v-model:value="searchSourceKeyword"></Input>
          </div>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.name }}<span v-html="$getColon()"></span></span>
            <Input v-model:value="searchSourceName"></Input>
          </div>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.url }}<span v-html="$getColon()"></span></span>
            <Input v-model:value="searchSourceURL"></Input>
          </div>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.description }}<span v-html="$getColon()"></span></span>
            <Input v-model:value="searchSourceDescription"></Input>
          </div>
          <span class="block text-xs mt-2 text-right">{{ $store.state.currentLanguage.wSearchKeyword }}</span>
          <div class="flex mt-2">
            <Button
              :text="$store.state.currentLanguage.save"
              :class="checkSearchSource() ? '' : 'cursor-not-allowed'"
              class="w-20 mr-2"
              type="primary"
              @click="saveSearchSource"
            ></Button>
            <Button :text="$store.state.currentLanguage.cancel" class="w-20" type="cancel" @click="closeSaveSearchSource"></Button>
          </div>
        </div>
      </div>
      <div v-if="menuSelected == 9" class="px-[8px] pb-[8px]" :style="{ height: height + 'px' }" data-simplebar>
        <span class="block font-semibold">{{ $store.state.currentLanguage.proxy }}</span>
        <check-box v-model:value="setting.network.useProxy" :label="$store.state.currentLanguage.useProxy" class="mt-2" @change="set" />
        <div v-if="setting.network.useProxy">
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.address }}<span v-html="$getColon()"></span></span>
            <Input v-model:value="setting.network.proxy.address" @blur="set"></Input>
          </div>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.username }}<span v-html="$getColon()"></span></span>
            <Input v-model:value="setting.network.proxy.username" @blur="set"></Input>
          </div>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.password }}<span v-html="$getColon()"></span></span>
            <Input v-model:value="setting.network.proxy.password" @blur="set"></Input>
          </div>
          <span class="block text-xs mt-2">{{ $store.state.currentLanguage.proxyNote }}</span>
        </div>
      </div>
      <div v-if="menuSelected == 10" class="px-[8px] pb-[8px]" :style="{ height: height + 'px' }" data-simplebar>
        <div>
          <span class="block font-semibold">{{ $store.state.currentLanguage.name }}</span>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.fontSize }}<span v-html="$getColon()"></span></span>
            <Input v-model:value="setting.subClassification.itemAreaNameFontSize" @blur="setItemAreaNameFontSize" type="number" />
          </div>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.fontWeight }}<span v-html="$getColon()"></span></span>
            <Select
              id="fontWeightSelect"
              :list="fontWeightList"
              v-model:value="setting.subClassification.itemAreaNameFontWeight"
              :width="140"
              @change="set"
              :key="setting.subClassification.itemAreaNameFontWeight"
            ></Select>
          </div>
          <div class="mt-2 flex items-center">
            <span class="whitespace-nowrap">{{ $store.state.currentLanguage.fontLineHeight }}<span v-html="$getColon()"></span></span>
            <Select
              id="fontLineHeightSelect"
              :list="fontLineHeightList"
              v-model:value="setting.subClassification.itemAreaNameFontLineHeight"
              :width="140"
              @change="set"
              :key="setting.subClassification.itemAreaNameFontLineHeight"
            ></Select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "simplebar";
import "simplebar/dist/simplebar.css";
import CheckBox from "@/components/CheckBox";
import CommonJS from "@/common/index.js";
import Close from "@/components/Close";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import Color from "@/components/Color";
const { ipcRenderer } = window.require("electron");

export default {
  name: "Setting",
  components: { Select, Input, CheckBox, Close, Button, Color },
  data() {
    return {
      // 选中的菜单ID
      menuSelected: 1,
      // 菜单
      menuList: null,
      setting: {
        general: {
          // 开机启动
          startup: false,
          // 启动后最小化到系统托盘
          startupTray: false,
          // 显示/隐藏快捷键
          showHideShortcutKey: null,
          // 语言
          language: null,
          // 永远置顶
          alwaysTop: false,
          // 停靠在桌面边缘时自动隐藏
          edgeAutoHide: true,
          // 锁定尺寸
          lockSize: false,
          // 失去焦点后隐藏
          hideLosingFocus: false,
          // 隐藏托盘图标
          hideTray: false,
          // 中间单击
          showHideMouseWheelClick: false,
          // 固定位置
          fixedPosition: false,
          // 永远居中
          alwaysCenter: false,
          // 显示时跟随鼠标位置
          showFollowMousePosition: false,
          // 勿扰模式
          notDisturb: false,
          // 双击任务栏
          doubleClickTaskbar: false,
          // 延迟显示(毫秒)
          delayDisplayMS: 0,
          // 延迟隐藏(毫秒)
          delayHidingMS: 0,
          // 显示窗口时将输入法切换为英文模式
          switchEnglish: false,
        },
        appearance: {
          // 主题
          theme: null,
          // 窗口透明度
          transparency: 1,
          // 背景透明度
          backgroundTransparency: 1,
          // 使用字体阴影
          useFontShadow: false,
          // 文字阴影
          fontShadow: "#000000",
          // 背景图
          backgroundImage: null,
          // 背景图模式
          backgroundImageMode: null,
          // 背景图定位
          backgroundImagePosition: null,
          // 背景图透明度
          backgroundImageTransparency: 1,
          // 窗口圆角
          windowRoundedCorners: false,
          // 标题
          title: "Dawn Launcher",
        },
        classification: {
          // 宽度
          width: 140,
          // 布局
          layout: "left",
          // 鼠标悬停切换
          mouseHover: false,
          // 悬停毫秒
          mouseHoverMS: 1000,
          // 滚轮切换
          mouseWheel: false,
          // 记住选择状态
          rememberSelectionState: false,
          // 名称对齐
          nameAlign: "left",
          // 模式
          mode: "normal",
          // 项目列表滚动到底部或顶部时自动切换分类
          autoSwitchClassification: false,
          // 隐藏窗口时折叠子分类
          hideWindowFoldChildClassification: false,
          // 切换分类时收起其他子分类
          switchClassificationCollapseOtherSubClassification: false,
        },
        item: {
          // 布局
          layout: "tile",
          // 图标大小
          iconSize: 40,
          // 搜索快捷键
          searchShortcutKey: null,
          // 双击运行项目
          doubleClickRunItem: false,
          // 打开后隐藏主界面
          openAfterHideMainInterface: false,
          // 从程序外拖动文件到项目图标上时用此项目打开文件
          useItemOpen: false,
          // 记录打开次数
          openNumber: false,
          // 隐藏项目名称
          hideItemName: false,
          // 隐藏省略号
          hideEllipsis: false,
          // 项目名称行数
          itemNameRowCount: 2,
          // 宽度
          width: 100,
          // 列数 单列多列
          columnNumber: 1,
          // 检测无效项目
          checkInvalidItem: true,
          // 字体大小
          fontSize: 14,
          // 字体粗细
          fontWeight: 400,
          // 字体行高
          fontLineHeight: 1.25,
        },
        quickSearch: {
          // 开启
          enable: true,
          // 快捷键
          showHideShortcutKey: null,
          // 打开快捷键
          openShortcutKey: "none",
          // 失去焦点后隐藏
          hideLosingFocus: false,
          // 仅剩一项时立即打开
          openNow: false,
          // 显示历史记录
          showHistory: false,
          // 历史记录排序
          showHistorySort: "lastOpen",
          // 从程序外拖动文件到项目图标上时用此项目打开文件
          useItemOpen: false,
          // 打开后隐藏快速搜索窗口
          openAfterHideQuickSearchWindow: true,
          // 匹配条件
          matchingConditionsRemark: false,
        },
        webSearch: {
          // 模式
          mode: 0,
          // 搜索源
          searchSourceList: [],
        },
        network: {
          // 使用代理
          useProxy: false,
          // 代理信息
          proxy: {
            // address
            address: null,
            // 用户名
            username: null,
            // 密码
            password: null,
          },
        },
        // 子分类
        subClassification: {
          // 名称字体大小(项目区域)
          itemAreaNameFontSize: 14,
          // 名称字体粗体(项目区域)
          itemAreaNameFontWeight: 700,
          // 名称字体行高(项目区域)
          itemAreaNameFontLineHeight: 1.25,
        },
      },
      // 临时变量
      temp: {
        showHideShortcutKey: null,
        searchShortcutKey: null,
        quickSearchShortcutKey: null,
      },
      // 快捷键校验内容
      shortcutKeyCheckMessage: null,
      // 主题
      themeList: [
        {
          name: "#FFFFFF",
          fontBasic: "#505050",
          fontHover: "#FFFFFF",
          mainBackground: "#FFFFFF",
          minorBackground: "#999999",
          border: "#F0F0F0",
        },
        {
          name: "#2B2B2B",
          fontBasic: "#BBBBBB",
          fontHover: "#BBBBBB",
          mainBackground: "#2B2B2B",
          minorBackground: "#3C3F41",
          border: "#3C3F41",
        },
        {
          name: "#508CC8",
          fontBasic: "#FFFFFF",
          fontHover: "#FFFFFF",
          mainBackground: "#508CC8",
          minorBackground: "#6FA0D2",
          border: "#6FA0D2",
        },
        {
          name: "#024351",
          fontBasic: "#FFFFFF",
          fontHover: "#FFFFFF",
          mainBackground: "#024351",
          minorBackground: "#025A6C",
          border: "#025A6C",
        },
        {
          name: "#516FA3",
          fontBasic: "#FFFFFF",
          fontHover: "#FFFFFF",
          mainBackground: "#516FA3",
          minorBackground: "#91A8D0",
          border: "#91A8D0",
        },
        {
          name: "#45326E",
          fontBasic: "#FFFFFF",
          fontHover: "#FFFFFF",
          mainBackground: "#45326E",
          minorBackground: "#5F4B8B",
          border: "#5F4B8B",
        },
        {
          name: "#693030",
          fontBasic: "#FFFFFF",
          fontHover: "#FFFFFF",
          mainBackground: "#693030",
          minorBackground: "#955151",
          border: "#803A3A",
        },
        {
          name: "#9F2F4A",
          fontBasic: "#FFFFFF",
          fontHover: "#FFFFFF",
          mainBackground: "#9F2F4A",
          minorBackground: "#EA6F8C",
          border: "#AD3350",
        },
        {
          name: "#000000,#FFDB00",
          fontBasic: "#B3B3B3",
          fontHover: "#000000",
          mainBackground: "#000000",
          minorBackground: "#FFDB00",
          border: "#1D1D1D",
        },
        {
          name: "#000000,#FFFFFF",
          fontBasic: "#B3B3B3",
          fontHover: "#000000",
          mainBackground: "#000000",
          minorBackground: "#FFFFFF",
          border: "#1D1D1D",
        },
      ],
      // 语言列表
      languageList: [],
      // 项目布局列表
      itemLayoutList: [],
      // 分类布局列表
      classificationLayoutList: [],
      // 项目图标尺寸列表
      iconSizeList: [],
      // 数据目录
      appDataPath: null,
      // 项目名称行数列表
      lineList: [
        {
          value: 1,
          label: 1,
        },
        {
          value: 2,
          label: 2,
        },
      ],
      // 分类名称对齐列表
      alignList: [],
      // 搜索源操作类型 add新增 edit编辑
      searchSourceType: null,
      // 搜索源ID
      searchSourceId: null,
      // 搜索源关键字
      searchSourceKeyword: null,
      // 搜索源名称
      searchSourceName: null,
      // 搜索源URL
      searchSourceURL: null,
      // 搜索源描述
      searchSourceDescription: null,
      // 背景图模式
      backgroundImageModeList: [],
      // 背景图定位
      backgroundImagePositionList: [],
      // 页面高度
      height: null,
      // 分类模式列表
      classificationModeList: [],
      // 快速搜索打开快捷键列表
      quickSearchOpenShortcutKeyList: [],
      // 网络搜索模式
      webSearchModeList: [],
      // 快速搜索历史记录排序列表
      showHistorySortList: [],
      // 字体粗细
      fontWeightList: [
        {
          value: 100,
          label: "100",
        },
        {
          value: 200,
          label: "200",
        },
        {
          value: 300,
          label: "300",
        },
        {
          value: 400,
          label: "400",
        },
        {
          value: 500,
          label: "500",
        },
        {
          value: 600,
          label: "600",
        },
        {
          value: 700,
          label: "700",
        },
        {
          value: 800,
          label: "800",
        },
        {
          value: 900,
          label: "900",
        },
      ],
      // 字体行高
      fontLineHeightList: [
        {
          value: 0,
          label: "0",
        },
        {
          value: 0.25,
          label: "0.25",
        },
        {
          value: 0.5,
          label: "0.5",
        },
        {
          value: 0.75,
          label: "0.75",
        },
        {
          value: 1,
          label: "1",
        },
        {
          value: 1.25,
          label: "1.25",
        },
        {
          value: 1.5,
          label: "1.5",
        },
        {
          value: 1.75,
          label: "1.75",
        },
        {
          value: 2,
          label: "2",
        },
        {
          value: 2.25,
          label: "2.25",
        },
        {
          value: 2.5,
          label: "2.5",
        },
        {
          value: 2.75,
          label: "2.75",
        },
        {
          value: 3,
          label: "3",
        },
      ],
    };
  },
  created() {
    // 获取窗口高度
    this.height = window.innerHeight - 34;
    // 获取数据
    this.getSetting();
    // 获取背景图
    ipcRenderer.send("getBackgroundImageBase64", JSON.stringify({ backgroundImage: this.setting.appearance.backgroundImage, page: "setting" }));
    // 设置菜单
    this.setMenuList();
    this.setSelectList();
    // 获取数据目录
    this.appDataPath = ipcRenderer.sendSync("getAppDataPath");
    // 监听
    this.$watch("setting.general.showHideShortcutKey", () => {
      if (this.temp.showHideShortcutKey != this.setting.general.showHideShortcutKey) {
        this.setting.general.showHideShortcutKey = this.temp.showHideShortcutKey;
      }
    });
    this.$watch("setting.item.searchShortcutKey", () => {
      if (this.temp.searchShortcutKey != this.setting.item.searchShortcutKey) {
        this.setting.item.searchShortcutKey = this.temp.searchShortcutKey;
      }
    });
    this.$watch("setting.quickSearch.showHideShortcutKey", () => {
      if (this.temp.quickSearchShortcutKey != this.setting.quickSearch.showHideShortcutKey) {
        this.setting.quickSearch.showHideShortcutKey = this.temp.quickSearchShortcutKey;
      }
    });
    this.createStyle();
  },
  mounted() {
    // 图片转base64
    ipcRenderer.on("imageToBase64", (event, args) => {
      this.setting.appearance.backgroundImage = args;
      this.set();
    });
    // 更新数据
    ipcRenderer.on("settingWindowGetData", (event, args) => {
      this.getSetting();
    });
    // 获取背景图
    ipcRenderer.on("returnBackgroundImageBase64", (event, args) => {
      if (args != null) {
        this.$store.state.backgroundImage = args;
      }
    });
    // 监听屏幕大小变化
    window.addEventListener("resize", this.resize, true);
    // 监听键盘
    window.addEventListener("keydown", this.keydown, true);
  },
  unmounted() {
    window.removeEventListener("resize", this.resize, true);
    window.removeEventListener("keydown", this.keydown, true);
  },
  methods: {
    /**
     * 判断字符串是否为空
     */
    strIsEmpty: CommonJS.strIsEmpty,
    /**
     * 获取数据
     */
    getSetting() {
      // 获取数据
      let setting = ipcRenderer.sendSync("getSetting");
      if (setting != null) {
        if (setting.general != null) {
          this.setting.general.startup = setting.general.startup;
          this.setting.general.startupTray = setting.general.startupTray;
          this.setting.general.showHideShortcutKey = setting.general.showHideShortcutKey;
          this.setting.general.alwaysTop = setting.general.alwaysTop;
          this.setting.general.language = setting.general.language;
          this.setting.general.edgeAutoHide = setting.general.edgeAutoHide;
          this.setting.general.lockSize = setting.general.lockSize;
          this.setting.general.hideLosingFocus = setting.general.hideLosingFocus;
          this.setting.general.hideTray = setting.general.hideTray;
          this.setting.general.showHideMouseWheelClick = setting.general.showHideMouseWheelClick;
          this.setting.general.fixedPosition = setting.general.fixedPosition;
          this.setting.general.alwaysCenter = setting.general.alwaysCenter;
          this.setting.general.showFollowMousePosition = setting.general.showFollowMousePosition;
          this.setting.general.notDisturb = setting.general.notDisturb;
          this.setting.general.doubleClickTaskbar = setting.general.doubleClickTaskbar;
          this.setting.general.delayDisplayMS = setting.general.delayDisplayMS;
          this.setting.general.delayHidingMS = setting.general.delayHidingMS;
          this.setting.general.switchEnglish = setting.general.switchEnglish;
        }
        if (setting.appearance != null) {
          this.setting.appearance.theme = setting.appearance.theme;
          this.setting.appearance.transparency = setting.appearance.transparency;
          this.setting.appearance.backgroundTransparency = setting.appearance.backgroundTransparency;
          this.setting.appearance.useFontShadow = setting.appearance.useFontShadow;
          this.setting.appearance.fontShadow = setting.appearance.fontShadow;
          this.setting.appearance.backgroundImage = setting.appearance.backgroundImage;
          this.setting.appearance.backgroundImageMode = setting.appearance.backgroundImageMode;
          this.setting.appearance.backgroundImagePosition = setting.appearance.backgroundImagePosition;
          this.setting.appearance.backgroundImageTransparency = setting.appearance.backgroundImageTransparency;
          this.setting.appearance.windowRoundedCorners = setting.appearance.windowRoundedCorners;
          this.setting.appearance.title = setting.appearance.title;
        }
        if (setting.classification != null) {
          this.setting.classification.width = setting.classification.width;
          this.setting.classification.layout = setting.classification.layout;
          this.setting.classification.mouseHover = setting.classification.mouseHover;
          this.setting.classification.mouseHoverMS = setting.classification.mouseHoverMS;
          this.setting.classification.mouseWheel = setting.classification.mouseWheel;
          this.setting.classification.rememberSelectionState = setting.classification.rememberSelectionState;
          this.setting.classification.nameAlign = setting.classification.nameAlign;
          this.setting.classification.mode = setting.classification.mode;
          this.setting.classification.autoSwitchClassification = setting.classification.autoSwitchClassification;
          this.setting.classification.hideWindowFoldChildClassification = setting.classification.hideWindowFoldChildClassification;
          this.setting.classification.switchClassificationCollapseOtherSubClassification =
            setting.classification.switchClassificationCollapseOtherSubClassification;
        }
        if (setting.item != null) {
          this.setting.item.layout = setting.item.layout;
          this.setting.item.iconSize = setting.item.iconSize;
          this.setting.item.searchShortcutKey = setting.item.searchShortcutKey;
          this.setting.item.doubleClickRunItem = setting.item.doubleClickRunItem;
          this.setting.item.openAfterHideMainInterface = setting.item.openAfterHideMainInterface;
          this.setting.item.useItemOpen = setting.item.useItemOpen;
          this.setting.item.openNumber = setting.item.openNumber;
          this.setting.item.hideItemName = setting.item.hideItemName;
          this.setting.item.hideEllipsis = setting.item.hideEllipsis;
          this.setting.item.itemNameRowCount = setting.item.itemNameRowCount;
          this.setting.item.width = setting.item.width;
          this.setting.item.columnNumber = setting.item.columnNumber;
          this.setting.item.checkInvalidItem = setting.item.checkInvalidItem;
          this.setting.item.fontSize = setting.item.fontSize;
          this.setting.item.fontWeight = setting.item.fontWeight;
          this.setting.item.fontLineHeight = setting.item.fontLineHeight;
        }
        if (setting.quickSearch != null) {
          this.setting.quickSearch.enable = setting.quickSearch.enable;
          this.setting.quickSearch.showHideShortcutKey = setting.quickSearch.showHideShortcutKey;
          this.setting.quickSearch.openShortcutKey = setting.quickSearch.openShortcutKey;
          this.setting.quickSearch.hideLosingFocus = setting.quickSearch.hideLosingFocus;
          this.setting.quickSearch.openNow = setting.quickSearch.openNow;
          this.setting.quickSearch.showHistory = setting.quickSearch.showHistory;
          this.setting.quickSearch.showHistorySort = setting.quickSearch.showHistorySort;
          this.setting.quickSearch.useItemOpen = setting.quickSearch.useItemOpen;
          this.setting.quickSearch.openAfterHideQuickSearchWindow = setting.quickSearch.openAfterHideQuickSearchWindow;
          this.setting.quickSearch.matchingConditionsRemark = setting.quickSearch.matchingConditionsRemark;
        }
        if (setting.webSearch != null) {
          this.setting.webSearch.searchSourceList = setting.webSearch.searchSourceList;
          this.setting.webSearch.mode = setting.webSearch.mode;
        }
        if (setting.network != null) {
          this.setting.network.useProxy = setting.network.useProxy;
          if (setting.network.proxy != null) {
            this.setting.network.proxy.address = setting.network.proxy.address;
            this.setting.network.proxy.username = setting.network.proxy.username;
            this.setting.network.proxy.password = setting.network.proxy.password;
          }
        }
        if (setting.subClassification != null) {
          this.setting.subClassification.itemAreaNameFontSize = setting.subClassification.itemAreaNameFontSize;
          this.setting.subClassification.itemAreaNameFontWeight = setting.subClassification.itemAreaNameFontWeight;
          this.setting.subClassification.itemAreaNameFontLineHeight = setting.subClassification.itemAreaNameFontLineHeight;
        }
      }
      this.$store.state.setting = this.setting;
      // 设置语言
      this.$store.state.setting.general.language = this.setting.general.language;
      this.$store.state.currentLanguage = this.$store.state.language[this.$store.state.setting.general.language];
    },
    /**
     * 监听屏幕大小变化
     */
    resize() {
      // 获取窗口高度
      this.height = window.innerHeight - 34;
    },
    createStyle() {
      // 找到要删除的 style 标签
      let styleElement = document.getElementById("range-style");
      // 如果找到了 style 标签，则从其父节点中移除
      if (styleElement) {
        styleElement.parentNode.removeChild(styleElement);
      }
      // 创建一个新的伪类样式规则
      let style = document.createElement("style");
      style.setAttribute("id", "range-style");
      style.type = "text/css";
      // 设置伪类样式规则的内容
      style.innerHTML =
        ".range::-webkit-slider-runnable-track {" +
        "background-color: " +
        this.setting.appearance.theme.minorBackground +
        ";" +
        "border-radius: 0.5rem;" +
        "height: 4px;" +
        "}" +
        ".range::-webkit-slider-thumb {" +
        "-webkit-appearance: none; " +
        "appearance: none;" +
        "margin-top: -8px;" +
        "border-radius: 50%;" +
        "background-color: " +
        this.setting.appearance.theme.minorBackground +
        ";" +
        "border: 1px solid " +
        this.setting.appearance.theme.mainBackground +
        ";" +
        "width: 20px;" +
        "height: 20px;" +
        "}";
      // 将伪类样式规则添加到 head 元素中
      document.head.appendChild(style);

      // 找到要删除的 style 标签
      let colorComponentStyleElement = document.getElementById("color-component-style");
      // 如果找到了 style 标签，则从其父节点中移除
      if (colorComponentStyleElement) {
        colorComponentStyleElement.parentNode.removeChild(colorComponentStyleElement);
      }
      // 创建一个新的伪类样式规则
      colorComponentStyleElement = document.createElement("style");
      colorComponentStyleElement.setAttribute("id", "color-component-style");
      colorComponentStyleElement.type = "text/css";
      // 设置伪类样式规则的内容
      colorComponentStyleElement.innerHTML =
        ".vc-chrome-body {" +
        "  background-color: " +
        this.setting.appearance.theme.mainBackground +
        ";" +
        "}" +
        ".vc-chrome-toggle-btn {" +
        "  left: 10px;" +
        "  top: 10px;" +
        "  width: auto;" +
        "}" +
        ".vc-chrome-fields .vc-input__input {" +
        "  background-color: " +
        this.setting.appearance.theme.mainBackground +
        ";" +
        "  box-shadow: none;" +
        "  border: 1px solid " +
        this.setting.appearance.theme.border +
        ";" +
        "  color: " +
        this.setting.appearance.theme.fontBasic +
        ";" +
        "}" +
        ".vc-chrome-toggle-icon {" +
        "  margin-right: 0;" +
        "  margin-top: 0;" +
        "}" +
        ".vc-chrome-toggle-icon-highlight {" +
        "  background-color: transparent;" +
        "}" +
        ".vc-chrome-fields .vc-input__label {" +
        "  color: " +
        this.setting.appearance.theme.fontBasic +
        ";" +
        "}";
      // 将伪类样式规则添加到 head 元素中
      document.head.appendChild(colorComponentStyleElement);

      // 找到要删除的 style 标签
      let scrollStyleElement = document.getElementById("scroll-style");
      // 如果找到了 style 标签，则从其父节点中移除
      if (scrollStyleElement) {
        scrollStyleElement.parentNode.removeChild(scrollStyleElement);
      }
      // 创建一个新的伪类样式规则
      scrollStyleElement = document.createElement("style");
      scrollStyleElement.setAttribute("id", "scroll-style");
      scrollStyleElement.type = "text/css";
      // 设置伪类样式规则的内容
      scrollStyleElement.innerHTML =
        ".simplebar-scrollbar::before {" +
        "  background-color: " +
        this.setting.appearance.theme.minorBackground +
        ";" +
        "  right: 0;" +
        "}" +
        "textarea::-webkit-scrollbar-thumb {" +
        "  background-color: " +
        this.setting.appearance.theme.minorBackground +
        ";" +
        "border-radius: 7px;" +
        "}";
      // 将伪类样式规则添加到 head 元素中
      document.head.appendChild(scrollStyleElement);
    },
    /**
     * 监听键盘
     * @param e
     */
    keydown(e) {
      // 禁止页面刷新
      let sk = CommonJS.setShortcutKey(e, null, false);
      if (!this.strIsEmpty(sk) && (sk.toLowerCase() == "ctrl + r" || sk.toLowerCase() == "ctrl + shift + r" || sk.toLowerCase() == "f5")) {
        e.preventDefault();
        return;
      }
      // 禁止关闭页面
      if (!this.strIsEmpty(sk) && sk.toLowerCase() == "ctrl + w") {
        e.preventDefault();
        return;
      }
      // ESC
      if (e.keyCode == 27) {
        this.close();
        e.preventDefault();
        return;
      }
    },
    setMenuList() {
      this.menuList = [
        {
          id: 1,
          name: this.$store.state.currentLanguage.general,
        },
        {
          id: 2,
          name: this.$store.state.currentLanguage.appearance,
        },
        {
          id: 4,
          name: this.$store.state.currentLanguage.classification,
        },
        {
          id: 10,
          name: this.$store.state.currentLanguage.subClassification,
        },
        {
          id: 3,
          name: this.$store.state.currentLanguage.item,
        },
        {
          id: 6,
          name: this.$store.state.currentLanguage.data,
        },
        {
          id: 7,
          name: this.$store.state.currentLanguage.quickSearch,
        },
        {
          id: 8,
          name: this.$store.state.currentLanguage.webSearch,
        },
        {
          id: 9,
          name: this.$store.state.currentLanguage.network,
        },
      ];
    },
    /**
     * set
     */
    set() {
      ipcRenderer.send(
        "setSetting",
        JSON.stringify({
          setting: this.setting,
          other: {
            main: true,
            search: true,
            setting: false,
          },
        })
      );
      this.$store.state.setting = this.setting;
      this.$store.state.setting.general.language = this.setting.general.language;
      this.$store.state.currentLanguage = this.$store.state.language[this.$store.state.setting.general.language];
      ipcRenderer.send("setCurrentLanguage", JSON.stringify(this.$store.state.currentLanguage));
    },
    /**
     * set
     */
    setTheme() {
      this.setting.appearance.theme.name = "custom";
      this.set();
      this.createStyle();
    },
    /**
     * 设置开机启动
     */
    setAutoStart() {
      this.set();
      ipcRenderer.send("setAutoLaunch", this.setting.general.startup);
    },
    /**
     * 设置隐藏托盘图标
     */
    setHideTray() {
      this.set();
      ipcRenderer.send("setTray", !this.setting.general.hideTray);
    },
    /**
     * 设置语言
     */
    setLanguage() {
      this.set();
      this.setMenuList();
      this.setSelectList();
    },
    /**
     * 设置永远置顶
     */
    setAlwaysTop() {
      this.set();
      ipcRenderer.send("setAlwaysTop", this.setting.general.alwaysTop);
    },
    /**
     * 设置锁定尺寸
     */
    setLockSize() {
      this.set();
      ipcRenderer.send("setResize", !this.setting.general.lockSize);
    },
    /**
     * 设置固定位置
     */
    setFixedPosition() {
      this.set();
      ipcRenderer.send("setFixedPosition", [!this.setting.general.fixedPosition, this.setting.general.alwaysCenter]);
    },
    /**
     * 设置永远居中
     */
    setAlwaysCenter() {
      this.set();
      ipcRenderer.send("setAlwaysCenter", [this.setting.general.alwaysCenter, !this.setting.general.fixedPosition, this.setting.general.alwaysCenter]);
    },
    /**
     * 设置背景图透明度
     */
    setBackgroundImageTransparency() {
      if (this.setting.appearance.backgroundImageTransparency == null || this.setting.appearance.backgroundImageTransparency < 0.1) {
        this.setting.appearance.backgroundImageTransparency = 0.1;
      }
      this.set();
    },
    /**
     * 设置透明度
     */
    setTransparency() {
      if (this.setting.appearance.transparency == null || this.setting.appearance.transparency < 0.1) {
        this.setting.appearance.transparency = 0.1;
      }
      this.set();
      ipcRenderer.send("setOpacity", this.setting.appearance.transparency);
    },
    /**
     * 设置背景透明度
     */
    setBackgroundTransparency() {
      if (this.setting.appearance.backgroundTransparency == null || this.setting.appearance.backgroundTransparency < 0.1) {
        this.setting.appearance.backgroundTransparency = 0.1;
      }
      this.set();
      ipcRenderer.send("setBackgroundTransparency", this.setting.appearance.backgroundTransparency);
    },
    /**
     * 设置快捷键
     */
    setShortcutKey: CommonJS.setShortcutKey,
    /**
     * 设置显示/隐藏快捷键
     */
    setShowHideShortcutKey() {
      this.checkShortcutKeys(this.setting.general.showHideShortcutKey, "showHideShortcutKey");
      if (this.shortcutKeyCheckMessage != null) {
        this.setting.general.showHideShortcutKey = null;
        this.temp.showHideShortcutKey = null;
      }
      this.set();
      ipcRenderer.send("setShortcutKey", JSON.stringify(this.setting));
    },
    /**
     * 校验搜索快捷键
     */
    setSearchShortcutKey() {
      this.checkShortcutKeys(this.setting.item.searchShortcutKey, "searchShortcutKey");
      if (this.shortcutKeyCheckMessage != null) {
        this.setting.item.searchShortcutKey = null;
        this.temp.searchShortcutKey = null;
      }
      this.set();
    },
    /**
     * 校验显示/隐藏快捷搜索快捷键
     */
    setQuickSearchShowHideShortcutKey() {
      this.checkShortcutKeys(this.setting.quickSearch.showHideShortcutKey, "quickSearchShowHideShortcutKey");
      if (this.shortcutKeyCheckMessage != null) {
        this.setting.quickSearch.showHideShortcutKey = null;
        this.temp.quickSearchShortcutKey = null;
      }
      this.set();
      ipcRenderer.send("setShortcutKey", JSON.stringify(this.setting));
    },
    /**
     * 校验快捷键
     */
    checkShortcutKeys(shortcutKey, name) {
      this.shortcutKeyCheckMessage = null;
      if (!this.strIsEmpty(shortcutKey)) {
        if (!CommonJS.checkShortcutKeys(shortcutKey.trim())) {
          this.shortcutKeyCheckMessage = this.$store.state.currentLanguage.shortcutKeyIncompleteMessage;
        } else {
          // 校验应用程序内快捷是否重复
          this.shortcutKeyCheckMessage = CommonJS.checkAppShortcutKeysDuplicate(shortcutKey, this.$store.state.appShortcutKeyMap);
          if (this.shortcutKeyCheckMessage == null) {
            // 校验设置中的快捷键是否重复
            this.shortcutKeyCheckMessage = CommonJS.checkSettingShortcutKeysDuplicate(shortcutKey, this.$store.state.setting, name);
          }
        }
      }
      if (this.shortcutKeyCheckMessage != null) {
        ipcRenderer.send("errorMessage", this.shortcutKeyCheckMessage);
      }
    },
    /**
     * 切换主题
     */
    changeTheme(theme) {
      this.setting.appearance.theme = JSON.parse(JSON.stringify(theme));
      this.set();
      this.createStyle();
    },
    /**
     * 关闭窗口
     */
    close() {
      ipcRenderer.send("closeSettingWindow");
    },
    /**
     * 设置数据列表
     */
    setSelectList() {
      this.languageList = [
        {
          value: "chinese",
          label: this.$store.state.currentLanguage.chinese,
        },
        {
          value: "traditionalChinese",
          label: this.$store.state.currentLanguage.traditionalChinese,
        },
      ];
      this.itemLayoutList = [
        {
          value: "tile",
          label: this.$store.state.currentLanguage.tile,
        },
        {
          value: "list",
          label: this.$store.state.currentLanguage.list,
        },
      ];
      this.iconSizeList = [
        {
          value: 48,
          label: this.$store.state.currentLanguage.extraLarge,
        },
        {
          value: 40,
          label: this.$store.state.currentLanguage.large,
        },
        {
          value: 32,
          label: this.$store.state.currentLanguage.medium,
        },
        {
          value: 24,
          label: this.$store.state.currentLanguage.small,
        },
      ];
      this.classificationLayoutList = [
        {
          value: "top",
          label: this.$store.state.currentLanguage.top,
        },
        {
          value: "left",
          label: this.$store.state.currentLanguage.left,
        },
        {
          value: "right",
          label: this.$store.state.currentLanguage.right,
        },
      ];
      this.alignList = [
        {
          value: "left",
          label: this.$store.state.currentLanguage.left,
        },
        {
          value: "center",
          label: this.$store.state.currentLanguage.center,
        },
      ];
      this.backgroundImageModeList = [
        {
          value: "repeat",
          label: this.$store.state.currentLanguage.repeat,
        },
        {
          value: "no-repeat",
          label: this.$store.state.currentLanguage.notRepeat,
        },
        {
          value: "space",
          label: this.$store.state.currentLanguage.tile,
        },
        {
          value: "round",
          label: this.$store.state.currentLanguage.zoom,
        },
      ];
      this.backgroundImagePositionList = [
        {
          value: "default",
          label: this.$store.state.currentLanguage.default,
        },
        {
          value: "top",
          label: this.$store.state.currentLanguage.top,
        },
        {
          value: "bottom",
          label: this.$store.state.currentLanguage.bottom,
        },
        {
          value: "center",
          label: this.$store.state.currentLanguage.center,
        },
        {
          value: "left",
          label: this.$store.state.currentLanguage.left,
        },
        {
          value: "right",
          label: this.$store.state.currentLanguage.right,
        },
      ];
      this.classificationModeList = [
        {
          value: "normal",
          label: this.$store.state.currentLanguage.normal,
        },
        {
          value: "icon",
          label: this.$store.state.currentLanguage.icon,
        },
      ];
      this.quickSearchOpenShortcutKeyList = [
        {
          value: "none",
          label: this.$store.state.currentLanguage.none,
        },
        {
          value: "numberKey",
          label: this.$store.state.currentLanguage.numberKey,
        },
        {
          value: "ctrlNumberKey",
          label: this.$store.state.currentLanguage.ctrlNumberKey,
        },
        {
          value: "altNumberKey",
          label: this.$store.state.currentLanguage.altNumberKey,
        },
      ];
      this.webSearchModeList = [
        {
          value: 0,
          label: this.$store.state.currentLanguage.colonKeywordSpace,
        },
        {
          value: 1,
          label: this.$store.state.currentLanguage.keywordSpace,
        },
      ];
      this.showHistorySortList = [
        {
          value: "lastOpen",
          label: this.$store.state.currentLanguage.byLastOpen,
        },
        {
          value: "openNumber",
          label: this.$store.state.currentLanguage.byOpenNumber,
        },
      ];
    },
    /**
     * 设置分类宽度
     */
    setClassificationWidth() {
      if (this.setting.classification.width == null || typeof this.setting.classification.width == "string") {
        this.setting.classification.width = 0;
      }
      this.set();
    },
    chooseDataDirectory() {
      let newDir = ipcRenderer.sendSync("chooseDataDirectory");
      if (!this.strIsEmpty(newDir) && this.appDataPath != newDir) {
        // 提示
        ipcRenderer.send("promptChangeDataDirectory", newDir);
      }
    },
    defaultDataDirectory() {
      // 提示
      ipcRenderer.send("promptChangeDataDirectory", null);
    },
    /**
     * 修改特殊快捷键
     * @param shortcutKey
     */
    changeShowHideShortcutKey(shortcutKey) {
      this.temp.showHideShortcutKey = shortcutKey;
      this.setting.general.showHideShortcutKey = shortcutKey;
      this.setShowHideShortcutKey();
    },
    /**
     * 修改特殊快捷键
     * @param shortcutKey
     */
    changeQuickSearchShowHideShortcutKey(shortcutKey) {
      this.temp.quickSearchShortcutKey = shortcutKey;
      this.setting.quickSearch.showHideShortcutKey = shortcutKey;
      this.setQuickSearchShowHideShortcutKey();
    },
    /**
     * 设置启动快捷搜索
     */
    setEnableQuickSearch() {
      this.set();
      ipcRenderer.send("setEnableQuickSearch", this.setting.quickSearch.enable);
    },
    /**
     * 显示新增搜索源
     */
    showAddSearchSource() {
      this.searchSourceType = "add";
      this.searchSourceId = null;
      this.searchSourceKeyword = null;
      this.searchSourceName = null;
      this.searchSourceURL = null;
    },
    /**
     * 显示编辑搜索源
     */
    showEditSearchSource(id, keyword, name, URL, description) {
      this.searchSourceType = "edit";
      this.searchSourceId = id;
      this.searchSourceKeyword = keyword;
      this.searchSourceName = name;
      this.searchSourceURL = URL;
      this.searchSourceDescription = description;
    },
    /**
     * 新增搜索源
     */
    addSearchSource() {
      // 新增
      let data = {
        id: CommonJS.getNewId(this.setting.webSearch.searchSourceList),
        keyword: this.searchSourceKeyword,
        name: this.searchSourceName,
        URL: this.searchSourceURL,
        description: this.searchSourceDescription,
      };
      this.setting.webSearch.searchSourceList.push(data);
      this.set();
      this.showEditSearchSource(data.id, data.keyword, data.name, data.URL, data.description);
    },
    /**
     * 编辑搜索源
     */
    editSearchSource() {
      for (let searchSource of this.setting.webSearch.searchSourceList) {
        if (searchSource.id == this.searchSourceId) {
          searchSource.keyword = this.searchSourceKeyword;
          searchSource.name = this.searchSourceName;
          searchSource.URL = this.searchSourceURL;
          searchSource.description = this.searchSourceDescription;
          break;
        }
      }
      this.set();
    },
    /**
     * 校验搜索源内容
     * @returns {boolean}
     */
    checkSearchSource() {
      if (this.searchSourceType == "edit") {
        if (this.searchSourceId == null) {
          return false;
        }
      }
      if (this.strIsEmpty(this.searchSourceKeyword)) {
        return false;
      }
      if (this.strIsEmpty(this.searchSourceName)) {
        return false;
      }
      if (this.strIsEmpty(this.searchSourceURL)) {
        return false;
      }
      return true;
    },
    /**
     * 保存搜索源
     */
    saveSearchSource() {
      if (this.checkSearchSource()) {
        if (this.searchSourceType == "add") {
          this.addSearchSource();
        } else {
          this.editSearchSource();
        }
      }
    },
    /**
     * 删除搜索源
     */
    deleteSearchSource() {
      if (this.searchSourceId != null) {
        let index;
        for (let i = 0; i < this.setting.webSearch.searchSourceList.length; i++) {
          if (this.setting.webSearch.searchSourceList[i].id == this.searchSourceId) {
            index = i;
            break;
          }
        }
        if (index != null) {
          this.setting.webSearch.searchSourceList.splice(index, 1);
        }
        this.set();
        this.closeSaveSearchSource();
      }
    },
    /**
     * 关闭保存搜索源
     */
    closeSaveSearchSource() {
      this.searchSourceType = null;
      this.searchSourceId = null;
      this.searchSourceKeyword = null;
      this.searchSourceName = null;
      this.searchSourceURL = null;
    },
    /**
     * 上传背景图
     * @param e
     */
    uploadBackgroundImage(e) {
      let file = e.target.files[0];
      this.setting.appearance.backgroundImage = ipcRenderer.sendSync("copyBackgroundImage", file.path);
      this.set();
      e.target.value = "";
      // 转换为base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.$store.state.backgroundImage = reader.result;
      };
    },
    /**
     * 删除背景图
     */
    deleteBackgroundImage() {
      this.setting.appearance.backgroundImage = null;
      this.set();
    },
    /**
     * 设置延迟显示
     */
    setDelayDisplayMS() {
      if (this.setting.general.delayDisplayMS == null || typeof this.setting.general.delayDisplayMS == "string") {
        this.setting.general.delayDisplayMS = 0;
      }
      this.set();
    },
    /**
     * 设置延迟隐藏
     */
    setDelayHidingMS() {
      if (this.setting.general.delayHidingMS == null || typeof this.setting.general.delayHidingMS == "string") {
        this.setting.general.delayHidingMS = 0;
      }
      this.set();
    },
    /**
     * 设置鼠标悬停毫秒
     */
    setMouseHoverMS() {
      if (this.setting.classification.mouseHoverMS == null || typeof this.setting.classification.mouseHoverMS == "string") {
        this.setting.classification.mouseHoverMS = 0;
      }
      this.set();
    },
    /**
     * 设置项目宽度
     */
    setItemWidth() {
      if (this.setting.item.width == null || typeof this.setting.item.width == "string") {
        this.setting.item.width = 0;
      }
      this.set();
    },
    /**
     * 设置项目宽度
     */
    setItemFontSize() {
      if (this.setting.item.fontSize == null || typeof this.setting.item.fontSize == "string") {
        this.setting.item.fontSize = 0;
      }
      this.set();
    },
    /**
     * 设置子分类项目区域字体大小
     */
    setItemAreaNameFontSize() {
      if (this.setting.subClassification.itemAreaNameFontSize == null || typeof this.setting.subClassification.itemAreaNameFontSize == "string") {
        this.setting.subClassification.itemAreaNameFontSize = 0;
      }
      this.set();
    },
  },
};
</script>

<style scoped>
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type="range"]:focus {
  outline: none;
}
</style>
