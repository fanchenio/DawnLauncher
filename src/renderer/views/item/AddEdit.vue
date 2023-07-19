<template>
  <div
    class="text-sm h-full"
    style="text-shadow: none"
    :style="{
      color: $store.state.setting.appearance.theme.fontBasic,
      backgroundColor: $store.state.setting.appearance.theme.mainBackground,
      borderRadius: $store.state.setting.appearance.backgroundTransparency < 1 && $store.state.setting.appearance.windowRoundedCorners ? '8px' : null,
    }"
  >
    <div class="relative float-left" v-if="type == 0">
      <h1 class="popup-header px-2 flex items-center h-[34px]">{{ $store.state.currentLanguage.newItem }}</h1>
      <ul class="px-[8px]" v-if="type == 0">
        <li
          v-for="(item, index) of menuList"
          class="mb-1 px-2 flex items-center h-[30px] text-left rounded min-w-[56px] menu-item"
          :class="[`${$store.state.setting.classification.nameAlign == 'center' ? 'justify-center' : ''}`]"
          :key="'menu-' + item.id + '-' + index"
          @click="changeMenu(item.id)"
          :style="{
            backgroundColor: menuSelected == item.id ? $hexToRGBA($store.state.setting.appearance.theme.minorBackground, 1) : null,
            color: menuSelected == item.id ? $hexToRGBA($store.state.setting.appearance.theme.fontHover, 1) : null,
          }"
          @mouseover="
            $styleMouseover(
              $event,
              'menu-item',
              ['color', 'background-color'],
              [$hexToRGBA($store.state.setting.appearance.theme.fontHover, 1), $hexToRGBA($store.state.setting.appearance.theme.minorBackground, 1)]
            )
          "
          @mouseout="$styleMouseout($event, 'menu-item', menuSelected == item.id ? [] : ['color', 'background-color'])"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
    <div class="overflow-hidden h-[inherit]">
      <div class="flex items-center">
        <h1 class="popup-header py-2 px-2 h-[34px] w-full" v-if="type == 1">{{ $store.state.currentLanguage.editItem }}</h1>
        <div class="popup-header w-full h-[34px]" v-if="type == 0"></div>
        <div class="flex items-center">
          <!-- 关闭 -->
          <Close @click="close" :key="'close-' + $store.state.setting.appearance.theme.name"></Close>
        </div>
      </div>
      <div class="mb-1 px-4 w-full mt-1 content" data-simplebar :key="menuSelected">
        <div id="popup-header" v-if="menuSelected != 6 && menuSelected != 7">
          <div class="flex items-end">
            <div
              v-if="data.icon == null && data.htmlIcon == null"
              class="w-10 h-10 border rounded flex items-center justify-center hover:cursor-pointer"
              :style="{ borderColor: $store.state.setting.appearance.theme.border }"
              @click="localIcon"
            ></div>
            <template v-else>
              <template v-if="data.htmlIcon != null">
                <div class="mx-auto flex items-center justify-center w-[40px] h-[40px]" @click="localIcon" v-html="sanitize(data.htmlIcon)"></div>
              </template>
              <template v-else>
                <div
                  v-if="data.useAppxBackgroundColor"
                  class="mx-auto flex items-center justify-center w-[40px] h-[40px]"
                  style="background-color: rgb(0, 120, 215)"
                >
                  <img :src="data.icon" class="w-[32px] h-[32px] hover:cursor-pointer" @click="localIcon" />
                </div>
                <img v-else :src="data.icon" class="w-[40px] h-[40px] hover:cursor-pointer" @click="localIcon" />
              </template>
            </template>
            <div class="flex-1 ml-2">
              <span class="block">{{ $store.state.currentLanguage.name }}</span>
              <Input v-model:value="data.name" class="mt-1.5 w-full"></Input>
            </div>
          </div>
          <span class="block mt-2">{{ $store.state.currentLanguage.modifyIcon }}</span>
          <div class="flex flex-wrap">
            <Button
              :text="$store.state.currentLanguage.localIcon"
              type="cancel"
              class="w-[30px] h-[30px] mr-1 mt-1.5 cursor-pointer"
              icon="upload"
              @click="localIcon"
            ></Button>
            <Button
              :text="$store.state.currentLanguage.networkIcon"
              type="cancel"
              class="w-[30px] h-[30px] mr-1 mt-1.5 cursor-pointer"
              icon="link"
              @click="urlIconShow = !urlIconShow"
            ></Button>
            <Button
              :text="$store.state.currentLanguage.svgCodeIcon"
              type="cancel"
              class="w-[30px] h-[30px] mr-1 mt-1.5 cursor-pointer"
              icon="code"
              @click="svgIconShow = !svgIconShow"
            ></Button>
            <Button
              v-if="data.type != 5 ? !strIsEmpty(data.path) : !strIsEmpty(data.originalIcon)"
              :text="$store.state.currentLanguage.defaultIcon"
              type="cancel"
              class="w-[30px] h-[30px] mr-1 mt-1.5 cursor-pointer"
              icon="reset"
              @click="defaultIcon"
            ></Button>
          </div>
          <check-box v-model:value="data.notRefreshIcon" :label="$store.state.currentLanguage.notRefreshIcon" class="mt-2 mr-2" />
          <check-box
            v-model:value="data.useAppxBackgroundColor"
            :label="$store.state.currentLanguage.useIconBackgroundColor"
            class="mt-2 mr-2"
            v-if="data.type == 5"
          />
        </div>
        <div class="mt-2" v-if="menuSelected != 6 && menuSelected != 7">
          <span class="block">{{ $store.state.currentLanguage.shortcutKey }}</span>
          <Input
            id="shortcutKeyInput"
            v-model:value="data.shortcutKey"
            class="mt-1.5 w-full"
            @keydown="tempShortcutKey = data.shortcutKey = setShortcutKey($event, data.shortcutKey, true)"
            @keyup="checkShortcutKeys"
          ></Input>
          <check-box v-model:value="data.globalShortcutKey" :label="$store.state.currentLanguage.globalShortcutKey" class="mt-2" />
        </div>
        <div class="mt-2" v-if="menuSelected == 1 || menuSelected == 2">
          <span class="block">{{ $store.state.currentLanguage.target }}</span>
          <textarea
            rows="2"
            v-model="data.path"
            class="mt-1.5 block w-full resize-none border rounded text-sm py-1 px-2 hover:outline-0 focus-visible:outline-0"
            :style="{
              color: $store.state.setting.appearance.theme.fontBasic,
              backgroundColor: $store.state.setting.appearance.theme.mainBackground,
              borderColor: $store.state.setting.appearance.theme.border,
            }"
            v-if="data.type != 5"
          ></textarea>
          <textarea
            rows="2"
            v-model="data.shell"
            class="mt-1.5 block w-full resize-none border rounded text-sm py-1 px-2 hover:outline-0 focus-visible:outline-0"
            :style="{
              color: $store.state.setting.appearance.theme.fontBasic,
              backgroundColor: $store.state.setting.appearance.theme.mainBackground,
              borderColor: $store.state.setting.appearance.theme.border,
            }"
            v-if="data.type == 5"
          ></textarea>
          <div class="flex flex-wrap">
            <Button :text="$store.state.currentLanguage.browse" type="primary" class="w-20 mr-1 mt-1.5" @click="chooseFile" v-if="data.type != 5"></Button>
            <Button
              :text="isAbsolutePath(data.path) ? $store.state.currentLanguage.toRelativePath : $store.state.currentLanguage.toAbsolutePath"
              type="primary"
              class="w-24 mr-2 mt-1.5"
              @click="convertPath(data.path)"
              v-if="data.type != 5 && !strIsEmpty(data.path)"
            ></Button>
          </div>
        </div>
        <div class="mt-2" v-if="menuSelected == 1">
          <span class="block">{{ $store.state.currentLanguage.startLocation }}</span>
          <Input
            id="startLocationInput"
            v-model:value="data.startLocation"
            class="mt-1.5 w-full"
            :placeholder="$store.state.currentLanguage.startLocationNote"
          ></Input>
        </div>
        <div class="mt-2" v-if="menuSelected == 3">
          <span class="block">{{ $store.state.currentLanguage.url }}</span>
          <textarea
            rows="2"
            v-model="data.url"
            class="mt-1.5 w-full resize-none border rounded text-sm py-1 px-2 hover:outline-0 focus-visible:outline-0"
            :style="{
              color: $store.state.setting.appearance.theme.fontBasic,
              backgroundColor: $store.state.setting.appearance.theme.mainBackground,
              borderColor: $store.state.setting.appearance.theme.border,
            }"
            @blur="urlBlur"
          ></textarea>
          <div class="flex items-center flex-wrap">
            <Button :text="$store.state.currentLanguage.getUrlInfo" type="primary" class="w-32 mt-0.5" @click="getUrlInfo"></Button>
            <div class="flex items-center ml-auto" v-if="urlGetting">
              <span class="ml-0.5 text-left">{{ urlGettingMessage }}</span>
            </div>
            <span class="ml-auto ml-0.5" v-if="urlError">{{ $store.state.currentLanguage.urlErrorMessage }}</span>
          </div>
        </div>
        <div class="mt-2" v-if="menuSelected == 1 && data.type != 5">
          <span class="block">{{ $store.state.currentLanguage.arguments }}</span>
          <Input v-model:value="data.params" class="mt-1.5 w-full"></Input>
        </div>
        <check-box
          v-model:value="data.admin"
          :label="$store.state.currentLanguage.runAsAdministrator"
          class="mt-2"
          v-if="menuSelected == 1 && data.type != 5"
        />
        <!-- 系统 -->
        <div
          class="mt-2 border rounded text-sm"
          v-if="menuSelected == 4"
          data-simplebar
          :style="{
            color: $store.state.setting.appearance.theme.fontBasic,
            backgroundColor: $store.state.setting.appearance.theme.mainBackground,
            borderColor: $store.state.setting.appearance.theme.border,
            height: systemHeight + 'px',
          }"
        >
          <ul class="system-item-list flex flex-wrap m-1" :style="{ fontSize: $store.state.setting.item.fontSize + 'px' }">
            <li v-for="(item, index) of systemList" :key="'system-' + index" class="system-item" @click="changeSystem(item)">
              <div
                class="p-2 rounded"
                :style="{ backgroundColor: systemSelected == item.name ? $hexToRGBA($store.state.setting.appearance.theme.minorBackground, 0.3) : null }"
              >
                <div
                  v-if="item.htmlIcon != null"
                  class="mx-auto"
                  :style="[{ width: $store.state.setting.item.iconSize + 'px' }, { height: $store.state.setting.item.iconSize + 'px' }]"
                  v-html="sanitize(item.htmlIcon)"
                ></div>
                <img
                  v-else
                  :src="item.icon"
                  class="mx-auto"
                  :style="[{ width: $store.state.setting.item.iconSize + 'px' }, { height: $store.state.setting.item.iconSize + 'px' }]"
                />
                <p
                  class="text-center mt-2 mx-2"
                  :class="[`${$store.state.setting.item.itemNameRowCount == 2 ? 'item-name-tile-2' : 'item-name-tile-1'}`]"
                  :title="item.name"
                >
                  {{ item.name }}
                </p>
              </div>
            </li>
          </ul>
        </div>
        <!-- 多项目 -->
        <div class="mt-2 flex" v-if="menuSelected == 5">
          <div class="mr-0.5 w-1/2">
            <span class="block">{{ $store.state.currentLanguage.itemList }}</span>
            <div class="mt-2 flex items-center border" :style="{ borderColor: $store.state.setting.appearance.theme.border }">
              <svg class="mx-2 w-[18px] h-[18px]" :style="{ color: $store.state.setting.appearance.theme.fontBasic }" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
                />
              </svg>
              <input
                type="text"
                v-model="multipleItemSearchName"
                @keyup="multipleItemSearch"
                class="w-full resize-none text-sm py-1 hover:outline-0 focus-visible:outline-0"
                :style="{
                  color: $store.state.setting.appearance.theme.fontBasic,
                  borderColor: $store.state.setting.appearance.theme.border,
                  backgroundColor: $store.state.setting.appearance.theme.mainBackground,
                }"
              />
            </div>
            <ul class="mt-1 border h-[200px]" :style="{ borderColor: $store.state.setting.appearance.theme.border }" data-simplebar>
              <li
                v-for="(item, index) of itemList"
                class="flex items-center px-1 py-1 multiple-item"
                :key="'itemList-' + item.id + '-' + index"
                @click="selectedMultipleItem(item)"
                @mouseover="
                  $styleMouseover($event, 'multiple-item', ['background-color'], [$hexToRGBA($store.state.setting.appearance.theme.minorBackground, 0.3)])
                "
                @mouseout="$styleMouseout($event, 'multiple-item', ['background-color'])"
              >
                <template v-if="item.type != 5 || item.useAppxBackgroundColor == null || !item.useAppxBackgroundColor">
                  <div v-if="item.htmlIcon != null" class="w-[20px] h-[20px]" v-html="sanitize(item.htmlIcon)"></div>
                  <img v-else :src="getIconByClassification(item)" class="w-[20px] h-[20px]" />
                </template>
                <template v-else>
                  <div class="flex items-center justify-center w-[20px] h-[20px] min-w-[20px] min-h-[20px]" style="background-color: rgb(0, 120, 215)">
                    <img :src="getIconByClassification(item)" :style="[{ width: 20 - 8 + 'px' }, { height: 20 - 8 + 'px' }]" />
                  </div>
                </template>
                <span class="ml-2 item-name-tile-1" :title="getItemName(item.name)">{{ getItemName(item.name) }}</span>
              </li>
            </ul>
          </div>
          <div class="ml-0.5 w-1/2">
            <span class="block">{{ $store.state.currentLanguage.selectedItems }}</span>
            <ul class="mt-2 border h-[234px]" :style="{ borderColor: $store.state.setting.appearance.theme.border }" data-simplebar>
              <li
                v-for="(item, index) of data.itemList"
                class="flex items-center px-1 py-1 multiple-item"
                :key="'itemList-' + item.id + '-' + index"
                @click="deleteMultipleItem(item)"
                @mouseover="
                  $styleMouseover($event, 'multiple-item', ['background-color'], [$hexToRGBA($store.state.setting.appearance.theme.minorBackground, 0.3)])
                "
                @mouseout="$styleMouseout($event, 'multiple-item', ['background-color'])"
              >
                <template v-if="item.type != 5 || item.useAppxBackgroundColor == null || !item.useAppxBackgroundColor">
                  <div v-if="item.htmlIcon != null" class="w-[20px] h-[20px]" v-html="sanitize(item.htmlIcon)"></div>
                  <img v-else :src="getIconByClassification(item)" class="w-[20px] h-[20px]" />
                </template>
                <template v-else>
                  <div class="flex items-center justify-center w-[20px] h-[20px] min-w-[20px] min-h-[20px]" style="background-color: rgb(0, 120, 215)">
                    <img :src="getIconByClassification(item)" :style="[{ width: 20 - 8 + 'px' }, { height: 20 - 8 + 'px' }]" />
                  </div>
                </template>
                <span class="ml-2 item-name-tile-1" :title="getItemName(item.name)">{{ getItemName(item.name) }}</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="mt-2" v-if="menuSelected == 1 || menuSelected == 2 || menuSelected == 3 || menuSelected == 5">
          <span class="block">{{ $store.state.currentLanguage.remark }}</span>
          <textarea
            rows="2"
            v-model="data.remark"
            class="mt-1.5 w-full resize-none border rounded text-sm py-1 px-2 hover:outline-0 focus-visible:outline-0"
            :style="{
              color: $store.state.setting.appearance.theme.fontBasic,
              borderColor: $store.state.setting.appearance.theme.border,
              backgroundColor: $store.state.setting.appearance.theme.mainBackground,
            }"
          ></textarea>
        </div>
        <!-- 开始菜单 -->
        <div class="flex items-center border" :style="{ borderColor: $store.state.setting.appearance.theme.border }" v-if="menuSelected == 6">
          <svg class="mx-2 w-[18px] h-[18px]" :style="{ color: $store.state.setting.appearance.theme.fontBasic }" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
            />
          </svg>
          <input
            type="text"
            v-model="startMenuProgramListSearchName"
            @keyup="startMenuProgramItemSearch"
            class="w-full resize-none text-sm py-1 hover:outline-0 focus-visible:outline-0"
            :style="{
              color: $store.state.setting.appearance.theme.fontBasic,
              borderColor: $store.state.setting.appearance.theme.border,
              backgroundColor: $store.state.setting.appearance.theme.mainBackground,
            }"
            :readonly="getStartMenuProgramListMessage"
          />
        </div>
        <!-- 开始菜单 -->
        <div
          class="border rounded text-sm mt-1"
          v-if="menuSelected == 6"
          data-simplebar
          :style="{
            color: $store.state.setting.appearance.theme.fontBasic,
            borderColor: $store.state.setting.appearance.theme.border,
            backgroundColor: $store.state.setting.appearance.theme.mainBackground,
            height: startMenuProgramListHeight + 'px',
          }"
        >
          <span class="block mt-2 text-center" v-if="getStartMenuProgramListGetting">{{ getStartMenuProgramListMessage }}</span>
          <ul class="app-menu-item-list flex flex-wrap m-1" :style="{ fontSize: $store.state.setting.item.fontSize + 'px' }" v-else>
            <li v-for="(item, index) of filterStartMenuProgramList" :key="'app-' + index" class="app-menu-item">
              <div
                class="p-2 rounded app-menu-item-content"
                @mouseover="
                  $styleMouseover(
                    $event,
                    'app-menu-item-content',
                    ['background-color'],
                    [$hexToRGBA($store.state.setting.appearance.theme.minorBackground, 0.3)]
                  )
                "
                @mouseout="$styleMouseout($event, 'app-menu-item-content', ['background-color'])"
                @click="addStartMenuProgram(item)"
              >
                <img
                  :src="item.icon"
                  class="mx-auto"
                  :style="[{ width: $store.state.setting.item.iconSize + 'px' }, { height: $store.state.setting.item.iconSize + 'px' }]"
                />
                <p
                  class="text-center mt-2 mx-2"
                  :class="[
                    `${
                      $store.state.setting.item.itemNameRowCount == 2
                        ? $store.state.setting.item.hideEllipsis
                          ? 'item-name-tile-2-no-ellipsis'
                          : 'item-name-tile-2'
                        : $store.state.setting.item.hideEllipsis
                        ? 'item-name-tile-1-no-ellipsis'
                        : 'item-name-tile-1'
                    }`,
                  ]"
                  :title="item.name"
                >
                  {{ item.name }}
                </p>
              </div>
            </li>
          </ul>
        </div>
        <!-- Appx -->
        <div class="flex items-center border" :style="{ borderColor: $store.state.setting.appearance.theme.border }" v-if="menuSelected == 7">
          <svg class="mx-2 w-[18px] h-[18px]" :style="{ color: $store.state.setting.appearance.theme.fontBasic }" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
            />
          </svg>
          <input
            type="text"
            v-model="appxProgramListSearchName"
            @keyup="appxProgramItemSearch"
            class="w-full resize-none text-sm py-1 hover:outline-0 focus-visible:outline-0"
            :style="{
              color: $store.state.setting.appearance.theme.fontBasic,
              borderColor: $store.state.setting.appearance.theme.border,
              backgroundColor: $store.state.setting.appearance.theme.mainBackground,
            }"
            :readonly="getAppxProgramListMessage"
          />
        </div>
        <!-- Appx -->
        <div
          class="border rounded text-sm mt-1"
          v-if="menuSelected == 7"
          data-simplebar
          :style="{
            color: $store.state.setting.appearance.theme.fontBasic,
            borderColor: $store.state.setting.appearance.theme.border,
            backgroundColor: $store.state.setting.appearance.theme.mainBackground,
            height: appxProgramListHeight + 'px',
          }"
        >
          <span class="block mt-2 text-center" v-if="getAppxProgramListGetting">{{ getAppxProgramListMessage }}</span>
          <ul class="app-menu-item-list flex flex-wrap m-1" :style="{ fontSize: $store.state.setting.item.fontSize + 'px' }" v-else>
            <li v-for="(item, index) of filterAppxProgramList" :key="'appx-' + index" class="app-menu-item">
              <div
                class="p-2 rounded app-menu-item-content"
                @mouseover="
                  $styleMouseover(
                    $event,
                    'app-menu-item-content',
                    ['background-color'],
                    [$hexToRGBA($store.state.setting.appearance.theme.minorBackground, 0.3)]
                  )
                "
                @mouseout="$styleMouseout($event, 'app-menu-item-content', ['background-color'])"
                @click="addAppxProgram(item)"
              >
                <img
                  :src="item.icon"
                  class="mx-auto"
                  :style="[{ width: $store.state.setting.item.iconSize + 'px' }, { height: $store.state.setting.item.iconSize + 'px' }]"
                />
                <p
                  class="text-center mt-2 mx-2"
                  :class="[
                    `${
                      $store.state.setting.item.itemNameRowCount == 2
                        ? $store.state.setting.item.hideEllipsis
                          ? 'item-name-tile-2-no-ellipsis'
                          : 'item-name-tile-2'
                        : $store.state.setting.item.hideEllipsis
                        ? 'item-name-tile-1-no-ellipsis'
                        : 'item-name-tile-1'
                    }`,
                  ]"
                  :title="item.name"
                >
                  {{ item.name }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="absolute right-[1rem] bottom-[6px] flex items-center">
        <Button
          :text="$store.state.currentLanguage.ok"
          type="primary"
          class="w-20 mr-1"
          :class="check() ? '' : 'cursor-not-allowed'"
          @click="addEdit"
          v-if="menuSelected != 6 && menuSelected != 7"
        ></Button>
        <Button :text="$store.state.currentLanguage.cancel" class="w-20" type="cancel" @click="close"></Button>
      </div>
    </div>
    <Popup id="URLIcon" :width="clientWidth - 50 > 400 ? 400 : clientWidth - 50" :height="230" v-if="urlIconShow">
      <template #body>
        <URLIcon v-model:show="urlIconShow" @set="setURLIcon"></URLIcon>
      </template>
    </Popup>
    <Popup id="SVGIcon" :width="clientWidth - 50 > 400 ? 400 : clientWidth - 50" :height="230" v-if="svgIconShow">
      <template #body>
        <SVGIcon v-model:show="svgIconShow" @set="setSVGIcon"></SVGIcon>
      </template>
    </Popup>
  </div>
</template>

<script>
import "simplebar";
import "simplebar/dist/simplebar.css";
import CheckBox from "@/components/CheckBox";
import ClassificationJS from "@/views/classification/js/index.js";
import CommonJS from "@/common/index";
import Button from "@/components/Button";
import URI from "urijs";
import Close from "@/components/Close";
import Input from "@/components/Input";
import ItemJS from "@/views/item/js/index.js";
import SearchIndexJS from "@/views/search/js/index.js";
import Popup from "@/components/Popup";
import URLIcon from "@/views/item/URLIcon";
import SVGIcon from "@/views/item/SVGIcon";
import SystemIcon from "@/views/item/js/systemIcon";

const { ipcRenderer } = window.require("electron");
const path = window.require("path");

export default {
  name: "ItemAddEdit",
  components: { Input, Button, CheckBox, Close, Popup, URLIcon, SVGIcon },
  props: {
    // 0:添加 1:编辑
    type: {
      type: Number,
    },
    // id
    id: {
      type: Number,
    },
    // 父级分类ID
    classificationParentId: {
      type: Number,
    },
    // 子级分类ID
    classificationChildId: {
      type: Number,
    },
    // 是否显示
    show: {
      type: Boolean,
    },
  },
  data() {
    return {
      // 选中的菜单ID
      menuSelected: 1,
      // 菜单
      menuList: null,
      // 数据
      data: {
        // id
        id: null,
        // 父级分类ID
        classificationParentId: null,
        // 分类ID
        classificationId: null,
        // 起始位置
        startLocation: null,
        // 路径
        path: null,
        // url
        url: null,
        // 名称
        name: null,
        // 图标
        icon: null,
        // html图标
        htmlIcon: null,
        // 参数
        params: null,
        // 以管理员身份运行
        admin: false,
        // 类型 0:文件 1:文件夹 2:网址 3:系统 4:多项目 5:Appx
        type: 0,
        // 排序
        order: 0,
        // 拓展名
        extension: null,
        // 快捷键
        shortcutKey: null,
        // 全局快捷键
        globalShortcutKey: false,
        // 拼音
        pinyin: null,
        // 缩写
        initial: null,
        // shell
        shell: null,
        // 备注
        remark: null,
        // 项目列表
        itemList: null,
        // 使用Appx图标背景
        useAppxBackgroundColor: false,
        // 不参与刷新图标缓存
        notRefreshIcon: false,
      },
      // 快捷键
      oldShortcutKey: null,
      // 临时变量
      tempShortcutKey: null,
      // 获取网址中
      urlGetting: false,
      urlGettingMessage: null,
      urlGettingInterval: null,
      // 获取url信息失败
      urlError: false,
      // 快捷键校验内容
      shortcutKeyCheckMessage: null,
      // 网址默认图标
      websiteIcon:
        "data:image/png;base64,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",
      // 系统
      systemList: [],
      // 当前选择系统
      systemSelected: null,
      // 高度
      systemHeight: 0,
      // 多项目默认图标
      multipleItemIcon:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAEnUlEQVR4nO2cT2gcVRzHx31p/YdKRBAMRPyDIIKXgnioJ6EFm92tYMGD5CL0JOTgQTCHxpM3IQeVnRfRpkI1FtLMCxVB1O6sVbSCmkaoomWT97KR1trQdja7b5JfeduExmbdZjcz897s+33gd5vD5POdfW++ZPc5DoIgCIIgCGIJnoB+JsIhj4endd+LNbA56FPSGQ9LHperTISgRvd9dTXTZehl8+EgEyHzuJTr0jeO7nvsOibm4M5pHh5Q0pmQtWbSMYCI+foc3OFxmWVcjntcXrmVdAwgAiYAiCfquz0uCx6XS+1IxwA65BBARklnXI4yLhc7lY4BtMlUpfYUE3KEcflXFNIxgDake0KejVo6BrCFgsRilI4BbKEgMQMCGPCD/py/PJTzq6etK0hMUwD7Tl3tU9LzfrWULwareb8KahzbChJLMIB9/qXenB8M5vyA5f1ArkvfOI5tBYnFPMd5CKO/10FJzxWDWjPpqQwgqoLEYphJHsK7f0h4/ecavPRta+GpCiCOgsQiGo+HMPanhDd+qcGBNqUbH0CcBYltc5T0N3+twcunljuWbmQASRUk1sGMnwvhrTN1eOX7aKQbGYCp0gdjkI4BiObSj5YlvP1bHV79IV7pGIC4If2TuevSD/64DPsTkr7lAAqiP1MQQxnK42/MSS4vx+YlvHO2Dq/9tAwvlpKX3jKA9+f6GtJdXiIuXyVUgJrUB3B8rSA1pGsU3jSA98q9GXd+MEMFI5TLdekbJ5UBTG6jIMU9AycDeObEEjSku6LWTHoqA4iqIOVjmGwxgGc/X4KHPz0PO8cWWgpPXQBRF6R8RJPzq/DcF5fh0c8uwO0ftCfd+ADiLEj57UgvXpf++LF/4K4PO5duZABJFaR8B/P8l1fgycmLcM9HlUikGxmAqdLvO7wYuXQMwG8ufc9XV+HpqX/h/iPxSscA/BvS965Jf+DjvxOTbn0AL3wTwK7pS/DQ0fPQM5a8dCsDGFgrSEr6jjbf1TEADQWJYAB6CxLBAPQWJIIB6C1IBAPQW5AIBtA8AGKANKtfQ4kB0jAAql8cfgKofnm4BNH0D+4BFAPATThO8C1I4BJEDFjrcQ+g+mXjJkz1C8e3IGrWxLoB4yYsMABiwFOOnwCqXzQuQVS/bNwDqHmDmzC1PQAuQ3XyCf5DJib+R/qKkq6OnZlahAfVdRhATNwkflb9aHuqAo/cfB0GEBMeD2c8Hg6fKMNjra7DADSDAWgGA9CMXQHwMnH56A66sMsxBQsC4Ep6T0HsdgBuc0yjSwO4SFw+TijPOoegxzGZLgogIK6YaEifOLPTSQu3/t5/EKqjIQ0QvHlcUVVHE6hzIZzxyt1OGmn+vf9gRUlX53Jmv7vcaMzmSOehOvkkQxcOOkcu3Ouknf/KD2bzfnUke7K6qTETreL5SkN6QQw5dLHxQHQNuWIwkysGw/tL1ZaNmeh52mcJFSOOW9n0QFgHSVw6f0L332wUxLaCZBrEtoJkGsS2gmQaxLaCZBrEtoJkGsS2gmQaxLaCZBoEC5JeMi6fyVA+7BTKLRszgiAIgiAIgiAIgiBOF3ANa0KHP95zF1IAAAAASUVORK5CYII=",
      // map
      itemMap: null,
      // 搜索名
      multipleItemSearchName: null,
      // 项目列表
      itemList: [],
      // 开始菜单列表
      startMenuProgramList: null,
      filterStartMenuProgramList: null,
      // 高度
      startMenuProgramListHeight: 0,
      // 获取开始菜单定时任务
      getStartMenuProgramListGetting: false,
      getStartMenuProgramListInterval: null,
      getStartMenuProgramListMessage: null,
      startMenuProgramListSearchName: null,
      startMenuProgramItemMap: null,
      // Appx列表
      appxProgramList: null,
      filterAppxProgramList: null,
      // 高度
      appxProgramListHeight: 0,
      // 获取Appx定时任务
      getAppxProgramListGetting: false,
      getAppxProgramListInterval: null,
      getAppxProgramListMessage: null,
      appxProgramListSearchName: null,
      appxProgramItemMap: null,
      // 软件目录
      appPath: null,
      // 网络图标
      urlIconShow: false,
      // SVG代码图标
      svgIconShow: false,
      // 屏幕宽
      clientWidth: null,
      // 屏幕高
      clientHeight: null,
    };
  },
  created() {
    // 记录宽高
    this.clientWidth = document.documentElement.clientWidth;
    this.clientHeight = document.documentElement.clientHeight;
    // select列表
    this.setSelectList();
    if (this.type == 1) {
      // 项目ID
      this.data.id = this.id;
      // 根据ID获取分类
      let classification = ClassificationJS.getClassificationById(this.classificationParentId, this.classificationChildId);
      // 根据ID获取项目信息
      this.data = JSON.parse(JSON.stringify(ItemJS.getItemById(classification, this.data.id)));
      this.oldShortcutKey = this.data.shortcutKey;
      // 选中菜单
      this.menuSelected = this.data.type == 5 ? 1 : this.data.type + 1;
      // 多项目
      if (this.data.type == 4) {
        this.itemMap = SearchIndexJS.convertToMap(this.$store.state.list);
        this.itemList = this.getItemList();
      }
      // 获取图标
      this.data.icon = this.getIcon(this.classificationParentId, this.classificationChildId, this.data.id);
    }
    // 设置分类ID
    this.data = ItemJS.setItemClassificationId(this.data, this.classificationParentId, this.classificationChildId);
    // 监控快捷键
    this.$watch("data.shortcutKey", () => {
      if (this.tempShortcutKey != this.data.shortcutKey) {
        this.data.shortcutKey = this.tempShortcutKey;
      }
    });
    this.$nextTick(() => {
      this.setHeight();
    });
  },
  mounted() {
    this.setSelectList();
    this.$nextTick(() => {
      this.setItemWidth();
      this.monitorItemWidth();
      this.setHeight();
    });
    // 获取文件图标
    ipcRenderer.on("getFileBase64", (event, args) => {
      this.data.icon = args;
      this.data.htmlIcon = null;
    });
    // 获取网址信息
    ipcRenderer.on("getUrlInfo", (event, args) => {
      this.urlGetting = false;
      let result = JSON.parse(args);
      if (result.status) {
        this.data.name = result.name;
        this.data.icon = result.icon;
        this.data.htmlIcon = null;
      } else {
        this.urlError = true;
        this.data.icon = this.websiteIcon;
        this.data.htmlIcon = null;
      }
      clearInterval(this.urlGettingInterval);
      this.urlGettingMessage = null;
    });
    // 图片转base64
    ipcRenderer.on("imageToBase64", (event, args) => {
      this.data.icon = args;
      this.data.htmlIcon = null;
    });
    // 获取开始菜单列表
    ipcRenderer.on("resultStartMenuProgramList", (event, args) => {
      clearInterval(this.getStartMenuProgramListInterval);
      this.getStartMenuProgramListGetting = false;
      this.getStartMenuProgramListInterval = null;
      this.getStartMenuProgramListMessage = null;
      if (this.menuSelected == 6) {
        this.startMenuProgramList = JSON.parse(args);
        for (let item of this.startMenuProgramList) {
          ItemJS.setPinyin(item);
          ItemJS.setAbbr(item);
        }
        this.filterStartMenuProgramList = this.startMenuProgramList;
        this.startMenuProgramItemMap = new Map();
        SearchIndexJS.setMap(this.startMenuProgramItemMap, this.startMenuProgramList, null, null);
      }
    });
    // 获取Appx列表
    ipcRenderer.on("returnAppxList", (event, args) => {
      clearInterval(this.getAppxProgramListInterval);
      this.getAppxProgramListGetting = false;
      this.getAppxProgramListInterval = null;
      this.getAppxProgramListMessage = null;
      if (this.menuSelected == 7) {
        this.appxProgramList = JSON.parse(args);
        for (let item of this.appxProgramList) {
          ItemJS.setPinyin(item);
          ItemJS.setAbbr(item);
        }
        this.filterAppxProgramList = this.appxProgramList;
        this.appxProgramItemMap = new Map();
        SearchIndexJS.setMap(this.appxProgramItemMap, this.appxProgramList, null, null);
      }
    });
    // 监听键盘
    window.addEventListener("keydown", this.keydown, true);
    // 监听屏幕大小变化
    window.addEventListener("resize", this.resize, true);
  },
  unmounted() {
    clearInterval(this.urlGettingInterval);
    clearInterval(this.getStartMenuProgramListInterval);
    clearInterval(this.getAppxProgramListInterval);
    window.removeEventListener("keydown", this.keydown, true);
    window.removeEventListener("resize", this.resize, true);
  },
  updated() {
    this.$nextTick(() => {
      this.setItemWidth();
      this.monitorItemWidth();
      this.setHeight();
    });
  },
  watch: {
    "$store.state.setting.general.language": {
      handler() {
        this.setSelectList();
      },
    },
  },
  methods: {
    /**
     * 判断数组是否等于空
     */
    arrayIsEmpty: CommonJS.arrayIsEmpty,
    /**
     * 设置快捷键
     */
    setShortcutKey: CommonJS.setShortcutKey,
    /**
     * 判断字符串是否为空
     */
    strIsEmpty: CommonJS.strIsEmpty,
    /**
     * 过滤XSS
     */
    sanitize: CommonJS.DOMPurify.sanitize,
    /**
     * 获取图标
     */
    getIcon: CommonJS.getIcon,
    /**
     * 获取图标根据分类
     */
    getIconByClassification: CommonJS.getIconByClassification,
    /**
     * 获取项目名称
     */
    getItemName: ItemJS.getName,
    /**
     * 校验快捷键
     */
    checkShortcutKeys() {
      this.shortcutKeyCheckMessage = null;
      if (!this.strIsEmpty(this.data.shortcutKey)) {
        if (!CommonJS.checkShortcutKeys(this.data.shortcutKey.trim())) {
          this.shortcutKeyCheckMessage = this.$store.state.currentLanguage.shortcutKeyIncompleteMessage;
        } else {
          if (this.oldShortcutKey == null || this.oldShortcutKey.trim() != this.data.shortcutKey.trim()) {
            // 校验应用程序内快捷是否重复
            this.shortcutKeyCheckMessage = CommonJS.checkAppShortcutKeysDuplicate(this.data.shortcutKey.trim(), this.$store.state.appShortcutKeyMap);
            if (this.shortcutKeyCheckMessage == null) {
              // 校验设置中的快捷键是否重复
              this.shortcutKeyCheckMessage = CommonJS.checkSettingShortcutKeysDuplicate(this.data.shortcutKey.trim(), this.$store.state.setting, null);
            }
          }
        }
      }
      if (this.shortcutKeyCheckMessage != null) {
        ipcRenderer.send("errorMessage", this.shortcutKeyCheckMessage);
        this.data.shortcutKey = null;
        this.tempShortcutKey = null;
      }
    },
    /**
     * 关闭窗口
     */
    close() {
      this.$emit("update:show", false);
    },
    /**
     * 选择菜单
     * @param id
     */
    changeMenu(id) {
      this.menuSelected = id;
      if (this.menuSelected != 6 && this.menuSelected != 7) {
        this.data.type = id - 1;
      }
      // 清空数据
      this.data.startLocation = null;
      this.data.path = null;
      this.data.url = null;
      this.data.name = null;
      this.data.icon = null;
      this.data.htmlIcon = null;
      this.data.params = null;
      this.data.admin = false;
      this.data.extension = null;
      this.data.shortcutKey = null;
      this.data.globalShortcutKey = false;
      this.data.pinyin = null;
      this.data.initial = null;
      this.data.shell = null;
      this.data.remark = null;
      this.data.itemList = null;
      this.data.useAppxBackgroundColor = false;
      this.data.notRefreshIcon = false;
      this.urlGetting = false;
      this.urlGettingMessage = null;
      clearInterval(this.urlGettingInterval);
      clearInterval(this.getStartMenuProgramListInterval);
      clearInterval(this.getAppxProgramListInterval);
      this.urlGettingInterval = null;
      this.getStartMenuProgramListInterval = null;
      this.getAppxProgramListInterval = null;
      this.urlError = false;
      if (this.data.type == 2) {
        this.data.icon = this.websiteIcon;
        this.data.htmlIcon = null;
      } else if (this.data.type == 4) {
        this.data.icon = this.multipleItemIcon;
        this.data.htmlIcon = null;
        this.itemMap = SearchIndexJS.convertToMap(this.$store.state.list);
        this.itemList = this.getItemList();
      } else if (this.menuSelected == 6) {
        let _this = this;
        this.getStartMenuProgramListMessage = this.$store.state.currentLanguage.loading + "...";
        this.getStartMenuProgramListInterval = setInterval(() => {
          let split = _this.getStartMenuProgramListMessage.split(".");
          if (split.length < 4) {
            _this.getStartMenuProgramListMessage += ".";
          } else {
            _this.getStartMenuProgramListMessage = _this.$store.state.currentLanguage.loading + ".";
          }
        }, 500);
        ipcRenderer.send("getStartMenuProgramList");
        this.startMenuProgramList = null;
        this.filterStartMenuProgramList = null;
        this.startMenuProgramItemMap = null;
        this.startMenuProgramListSearchName = null;
        this.getStartMenuProgramListGetting = true;
      } else if (this.menuSelected == 7) {
        let _this = this;
        this.getAppxProgramListMessage = this.$store.state.currentLanguage.loading + "...";
        this.getAppxProgramListInterval = setInterval(() => {
          let split = _this.getAppxProgramListMessage.split(".");
          if (split.length < 4) {
            _this.getAppxProgramListMessage += ".";
          } else {
            _this.getAppxProgramListMessage = _this.$store.state.currentLanguage.loading + ".";
          }
        }, 500);
        ipcRenderer.send("getAppxList");
        this.appxProgramList = null;
        this.filterAppxProgramList = null;
        this.appxProgramItemMap = null;
        this.appxProgramListSearchName = null;
        this.getAppxProgramListGetting = true;
      }
    },
    /**
     * 上传文件
     * @param e
     */
    uploadFile(e) {
      let file = e.target.files[0];
      if (file != null) {
        this.data.path = file.path;
        this.data.name = file.name;
        // 去掉后缀
        if (this.data.type == 0 && !this.strIsEmpty(this.data.name)) {
          let arr = this.data.name.split(".");
          if (arr.length > 1) {
            let n = this.data.name.substring(0, this.data.name.lastIndexOf("."));
            if (n.trim() != "") {
              this.data.name = n;
            }
          }
        }
        ipcRenderer.send("getFileIcon", this.data.path);
      }
    },
    /**
     * 校验
     */
    check() {
      if (this.menuSelected == 1 || this.menuSelected == 2) {
        if (this.data.type == 5) {
          if (!this.strIsEmpty(this.data.name) && !this.strIsEmpty(this.data.shell)) {
            return true;
          }
        } else {
          if (!this.strIsEmpty(this.data.name) && !this.strIsEmpty(this.data.path)) {
            return true;
          }
        }
      } else if (this.menuSelected == 3) {
        if (!this.strIsEmpty(this.data.name) && !this.strIsEmpty(this.data.url)) {
          return true;
        }
      } else if (this.menuSelected == 4) {
        if (!this.strIsEmpty(this.data.name)) {
          return true;
        }
      } else if (this.menuSelected == 5) {
        if (!this.strIsEmpty(this.data.name) && !this.arrayIsEmpty(this.data.itemList)) {
          return true;
        }
      }
      return false;
    },
    /**
     * 添加修改
     */
    addEdit() {
      if (this.type == 0) {
        this.add();
      } else {
        this.edit();
      }
    },
    /**
     * 添加
     */
    async add() {
      if (this.check()) {
        // 校验快捷键
        this.checkShortcutKeys();
        if (this.shortcutKeyCheckMessage == null) {
          this.$emit("update:show", false);
          this.$emit("add", this.classificationParentId, this.classificationChildId, [JSON.parse(JSON.stringify(this.data))]);
        }
      }
    },
    /**
     * 修改
     */
    async edit() {
      if (this.check()) {
        // 校验快捷键
        this.checkShortcutKeys();
        if (this.shortcutKeyCheckMessage == null) {
          this.$emit("update:show", false);
          this.$emit("edit", this.classificationParentId, this.classificationChildId, JSON.parse(JSON.stringify(this.data)));
        }
      }
    },
    /**
     * 选择文件或文件夹
     */
    chooseFile() {
      if (this.menuSelected == 1) {
        let filePath = ipcRenderer.sendSync(
          "openFile",
          JSON.stringify({
            window: "mainWindow",
            target: true,
            defaultPath: this.data.path,
          })
        );
        if (!this.strIsEmpty(filePath)) {
          this.data.path = filePath;
          // 获取文件名称
          this.getFileName();
          // 去掉后缀
          if (this.data.type == 0 && !this.strIsEmpty(this.data.name)) {
            let arr = this.data.name.split(".");
            if (arr.length > 1) {
              let n = this.data.name.substring(0, this.data.name.lastIndexOf("."));
              if (n.trim() != "") {
                this.data.name = n;
              }
            }
          }
          ipcRenderer.send("getFileIcon", this.data.path);
        }
      } else {
        let filePath = ipcRenderer.sendSync(
          "openDirectory",
          JSON.stringify({
            window: "mainWindow",
            defaultPath: this.data.path,
          })
        );
        if (!this.strIsEmpty(filePath)) {
          this.data.path = filePath;
          this.getFileName();
          ipcRenderer.send("getFileIcon", this.data.path);
        }
      }
    },
    /**
     * 获取文件名称
     */
    getFileName() {
      let split = this.data.path.split("\\");
      let i = split.length - 1;
      let name;
      while (this.strIsEmpty(name) && i >= 0) {
        name = split[i];
        i--;
      }
      this.data.name = name;
    },
    /**
     * url失去焦点
     */
    urlBlur() {
      if (!this.strIsEmpty(this.data.url)) {
        let uri = new URI(this.data.url);
        if (this.strIsEmpty(uri.protocol())) {
          this.data.url = "http://" + this.data.url;
        }
      }
    },
    /**
     * 获取网页信息
     */
    getUrlInfo() {
      if (!this.strIsEmpty(this.data.url) && !this.urlGetting) {
        this.urlGetting = true;
        this.urlError = false;
        ipcRenderer.send("getUrlInfo", this.data.url);
        let _this = this;
        this.urlGettingMessage = this.$store.state.currentLanguage.gettingUrlInfo + "...";
        this.urlGettingInterval = setInterval(() => {
          let split = _this.urlGettingMessage.split(".");
          if (split.length < 4) {
            _this.urlGettingMessage += ".";
          } else {
            _this.urlGettingMessage = _this.$store.state.currentLanguage.gettingUrlInfo + ".";
          }
        }, 500);
      }
    },
    /**
     * 默认图标
     */
    defaultIcon() {
      if (this.data.type == 5) {
        ipcRenderer.send("imageToBase64", this.data.originalIcon);
      } else {
        ipcRenderer.send("getFileIcon", this.data.path);
      }
    },
    /**
     * 监听键盘
     * @param e
     */
    keydown(e) {
      if (e.keyCode == 27) {
        if (this.urlIconShow) {
          this.urlIconShow = false;
        } else if (this.svgIconShow) {
          this.svgIconShow = false;
        } else {
          this.close();
        }
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    },
    /**
     * 监控项目div宽度
     */
    monitorItemWidth() {
      let itemElementList = document.getElementsByClassName("system-item-list");
      if (!this.arrayIsEmpty(itemElementList)) {
        for (let i = 0; i < itemElementList.length; i++) {
          const observer = new ResizeObserver((entries) => {
            this.setItemWidth();
          });
          observer.observe(itemElementList[i]);
        }
      }
      let appItemElementList = document.getElementsByClassName("app-menu-item-list");
      if (!this.arrayIsEmpty(appItemElementList)) {
        for (let i = 0; i < appItemElementList.length; i++) {
          const observer = new ResizeObserver((entries) => {
            this.setItemWidth();
          });
          observer.observe(appItemElementList[i]);
        }
      }
    },
    /**
     * 设置项目宽度
     */
    setItemWidth() {
      let itemElementList = document.getElementsByClassName("system-item-list");
      if (!this.arrayIsEmpty(itemElementList)) {
        for (let i = 0; i < itemElementList.length; i++) {
          let itemElement = itemElementList[i];
          let width = itemElement.getBoundingClientRect().width;
          let num = Math.floor(width / this.$store.state.setting.item.width);
          let itemList = itemElement.getElementsByClassName("system-item");
          for (let i = 0; i < itemList.length; i++) {
            itemList[i].style.width = width / num + "px";
          }
        }
      }
      let appItemElementList = document.getElementsByClassName("app-menu-item-list");
      if (!this.arrayIsEmpty(appItemElementList)) {
        for (let i = 0; i < appItemElementList.length; i++) {
          let itemElement = appItemElementList[i];
          let width = itemElement.getBoundingClientRect().width;
          let num = Math.floor(width / this.$store.state.setting.item.width);
          let itemList = itemElement.getElementsByClassName("app-menu-item");
          for (let i = 0; i < itemList.length; i++) {
            itemList[i].style.width = width / num + "px";
          }
        }
      }
    },
    /**
     * 选择系统选项
     * @param item
     */
    changeSystem(item) {
      this.systemSelected = item.name;
      this.data.name = item.name;
      this.data.icon = item.icon;
      this.data.htmlIcon = item.htmlIcon;
      this.data.shell = item.shell;
    },
    /**
     * resize
     */
    resize() {
      this.setItemWidth();
      this.setHeight();
      // 记录宽高
      this.clientWidth = document.documentElement.clientWidth;
      this.clientHeight = document.documentElement.clientHeight;
    },
    /**
     * 获取项目列表
     */
    getItemList() {
      let itemList = [];
      for (let c of this.$store.state.list) {
        if (!this.arrayIsEmpty(c.childList)) {
          for (let cc of c.childList) {
            if (!this.arrayIsEmpty(cc.itemList)) {
              for (let item of cc.itemList) {
                itemList.push(item);
              }
            }
          }
        } else {
          if (!this.arrayIsEmpty(c.itemList)) {
            for (let item of c.itemList) {
              itemList.push(item);
            }
          }
        }
      }
      return itemList;
    },
    /**
     * 搜索项目
     */
    multipleItemSearch() {
      if (this.multipleItemSearchName == null || this.multipleItemSearchName == "") {
        this.itemList = this.getItemList();
      } else {
        this.itemList = SearchIndexJS.search(this.multipleItemSearchName, this.itemMap);
      }
    },
    /**
     * 获取项目所在列表的下标
     * @param item
     * @returns {number}
     */
    getItemListIndex(item) {
      let index;
      for (let i = 0; i < this.data.itemList.length; i++) {
        let iItem = this.data.itemList[i];
        if (iItem.classificationParentId == item.classificationParentId && iItem.classificationId == item.classificationId && iItem.id == item.id) {
          index = i;
        }
      }
      return index;
    },
    /**
     * 选中项目
     */
    selectedMultipleItem(item) {
      if (this.arrayIsEmpty(this.data.itemList)) {
        this.data.itemList = [];
        this.data.itemList.push(item);
      } else {
        let index = this.getItemListIndex(item);
        if (index == null) {
          this.data.itemList.push(item);
        } else if (index >= 0) {
          this.data.itemList.splice(index, 1);
        }
      }
    },
    /**
     * 删除项目
     * @param item
     */
    deleteMultipleItem(item) {
      let index = this.getItemListIndex(item);
      if (index != null && index >= 0) {
        this.data.itemList.splice(index, 1);
      }
    },
    /**
     * 设置高度
     */
    setHeight() {
      this.startMenuProgramListHeight = document.getElementById("item-add-edit").offsetHeight - 34 - 8 - 30 - 34 - 4 - 8;
      this.appxProgramListHeight = document.getElementById("item-add-edit").offsetHeight - 34 - 8 - 30 - 34 - 4 - 8;
      this.systemHeight = document.getElementById("item-add-edit").offsetHeight - 34 - 56 - 56 - 8 - 4 - 8 - 30 - 8 - 8;
    },
    /**
     * 从开始菜单添加项目
     * @param item
     */
    addStartMenuProgram(item) {
      let classificationParentId, classificationChildId;
      if (this.classificationChildId != null) {
        classificationParentId = this.classificationParentId;
        classificationChildId = this.classificationChildId;
      } else {
        classificationParentId = this.classificationParentId;
        classificationChildId = null;
      }
      ipcRenderer.send(
        "readFiles",
        JSON.stringify({
          classificationParentId: classificationParentId,
          classificationChildId: classificationChildId,
          path: [item.path],
        })
      );
    },
    /**
     * 从Appx添加项目
     * @param item
     */
    addAppxProgram(item) {
      let classificationParentId, classificationChildId;
      if (this.classificationChildId != null) {
        classificationParentId = this.classificationParentId;
        classificationChildId = this.classificationChildId;
      } else {
        classificationParentId = this.classificationParentId;
        classificationChildId = null;
      }
      item.type = 5;
      item.shell = "Shell:AppsFolder\\" + item.packageFamilyName + "!" + item.appId;
      this.$emit("appx", this.classificationParentId, this.classificationChildId, JSON.parse(JSON.stringify(item)));
    },
    /**
     * 搜索项目
     */
    startMenuProgramItemSearch() {
      if (this.startMenuProgramListSearchName == null || this.startMenuProgramListSearchName == "") {
        this.filterStartMenuProgramList = this.startMenuProgramList;
      } else {
        this.filterStartMenuProgramList = SearchIndexJS.search(this.startMenuProgramListSearchName, this.startMenuProgramItemMap);
      }
    },
    /**
     * 搜索Appx项目
     */
    appxProgramItemSearch() {
      if (this.appxProgramListSearchName == null || this.appxProgramListSearchName == "") {
        this.filterAppxProgramList = this.appxProgramList;
      } else {
        this.filterAppxProgramList = SearchIndexJS.search(this.appxProgramListSearchName, this.appxProgramItemMap);
      }
    },
    /**
     * 是否是绝对路径
     */
    isAbsolutePath: ItemJS.isAbsolutePath,
    /**
     * 转换路径
     */
    convertPath(p) {
      // 获取当前软件根目录
      if (this.appPath == null) {
        this.appPath = ipcRenderer.sendSync("getPath");
      }
      if (this.appPath != null) {
        if (ItemJS.isAbsolutePath(p)) {
          // 转换为相对路径
          this.data.path = path.relative(this.appPath, p);
        } else {
          // 转换为绝对路径
          this.data.path = path.resolve(this.appPath, p);
        }
      }
    },
    /**
     * 设置图标
     * @param icon
     */
    setURLIcon(icon) {
      if (!this.strIsEmpty(icon)) {
        this.data.icon = icon;
        this.data.htmlIcon = null;
      }
    },
    /**
     * 设置图标
     * @param svg
     */
    setSVGIcon(svg) {
      if (!this.strIsEmpty(svg)) {
        this.data.icon = null;
        this.data.htmlIcon = svg;
      }
    },
    /**
     * 本地图标
     */
    localIcon() {
      let filePath = ipcRenderer.sendSync(
        "openFile",
        JSON.stringify({
          window: "mainWindow",
          target: false,
          defaultPath: this.data.path,
        })
      );
      if (!CommonJS.strIsEmpty(filePath)) {
        ipcRenderer.send("uploadIcon", filePath);
      }
    },
    setSelectList() {
      // 获取release
      let release = ipcRenderer.sendSync("getRelease");
      this.menuList = [
        {
          id: 1,
          name: this.$store.state.currentLanguage.file,
        },
        {
          id: 2,
          name: this.$store.state.currentLanguage.folder,
        },
        {
          id: 3,
          name: this.$store.state.currentLanguage.url,
        },
        {
          id: 4,
          name: this.$store.state.currentLanguage.system,
        },
        {
          id: 6,
          name: this.$store.state.currentLanguage.startMenu,
        },
        {
          id: 7,
          name: "Appx",
        },
        {
          id: 5,
          name: this.$store.state.currentLanguage.multipleItem,
        },
      ];
      this.systemList = [
        {
          name: this.$store.state.currentLanguage.computer,
          shell: "shell:MyComputerFolder",
          icon: SystemIcon.computer(release),
        },
        {
          name: this.$store.state.currentLanguage.document,
          shell: "shell:DocumentsLibrary",
          icon: SystemIcon.document(release),
        },
        {
          name: this.$store.state.currentLanguage.controlPanel,
          shell: "shell:ControlPanelFolder",
          icon: SystemIcon.controlPanel(release),
        },
        {
          name: this.$store.state.currentLanguage.networkAndSharingCenter,
          shell: "control.exe /name Microsoft.NetworkAndSharingCenter",
          icon: SystemIcon.networkAndSharingCenter(),
        },
        {
          name: this.$store.state.currentLanguage.recycleBin,
          shell: "shell:RecycleBinFolder",
          icon: SystemIcon.recycleBin(release),
        },
        {
          name: this.$store.state.currentLanguage.fileExplorerOptions,
          shell: "control.exe folders",
          icon: SystemIcon.fileExplorerOptions(release),
        },
        {
          name: this.$store.state.currentLanguage.programsAndFeatures,
          shell: "appwiz.cpl",
          icon: SystemIcon.programsAndFeatures(),
        },
        {
          name: this.$store.state.currentLanguage.calculator,
          shell: "calc",
          icon: SystemIcon.calculator(),
        },
        {
          name: this.$store.state.currentLanguage.services,
          shell: "services.msc",
          icon: SystemIcon.services(),
        },
        {
          name: this.$store.state.currentLanguage.commandPrompt,
          shell: "cmd",
          icon: SystemIcon.commandPrompt(),
        },
        {
          name: this.$store.state.currentLanguage.taskManager,
          shell: "taskmgr",
          icon: SystemIcon.taskManager(release),
        },
        {
          name: this.$store.state.currentLanguage.registryEditor,
          shell: "regedit",
          icon: SystemIcon.registryEditor(),
        },
        {
          name: this.$store.state.currentLanguage.powerOptions,
          shell: "powercfg.cpl",
          icon: SystemIcon.powerOptions(),
        },
        {
          name: this.$store.state.currentLanguage.perfmon,
          shell: "perfmon.exe /res",
          icon: SystemIcon.perfmon(),
        },
        {
          name: this.$store.state.currentLanguage.computerManagement,
          shell: "compmgmt.msc /s",
          icon: SystemIcon.computerManagement(),
        },
        {
          name: this.$store.state.currentLanguage.shutdown,
          shell: "shutdown -s -t 0",
          htmlIcon:
            '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:100%; height:100%"><path stroke-linecap="round" stroke-linejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" /></svg>',
        },
        {
          name: this.$store.state.currentLanguage.restart,
          shell: "shutdown -r -t 0",
          htmlIcon:
            '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 100%; height: 100%;"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>',
        },
        {
          name: this.$store.state.currentLanguage.sleep,
          shell: "rundll32.exe powrprof.dll, SetSuspendState Sleep",
          htmlIcon:
            '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 100%; height: 100%;"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>',
        },
        {
          name: this.$store.state.currentLanguage.lock,
          shell: "rundll32.exe user32.dll LockWorkStation",
          htmlIcon:
            '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 100%; height: 100%;"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>',
        },
        {
          name: this.$store.state.currentLanguage.turnOffMonitor,
          shell: "turnOffMonitor",
          htmlIcon:
            '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 100%; height: 100%;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>',
        },
      ];
    },
  },
};
</script>
<style scoped>
.content {
  height: calc(100% - 34px - 46px);
}
</style>
