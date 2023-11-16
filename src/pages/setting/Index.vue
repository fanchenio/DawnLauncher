<template>
  <div
    class="h-full text-sm"
    :style="{
      backgroundColor: store.setting.appearance.theme.mainBackgroundColor,
      color: store.setting.appearance.theme.mainFontColor,
      height: height + 'px',
    }"
  >
    <div class="flex items-center px-2 app-region-drag">
      <h1 class="w-full text-sm flex items-center h-[34px] app-region-drag">
        {{ store.language.settings }}
      </h1>
      <Icon
        class="ml-2 close-icon app-region-no-drag"
        size="18"
        @mouseover="setIconStyle($event, 'close-icon', store.setting)"
        @mouseout="removeIconStyle($event, 'close-icon')"
        @click="close"
        :title="store.language.close"
      >
        <CloseRound></CloseRound>
      </Icon>
    </div>
    <div class="flex">
      <ul class="px-2">
        <li
          v-for="(menu, index) of menuList"
          :key="'menu-' + index"
          class="menu mb-1 px-2 flex items-center relative h-[30px] rounded"
          :class="[
            `${
              store.setting.classification.nameAlign === 'center'
                ? 'justify-center'
                : ''
            }`,
          ]"
          @mouseover="menuItemMouseover"
          @mouseout="menuItemMouseout($event, menu.id)"
          :style="{
            color:
              selectedMenuId === menu.id
                ? store.setting.appearance.theme.secondFontColor
                : undefined,
            backgroundColor:
              selectedMenuId === menu.id
                ? store.setting.appearance.theme.secondBackgroundColor
                : undefined,
          }"
          @click="changeMenu(menu.id)"
        >
          {{ menu.label }}
        </li>
      </ul>
      <div class="flex-1">
        <!-- 页面高度 - 34（标题栏固定高度） - 底部按钮（固定高度） -->
        <div id="content" :style="{ maxHeight: height - 34 - 10 + 'px' }">
          <div class="mx-2" v-if="selectedMenuId === 0">
            <NForm
              label-placement="left"
              label-width="auto"
              :show-feedback="false"
              size="small"
            >
              <span class="block font-semibold">{{
                store.language.startup
              }}</span>
              <NFormItem class="mt-1">
                <NCheckbox
                  v-model:checked="setting.general.startup"
                  :focusable="false"
                  @update:checked="setStartup"
                  >{{ store.language.runSystemStartup }}</NCheckbox
                >
              </NFormItem>
              <NFormItem>
                <NCheckbox
                  v-model:checked="setting.general.startupTray"
                  :focusable="false"
                  >{{ store.language.startupTray }}</NCheckbox
                >
              </NFormItem>
              <NFormItem
                ><NCheckbox
                  v-model:checked="setting.general.hideTray"
                  :focusable="false"
                  @update:checked="setTray"
                  >{{ store.language.hideTray }}</NCheckbox
                ></NFormItem
              >
            </NForm>
            <NForm
              label-placement="left"
              label-width="auto"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.language
              }}</span>
              <NFormItem class="mt-2">
                <NSelect
                  v-model:value="setting.general.language"
                  :options="languageOptions"
                  size="small"
                ></NSelect>
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              label-width="auto"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.showHide
              }}</span>
              <NFormItem class="mt-1">
                <NCheckbox
                  v-model:checked="setting.general.showFollowMousePosition"
                  :focusable="false"
                  >{{ store.language.showFollowMousePosition }}</NCheckbox
                >
              </NFormItem>
              <NFormItem>
                <NCheckbox
                  v-model:checked="setting.general.showHideMouseWheelClick"
                  :focusable="false"
                  >{{ store.language.middleClick }}</NCheckbox
                >
              </NFormItem>
              <NFormItem
                ><NCheckbox
                  v-model:checked="setting.general.showHideDoubleClickTaskbar"
                  :focusable="false"
                  >{{ store.language.doubleClickTaskbar }}</NCheckbox
                ></NFormItem
              >
              <NFormItem :label="store.language.shortcutKey" class="mt-0.5">
                <NInput
                  v-model:value="tempGeneralShowHideShortcutKey"
                  clearable
                  size="small"
                  placeholder=""
                  @keydown="
                    tempGeneralShowHideShortcutKey = getShortcutKey(
                      $event,
                      tempGeneralShowHideShortcutKey,
                      true
                    )
                  "
                  @blur="checkGeneralShowHideShortcutKey"
                ></NInput>
              </NFormItem>
              <div class="flex mt-1">
                <NButton
                  type="primary"
                  size="small"
                  class="mr-1"
                  @click="
                    (tempGeneralShowHideShortcutKey = 'Ctrl + Space'),
                      checkGeneralShowHideShortcutKey()
                  "
                  >Ctrl + Space</NButton
                >
                <NButton
                  type="primary"
                  size="small"
                  @click="
                    (tempGeneralShowHideShortcutKey = 'Alt + Space'),
                      checkGeneralShowHideShortcutKey()
                  "
                  >Alt + Space</NButton
                >
              </div>
            </NForm>
            <NForm
              label-placement="left"
              label-width="auto"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.search
              }}</span>
              <NFormItem :label="store.language.shortcutKey" class="mt-1">
                <NInput
                  v-model:value="tempGeneralSearchShowHideShortcutKey"
                  clearable
                  size="small"
                  placeholder=""
                  @keydown="
                    tempGeneralSearchShowHideShortcutKey = getShortcutKey(
                      $event,
                      tempGeneralSearchShowHideShortcutKey,
                      true
                    )
                  "
                  @blur="checkGeneralSearchShowHideShortcutKey"
                ></NInput>
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              label-width="auto"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.window
              }}</span>
              <NFormItem class="mt-1"
                ><NCheckbox
                  v-model:checked="setting.general.alwaysTop"
                  :focusable="false"
                  @update:checked="setAlwaysTop"
                  >{{ store.language.alwaysTop }}</NCheckbox
                ></NFormItem
              >
              <NFormItem
                ><NCheckbox
                  v-model:checked="setting.general.lockSize"
                  :focusable="false"
                  @update:checked="setLockSize"
                  >{{ store.language.lockSize }}</NCheckbox
                ></NFormItem
              >
              <NFormItem
                ><NCheckbox
                  v-model:checked="setting.general.fixedPosition"
                  :focusable="false"
                  @update:checked="setFixedPosition"
                  >{{ store.language.fixedPosition }}</NCheckbox
                ></NFormItem
              >
              <NFormItem
                ><NCheckbox
                  v-model:checked="setting.general.alwaysCenter"
                  :focusable="false"
                  @update:checked="setAlwaysCenter"
                  >{{ store.language.alwaysCenter }}</NCheckbox
                ></NFormItem
              >
              <NFormItem
                ><NCheckbox
                  v-model:checked="setting.general.edgeAdsorb"
                  :focusable="false"
                  @update:checked="setEdgeAdsorb"
                  >{{ store.language.edgeDock }}</NCheckbox
                ></NFormItem
              >
              <NFormItem
                ><NCheckbox
                  v-model:checked="setting.general.hideLoseFocus"
                  :focusable="false"
                  >{{ store.language.hideLoseFocus }}</NCheckbox
                ></NFormItem
              >
              <NFormItem
                ><NCheckbox
                  v-model:checked="setting.general.edgeAutoHide"
                  :focusable="false"
                  @update:checked="setAutoHide"
                  >{{ store.language.edgeAutoHide }}</NCheckbox
                >
              </NFormItem>
              <NFormItem
                :label="store.language.delayDisplay"
                v-if="setting.general.edgeAutoHide"
              >
                <NInputNumber
                  v-model:value="setting.general.delayDisplayMs"
                  size="small"
                  :min="0"
                  class="w-full"
                  :show-button="false"
                  placeholder=""
                >
                  <template #suffix>
                    {{ store.language.millisecond }}
                  </template></NInputNumber
                >
              </NFormItem>
              <NFormItem
                :label="store.language.delayHide"
                class="mt-1"
                v-if="setting.general.edgeAutoHide"
              >
                <NInputNumber
                  v-model:value="setting.general.delayHideMs"
                  size="small"
                  :min="0"
                  class="w-full"
                  :show-button="false"
                  placeholder=""
                >
                  <template #suffix>
                    {{ store.language.millisecond }}
                  </template></NInputNumber
                >
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              label-width="auto"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.functions
              }}</span>
              <NFormItem class="mt-1"
                ><NCheckbox
                  v-model:checked="setting.general.notDisturb"
                  :focusable="false"
                  >{{ store.language.notDisturb }}</NCheckbox
                >
              </NFormItem>
              <Desc :content="store.language.notDisturbPrompt"></Desc>
              <NFormItem
                ><NCheckbox
                  v-model:checked="setting.general.switchEnglish"
                  :focusable="false"
                  >{{ store.language.switchEnglish }}</NCheckbox
                ></NFormItem
              >
            </NForm>
            <NForm
              label-placement="left"
              label-width="auto"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.update
              }}</span>
              <NFormItem class="mt-1"
                ><NCheckbox
                  v-model:checked="setting.general.checkUpdates"
                  :focusable="false"
                  >{{ store.language.checkUpdates }}</NCheckbox
                >
              </NFormItem>
            </NForm>
          </div>
          <div class="mx-2" v-if="selectedMenuId === 1">
            <div>
              <span class="block font-semibold">{{
                store.language.theme
              }}</span>
              <div class="flex items-center flex-wrap gap-[4px] pt-2">
                <div
                  v-for="(theme, index) of themeList"
                  class="border rounded w-10 h-10 border-solid"
                  :style="{
                    backgroundColor: theme.name,
                    borderColor: store.setting.appearance.theme.borderColor,
                  }"
                  :key="'theme-' + index"
                  @click="changeTheme(theme)"
                >
                  <template v-if="theme.name.split(',').length > 1">
                    <div
                      class="rounded-l w-1/2 h-full float-left"
                      :style="{ backgroundColor: theme.name.split(',')[0] }"
                    ></div>
                    <div
                      class="rounded-r w-1/2 h-full float-right"
                      :style="{ backgroundColor: theme.name.split(',')[1] }"
                    ></div>
                  </template>
                  <template v-else>
                    <div
                      class="rounded w-full h-full"
                      :style="{ backgroundColor: theme.name }"
                    ></div>
                  </template>
                </div>
              </div>
            </div>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.color
              }}</span>
              <NFormItem class="mt-1" :label="store.language.mainColor">
                <NColorPicker
                  :modes="['hex']"
                  v-model:value="mainBackgroundColor"
                  @complete="changeMainBackgroundColor"
                  :to="false"
                ></NColorPicker>
              </NFormItem>
              <NFormItem class="mt-1" :label="store.language.secondaryColor">
                <NColorPicker
                  :modes="['hex']"
                  v-model:value="secondBackgroundColor"
                  @complete="changeSecondBackgroundColor"
                  :to="false"
                ></NColorPicker>
              </NFormItem>
              <NFormItem class="mt-1" :label="store.language.fontMainColor">
                <NColorPicker
                  :modes="['hex']"
                  v-model:value="mainFontColor"
                  @complete="changeMainFontColor"
                  :to="false"
                ></NColorPicker>
              </NFormItem>
              <NFormItem
                class="mt-1"
                :label="store.language.fontSecondaryColor"
              >
                <NColorPicker
                  :modes="['hex']"
                  v-model:value="secondFontColor"
                  @complete="changeSecondFontColor"
                  :to="false"
                ></NColorPicker>
              </NFormItem>
              <NFormItem class="mt-1" :label="store.language.borderColor">
                <NColorPicker
                  :modes="['hex']"
                  v-model:value="borderColor"
                  @complete="changeBorderColor"
                  :to="false"
                ></NColorPicker>
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold"
                >{{ store.language.backgroundTransparent }}({{
                  transparency
                }})</span
              >
              <NFormItem>
                <input
                  type="range"
                  v-model="transparency"
                  min="0.1"
                  max="1.0"
                  step="0.01"
                  class="mt-2 w-full range"
                  @change="setTransparency"
                />
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-1"
            >
              <span class="block font-semibold">{{
                store.language.backgroundImage
              }}</span>
              <div class="flex mt-2">
                <NButton
                  type="primary"
                  size="small"
                  class="mr-1"
                  @click="uploadBackgrounImage"
                  >{{ store.language.select }}</NButton
                >
                <NButton
                  type="primary"
                  size="small"
                  @click="deleteBackgroundImage"
                  >{{ store.language.delete }}</NButton
                >
              </div>
              <img
                v-if="
                  setting.appearance.backgroundImage && store.backgroundImage
                "
                :src="store.backgroundImage"
                class="h-[100px] mt-3 rounded"
              />
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
              v-if="setting.appearance.backgroundImage && store.backgroundImage"
            >
              <span class="block font-semibold"
                >{{ store.language.backgroundImageTransparent }}({{
                  setting.appearance.backgroundImageTransparency
                }})</span
              >
              <NFormItem>
                <input
                  type="range"
                  v-model="backgroundImageTransparency"
                  min="0.1"
                  max="1.0"
                  step="0.01"
                  class="mt-2 w-full range"
                  @change="setBackgroundImageTransparency"
                />
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-1"
              v-if="setting.appearance.backgroundImage && store.backgroundImage"
            >
              <span class="block font-semibold">{{
                store.language.backgroundImageMode
              }}</span>
              <NFormItem class="mt-2">
                <NSelect
                  v-model:value="setting.appearance.backgroundImageMode"
                  :options="backgroundImageModeOptions"
                  size="small"
                ></NSelect>
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
              v-if="setting.appearance.backgroundImage && store.backgroundImage"
            >
              <span class="block font-semibold">{{
                store.language.backgroundImagePostion
              }}</span>
              <NFormItem class="mt-2">
                <NSelect
                  v-model:value="setting.appearance.backgroundImagePosition"
                  :options="backgroundImagePositionOptions"
                  size="small"
                ></NSelect>
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
              v-if="setting.appearance.transparency < 1"
            >
              <span class="block font-semibold">{{
                store.language.window
              }}</span>
              <NFormItem class="mt-1"
                ><NCheckbox
                  v-model:checked="setting.appearance.windowRounded"
                  :focusable="false"
                  >{{ store.language.roundedCorners }}</NCheckbox
                ></NFormItem
              >
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.fontShadow
              }}</span>
              <NFormItem class="mt-1">
                <NCheckbox
                  v-model:checked="setting.appearance.fontShadow"
                  :focusable="false"
                  >{{ store.language.enable }}</NCheckbox
                >
              </NFormItem>
              <NFormItem class="mt-1" v-if="setting.appearance.fontShadow">
                <NColorPicker
                  :modes="['hex']"
                  v-model:value="fontShadowColor"
                  @complete="changeFontShadowColor"
                ></NColorPicker>
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.title
              }}</span>
              <NFormItem :label="store.language.title" class="mt-1">
                <NInput
                  v-model:value="setting.appearance.title"
                  clearable
                  size="small"
                  placeholder=""
                ></NInput>
              </NFormItem>
            </NForm>
          </div>
          <div class="mx-2" v-if="selectedMenuId === 2">
            <NForm label-placement="left" :show-feedback="false" size="small">
              <span class="block font-semibold">{{ store.language.size }}</span>
              <NFormItem :label="store.language.width" class="mt-1">
                <NInputNumber
                  v-model:value="setting.classification.width"
                  size="small"
                  :min="0"
                  class="w-full"
                  placeholder=""
                  :show-button="false"
                ></NInputNumber>
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.layout
              }}</span>
              <NFormItem class="mt-2">
                <NSelect
                  v-model:value="setting.classification.layout"
                  :options="classificationLayoutOptions"
                  size="small"
                ></NSelect>
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{ store.language.mode }}</span>
              <NFormItem class="mt-2">
                <NSelect
                  v-model:value="setting.classification.mode"
                  :options="classificationModeOptions"
                  size="small"
                ></NSelect>
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{ store.language.name }}</span>
              <NFormItem :label="store.language.align" class="mt-1">
                <NSelect
                  v-model:value="setting.classification.nameAlign"
                  :options="classificationNameAlignOptions"
                  size="small"
                ></NSelect>
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.switch
              }}</span>
              <NFormItem class="mt-1">
                <NCheckbox
                  v-model:checked="setting.classification.mouseHover"
                  :focusable="false"
                  >{{ store.language.mouseHover }}</NCheckbox
                >
              </NFormItem>
              <NFormItem
                :label="store.language.hover"
                v-if="setting.classification.mouseHover"
              >
                <NInputNumber
                  v-model:value="setting.classification.mouseHoverMs"
                  size="small"
                  :min="0"
                  class="w-full"
                  :show-button="false"
                  placeholder=""
                >
                  <template #suffix>
                    {{ store.language.millisecond }}
                  </template></NInputNumber
                >
              </NFormItem>
              <NFormItem>
                <NCheckbox
                  v-model:checked="setting.classification.mouseWheel"
                  :focusable="false"
                  >{{ store.language.mouseWheel }}</NCheckbox
                >
              </NFormItem>
              <NFormItem>
                <NCheckbox
                  v-model:checked="
                    setting.classification.autoSwitchClassification
                  "
                  :focusable="false"
                  >{{ store.language.autoSwitchClassification }}</NCheckbox
                >
              </NFormItem>
              <NFormItem>
                <NCheckbox
                  v-model:checked="
                    setting.classification
                      .switchClassificationCollapseOtherSubClassification
                  "
                  :focusable="false"
                  >{{
                    store.language
                      .switchClassificationCollapseOtherSubClassification
                  }}</NCheckbox
                >
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.functions
              }}</span>
              <NFormItem class="mt-1">
                <NCheckbox
                  v-model:checked="
                    setting.classification.rememberSelectionState
                  "
                  :focusable="false"
                  >{{ store.language.rememberSelectionState }}</NCheckbox
                >
              </NFormItem>
              <NFormItem>
                <NCheckbox
                  v-model:checked="
                    setting.classification.hideWindowCollapseSubClassification
                  "
                  :focusable="false"
                  >{{
                    store.language.hideWindowCollapseSubClassification
                  }}</NCheckbox
                >
              </NFormItem>
            </NForm>
          </div>
          <div class="mx-2" v-if="selectedMenuId === 3">
            <NForm label-placement="left" :show-feedback="false" size="small">
              <span class="block font-semibold">{{ store.language.name }}</span>
              <NFormItem :label="store.language.align" class="mt-1">
                <NSelect
                  v-model:value="setting.subClassification.itemAreaNameAlign"
                  :options="itemAreaSubclassificationNameAlignOptions"
                  size="small"
                ></NSelect>
              </NFormItem>
              <NFormItem :label="store.language.fontSize" class="mt-1">
                <NInputNumber
                  v-model:value="setting.subClassification.itemAreaNameFontSize"
                  size="small"
                  :min="0"
                  class="w-full"
                  placeholder=""
                  :show-button="false"
                ></NInputNumber>
              </NFormItem>
              <NFormItem :label="store.language.fontWeight" class="mt-1">
                <NSelect
                  v-model:value="
                    setting.subClassification.itemAreaNameFontWeight
                  "
                  :options="fontWeightOptions"
                  size="small"
                ></NSelect>
              </NFormItem>
              <NFormItem :label="store.language.fontLineHeight" class="mt-1">
                <NSelect
                  v-model:value="
                    setting.subClassification.itemAreaNameFontLineHeight
                  "
                  :options="fontLineHeightOptions"
                  size="small"
                ></NSelect>
              </NFormItem>
            </NForm>
          </div>
          <div class="mx-2" v-if="selectedMenuId === 4">
            <NForm label-placement="left" :show-feedback="false" size="small">
              <span class="block font-semibold">{{
                store.language.layout
              }}</span>
              <NFormItem class="mt-2">
                <NSelect
                  v-model:value="setting.item.layout"
                  :options="itemLayoutOptions"
                  size="small"
                ></NSelect>
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{ store.language.size }}</span>
              <NFormItem :label="store.language.width" class="mt-1">
                <NInputNumber
                  v-model:value="setting.item.width"
                  size="small"
                  :min="0"
                  class="w-full"
                  placeholder=""
                  :show-button="false"
                ></NInputNumber>
              </NFormItem>
              <Desc
                class="mt-1"
                :content="store.language.layoutTileModeTakeEffect"
              ></Desc>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{ store.language.icon }}</span>
              <NFormItem :label="store.language.size" class="mt-1">
                <NSelect
                  v-model:value="setting.item.iconSize"
                  :options="itemIconSizeOptions"
                  size="small"
                ></NSelect>
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold"
                >{{ store.language.columnNumber }}({{
                  setting.item.columnNumber
                }})</span
              >
              <NFormItem>
                <input
                  type="range"
                  v-model="columnNumber"
                  min="1"
                  max="20"
                  step="1"
                  class="mt-2 w-full range"
                  @change="setColumnNumber"
                />
              </NFormItem>
              <Desc
                class="mt-1"
                :content="store.language.layoutListModeTakeEffect"
              ></Desc>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{ store.language.name }}</span>
              <NFormItem :label="store.language.lineNumber" class="mt-1">
                <NSelect
                  v-model:value="setting.item.itemNameRowCount"
                  :options="itemRowCountOptions"
                  size="small"
                ></NSelect>
              </NFormItem>
              <Desc
                class="mt-1"
                :content="store.language.layoutTileModeTakeEffect"
              ></Desc>
              <NFormItem :label="store.language.fontSize" class="mt-1">
                <NInputNumber
                  v-model:value="setting.item.fontSize"
                  size="small"
                  :min="0"
                  class="w-full"
                  placeholder=""
                  :show-button="false"
                ></NInputNumber>
              </NFormItem>
              <NFormItem :label="store.language.fontWeight" class="mt-1">
                <NSelect
                  v-model:value="setting.item.fontWeight"
                  :options="fontWeightOptions"
                  size="small"
                ></NSelect>
              </NFormItem>
              <NFormItem :label="store.language.fontLineHeight" class="mt-1">
                <NSelect
                  v-model:value="setting.item.fontLineHeight"
                  :options="fontLineHeightOptions"
                  size="small"
                ></NSelect>
              </NFormItem>
              <NFormItem>
                <NCheckbox
                  v-model:checked="setting.item.hideItemName"
                  :focusable="false"
                  >{{ store.language.hideName }}</NCheckbox
                >
              </NFormItem>
              <NFormItem>
                <NCheckbox
                  v-model:checked="setting.item.hideEllipsis"
                  :focusable="false"
                  >{{ store.language.hideEllipses }}</NCheckbox
                >
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{ store.language.open }}</span>
              <NFormItem class="mt-1">
                <NCheckbox
                  v-model:checked="setting.item.doubleClickOpen"
                  :focusable="false"
                  >{{ store.language.doubleClickOpen }}</NCheckbox
                >
              </NFormItem>
              <NFormItem>
                <NCheckbox
                  v-model:checked="setting.item.openAfterHideMainInterface"
                  :focusable="false"
                  >{{ store.language.openAfterHideMainInterface }}</NCheckbox
                >
              </NFormItem>
              <NFormItem>
                <NCheckbox
                  v-model:checked="setting.item.useItemOpen"
                  :focusable="false"
                  >{{ store.language.useItemOpen }}</NCheckbox
                >
              </NFormItem>
              <NFormItem>
                <NCheckbox
                  v-model:checked="setting.item.openNumber"
                  :focusable="false"
                  @update:checked="setOpenNumber"
                  >{{ store.language.recordOpenNumber }}</NCheckbox
                >
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.functions
              }}</span>
              <NFormItem class="mt-1">
                <NCheckbox
                  v-model:checked="setting.item.checkInvalidItem"
                  :focusable="false"
                  @update:checked="setCheckInvalidItem"
                  >{{ store.language.checkInvalidItem }}</NCheckbox
                >
              </NFormItem>
            </NForm>
          </div>
          <div class="mx-2" v-if="selectedMenuId === 5">
            <NForm label-placement="left" :show-feedback="false" size="small">
              <span class="block font-semibold">{{
                store.language.enable
              }}</span>
              <NFormItem class="mt-1">
                <NCheckbox
                  v-model:checked="setting.quickSearch.enable"
                  :focusable="false"
                  >{{ store.language.useQuickSearch }}</NCheckbox
                >
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.showHide
              }}</span>
              <NFormItem :label="store.language.shortcutKey" class="mt-1">
                <NInput
                  v-model:value="tempQuickSearchShowHideShortcutKey"
                  clearable
                  size="small"
                  placeholder=""
                  @keydown="
                    tempQuickSearchShowHideShortcutKey = getShortcutKey(
                      $event,
                      tempQuickSearchShowHideShortcutKey,
                      true
                    )
                  "
                  @blur="checkQuickSearchShowHideShortcutKey"
                ></NInput>
              </NFormItem>
              <div class="flex mt-1">
                <NButton
                  type="primary"
                  size="small"
                  class="mr-1"
                  @click="
                    (tempQuickSearchShowHideShortcutKey = 'Ctrl + Space'),
                      checkQuickSearchShowHideShortcutKey()
                  "
                  >Ctrl + Space</NButton
                >
                <NButton
                  type="primary"
                  size="small"
                  @click="
                    (tempQuickSearchShowHideShortcutKey = 'Alt + Space'),
                      checkQuickSearchShowHideShortcutKey()
                  "
                  >Alt + Space</NButton
                >
              </div>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.window
              }}</span>
              <NFormItem class="mt-1">
                <NCheckbox
                  v-model:checked="setting.quickSearch.hideLoseFocus"
                  :focusable="false"
                  >{{ store.language.hideLoseFocus }}</NCheckbox
                >
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{ store.language.open }}</span>
              <NFormItem class="mt-1">
                <NCheckbox
                  v-model:checked="setting.quickSearch.openNow"
                  :focusable="false"
                  >{{ store.language.openNow }}</NCheckbox
                >
              </NFormItem>
              <NFormItem>
                <NCheckbox
                  v-model:checked="setting.quickSearch.useItemOpen"
                  :focusable="false"
                  >{{ store.language.useItemOpen }}</NCheckbox
                >
              </NFormItem>
              <NFormItem>
                <NCheckbox
                  v-model:checked="
                    setting.quickSearch.openAfterHideQuickSearchWindow
                  "
                  :focusable="false"
                  >{{
                    store.language.openAfterHideQuickSearchWindow
                  }}</NCheckbox
                >
              </NFormItem>
              <NFormItem :label="store.language.shortcutKey" class="mt-0.5">
                <NSelect
                  v-model:value="setting.quickSearch.openShortcutKey"
                  :options="quickSearchShortcutKeyOpenOptions"
                  size="small"
                ></NSelect>
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.history
              }}</span>
              <NFormItem class="mt-1">
                <NCheckbox
                  v-model:checked="setting.quickSearch.showHistory"
                  :focusable="false"
                  >{{ store.language.display }}</NCheckbox
                >
              </NFormItem>
              <NFormItem
                v-if="setting.quickSearch.showHistory"
                :label="store.language.sort"
                class="mt-0.5"
              >
                <NSelect
                  v-model:value="setting.quickSearch.showHistorySort"
                  :options="quickSearchHistorySortOptions"
                  size="small"
                ></NSelect>
              </NFormItem>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.matchCondition
              }}</span>
              <NFormItem class="mt-1">
                <NCheckbox
                  v-model:checked="setting.quickSearch.matchConditionsRemark"
                  :focusable="false"
                  >{{ store.language.remark }}</NCheckbox
                >
              </NFormItem>
            </NForm>
          </div>
          <div class="mx-2" v-if="selectedMenuId === 6">
            <NForm label-placement="left" :show-feedback="false" size="small">
              <span class="block font-semibold">{{ store.language.mode }}</span>
              <NFormItem class="mt-2">
                <NSelect
                  v-model:value="setting.webSearch.mode"
                  :options="webSearchModeOptions"
                  size="small"
                ></NSelect>
              </NFormItem>
              <Desc
                class="mt-1"
                :content="store.language.webSearchModePrompt1"
              ></Desc>
            </NForm>
            <NForm
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{
                store.language.searchSource
              }}</span>
              <NFormItem class="mt-2">
                <table
                  class="table-fixed border w-full border-collapse text-center border-solid"
                  :style="{ borderColor: setting.appearance.theme.borderColor }"
                >
                  <thead
                    class="border border-solid"
                    :style="{
                      backgroundColor: hexToRGBA(
                        setting.appearance.theme.secondBackgroundColor,
                        0.8
                      ),
                      color: setting.appearance.theme.secondFontColor,
                    }"
                  >
                    <tr>
                      <th
                        class="border border-solid py-0.5"
                        :style="{
                          borderColor: setting.appearance.theme.borderColor,
                        }"
                      >
                        {{ store.language.keyword }}
                      </th>
                      <th
                        class="border border-solid py-0.5"
                        :style="{
                          borderColor: setting.appearance.theme.borderColor,
                        }"
                      >
                        {{ store.language.name }}
                      </th>
                      <th
                        class="border border-solidpy-0.5"
                        :style="{
                          borderColor: setting.appearance.theme.borderColor,
                        }"
                      >
                        {{ store.language.description }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="table-item"
                      v-for="(item, index) of setting.webSearch
                        .searchSourceList"
                      :key="'search-source-' + item.id + '-' + index"
                      :style="{
                        backgroundColor:
                          searchSourceId === item.id
                            ? hexToRGBA(
                                setting.appearance.theme.secondBackgroundColor,
                                0.8
                              )
                            : undefined,
                        color:
                          searchSourceId === item.id
                            ? setting.appearance.theme.secondFontColor
                            : undefined,
                      }"
                      @mouseover="
                        setStyle(
                          $event,
                          'table-item',
                          new Map([
                            [
                              'background-color',
                              hexToRGBA(
                                setting.appearance.theme.secondBackgroundColor,
                                0.8
                              ),
                            ],
                            ['color', setting.appearance.theme.secondFontColor],
                          ])
                        )
                      "
                      @mouseout="
                        removeStyle(
                          $event,
                          'table-item',
                          searchSourceId == item.id
                            ? new Map()
                            : new Map([
                                ['background-color', null],
                                ['color', null],
                              ])
                        )
                      "
                      @click="
                        showEditSearchSource(
                          item.id,
                          item.keyword,
                          item.name,
                          item.url,
                          item.description
                        )
                      "
                    >
                      <td
                        class="border border-solid py-0.5"
                        :style="{
                          borderColor: setting.appearance.theme.borderColor,
                        }"
                      >
                        {{ item.keyword }}
                      </td>
                      <td
                        class="border border-solid py-0.5"
                        :style="{
                          borderColor: setting.appearance.theme.borderColor,
                        }"
                      >
                        {{ item.name }}
                      </td>
                      <td
                        class="border border-solid py-0.5"
                        :style="{
                          borderColor: setting.appearance.theme.borderColor,
                        }"
                      >
                        {{ item.description }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </NFormItem>
              <div class="flex mt-1">
                <NButton
                  type="primary"
                  size="small"
                  class="mr-1 w-20"
                  @click="showAddSearchSource"
                  >{{ store.language.add }}</NButton
                >
                <NButton
                  v-if="searchSourceId"
                  type="primary"
                  size="small"
                  class="w-20"
                  @click="deleteSearchSource"
                  >{{ store.language.delete }}</NButton
                >
              </div>
            </NForm>
            <NForm
              v-if="searchSourceType"
              label-placement="left"
              :show-feedback="false"
              size="small"
              class="mt-3"
            >
              <span class="block font-semibold">{{ store.language.edit }}</span>
              <NFormItem :label="store.language.keyword" class="mt-2">
                <NInput
                  v-model:value="searchSourceKeyword"
                  size="small"
                  clearable
                  placeholder=""
                ></NInput>
              </NFormItem>
              <NFormItem :label="store.language.name" class="mt-1">
                <NInput
                  v-model:value="searchSourceName"
                  size="small"
                  clearable
                  placeholder=""
                ></NInput>
              </NFormItem>
              <NFormItem :label="store.language.url" class="mt-1">
                <NInput
                  v-model:value="searchSourceURL"
                  size="small"
                  clearable
                  placeholder=""
                ></NInput>
              </NFormItem>
              <NFormItem :label="store.language.description" class="mt-1">
                <NInput
                  v-model:value="searchSourceDescription"
                  size="small"
                  clearable
                  placeholder=""
                ></NInput>
              </NFormItem>
              <div class="flex mt-1 items-center">
                <NButton
                  type="primary"
                  size="small"
                  class="mr-1 w-20"
                  @click="saveSearchSource"
                  >{{ store.language.save }}</NButton
                >
                <NButton
                  type="primary"
                  size="small"
                  class="w-20"
                  @click="closeSaveSearchSource"
                  >{{ store.language.cancel }}</NButton
                >
                <Desc
                  class="ml-auto"
                  :content="store.language.webSearchModePrompt2"
                ></Desc>
              </div>
            </NForm>
          </div>
          <div class="mx-2" v-if="selectedMenuId === 7">
            <NForm label-placement="left" :show-feedback="false" size="small">
              <span class="block font-semibold">{{
                store.language.proxy
              }}</span>
              <NFormItem class="mt-1">
                <NCheckbox
                  v-model:checked="setting.network.useProxy"
                  :focusable="false"
                  >{{ store.language.useProxy }}</NCheckbox
                >
              </NFormItem>
              <NFormItem :label="store.language.address" class="mt-1">
                <NInput
                  v-model:value="setting.network.proxy.address"
                  size="small"
                  clearable
                  placeholder=""
                ></NInput>
              </NFormItem>
              <NFormItem :label="store.language.username" class="mt-1">
                <NInput
                  v-model:value="setting.network.proxy.username"
                  size="small"
                  clearable
                  placeholder=""
                ></NInput>
              </NFormItem>
              <NFormItem :label="store.language.password" class="mt-1">
                <NInput
                  v-model:value="setting.network.proxy.password"
                  size="small"
                  clearable
                  placeholder=""
                ></NInput>
              </NFormItem>
              <Desc class="mt-1" :content="store.language.proxyPrompt"></Desc>
            </NForm>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch } from "vue";
import { Icon } from "@vicons/utils";
import { CloseRound } from "@vicons/material";
import {
  setIconStyle,
  removeIconStyle,
  setStyle,
  removeStyle,
  hexToRGBA,
} from "../../utils/style";
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NCheckbox,
  NColorPicker,
  NInputNumber,
  NSelect,
} from "naive-ui";
import SimpleBar from "simplebar";
import "simplebar/dist/simplebar.css";
import { checkShortcutKey as commonCheckShortcutKey } from "../../utils/shortcutKey";
import { getShortcutKey } from "../../utils/common";
import { convert } from "../../../commons/utils/common";
import { themeList } from "../../../commons/data/theme";
import { Setting, Theme, WebSearchSource } from "../../../types/setting";
import { scrollToTop, getNewId } from "../../utils/common";
import Desc from "../../components/Desc.vue";
import { useMainStore } from "../../store";
// pinia
const store = useMainStore();
// 创建滚动条
let simpleBar: SimpleBar | null;
function createSimpleBar() {
  let element = document.getElementById("content");
  if (element) {
    simpleBar = new SimpleBar(element);
  }
}
// setting
let setting = ref<Setting>(convert(store.setting));
// 背景图
if (setting.value.appearance.backgroundImage) {
  window.setting.getBackgroundImage(
    setting.value.appearance.backgroundImage,
    "settingWindow"
  );
}
// 窗口快捷键
let oldGeneralShowHideShortcutKey = setting.value.general.showHideShortcutKey;
let tempGeneralShowHideShortcutKey = ref(
  setting.value.general.showHideShortcutKey
);
// 搜索快捷键
let oldGeneralSearchShowHideShortcutKey =
  setting.value.general.searchShowHideShortcutKey;
let tempGeneralSearchShowHideShortcutKey = ref(
  setting.value.general.searchShowHideShortcutKey
);
// 快速搜索快捷键
let oldQuickSearchShowHideShortcutKey =
  setting.value.quickSearch.showHideShortcutKey;
let tempQuickSearchShowHideShortcutKey = ref(
  setting.value.quickSearch.showHideShortcutKey
);
// 当前菜单
let selectedMenuId = ref<number>(0);
// 切换菜单
function changeMenu(menuId: number) {
  selectedMenuId.value = menuId;
  scrollToTop(simpleBar);
}
// 菜单
let menuList = [
  {
    id: 0,
    label: store.language.general,
  },
  {
    id: 1,
    label: store.language.appearance,
  },
  {
    id: 2,
    label: store.language.classification,
  },
  {
    id: 3,
    label: store.language.subclassification,
  },
  {
    id: 4,
    label: store.language.item,
  },
  {
    id: 5,
    label: store.language.quickSearch,
  },
  {
    id: 6,
    label: store.language.webSearch,
  },
  {
    id: 7,
    label: store.language.network,
  },
];
// 语言
let languageOptions = ref([
  {
    label: store.language.simplifiedChinese,
    value: "SimplifiedChinese",
  },
  {
    label: store.language.traditionalChinese,
    value: "TraditionalChinese",
  },
  {
    label: store.language.english,
    value: "English",
  },
]);
// 分类布局
let classificationLayoutOptions = ref([
  {
    label: store.language.top,
    value: "top",
  },
  {
    label: store.language.left,
    value: "left",
  },
  {
    label: store.language.right,
    value: "right",
  },
]);
// 分类模式
let classificationModeOptions = ref([
  {
    label: store.language.normal,
    value: "normal",
  },
  {
    label: store.language.icon,
    value: "icon",
  },
]);
// 分类名称对齐
let classificationNameAlignOptions = ref([
  {
    label: store.language.left,
    value: "left",
  },
  {
    label: store.language.center,
    value: "center",
  },
]);
// 字体粗细
let fontWeightOptions = ref([
  {
    label: "100",
    value: 100,
  },
  {
    label: "200",
    value: 200,
  },
  {
    label: "300",
    value: 300,
  },
  {
    label: "400",
    value: 400,
  },
  {
    label: "500",
    value: 500,
  },
  {
    label: "600",
    value: 600,
  },
  {
    label: "700",
    value: 700,
  },
  {
    label: "800",
    value: 800,
  },
  {
    label: "900",
    value: 900,
  },
]);
// 字体粗细
let fontLineHeightOptions = ref([
  {
    label: "0",
    value: 0,
  },
  {
    label: "0.25",
    value: 0.25,
  },
  {
    label: "0.5",
    value: 0.5,
  },
  {
    label: "0.75",
    value: 0.75,
  },
  {
    label: "1",
    value: 1,
  },
  {
    label: "1.25",
    value: 1.25,
  },
  {
    label: "1.5",
    value: 1.5,
  },
  {
    label: "1.75",
    value: 1.75,
  },
  {
    label: "2",
    value: 2,
  },
  {
    label: "2.25",
    value: 2.25,
  },
  {
    label: "2.5",
    value: 2.5,
  },
  {
    label: "2.75",
    value: 2.75,
  },
  {
    label: "3",
    value: 3,
  },
]);
// 项目布局
let itemLayoutOptions = ref([
  {
    label: store.language.tile,
    value: "tile",
  },
  {
    label: store.language.list,
    value: "list",
  },
]);
// 项目图标大小
let itemIconSizeOptions = ref([
  {
    label: store.language.extraLarge,
    value: 48,
  },
  {
    label: store.language.large,
    value: 40,
  },
  {
    label: store.language.medium,
    value: 32,
  },
  {
    label: store.language.small,
    value: 24,
  },
]);
// 项目名称行数
let itemRowCountOptions = ref([
  {
    label: "1",
    value: 1,
  },
  {
    label: "2",
    value: 2,
  },
]);
// 背景图模式
let backgroundImageModeOptions = ref([
  {
    label: store.language.repeat,
    value: "repeat",
  },
  {
    label: store.language.noRepeat,
    value: "no-repeat",
  },
  {
    label: store.language.tile,
    value: "space",
  },
  {
    label: store.language.zoom,
    value: "round",
  },
]);
// 背景图定位
let backgroundImagePositionOptions = ref([
  {
    label: store.language.default,
    value: "default",
  },
  {
    label: store.language.top,
    value: "top",
  },
  {
    label: store.language.bottom,
    value: "bottom",
  },
  {
    label: store.language.center,
    value: "center",
  },
  {
    label: store.language.left,
    value: "left",
  },
  {
    label: store.language.right,
    value: "right",
  },
]);
// 子分类项目区域名称对齐
let itemAreaSubclassificationNameAlignOptions = ref([
  {
    label: store.language.left,
    value: "left",
  },
  {
    label: store.language.center,
    value: "center",
  },
  {
    label: store.language.right,
    value: "right",
  },
]);
// 监听
watch(
  () => setting.value,
  async (newValue: Setting) => {
    let setting: Setting = convert(newValue);
    window.setting.update(setting);
  },
  { deep: true }
);
watch(
  () => store.setting.general.alwaysTop,
  (newValue: boolean) => {
    setting.value.general.alwaysTop = newValue;
  }
);
watch(
  () => store.setting.general.lockSize,
  (newValue: boolean) => {
    setting.value.general.lockSize = newValue;
  }
);
watch(
  () => store.setting.general.fixedPosition,
  (newValue: boolean) => {
    setting.value.general.fixedPosition = newValue;
  }
);
watch(
  () => store.setting.general.alwaysCenter,
  (newValue: boolean) => {
    setting.value.general.alwaysCenter = newValue;
  }
);
// 开机启动
function setStartup(value: boolean) {
  window.setting.setStartup(value);
}
// 隐藏托盘图标
function setTray(value: boolean) {
  window.setting.setTray(!value);
}
// 校验快捷键
async function checkGeneralShowHideShortcutKey() {
  let success = true;
  if (
    tempGeneralShowHideShortcutKey.value !== null &&
    tempGeneralShowHideShortcutKey.value !== ""
  ) {
    success = await commonCheckShortcutKey(
      setting.value,
      oldGeneralShowHideShortcutKey,
      tempGeneralShowHideShortcutKey.value,
      "settingWindow",
      "GeneralShowHide"
    );
    if (!success) {
      setting.value.general.showHideShortcutKey = null;
      tempGeneralShowHideShortcutKey.value = null;
    } else {
      setting.value.general.showHideShortcutKey =
        tempGeneralShowHideShortcutKey.value;
    }
  } else {
    setting.value.general.showHideShortcutKey = null;
  }
  // 设置快捷键
  window.setting.setShortcutKey(convert(setting.value));
}
// 校验快捷键
async function checkGeneralSearchShowHideShortcutKey() {
  let success = true;
  if (
    tempGeneralSearchShowHideShortcutKey.value !== null &&
    tempGeneralSearchShowHideShortcutKey.value !== ""
  ) {
    success = await commonCheckShortcutKey(
      setting.value,
      oldGeneralSearchShowHideShortcutKey,
      tempGeneralSearchShowHideShortcutKey.value,
      "settingWindow",
      "GeneralSearch"
    );
    if (!success) {
      setting.value.general.searchShowHideShortcutKey = null;
      tempGeneralSearchShowHideShortcutKey.value = null;
    } else {
      setting.value.general.searchShowHideShortcutKey =
        tempGeneralSearchShowHideShortcutKey.value;
    }
  } else {
    setting.value.general.searchShowHideShortcutKey = null;
  }
}
// 校验快捷键
async function checkQuickSearchShowHideShortcutKey() {
  let success = true;
  if (
    tempQuickSearchShowHideShortcutKey.value !== null &&
    tempQuickSearchShowHideShortcutKey.value !== ""
  ) {
    success = await commonCheckShortcutKey(
      setting.value,
      oldQuickSearchShowHideShortcutKey,
      tempQuickSearchShowHideShortcutKey.value,
      "settingWindow",
      "QuickSearch"
    );
    if (!success) {
      setting.value.quickSearch.showHideShortcutKey = null;
      tempQuickSearchShowHideShortcutKey.value = null;
    } else {
      setting.value.quickSearch.showHideShortcutKey =
        tempQuickSearchShowHideShortcutKey.value;
    }
  } else {
    setting.value.quickSearch.showHideShortcutKey = null;
  }
  // 设置快捷键
  window.setting.setShortcutKey(convert(setting.value));
}
// 永远置顶
function setAlwaysTop(value: boolean) {
  window.setting.setAlwaysTop(value);
}
// 锁定尺寸
function setLockSize(value: boolean) {
  window.setting.setLockSize(value);
}
// 固定位置
function setFixedPosition(value: boolean) {
  // 固定位置和永远居中不能同时存在
  window.setting.setFixedPosition(value, setting.value.general.alwaysCenter);
}
// 永远居中
function setAlwaysCenter(value: boolean) {
  // 固定位置和永远居中不能同时存在
  window.setting.setAlwaysCenter(setting.value.general.fixedPosition, value);
}
// 边缘吸附
function setEdgeAdsorb(value: boolean) {
  window.setting.setEdgeAdsorb(value);
}
// 停靠在桌面边缘时自动隐藏
function setAutoHide(value: boolean) {
  if (value) {
    window.setting.setEdgeAdsorb(value);
  }
}
// 修改主色
let mainBackgroundColor = ref(
  setting.value.appearance.theme.mainBackgroundColor
);
function changeMainBackgroundColor(value: string) {
  setting.value.appearance.theme.mainBackgroundColor = value;
  setting.value.appearance.theme.name = "custom";
}
// 修改副色
let secondBackgroundColor = ref(
  setting.value.appearance.theme.secondBackgroundColor
);
function changeSecondBackgroundColor(value: string) {
  setting.value.appearance.theme.secondBackgroundColor = value;
  setting.value.appearance.theme.name = "custom";
}
// 修改字体主色
let mainFontColor = ref(setting.value.appearance.theme.mainFontColor);
function changeMainFontColor(value: string) {
  setting.value.appearance.theme.mainFontColor = value;
  setting.value.appearance.theme.name = "custom";
}
// 修改字体副色
let secondFontColor = ref(setting.value.appearance.theme.secondFontColor);
function changeSecondFontColor(value: string) {
  setting.value.appearance.theme.secondFontColor = value;
  setting.value.appearance.theme.name = "custom";
}
// 修改边框色
let borderColor = ref(setting.value.appearance.theme.borderColor);
function changeBorderColor(value: string) {
  setting.value.appearance.theme.borderColor = value;
  setting.value.appearance.theme.name = "custom";
}
// 修改主题
function changeTheme(theme: Theme) {
  setting.value.appearance.theme = convert(theme);
  mainBackgroundColor.value =
    setting.value.appearance.theme.mainBackgroundColor;
  secondBackgroundColor.value =
    setting.value.appearance.theme.secondBackgroundColor;
  mainFontColor.value = setting.value.appearance.theme.mainFontColor;
  secondFontColor.value = setting.value.appearance.theme.secondFontColor;
  borderColor.value = setting.value.appearance.theme.borderColor;
}
// 修改字体阴影颜色
let fontShadowColor = ref(setting.value.appearance.fontShadowColor);
function changeFontShadowColor(value: string) {
  setting.value.appearance.fontShadowColor = value;
}
// 修改背景色透明
let transparency = ref(setting.value.appearance.transparency);
function setTransparency() {
  setting.value.appearance.transparency = Number(transparency.value);
}
// 上传背景图
function uploadBackgrounImage() {
  // 选择文件上传
  let data = window.setting.uploadBackgrounImage();
  if (data) {
    // 图片名
    setting.value.appearance.backgroundImage = data.name;
    // 设置背景图
    store.backgroundImage = data.image;
    // 通知主窗口
    window.api.emit("mainWindow", "onSetBacngroundImage", data.image);
  }
}
// 删除背景图
function deleteBackgroundImage() {
  // 图片名
  setting.value.appearance.backgroundImage = null;
  // 设置背景图
  store.backgroundImage = null;
  // 通知主窗口
  window.api.emit("mainWindow", "onSetBacngroundImage", null);
}
// 修改背景图透明
let backgroundImageTransparency = ref(
  setting.value.appearance.backgroundImageTransparency
);
function setBackgroundImageTransparency() {
  setting.value.appearance.backgroundImageTransparency = Number(
    backgroundImageTransparency.value
  );
}
// 修改项目列表列数
let columnNumber = ref(setting.value.item.columnNumber);
function setColumnNumber() {
  setting.value.item.columnNumber = Number(columnNumber.value);
}
// 检测无效项目
function setCheckInvalidItem(value: boolean) {
  window.setting.setCheckInvalidItem(value);
}
// 项目打开次数
function setOpenNumber(value: boolean) {
  window.setting.setOpenNumber(value);
}
// 快速搜索打开快捷键
let quickSearchShortcutKeyOpenOptions = ref([
  {
    label: store.language.none,
    value: "none",
  },
  {
    label: store.language.numberKey,
    value: "numberKey",
  },
  {
    label: store.language.ctrlNumberKey,
    value: "ctrlNumberKey",
  },
  {
    label: store.language.altNumberKey,
    value: "altNumberKey",
  },
]);
// 快速搜索历史记录排序
let quickSearchHistorySortOptions = ref([
  {
    label: store.language.byLastOpen,
    value: "lastOpen",
  },
  {
    label: store.language.byOpenNumber,
    value: "openNumber",
  },
]);
// 网络搜索模式
let webSearchModeOptions = ref([
  {
    label: store.language.colonKeywordSpace,
    value: 0,
  },
  {
    label: store.language.keywordSpace,
    value: 1,
  },
]);
// 网络搜索源操作类型 add新增 edit编辑
let searchSourceType = ref<string | null>(null);
// 网络搜索源ID
let searchSourceId = ref<number | null>(null);
// 网络搜索源关键字
let searchSourceKeyword = ref<string | null>(null);
// 网络搜索源名称
let searchSourceName = ref<string | null>(null);
// 网络搜索源URL
let searchSourceURL = ref<string | null>(null);
// 网络搜索源描述
let searchSourceDescription = ref<string | null>(null);
//  显示新增搜索源
function showAddSearchSource() {
  searchSourceType.value = "add";
  searchSourceId.value = null;
  searchSourceKeyword.value = null;
  searchSourceName.value = null;
  searchSourceURL.value = null;
  searchSourceDescription.value = null;
}
// 编辑网络搜索源
function showEditSearchSource(
  id: number,
  keyword: string,
  name: string,
  url: string,
  description: string | null
) {
  searchSourceType.value = "edit";
  searchSourceId.value = id;
  searchSourceKeyword.value = keyword;
  searchSourceName.value = name;
  searchSourceURL.value = url;
  searchSourceDescription.value = description;
}
// 校验搜索源内容
function checkSearchSource() {
  if (searchSourceType.value === "edit") {
    if (!searchSourceId.value) {
      return false;
    }
  }
  if (!searchSourceKeyword.value || searchSourceKeyword.value.trim() === "") {
    return false;
  }
  if (!searchSourceName.value || searchSourceName.value.trim() === "") {
    return false;
  }
  if (!searchSourceURL.value || searchSourceURL.value.trim() === "") {
    return false;
  }
  return true;
}
// 保存搜索源
function saveSearchSource() {
  if (checkSearchSource()) {
    if (searchSourceType.value === "add") {
      addSearchSource();
    } else {
      editSearchSource();
    }
  }
}
// 新增搜索源
function addSearchSource() {
  // 新增
  let data: WebSearchSource = {
    id: getNewId(setting.value.webSearch.searchSourceList),
    keyword: searchSourceKeyword.value!,
    name: searchSourceName.value!,
    url: searchSourceURL.value!,
    description: searchSourceDescription.value,
  };
  setting.value.webSearch.searchSourceList.push(data);
  showEditSearchSource(
    data.id,
    data.keyword,
    data.name,
    data.url,
    data.description
  );
}
// 编辑搜索源
function editSearchSource() {
  for (let searchSource of setting.value.webSearch.searchSourceList) {
    if (searchSource.id === searchSourceId.value) {
      searchSource.keyword = searchSourceKeyword.value!;
      searchSource.name = searchSourceName.value!;
      searchSource.url = searchSourceURL.value!;
      searchSource.description = searchSourceDescription.value;
      break;
    }
  }
}
// 删除搜索源
function deleteSearchSource() {
  let index;
  for (let i = 0; i < setting.value.webSearch.searchSourceList.length; i++) {
    if (
      setting.value.webSearch.searchSourceList[i].id === searchSourceId.value
    ) {
      index = i;
      break;
    }
  }
  if (index != null) {
    setting.value.webSearch.searchSourceList.splice(index, 1);
  }
  closeSaveSearchSource();
}
// 关闭保存搜索源
function closeSaveSearchSource() {
  searchSourceType.value = null;
  searchSourceId.value = null;
  searchSourceKeyword.value = null;
  searchSourceName.value = null;
  searchSourceURL.value = null;
  searchSourceDescription.value = null;
}
// 页面高度
let height = ref(0);
// 初始化页面尺寸
resize();
// 监听页面大小
function resize() {
  height.value = document.documentElement.clientHeight;
}
// 加载完dom后再显示页面
nextTick(() => {
  window.setting.showWindow();
});
// 菜单鼠标经过
function menuItemMouseover(e: any) {
  let style: Map<string, string> = new Map();
  style.set("color", store.setting.appearance.theme.secondFontColor);
  style.set(
    "background-color",
    store.setting.appearance.theme.secondBackgroundColor
  );
  setStyle(e, "menu", style);
}
// 菜单鼠标移走
function menuItemMouseout(e: any, menuId: number) {
  if (selectedMenuId.value !== menuId) {
    let style: Map<string, string | null> = new Map();
    style.set("color", null);
    style.set("background-color", null);
    removeStyle(e, "menu", style);
  }
}
/**
 * 关闭窗口
 */
function close() {
  window.setting.closeWindow();
}
// 键盘按下
function keydown(e: any) {
  if (e.keyCode === 27) {
    // ESC
    close();
    e.preventDefault();
    e.stopPropagation();
    return;
  }
}
// 监听
let onSetBacngroundImageUnListen: Function | null = null;
// moutned
onMounted(() => {
  // resize
  window.addEventListener("resize", resize);
  // 监听键盘
  window.addEventListener("keydown", keydown, true);
  // 刷新DOM完毕执行
  nextTick(() => {
    // 滚动条
    createSimpleBar();
  });
  // 监听设置背景图
  onSetBacngroundImageUnListen = window.setting.onSetBacngroundImage((data) => {
    store.backgroundImage = data;
  });
});
// unmounted
onUnmounted(() => {
  // resize
  window.removeEventListener("resize", resize);
  // 监听键盘
  window.removeEventListener("keydown", keydown, true);
  // 删除监听
  if (onSetBacngroundImageUnListen) {
    onSetBacngroundImageUnListen();
  }
});
</script>
../../../types/setting
