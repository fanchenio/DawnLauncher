<template>
  <div
    id="main"
    :style="{
      backgroundColor:
        this.$store.state.backgroundImage != null && this.setting.appearance.backgroundImageTransparency < 1
          ? null
          : $backgroundTransparencyBackgroundColor(setting),
      color: $backgroundTransparencyFontColor(setting, 1),
      backgroundImage:
        $store.state.backgroundImage != null && setting.appearance.backgroundImageTransparency == 1 ? 'url(' + $store.state.backgroundImage + ')' : null,
      backgroundRepeat: setting.appearance.backgroundImageMode,
      backgroundPosition: setting.appearance.backgroundImagePosition == 'default' ? null : setting.appearance.backgroundImagePosition,
      borderRadius: setting.appearance.backgroundTransparency < 1 && setting.appearance.windowRoundedCorners ? '8px' : null,
    }"
  >
    <div class="h-[34px] text-sm flex">
      <!-- 标题 -->
      <h1
        class="mx-2 flex items-center h-[34px] float-left w-[140px] app-region-drag"
        :style="{ filter: setting.appearance.useFontShadow ? 'drop-shadow(1px 1px 1px ' + setting.appearance.fontShadow + ')' : null }"
      >
        {{ setting.appearance.title }}
      </h1>
      <!-- 右上角操作按钮 -->
      <div class="flex flex-1 items-center app-region-drag">
        <div class="ml-auto flex items-center">
          <!-- 窗口 -->
          <div
            id="window-setting-menu"
            class="p-2 app-region-no-drag icon-menu"
            @click="(windowSetting = !windowSetting), (topRightMenu = false)"
            :class="[
              `${
                setting.general.alwaysTop || setting.general.fixedPosition || setting.general.alwaysCenter || setting.general.lockSize ? '!text-[#03C988]' : ''
              }`,
            ]"
            :title="$store.state.currentLanguage.window"
            :style="{
              color: $backgroundTransparencyFontColor(setting, 1),
              filter: setting.appearance.useFontShadow ? 'drop-shadow(1px 1px 1px ' + setting.appearance.fontShadow + ')' : null,
            }"
            @mouseover="$styleMouseover($event, 'icon-menu', ['color'], [$backgroundTransparencyFontColor(setting, 0.8)])"
            @mouseout="$styleMouseout($event, 'icon-menu', ['color'])"
          >
            <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24"><path fill="currentColor" d="M4,4H20V20H4V4M6,8V18H18V8H6Z" /></svg>
          </div>
          <!-- 搜索 -->
          <div
            id="search-menu"
            class="p-2 app-region-no-drag icon-menu"
            @click="searchInput"
            :title="$store.state.currentLanguage.search"
            :style="{
              color: $backgroundTransparencyFontColor(setting, 1),
              filter: setting.appearance.useFontShadow ? 'drop-shadow(1px 1px 1px ' + setting.appearance.fontShadow + ')' : null,
            }"
            @mouseover="$styleMouseover($event, 'icon-menu', ['color'], [$backgroundTransparencyFontColor(setting, 0.8)])"
            @mouseout="$styleMouseout($event, 'icon-menu', ['color'])"
          >
            <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
              />
            </svg>
          </div>
          <!-- 菜单 -->
          <div
            id="top-right-menu"
            class="p-2 app-region-no-drag icon-menu"
            @click="showMenu"
            :title="$store.state.currentLanguage.menu"
            :style="{
              color: $backgroundTransparencyFontColor(setting, 1),
              filter: setting.appearance.useFontShadow ? 'drop-shadow(1px 1px 1px ' + setting.appearance.fontShadow + ')' : null,
            }"
            @mouseover="$styleMouseover($event, 'icon-menu', ['color'], [$backgroundTransparencyFontColor(setting, 0.8)])"
            @mouseout="$styleMouseout($event, 'icon-menu', ['color'])"
          >
            <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24">
              <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
            </svg>
          </div>
          <!-- 关闭 -->
          <Close
            page="main"
            @click="hideMainWindowBefore"
            :key="'close-' + setting.appearance.theme.name"
            :style="{ filter: setting.appearance.useFontShadow ? 'drop-shadow(1px 1px 1px ' + setting.appearance.fontShadow + ')' : null }"
          ></Close>
        </div>
      </div>
    </div>
    <div
      class="text-sm"
      :class="[`${setting.classification.layout == 'left' ? 'float-left' : setting.classification.layout == 'right' ? 'float-right' : ''}`]"
      :style="{
        width:
          setting.classification.layout == 'left' || setting.classification.layout == 'right'
            ? setting.classification.mode == 'icon'
              ? '50px'
              : setting.classification.width + 'px'
            : 'auto',
      }"
      :key="setting.classification.layout"
    >
      <!-- 分类 -->
      <div id="classification-content" :key="'classification-key-' + classificationKey + '-' + lockClassification">
        <!-- 分类列表 -->
        <ul id="classification-list" class="px-[8px]" :class="[`${setting.classification.layout == 'top' ? 'flex flex-wrap' : ''}`]">
          <template v-for="(classification, index) of list" :key="'classification-' + classification.id + '-' + index">
            <li
              draggable="false"
              class="classification-parent"
              :class="[`${setting.classification.layout == 'top' ? 'px-0.5' : ''}`]"
              @mouseover="classificationMouseOver"
              @mouseout="classificationMouseOut"
              @dragleave="clearMouseOverSetTimeout"
              :id="'classification-' + classification.id"
            >
              <div
                class="mb-1 flex items-center h-[30px] rounded relative classification-parent-content"
                @click="changeClassification(classification.id, true)"
                :classification-parent-id="classification.id"
                :classification="true"
                :title="classification.name"
                :class="[
                  `${setting.classification.nameAlign == 'center' || setting.classification.mode == 'icon' ? 'justify-center' : ''}`,
                  `${setting.classification.mode == 'normal' ? 'px-2' : ''}`,
                ]"
                :style="{
                  color: isClassificationParentSelected(classification) ? $hexToRGBA(setting.appearance.theme.fontHover, 1) : null,
                  backgroundColor: isClassificationParentSelected(classification)
                    ? $hexToRGBA(setting.appearance.theme.minorBackground, setting.appearance.backgroundTransparency)
                    : null,
                }"
                @mouseover="
                  $styleMouseover(
                    $event,
                    'classification-parent-content',
                    ['color', 'background-color'],
                    [
                      $hexToRGBA(setting.appearance.theme.fontHover, 1),
                      $hexToRGBA(setting.appearance.theme.minorBackground, setting.appearance.backgroundTransparency),
                    ]
                  )
                "
                @mouseout="
                  $styleMouseout($event, 'classification-parent-content', isClassificationParentSelected(classification) ? [] : ['color', 'background-color'])
                "
                @dragleave="clearMouseOverSetTimeout"
              >
                <!-- 父级分类 -->
                <!-- 名称 -->
                <span
                  class="overflow-hidden text-ellipsis whitespace-nowrap"
                  :style="{ filter: setting.appearance.useFontShadow ? 'drop-shadow(1px 1px 1px ' + setting.appearance.fontShadow + ')' : null }"
                  >{{ getClassificationName(classification) }}</span
                >
                <!-- 收起图标 -->
                <svg
                  viewBox="0 0 24 24"
                  class="classification-show-hidden w-4 h-4 cursor-pointer absolute right-[2px]"
                  v-if="
                    !arrayIsEmpty(classification.childList) &&
                    !classificationChildShowHiddenMap.get(classification.id) &&
                    setting.classification.mode == 'normal'
                  "
                  @click="showHiddenClassificationChildList($event, classification.id, false)"
                  :style="{ filter: setting.appearance.useFontShadow ? 'drop-shadow(1px 1px 1px ' + setting.appearance.fontShadow + ')' : null }"
                >
                  <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                </svg>
                <!-- 展开图标 -->
                <svg
                  viewBox="0 0 24 24"
                  class="classification-show-hidden w-4 h-4 cursor-pointer absolute right-[2px]"
                  v-if="
                    !arrayIsEmpty(classification.childList) &&
                    classificationChildShowHiddenMap.get(classification.id) &&
                    setting.classification.mode == 'normal'
                  "
                  @click="showHiddenClassificationChildList($event, classification.id, false)"
                  :style="{ filter: setting.appearance.useFontShadow ? 'drop-shadow(1px 1px 1px ' + setting.appearance.fontShadow + ')' : null }"
                >
                  <path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                </svg>
              </div>
              <!-- 子级分类 -->
              <ul
                v-if="!arrayIsEmpty(classification.childList) && classificationChildShowHiddenMap.get(classification.id)"
                :id="'classification-child-' + classification.id"
                class="classification-child-list"
                :class="[
                  `${setting.classification.layout == 'top' ? 'absolute z-[10000] rounded drop-shadow-[0_0_6px_rgba(0,0,0,0.2)] origin-top-left menu' : ''}`,
                ]"
                :classification-parent-id="classification.id"
                :style="{ backgroundColor: setting.classification.layout == 'top' ? $backgroundTransparencyBackgroundColor(setting) : '' }"
              >
                <!-- 分类列表 -->
                <li
                  v-for="childClassification of classification.childList"
                  draggable="false"
                  class="classification-child"
                  @mouseover="classificationMouseOver"
                  @mouseout="classificationMouseOut"
                  @dragleave="clearMouseOverSetTimeout"
                >
                  <div
                    @click="changeChildClassification(classification.id, childClassification.id)"
                    :classification-parent-id="classification.id"
                    :classification-child-id="childClassification.id"
                    :classification-child="true"
                    :title="childClassification.name"
                    class="my-1 flex items-center h-[30px] text-left classification-child-content"
                    :class="[
                      `${setting.classification.nameAlign == 'center' || setting.classification.mode == 'icon' ? 'justify-center' : ''}`,
                      `${setting.classification.layout == 'left' || setting.classification.layout == 'right' ? 'rounded' : ''}`,
                      `${setting.classification.mode == 'normal' ? 'px-2' : ''}`,
                    ]"
                    :style="{
                      color: isClassificationChildSelected(classification, childClassification) ? $hexToRGBA(setting.appearance.theme.fontHover, 1) : null,
                      backgroundColor: isClassificationChildSelected(classification, childClassification)
                        ? $hexToRGBA(setting.appearance.theme.minorBackground, setting.appearance.backgroundTransparency)
                        : null,
                    }"
                    @mouseover="
                      $styleMouseover(
                        $event,
                        'classification-child-content',
                        ['color', 'background-color'],
                        [
                          $hexToRGBA(setting.appearance.theme.fontHover, 1),
                          $hexToRGBA(setting.appearance.theme.minorBackground, setting.appearance.backgroundTransparency),
                        ]
                      )
                    "
                    @mouseout="
                      $styleMouseout(
                        $event,
                        'classification-child-content',
                        isClassificationChildSelected(classification, childClassification) ? [] : ['color', 'background-color']
                      )
                    "
                    @dragleave="clearMouseOverSetTimeout"
                  >
                    <span
                      class="overflow-hidden text-ellipsis whitespace-nowrap"
                      :style="{
                        filter: setting.appearance.useFontShadow ? 'drop-shadow(1px 1px 1px ' + setting.appearance.fontShadow + ')' : null,
                      }"
                      >{{ getClassificationName(childClassification) }}</span
                    >
                  </div>
                </li>
                <li
                  v-if="setting.classification.layout == 'left' || setting.classification.layout == 'right'"
                  class="h-[1px] my-1 border-t-[1px]"
                  :style="{ borderColor: $hexToRGBA(setting.appearance.theme.border, setting.appearance.backgroundTransparency) }"
                ></li>
              </ul>
            </li>
          </template>
        </ul>
      </div>
    </div>
    <div class="overflow-hidden">
      <!-- 项目 -->
      <div
        id="item-content"
        class="h-full w-full text-sm"
        :class="[`${setting.classification.layout == 'left' ? 'px-2' : setting.classification.layout == 'right' ? 'px-[8px]' : 'px-[10px] pt-[8px]'}`]"
        :key="'item-' + setting.appearance.theme.name + '-' + lockItem"
      >
        <!-- 没有选中子分类 -->
        <template v-if="classificationChildSelected == null">
          <!-- 是否拥有子分类，如果有的话，就把子分类里面所有的项目分组显示出来 -->
          <template v-if="haveClassificationChild(classificationParentSelected)">
            <div
              v-for="(classification, index) of getClassificationChildList(classificationParentSelected)"
              :key="'item-' + classification.id + '-' + index"
              :classification-child-id="classification.id"
              :classification-child-item="true"
            >
              <p
                :style="{
                  filter: setting.appearance.useFontShadow ? 'drop-shadow(1px 1px 1px ' + setting.appearance.fontShadow + ')' : null,
                  fontSize: setting.subClassification.itemAreaNameFontSize + 'px',
                  fontWeight: setting.subClassification.itemAreaNameFontWeight,
                  lineHeight: setting.subClassification.itemAreaNameFontLineHeight + 'rem',
                }"
              >
                {{ classification.icon != null ? classification.icon + " " : null }}{{ classification.name }}
              </p>
              <ItemList
                v-if="!arrayIsEmpty(getItemList(classificationParentSelected, classification.id))"
                :classificationChildId="classification.id"
                :classificationChildItem="true"
                :classificationParentId="classificationParentSelected"
                :itemList="getItemList(classificationParentSelected, classification.id)"
                :itemChild="true"
                :layout="classification.layout"
                :iconSize="classification.iconSize"
                :invalidItemList="invalidItemList"
                :itemSorting="itemSorting"
                :dragOut="dragOut"
                :batchOperation="batchOperation"
                :itemSortingMap="itemSortingMap"
                :showOnly="classification.showOnly"
                :key="'itemList-' + classificationParentSelected + '-' + classification.id + '-' + itemKey"
              ></ItemList>
              <div
                v-else
                class="item-list flex flex-wrap pb-2 w-full pt-2 min-h-[20px]"
                :classification-child-id="classification.id"
                :classification-child-item="true"
                :style="{ fontSize: $store.state.setting.item.fontSize + 'px' }"
              ></div>
            </div>
          </template>
          <!-- 没有子分类 -->
          <ItemList
            v-else
            :classificationParentId="classificationParentSelected"
            :classificationChildId="classificationChildSelected"
            :itemList="getItemList(classificationParentSelected, null)"
            :itemChild="false"
            :layout="getClassificationById(classificationParentSelected, null).layout"
            :iconSize="getClassificationById(classificationParentSelected, null).iconSize"
            :invalidItemList="invalidItemList"
            :itemSorting="itemSorting"
            :dragOut="dragOut"
            :batchOperation="batchOperation"
            :itemSortingMap="itemSortingMap"
            :showOnly="getClassificationById(classificationParentSelected, null).showOnly"
            :key="'itemList-' + classificationParentSelected + '-' + itemKey"
          ></ItemList>
        </template>
        <!-- 选中了子分类 -->
        <ItemList
          v-else
          :classificationParentId="classificationParentSelected"
          :classificationChildId="classificationChildSelected"
          :itemList="getItemList(classificationParentSelected, classificationChildSelected)"
          :itemChild="true"
          :layout="getClassificationById(classificationParentSelected, classificationChildSelected).layout"
          :iconSize="getClassificationById(classificationParentSelected, classificationChildSelected).iconSize"
          :invalidItemList="invalidItemList"
          :itemSorting="itemSorting"
          :dragOut="dragOut"
          :batchOperation="batchOperation"
          :itemSortingMap="itemSortingMap"
          :showOnly="getClassificationById(classificationParentSelected, classificationChildSelected).showOnly"
          :key="'itemList-' + classificationParentSelected + '-' + classificationChildSelected + '-' + itemKey"
        ></ItemList>
      </div>
    </div>
    <!-- 搜索 -->
    <Search v-if="search" v-model:show="search"></Search>
    <!-- 窗口设置 -->
    <div
      id="window-setting"
      class="fixed z-[10000] top-[40px] right-[65px] rounded drop-shadow-[0_0_6px_rgba(0,0,0,0.2)] py-1.5 origin-top-left app-region-no-drag"
      v-if="windowSetting"
      :style="{ backgroundColor: $backgroundTransparencyBackgroundColor(setting) }"
    >
      <div class="px-3 py-1.5 text-xs flex items-center">
        <check-box
          size="small"
          v-model:value="setting.general.alwaysTop"
          :label="$store.state.currentLanguage.alwaysTop"
          @change="setAlwaysTop"
          :style="{ filter: setting.appearance.useFontShadow ? 'drop-shadow(1px 1px 1px ' + setting.appearance.fontShadow + ')' : null }"
        />
      </div>
      <div class="px-3 py-1.5 text-xs flex items-center">
        <check-box
          size="small"
          v-model:value="setting.general.lockSize"
          :label="$store.state.currentLanguage.lockSize"
          @change="setResize"
          :style="{ filter: setting.appearance.useFontShadow ? 'drop-shadow(1px 1px 1px ' + setting.appearance.fontShadow + ')' : null }"
        />
      </div>
      <div class="px-3 py-1.5 text-xs flex items-center">
        <check-box
          size="small"
          v-model:value="setting.general.fixedPosition"
          :label="$store.state.currentLanguage.fixedPosition"
          @change="setFixedPosition"
          :style="{ filter: setting.appearance.useFontShadow ? 'drop-shadow(1px 1px 1px ' + setting.appearance.fontShadow + ')' : null }"
        />
      </div>
      <div class="px-3 py-1.5 text-xs flex items-center">
        <check-box
          size="small"
          v-model:value="setting.general.alwaysCenter"
          :label="$store.state.currentLanguage.alwaysCenter"
          @change="setAlwaysCenter"
          :style="{ filter: setting.appearance.useFontShadow ? 'drop-shadow(1px 1px 1px ' + setting.appearance.fontShadow + ')' : null }"
        />
      </div>
    </div>
    <!-- 右上角菜单 -->
    <div
      id="menu"
      class="fixed z-[10000] min-w-[128px] top-[40px] right-[20px] rounded py-1.5 origin-top-left app-region-no-drag"
      :class="setting.appearance.backgroundTransparency == 1 ? 'drop-shadow-[0_0_6px_rgba(0,0,0,0.2)]' : ''"
      v-if="topRightMenu"
      :style="{ backgroundColor: $backgroundTransparencyBackgroundColor(setting) }"
    >
      <template v-for="(menu, index) of menuList">
        <div
          v-if="menu.type != null && menu.type == 'separator' && (menu.show == null || menu.show)"
          class="w-full border-t border-solid my-1"
          :style="{ borderColor: $hexToRGBA(setting.appearance.theme.border, setting.appearance.backgroundTransparency) }"
        ></div>
        <div
          v-else-if="menu.show == null || menu.show"
          class="menu-item px-3 py-1.5 text-xs flex items-center"
          @click="menu.func"
          :key="'menu-' + index"
          @mouseover="
            $styleMouseover(
              $event,
              'menu-item',
              ['background-color', 'color'],
              [
                $hexToRGBA(setting.appearance.theme.minorBackground, setting.appearance.backgroundTransparency),
                $hexToRGBA(setting.appearance.theme.fontHover, 1),
              ]
            )
          "
          @mouseout="$styleMouseout($event, 'menu-item', ['background-color', 'color'])"
        >
          <span :style="{ filter: setting.appearance.useFontShadow ? 'drop-shadow(1px 1px 1px ' + setting.appearance.fontShadow + ')' : null }">{{
            menu.name
          }}</span>
        </div>
      </template>
    </div>
    <!-- 分类 -->
    <Popup id="classification-add-edit" :width="clientWidth - 50 > 400 ? 400 : clientWidth - 50" :height="185" v-if="classificationAddEditForm.show">
      <template #body>
        <ClassificationAddEdit
          :type="classificationAddEditForm.type"
          :id="classificationAddEditForm.id"
          :parentId="classificationAddEditForm.parentId"
          v-model:show="classificationAddEditForm.show"
          @add="addClassification"
          @edit="editClassification"
        ></ClassificationAddEdit>
      </template>
    </Popup>
    <!-- 分类图标 -->
    <Popup id="classification-icon" :width="clientWidth - 50 > 372 ? 372 : clientWidth - 50" :height="clientHeight - 50" v-if="classificationIconForm.show">
      <template #body>
        <ClassificationIcon
          :id="classificationIconForm.id"
          :parentId="classificationIconForm.parentId"
          v-model:show="classificationIconForm.show"
          @setIcon="setIcon"
        ></ClassificationIcon>
      </template>
    </Popup>
    <!-- 分类关联文件夹 -->
    <Popup
      id="classification-associated-folder"
      :width="clientWidth - 50 > 400 ? 400 : clientWidth - 50"
      :height="280"
      v-if="classificationAssociatedFolderForm.show"
    >
      <template #body>
        <ClassificationAssociatedFolder
          :id="classificationAssociatedFolderForm.id"
          :parentId="classificationAssociatedFolderForm.parentId"
          v-model:show="classificationAssociatedFolderForm.show"
          @set="setClassificationAssociatedFolder"
        ></ClassificationAssociatedFolder>
      </template>
    </Popup>
    <!-- 聚合分类 -->
    <Popup id="classification-aggregate" :width="clientWidth - 50 > 400 ? 400 : clientWidth - 50" :height="260" v-if="classificationAggregateForm.show">
      <template #body>
        <ClassificationAggregate
          :id="classificationAggregateForm.id"
          :parentId="classificationAggregateForm.parentId"
          v-model:show="classificationAggregateForm.show"
          @set="setClassificationAggregate"
        ></ClassificationAggregate>
      </template>
    </Popup>
    <!-- 项目 -->
    <Popup id="item-add-edit" :width="clientWidth - 50 > 600 ? 600 : clientWidth - 50" :height="clientHeight - 50" v-if="itemAddEditForm.show">
      <template #body>
        <ItemAddEdit
          :type="itemAddEditForm.type"
          :id="itemAddEditForm.id"
          :classificationParentId="itemAddEditForm.classificationParentId"
          :classificationChildId="itemAddEditForm.classificationChildId"
          v-model:show="itemAddEditForm.show"
          @add="addItem"
          @edit="editItem"
          @appx="addAppxItem"
        ></ItemAddEdit>
      </template>
    </Popup>
    <!-- 关于 -->
    <Popup id="about" :width="clientWidth - 50 > 600 ? 600 : clientWidth - 50" v-if="showAbout">
      <template #body>
        <About v-model:show="showAbout"></About>
      </template>
    </Popup>
    <!-- 备份/恢复数据 -->
    <Popup id="setting" :width="250" :height="80" v-if="showBackupRestore">
      <template #body>
        <BackupRestore v-model:show="showBackupRestore"></BackupRestore>
      </template>
    </Popup>
    <canvas id="canvas" class="hidden"></canvas>
  </div>
</template>

<script>
import SimpleBar from "simplebar";
import "simplebar/dist/simplebar.css";
import Sortable, { MultiDrag } from "sortablejs";
Sortable.mount(new MultiDrag());
import Popup from "@/components/Popup";
import ClassificationAddEdit from "@/views/classification/AddEdit";
import ItemAddEdit from "@/views/item/AddEdit";
import About from "@/views/about/Index";
import Setting from "@/views/setting/Index";
import CommonJS from "@/common";
import ItemList from "@/views/item/ItemList";
import ClassificationJS from "@/views/classification/js/index.js";
import ItemJS from "@/views/item/js/index.js";
import Search from "@/views/search/Index";
import Close from "@/components/Close";
import BackupRestore from "@/views/data/BackupRestore";
import Button from "@/components/Button";
import SettingJS from "@/views/setting/js/index.js";
import CheckBox from "@/components/CheckBox";
import ClassificationIcon from "@/views/classification/Icon";
import ClassificationAssociatedFolder from "@/views/classification/AssociatedFolder";
import ClassificationAggregate from "@/views/classification/Aggregate";
const { ipcRenderer } = window.require("electron");
const path = window.require("path");

export default {
  name: "Index",
  components: {
    BackupRestore,
    Popup,
    ClassificationAddEdit,
    ItemAddEdit,
    About,
    Setting,
    ItemList,
    Search,
    Close,
    Button,
    SimpleBar,
    CheckBox,
    ClassificationIcon,
    ClassificationAssociatedFolder,
    ClassificationAggregate,
  },
  data() {
    return {
      // 数据列表
      list: [],
      // 选中的父级分类ID
      classificationParentSelected: null,
      // 选中的子级分类ID
      classificationChildSelected: null,
      // 更新DOM用
      classificationKey: 0,
      // 更新DOM用
      itemKey: 0,
      // 计时器分类单击双击多次点击用
      classificationTimer: null,
      // 点击分类次数
      classificationCounter: 0,
      // 存储父级分类是否展开或收起
      classificationChildShowHiddenMap: new Map(),
      // 分类
      classificationAddEditForm: {
        // 是否显示
        show: false,
        // 0:添加 1:编辑
        type: 0,
        // id
        id: null,
        // 父级ID
        parentId: null,
      },
      // 项目
      itemAddEditForm: {
        // 是否显示
        show: false,
        // 0:添加 1:编辑
        type: 0,
        // id
        id: null,
        // 父级分类ID
        classificationParentId: null,
        // 子级分类ID
        classificationChildId: null,
        // 类型 0:文件 1:文件夹 2:网址
        itemType: null,
      },
      // 关于
      showAbout: false,
      // 菜单
      menuList: [],
      // 设置
      setting: null,
      // 右上角菜单
      topRightMenu: false,
      // 搜索
      search: false,
      // sortable
      classificationParentSortable: null,
      classificationChildSortableList: null,
      // 分类推拽中
      classificationSorting: false,
      itemSortableList: null,
      // 备份/恢复数据
      showBackupRestore: false,
      // 拖出
      dragOut: false,
      // 拖出的项目
      dragOutItem: null,
      // 锁定项目
      lockItem: false,
      // 屏幕宽
      clientWidth: null,
      // 屏幕高
      clientHeight: null,
      // 窗口设置
      windowSetting: false,
      // 拖拽中
      itemSorting: false,
      // 拖拽项目
      itemSortingMap: null,
      // 拖拽鼠标悬浮分类信息
      itemSortingClassificationInfo: null,
      // 锁定分类
      lockClassification: false,
      // 无效项目列表
      invalidItemList: [],
      // 分类悬浮信息
      mouseHoverClassificationParentId: null,
      mouseHoverClassificationChildId: null,
      mouseHoverSetTimeout: null,
      // 分类图标
      classificationIconForm: {
        // 是否显示
        show: false,
        // id
        id: null,
        // 父级ID
        parentId: null,
      },
      // 关联文件夹
      classificationAssociatedFolderForm: {
        // 是否显示
        show: false,
        // id
        id: null,
        // 父级ID
        parentId: null,
      },
      // 聚合分类
      classificationAggregateForm: {
        // 是否显示
        show: false,
        // id
        id: null,
        // 父级ID
        parentId: null,
      },
      // 批量操作
      batchOperation: false,
      // 批量操作数据
      batchOperationData: null,
      // 保存需要改动的图标数据
      updateIconData: null,
      // 项目滚动条
      itemContentSimpleBar: null,
    };
  },
  created() {
    if (process.env.NODE_ENV === "production") {
      // 统计
      ipcRenderer.send("statistics");
    }
    // 记录宽高
    this.clientWidth = document.documentElement.clientWidth;
    this.clientHeight = document.documentElement.clientHeight;
    // 获取锁定项目
    this.lockItem = ipcRenderer.sendSync("getLockItem");
    // 获取锁定分类
    this.lockClassification = ipcRenderer.sendSync("getLockClassification");
    // 获取数据
    this.getAllData();
    // 初始化映射文件夹
    ipcRenderer.send("initMapDirectory");
    // 创建快捷搜索窗口
    if (this.setting.quickSearch.enable) {
      ipcRenderer.send("createSearchWindow");
    }
    // 校验无效项目
    if (this.setting.item.checkInvalidItem) {
      ipcRenderer.send("checkInvalidItem");
    }
    // 获取背景图
    if (this.setting.appearance.backgroundImage != null) {
      ipcRenderer.send("getBackgroundImageBase64", JSON.stringify({ backgroundImage: this.setting.appearance.backgroundImage, page: "main" }));
    } else {
      this.$store.state.backgroundImage = null;
    }
    // 创建样式
    this.createStyle();
  },
  updated() {
    if (!this.itemSorting && !this.classificationSorting) {
      this.$nextTick(() => {
        // 监控分类div宽度
        this.monitorClassificationWidth();
        // 初始化
        this.init();
        // 监控项目div宽度
        this.monitorItemWidth();
        // 监听滚轮
        this.mouseWheelListener();
        // 分类滚动条
        this.classificationSimpleBar();
        // 项目滚动条
        this.itemSimpleBar();
      });
    }
  },
  mounted() {
    let _this = this;
    this.$nextTick(() => {
      // 监控分类div宽度
      this.monitorClassificationWidth();
      // 初始化
      this.init();
      // 监测项目div宽度
      this.monitorItemWidth();
      // 分类滚动条
      this.classificationSimpleBar();
      // 项目滚动条
      this.itemSimpleBar();
    });
    window.addEventListener("dragstart", this.dragstart, true);
    window.addEventListener("dragover", this.dragover, true);
    window.addEventListener("drop", this.drop, true);
    // 右键菜单
    window.addEventListener("contextmenu", this.rightMenu, true);
    // 监听屏幕大小变化
    window.addEventListener("resize", this.resize, true);
    // 监听键盘
    window.addEventListener("keydown", this.keydown, true);
    // 监听滚轮
    this.mouseWheelListener();
    // 显示添加编辑分类窗口
    ipcRenderer.on("showClassificationAddEditWindow", (event, args) => {
      let params = JSON.parse(args);
      this.showClassificationAddEditWindow(params.type, params.id, params.parentId);
    });
    // 删除分类
    ipcRenderer.on("classificationDelete", (event, args) => {
      let params = JSON.parse(args);
      this.deleteClassification(params.id, params.parentId);
    });
    // 显示添加编辑项目窗口
    ipcRenderer.on("showItemAddEditWindow", (event, args) => {
      let params = JSON.parse(args);
      this.showItemAddEditWindow(params.type, params.classificationParentId, params.classificationChildId, params.id, params.itemType);
    });
    // 添加项目
    ipcRenderer.on("itemAdd", async (event, args) => {
      let params = JSON.parse(args);
      this.addItem(params.classificationParentId, params.classificationChildId, params.itemList, params.clear);
    });
    // 删除项目
    ipcRenderer.on("deleteItem", (event, args) => {
      let params = JSON.parse(args);
      this.deleteItem(params.classificationParentId, params.classificationChildId, params.id);
    });
    // 清空项目
    ipcRenderer.on("clearItem", (event, args) => {
      let params = JSON.parse(args);
      this.clearItem(params.classificationParentId, params.classificationChildId, params.confirm);
    });
    // 移动项目
    ipcRenderer.on("moveItem", async (event, args) => {
      let params = JSON.parse(args);
      this.moveItem(params.from, params.to, params.del);
    });
    // 关闭搜索框
    ipcRenderer.on("closeSearch", (event, args) => {
      this.search = false;
    });
    // 重新获取数据
    ipcRenderer.on("getAllData", () => {
      // 记录旧设置
      let oldSetting = JSON.parse(JSON.stringify(this.setting));
      // 隐藏备份恢复窗口
      this.showBackupRestore = false;
      // 校验项目清空
      this.invalidItemList = [];
      // 背景图清空
      this.$store.state.backgroundImage = null;
      // 清除记住的分类
      localStorage.setItem("classificationSelected", null);
      // 清空数据
      this.clearItemSortingData();
      // 获取数据
      this.getAllData();
      // 隐藏搜索窗口
      ipcRenderer.send("hideSearchWindow");
      // 隐藏设置窗口
      ipcRenderer.send("closeSettingWindow");
      // 通知搜索窗口重新获取图标数据
      ipcRenderer.send("searchWindowGetIconData");
      // 重新设置
      SettingJS.resetSetting(this.setting);
      // 获取背景图
      if (this.setting.appearance.backgroundImage != null) {
        ipcRenderer.send("getBackgroundImageBase64", JSON.stringify({ backgroundImage: this.setting.appearance.backgroundImage, page: "main" }));
      } else {
        this.$store.state.backgroundImage = null;
      }
      // 背景透明
      if (oldSetting.appearance.backgroundTransparency != this.setting.appearance.backgroundTransparency) {
        ipcRenderer.send("setBackgroundTransparency", this.setting.appearance.backgroundTransparency);
      }
    });
    // 取消拖出状态
    ipcRenderer.on("cancelDragOut", () => {
      this.dragOutItem = null;
      this.dragOut = false;
    });
    // 设置锁定项目
    ipcRenderer.on("setLockItem", (event, args) => {
      this.lockItem = args;
    });
    // 项目排序
    ipcRenderer.on("itemSort", (event, args) => {
      let params = JSON.parse(args);
      this.itemSort(params.classificationParentId, params.classificationChildId, params.sort);
    });
    // 记录使用次数
    ipcRenderer.on("setItemData", (event, args) => {
      let params = JSON.parse(args);
      let { classificationParentId, classificationChildId } = ClassificationJS.convertClassificationId(
        params.item.classificationId,
        params.item.classificationParentId
      );
      let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
      if (classification != null) {
        let t = ItemJS.getItemById(classification, params.item.id);
        if (t != null) {
          if (this.setting.item.openNumber) {
            if (t.openNumber == null) {
              t.openNumber = 1;
            } else {
              t.openNumber = t.openNumber + 1;
            }
          }
          t.lastOpen = new Date().getTime();
          if (params.recordQuickSearch) {
            // 记录快速搜索打开记录
            if (t.quickSearchOpenNumber == null) {
              t.quickSearchOpenNumber = 1;
            } else {
              t.quickSearchOpenNumber = t.quickSearchOpenNumber + 1;
            }
            t.quickSearchLastOpen = new Date().getTime();
          }
          this.setList();
        }
      }
    });
    // 单独设置布局
    ipcRenderer.on("itemTile", (event, args) => {
      let params = JSON.parse(args);
      let classification = ClassificationJS.getClassificationById(params.classificationParentId, params.classificationChildId);
      if (classification != null) {
        if (!this.arrayIsEmpty(classification.childList)) {
          for (let c of classification.childList) {
            if (params.type == "default") {
              delete c.layout;
            } else {
              c.layout = params.type;
            }
          }
          delete classification.layout;
        } else {
          if (params.type == "default") {
            delete classification.layout;
          } else {
            classification.layout = params.type;
          }
        }
        this.setList();
      }
    });
    // 单独设置图标大小
    ipcRenderer.on("itemIconSize", (event, args) => {
      let params = JSON.parse(args);
      let classification = ClassificationJS.getClassificationById(params.classificationParentId, params.classificationChildId);
      if (classification != null) {
        if (!this.arrayIsEmpty(classification.childList)) {
          for (let c of classification.childList) {
            if (params.type == "default") {
              delete c.iconSize;
            } else {
              c.iconSize = params.type;
            }
          }
          delete classification.iconSize;
        } else {
          if (params.type == "default") {
            delete classification.iconSize;
          } else {
            classification.iconSize = params.type;
          }
        }
        this.setList();
      }
    });
    // 设置锁定分类
    ipcRenderer.on("setLockClassification", (event, args) => {
      this.lockClassification = args;
    });
    // 校验无效项目结果
    ipcRenderer.on("checkInvalidItemResult", (event, args) => {
      this.invalidItemList = JSON.parse(args);
    });
    // 获取背景图
    ipcRenderer.on("returnBackgroundImageBase64", (event, args) => {
      if (args != null) {
        this.$store.state.backgroundImage = args;
        this.createBackgroundImageStyle();
      }
    });
    // 刷新单个项目图标缓存
    ipcRenderer.on("refreshIconCache", (event, args) => {
      let params = JSON.parse(args);
      let classification = this.getClassificationById(params.classificationParentId, params.classificationChildId);
      if (classification != null) {
        let item = ItemJS.getItemById(classification, params.id);
        if (item != null && (item.notRefreshIcon == null || !item.notRefreshIcon)) {
          item.icon = params.icon;
          item.htmlIcon = null;
          this.setUpdateIconData(params.classificationParentId, params.classificationChildId, item, "update");
          item.icon = null;
          if (item.type == 5) {
            item.originalIcon = params.iconPath;
          }
          this.setList();
        }
      }
    });
    // 刷新多个项目图标缓存
    ipcRenderer.on("refreshIconCacheList", (event, args) => {
      let params = JSON.parse(args);
      let classification = this.getClassificationById(params.classificationParentId, params.classificationChildId);
      if (classification != null && !this.arrayIsEmpty(classification.itemList) && !this.arrayIsEmpty(params.list)) {
        for (let item of classification.itemList) {
          for (let info of params.list) {
            if (info.icon != null && info.itemId == item.id && (item.notRefreshIcon == null || !item.notRefreshIcon)) {
              item.icon = info.icon;
              item.htmlIcon = null;
              this.setUpdateIconData(params.classificationParentId, params.classificationChildId, item, "update");
              item.icon = null;
              if (item.type == 5) {
                item.originalIcon = info.iconPath;
              }
              break;
            }
          }
        }
        this.setList();
      }
    });
    // 重新获取设置
    ipcRenderer.on("mainWindowGetData", (event, args) => {
      this.reSetSetting(ipcRenderer.sendSync("getSetting"));
      if (this.setting.appearance.backgroundImage != null) {
        ipcRenderer.send("getBackgroundImageBase64", JSON.stringify({ backgroundImage: this.setting.appearance.backgroundImage, page: "main" }));
      } else {
        this.$store.state.backgroundImage = null;
      }
    });
    // 显示设置分类图标窗口
    ipcRenderer.on("showSetClassificationIconWindow", (event, args) => {
      let params = JSON.parse(args);
      this.classificationIconForm.id = CommonJS.parseInt(params.id);
      this.classificationIconForm.show = true;
      this.classificationIconForm.parentId = CommonJS.parseInt(params.parentId);
    });
    // 删除分类图标
    ipcRenderer.on("deleteSetClassificationIcon", (event, args) => {
      let params = JSON.parse(args);
      this.setIcon(CommonJS.parseInt(params.id), CommonJS.parseInt(params.parentId), null);
    });
    // 显示关联文件夹
    ipcRenderer.on("showClassificationAssociatedFolderWindow", (event, args) => {
      let params = JSON.parse(args);
      this.classificationAssociatedFolderForm.id = CommonJS.parseInt(params.id);
      this.classificationAssociatedFolderForm.show = true;
      this.classificationAssociatedFolderForm.parentId = CommonJS.parseInt(params.parentId);
    });
    // 显示聚合分类
    ipcRenderer.on("showClassificationAggregateWindow", (event, args) => {
      let params = JSON.parse(args);
      this.classificationAggregateForm.id = CommonJS.parseInt(params.id);
      this.classificationAggregateForm.show = true;
      this.classificationAggregateForm.parentId = CommonJS.parseInt(params.parentId);
    });
    // 切换分类
    ipcRenderer.on("changeClassification", (event, args) => {
      let params = JSON.parse(args);
      if (ClassificationJS.getClassificationById(params.classificationParentId, params.classificationChildId) != null) {
        if (params.classificationChildId != null) {
          this.changeChildClassification(params.classificationParentId, params.classificationChildId);
          this.classificationChildShowHiddenMap.set(CommonJS.parseInt(params.classificationParentId), true);
        } else {
          this.changeClassification(params.classificationParentId, false);
        }
      }
    });
    // 排除搜索
    ipcRenderer.on("classificationExcludeSearch", (event, args) => {
      let params = JSON.parse(args);
      let classification = ClassificationJS.getClassificationById(params.classificationParentId, params.classificationChildId);
      if (classification != null) {
        classification.excludeSearch = classification.excludeSearch == null ? true : !classification.excludeSearch;
      }
      this.setList();
    });
    // 初始化关联文件夹数据
    ipcRenderer.on("returnInitMapDirectory", (event, args) => {
      let list = JSON.parse(args);
      for (let data of list) {
        this.addItem(data.classificationParentId, data.classificationChildId, data.itemList, true);
      }
      this.setList();
    });
    // 设置批量操作
    ipcRenderer.on("setBatchOperation", (event, args) => {
      this.batchOperation = args;
      this.itemSortingMap = null;
      this.itemSortingClassificationInfo = null;
      this.$nextTick(() => {
        this.itemSortable();
        this.removeItemHoverClass();
      });
    });
    // 批量操作全选
    ipcRenderer.on("batchOperationSelectAll", (event, args) => {
      if (this.batchOperation) {
        // function
        let itemSortableItemAdd = (classificationParentId, classificationChildId, item) => {
          // 转换分类ID
          let key = classificationParentId;
          if (item != null) {
            let newItem = JSON.parse(JSON.stringify(item));
            if (classificationChildId != null) {
              newItem.classificationId = CommonJS.parseInt(classificationChildId);
              newItem.classificationParentId = CommonJS.parseInt(classificationParentId);
              key += "-" + classificationChildId;
            } else {
              newItem.classificationId = CommonJS.parseInt(classificationParentId);
              newItem.classificationParentId = null;
            }
            key += "-" + newItem.id;
            // 放入map中
            if (this.itemSortingMap == null) {
              this.itemSortingMap = new Map();
            }
            this.itemSortingMap.set(key, newItem);
          }
        };
        // 判断当前是否选择子分类
        if (this.classificationChildSelected == null) {
          let classification = ClassificationJS.getClassificationById(this.classificationParentSelected, null);
          // 子分类ID为空判断当前分类是否是有子分类
          if (!this.arrayIsEmpty(classification.childList)) {
            for (let child of classification.childList) {
              if (!this.arrayIsEmpty(child.itemList)) {
                for (let item of child.itemList) {
                  itemSortableItemAdd(this.classificationParentSelected, child.id, item);
                }
              }
            }
          } else {
            if (!this.arrayIsEmpty(classification.itemList)) {
              for (let item of classification.itemList) {
                itemSortableItemAdd(this.classificationParentSelected, null, item);
              }
            }
          }
        } else {
          let classification = ClassificationJS.getClassificationById(this.classificationParentSelected, this.classificationChildSelected);
          if (!this.arrayIsEmpty(classification.itemList)) {
            for (let item of classification.itemList) {
              itemSortableItemAdd(this.classificationParentSelected, this.classificationChildSelected, item);
            }
          }
        }
      }
    });
    // 批量移动或复制
    ipcRenderer.on("batchMoveItem", (event, args) => {
      let params = JSON.parse(args);
      if (this.itemSortingMap != null && this.itemSortingMap.size > 0) {
        // 更新数据
        this.itemSortingDataUpdate(params.to.classificationParentId, params.to.classificationChildId, null, params.del);
      } else {
        this.clearItemSortingData();
      }
    });
    // 批量删除
    ipcRenderer.on("batchDeleteItem", (event, args) => {
      if (this.itemSortingMap != null && this.itemSortingMap.size > 0) {
        // 删除数据
        this.deleteItemSortingMapData(true);
        // 清空数据
        this.clearItemSortingData();
        // 更新DOM
        this.itemKey++;
        // 保存数据
        this.setList();
        this.$nextTick(() => {
          // 设置项目宽度
          this.setItemWidth();
        });
      } else {
        this.clearItemSortingData();
      }
    });
    // 只显示...
    ipcRenderer.on("itemShowOnly", (event, args) => {
      let params = JSON.parse(args);
      if (params.classificationChildId == null && this.haveClassificationChild(params.classificationParentId)) {
        // 在父级分类下并且有子分类
        let classification = ClassificationJS.getClassificationById(params.classificationParentId, null);
        if (classification != null && !this.arrayIsEmpty(classification.childList)) {
          for (let child of classification.childList) {
            child.showOnly = params.showOnly;
          }
          classification.showOnly = null;
        }
      } else {
        let classification = ClassificationJS.getClassificationById(params.classificationParentId, params.classificationChildId);
        if (classification != null) {
          classification.showOnly = params.showOnly;
        }
      }
      this.setList();
    });
    // 列数
    ipcRenderer.on("itemColumnNumber", (event, args) => {
      let params = JSON.parse(args);
      if (params.classificationChildId == null && this.haveClassificationChild(params.classificationParentId)) {
        // 在父级分类下并且有子分类
        let classification = ClassificationJS.getClassificationById(params.classificationParentId, null);
        if (classification != null && !this.arrayIsEmpty(classification.childList)) {
          for (let child of classification.childList) {
            child.columnNumber = params.columnNumber;
          }
          classification.columnNumber = null;
        }
      } else {
        let classification = ClassificationJS.getClassificationById(params.classificationParentId, params.classificationChildId);
        if (classification != null) {
          classification.columnNumber = params.columnNumber;
        }
      }
      this.setList();
    });
    // 隐藏项
    ipcRenderer.on("hiddenItem", (event, args) => {
      let params = JSON.parse(args);
      let classification = ClassificationJS.getClassificationById(params.classificationParentId, params.classificationChildId);
      if (classification != null) {
        // 追加隐藏项
        if (this.strIsEmpty(classification.hiddenItem)) {
          classification.hiddenItem = params.item.fullName;
        } else {
          classification.hiddenItem = classification.hiddenItem + "," + params.item.fullName;
        }
        // 删除项目
        this.deleteItem(params.classificationParentId, params.classificationChildId, params.item.id);
        // 保存
        this.setList();
      }
    });
    // 隐藏备份/恢复窗口
    ipcRenderer.on("hideBackupRestore", () => {
      this.showBackupRestore = false;
    });
    // 隐藏窗口前
    ipcRenderer.on("hideMainWindowBefore", () => {
      this.hideMainWindowBefore();
    });
    // 转换路径
    ipcRenderer.on("convertPath", (event, args) => {
      let params = JSON.parse(args);
      let classification = this.getClassificationById(params.classificationParentId, params.classificationChildId);
      if (classification != null) {
        let item = ItemJS.getItemById(classification, params.id);
        if (item != null) {
          let appPath = ipcRenderer.sendSync("getPath");
          if (params.type == "relative") {
            if (ItemJS.isAbsolutePath(item.path)) {
              item.path = path.relative(appPath, item.path);
            }
          } else if (params.type == "absolute") {
            if (!ItemJS.isAbsolutePath(item.path)) {
              item.path = path.resolve(appPath, item.path);
            }
          }
          this.setList();
        }
      }
    });
    // 转换路径
    ipcRenderer.on("convertPathList", (event, args) => {
      let params = JSON.parse(args);
      let classification = this.getClassificationById(params.classificationParentId, params.classificationChildId);
      if (classification != null && !this.arrayIsEmpty(classification.itemList)) {
        let appPath = ipcRenderer.sendSync("getPath");
        for (let item of classification.itemList) {
          if (item.type == 0 || item.type == 1) {
            if (params.type == "relative") {
              if (ItemJS.isAbsolutePath(item.path)) {
                item.path = path.relative(appPath, item.path);
              }
            } else if (params.type == "absolute") {
              if (!ItemJS.isAbsolutePath(item.path)) {
                item.path = path.resolve(appPath, item.path);
              }
            }
          }
        }
        this.setList();
      }
    });
    window.onclick = function (e) {
      // 隐藏子菜单判断
      _this.classificationLayoutTopHiddenChildMenu(e);
      // 如果是在点击菜单的话，需要显示菜单，直接返回，不隐藏
      for (let i = 0; i < e.path.length; i++) {
        if (e.path[i].attributes == null) {
          continue;
        }
        if (e.path[i].id == "window-setting-menu" || e.path[i].id == "window-setting") {
          _this.search = false;
          _this.topRightMenu = false;
          return;
        }
        if (e.path[i].id == "top-right-menu") {
          _this.search = false;
          _this.windowSetting = false;
          return;
        }
        if (e.path[i].id == "search-menu" || e.path[i].id == "search") {
          _this.topRightMenu = false;
          _this.windowSetting = false;
          return;
        }
      }
      _this.topRightMenu = false;
      _this.windowSetting = false;
      _this.search = false;
    };
  },
  unmounted() {
    window.removeEventListener("dragstart", this.dragstart, true);
    window.removeEventListener("dragover", this.dragover, true);
    window.removeEventListener("drop", this.drop, true);
    window.removeEventListener("contextmenu", this.rightMenu, true);
    window.removeEventListener("resize", this.resize, true);
    window.removeEventListener("keydown", this.keydown, true);
    document.getElementById("classification-content").removeEventListener("wheel", this.wheel, true);
  },
  methods: {
    /**
     * 判断数组是否等于空
     */
    arrayIsEmpty: CommonJS.arrayIsEmpty,
    /**
     * 判断字符串是否为空
     */
    strIsEmpty: CommonJS.strIsEmpty,
    /**
     * 初始化
     */
    init() {
      // 父级分类拖拽排序
      this.classificationSortable();
      // 子级分类拖拽排序
      this.classificationChildSortable();
      if (!this.itemSorting && !this.batchOperation) {
        // 项目拖拽排序
        this.itemSortable();
      }
      // 更新项目宽度
      this.setItemWidth();
      // 更新分类宽度
      this.setClassificationWidth();
      // 更新子分类宽度
      this.setClassificationChildWidth();
      // 设置初始高度
      this.setHeight();
    },
    /**
     * resize
     */
    resize() {
      // 更新分类宽度
      this.setClassificationWidth();
      // 更新子分类宽度
      this.setClassificationChildWidth();
      // 更新高度
      this.setHeight();
      // 更新项目宽度
      this.setItemWidth();
      // 隐藏菜单
      this.topRightMenu = false;
      // 隐藏窗口设置
      this.windowSetting = false;
      // 记录宽高
      this.clientWidth = document.documentElement.clientWidth;
      this.clientHeight = document.documentElement.clientHeight;
    },
    /**
     * 拖拽开始
     * @param e
     */
    dragstart(e) {
      // 如果项目在拖拽排序中直接返回
      if (this.itemSorting) {
        return;
      }
      // 解锁项目不能拖出
      if (!this.lockItem) {
        return;
      }
      // 去除所有项目选中效果
      this.removeItemHoverClass();
      // 拖出中
      this.dragOut = true;
      // 获取项目
      let item = this.getItemByElement(e);
      if (item == null) {
        this.dragOut = false;
        return;
      }
      this.dragOutItem = item;
      ipcRenderer.send(
        "ondragstart",
        JSON.stringify({
          path: item.path,
          type: item.type,
        })
      );
      // 阻止默认行为
      e.preventDefault();
      e.stopPropagation();
    },
    /**
     * 拖拽悬停
     * @param e
     */
    dragover(e) {
      // 如果项目在拖拽排序中直接返回
      if (this.itemSorting) {
        return;
      }
      let classificationList = false;
      for (let i = 0; i < e.path.length; i++) {
        if (e.path[i].attributes == null) {
          continue;
        }
        if (e.path[i].id == "classification-list") {
          classificationList = true;
          break;
        }
      }
      if (classificationList) {
        let { classificationParentId, classificationChildId } = this.getClassificationByElement(e);
        if (classificationParentId != null) {
          if (this.mouseHoverClassificationParentId == null && this.mouseHoverClassificationChildId == null) {
            this.classificationMouseOverSetTimeout(classificationParentId, classificationChildId, 400);
          } else {
            if (this.mouseHoverClassificationParentId != classificationParentId || this.mouseHoverClassificationChildId != classificationChildId) {
              this.classificationMouseOverSetTimeout(classificationParentId, classificationChildId, 400);
            }
          }
        } else {
          this.clearMouseOverSetTimeout();
        }
      } else {
        this.clearMouseOverSetTimeout();
      }
      if (this.setting.item.useItemOpen || this.dragOut) {
        // 取消选中效果
        let itemList = document.getElementsByClassName("item");
        for (let itemEl of itemList) {
          let el = itemEl.getElementsByClassName("inner-item")[0];
          this.$styleMouseout(el, "inner-item", ["background-color"]);
        }
        // 选中效果
        this.$styleMouseover(e, "inner-item", ["background-color"], [this.$hexToRGBA(this.setting.appearance.theme.minorBackground, 0.3)]);
      }
      e.preventDefault();
      e.stopPropagation();
    },
    /**
     * 拖拽释放
     * @param e
     */
    drop(e) {
      // 如果项目在拖拽排序中直接返回
      if (this.itemSorting) {
        return;
      }
      // 从程序外拖动文件到项目图标上时需显示样式
      if (this.setting.item.useItemOpen) {
        // 取消选中效果
        let itemList = document.getElementsByClassName("item");
        for (let itemEl of itemList) {
          let el = itemEl.getElementsByClassName("inner-item")[0];
          this.$styleMouseout(el, "inner-item", ["background-color"]);
        }
      }
      // 如果是在拖出中的话，就不能拖入，改为使用某程序打开此文件
      if (this.dragOut) {
        if (this.dragOutItem != null) {
          // 获取项目
          let item = this.getItemByElement(e);
          if (item == null) {
            return;
          }
          // 如果不是同一个项目就可以使用某个程序打开此文件
          if ((item.classificationId != this.dragOutItem.classificationId || item.id != this.dragOutItem.id) && this.dragOutItem.type == 0) {
            let params = '"' + this.dragOutItem.path + '"';
            if (!this.strIsEmpty(item.params)) {
              params += " " + item.params;
            }
            let copyItem = JSON.parse(JSON.stringify(item));
            copyItem.params = params;
            ItemJS.itemRun(copyItem, false);
          }
        }
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      // 必须在项目DIV内
      let content = null;
      for (let i = 0; i < e.path.length; i++) {
        if (e.path[i].id != null && e.path[i].id == "item-content") {
          content = "item";
          break;
        } else if (e.path[i].id != null && e.path[i].id == "classification-content") {
          content = "classification";
        }
      }
      if (content == null) {
        return;
      }
      // 项目ID
      let itemId;
      // 获取子分类ID和项目ID
      let classificationChildId = this.classificationChildSelected;
      for (let i = 0; i < e.path.length; i++) {
        if (e.path[i].attributes == null) {
          continue;
        }
        if (e.path[i].getAttribute("classification-child-item") != null && e.path[i].getAttribute("classification-child-item") == "true") {
          classificationChildId = CommonJS.parseInt(e.path[i].getAttribute("classification-child-id"));
        } else if (!this.strIsEmpty(e.path[i].getAttribute("item-id"))) {
          itemId = CommonJS.parseInt(e.path[i].getAttribute("item-id"));
        }
      }
      // 提取拖入的文件路径
      let pathArr = [];
      for (const f of e.dataTransfer.files) {
        pathArr.push(f.path);
      }
      if (this.setting.item.useItemOpen && itemId != null && pathArr.length > 0 && content == "item") {
        let classification = ClassificationJS.getClassificationById(this.classificationParentSelected, classificationChildId);
        let item = ItemJS.getItemById(classification, itemId);
        let copyItem = JSON.parse(JSON.stringify(item));
        let params = "";
        for (let i = 0; i < pathArr.length; i++) {
          if (i > 0) {
            params += " ";
          }
          params += '"' + pathArr[i] + '"';
        }
        if (!this.strIsEmpty(item.params)) {
          params += " " + item.params;
        }
        copyItem.params = params;
        ItemJS.itemRun(copyItem, null);
      } else {
        if (content == "item") {
          // 添加项目
          let insert = false;
          if (!(this.haveClassificationChild(this.classificationParentSelected) && this.classificationChildSelected == null) || classificationChildId != null) {
            insert = true;
          } else if (this.haveClassificationChild(this.classificationParentSelected) && this.classificationChildSelected == null) {
            insert = true;
            let classification = ClassificationJS.getClassificationById(this.classificationParentSelected, null);
            classificationChildId = classification.childList[classification.childList.length - 1].id;
          }
          let classification = ClassificationJS.getClassificationById(this.classificationParentSelected, classificationChildId);
          if (insert && this.strIsEmpty(classification.mapDirectory)) {
            ipcRenderer.send(
              "readFiles",
              JSON.stringify({
                classificationParentId: this.classificationParentSelected,
                classificationChildId: classificationChildId,
                path: pathArr,
              })
            );
          }
        } else {
          // 添加分类和项目
          let result = ipcRenderer.sendSync("readDirectory", JSON.stringify(pathArr));
          let resultList = JSON.parse(result);
          // 循环添加分类和项目
          for (let r of resultList) {
            let { classificationParentId } = this.addClassification(r.name, null, null, null);
            if (!this.arrayIsEmpty(r.fileList)) {
              ipcRenderer.send(
                "readFiles",
                JSON.stringify({
                  classificationParentId: classificationParentId,
                  classificationChildId: null,
                  path: r.fileList,
                })
              );
            }
          }
        }
      }
      // 隐藏搜索
      this.search = false;
    },
    /**
     * 右键菜单
     */
    rightMenu(e) {
      e.preventDefault();
      // 隐藏右上角菜单
      this.topRightMenu = false;
      // 隐藏窗口设置
      this.windowSetting = false;
      // 搜索隐藏
      let searchFlag = false;
      for (let i = 0; i < e.path.length; i++) {
        if (e.path[i].id == "search") {
          searchFlag = true;
          break;
        }
      }
      // 隐藏搜索
      this.search = searchFlag;
      // 判断当前元素是不是文本框，如果是文本框右键的话，就显示剪切、复制、粘贴菜单
      if (
        (e.target.nodeName != null && e.target.nodeName.toLowerCase() == "input" && e.target.type != null && e.target.type.toLowerCase() == "text") ||
        (e.target.nodeName != null && e.target.nodeName.toLowerCase() == "textarea")
      ) {
        ipcRenderer.send("textRightMenu");
        return;
      }
      // 获取右键的元素
      let { element, classificationParentId, classificationChildId, itemId, aggregateClassificationParentId, aggregateClassificationChildId } =
        this.getRightClickElementInfo(e);
      // 为空不继续执行
      if (this.strIsEmpty(element)) {
        return;
      }
      // 在分类右键的时候才会选中
      if (element.indexOf("classification") >= 0) {
        // 如果分类ID或者父类ID不为空的话，就选中当前右键选中的分类
        if (classificationParentId != null && classificationChildId == null) {
          this.changeClassification(classificationParentId, false);
        } else if (classificationParentId != null && classificationChildId != null) {
          this.changeChildClassification(classificationParentId, classificationChildId);
        }
      }
      // 查询分类
      let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
      // 调用相应的菜单
      if (element == "classification-content") {
        ipcRenderer.send("classificationContentRightMenu");
      } else if (element == "classification") {
        ipcRenderer.send(
          "classificationRightMenu",
          JSON.stringify({
            classificationParentId: classificationParentId,
            classificationParentName: classification.name,
            haveClassificationChild: this.haveClassificationChild(classificationParentId),
            sort: classification.sort,
            layout: classification.layout,
            iconSize: classification.iconSize,
            lockClassification: this.lockClassification,
            excludeSearch: classification.excludeSearch != null && classification.excludeSearch,
            showOnly: classification.showOnly,
            columnNumber: classification.columnNumber,
            isMapDirectory: !this.strIsEmpty(classification.mapDirectory),
            aggregate: classification.type != null && classification.type == 1,
          })
        );
      } else if (element == "classification-child") {
        ipcRenderer.send(
          "classificationChildRightMenu",
          JSON.stringify({
            classificationChildId: classificationChildId,
            classificationChildName: classification.name,
            classificationParentId: classificationParentId,
            haveClassificationChild: false,
            sort: classification.sort,
            layout: classification.layout,
            iconSize: classification.iconSize,
            lockClassification: this.lockClassification,
            excludeSearch: classification.excludeSearch != null && classification.excludeSearch,
            showOnly: classification.showOnly,
            columnNumber: classification.columnNumber,
            isMapDirectory: !this.strIsEmpty(classification.mapDirectory),
            aggregate: classification.type != null && classification.type == 1,
          })
        );
      } else if (element == "item-content") {
        if (!this.batchOperation) {
          let c = ClassificationJS.getClassificationById(this.classificationParentSelected, this.classificationChildSelected);
          ipcRenderer.send(
            "itemContentRightMenu",
            JSON.stringify({
              classificationChildId: this.classificationChildSelected,
              classificationParentId: this.classificationParentSelected,
              haveClassificationChild: this.classificationChildSelected == null ? this.haveClassificationChild(this.classificationParentSelected) : false,
              lockItem: this.lockItem,
              sort: c.sort,
              layout: c.layout,
              iconSize: c.iconSize,
              isMapDirectory: !this.strIsEmpty(c.mapDirectory),
              batchOperation: this.batchOperation,
              showOnly: c.showOnly,
              columnNumber: c.columnNumber,
              aggregate: c.type != null && c.type == 1,
            })
          );
        } else {
          ipcRenderer.send("multiItemRightMenu");
        }
      } else if (element == "item" || element == "item-child") {
        if (!this.batchOperation) {
          // 获取分类下的项目
          let item = ItemJS.getItemById(classification, itemId);
          // new
          let newItem = JSON.parse(JSON.stringify(item));
          // 查询图标
          newItem.icon = CommonJS.getIcon(classificationParentId, classificationChildId, newItem.id);
          // 如果是聚合分类的话，尝试获取聚合分类ID
          let aggregateClassification;
          if (!this.strIsEmpty(aggregateClassificationParentId) || !this.strIsEmpty(aggregateClassificationChildId)) {
            aggregateClassification = ClassificationJS.getClassificationById(aggregateClassificationParentId, aggregateClassificationChildId);
          }
          ipcRenderer.send(
            "itemRightMenu",
            JSON.stringify({
              item: newItem,
              classificationChildId: classificationChildId,
              classificationParentId: classificationParentId,
              showClearItem: !(this.haveClassificationChild(this.classificationParentSelected) && this.classificationChildSelected == null),
              search: this.search,
              lockItem: this.lockItem,
              layout: classification.layout,
              iconSize: classification.iconSize,
              x: e.screenX,
              y: e.screenY,
              isMapDirectory: !this.strIsEmpty(classification.mapDirectory),
              batchOperation: this.batchOperation,
              aggregate:
                aggregateClassification != null
                  ? aggregateClassification.type != null && aggregateClassification.type == 1
                  : classification.type != null && classification.type == 1,
            })
          );
        } else {
          ipcRenderer.send("multiItemRightMenu");
        }
      }
      // 隐藏子菜单判断
      this.classificationLayoutTopHiddenChildMenu(e);
    },
    /**
     * 获取数据
     * @returns
     */
    getList() {
      let list = ipcRenderer.sendSync("getList");
      return list;
    },
    /**
     * 获取图标
     * @returns
     */
    getIconData() {
      let iconData = ipcRenderer.sendSync("getIconData");
      let map = new Map();
      for (let icon of iconData) {
        map.set(CommonJS.getKey(icon.classificationParentId, icon.classificationChildId, icon.itemId), icon);
      }
      return map;
    },
    /**
     * 选择分类
     * @param id 父级分类ID
     * @param counter 是否计数，模拟双击
     */
    changeClassification(id, counter) {
      if (this.classificationParentSelected != id) {
        // 清除timeout
        clearTimeout(this.classificationTimer);
        this.classificationCounter = 0;
      }
      if (counter) {
        let _this = this;
        // +1
        this.classificationCounter++;
        // 等于2就是双击
        if (this.classificationCounter == 2) {
          // 清除timeout
          clearTimeout(this.classificationTimer);
          // 归0
          this.classificationCounter = 0;
          // 双击操作
          this.showHiddenClassificationChildList(null, id, false);
        } else {
          // 间隔为500毫秒，如果超过500毫秒就代表不是双击
          this.classificationTimer = setTimeout(function () {
            _this.classificationCounter = 0;
          }, 500);
        }
      }
      // 赋值选中父级分类
      this.classificationParentSelected = CommonJS.parseInt(id);
      this.classificationChildSelected = null;
      // 记住选择分类
      this.rememberClassificationSelected(CommonJS.parseInt(id), null);
      // 如果是分类顶部布局的话，隐藏子菜单
      if (this.setting.classification.layout == "top") {
        for (let key of this.classificationChildShowHiddenMap.keys()) {
          if (key != CommonJS.parseInt(id)) {
            this.classificationChildShowHiddenMap.set(key, false);
          }
        }
      }
      // 清空批量操作
      if (this.batchOperation) {
        this.clearItemSortingData();
      }
      // 回到顶部
      if (this.itemContentSimpleBar != null && this.itemContentSimpleBar.getScrollElement() != null) {
        this.itemContentSimpleBar.getScrollElement().scrollTop = 0;
      }
      // 收起其他子分类
      this.collapseOtherSubClassification();
      // 项目排序
      this.$nextTick(() => {
        this.itemSortable();
      });
    },
    /**
     * 显示或者隐藏子级分类列表
     * @param e
     * @param id
     * @param onlyShow
     */
    showHiddenClassificationChildList(e, id, onlyShow) {
      // 转为Int
      id = CommonJS.parseInt(id);
      // 如果当前父级分类拥有子级分类的话，就判断子级分类是展开还是收起，取反
      if (this.haveClassificationChild(id)) {
        // 获取状态
        let show = this.classificationChildShowHiddenMap.get(id);
        if (onlyShow) {
          show = true;
        } else {
          // 如果为空的话代表没有展开过，展开，否则的话就是取反
          if (show == null) {
            show = true;
          } else {
            show = !show;
          }
        }
        // 放入状态
        this.classificationChildShowHiddenMap.set(id, show);
        // 更新DOM
        this.classificationKey++;
        // 更新子分类宽度
        this.$nextTick(() => {
          this.setClassificationChildWidth();
        });
      }
      // 收起其他子分类
      this.collapseOtherSubClassification(id);
      if (e != null) {
        e.stopPropagation();
      }
    },
    /**
     * 选择子分类
     * @param parentId 父级分类ID
     * @param childId 子级分类ID
     */
    changeChildClassification(parentId, childId) {
      // 父级分类ID
      this.classificationParentSelected = CommonJS.parseInt(parentId);
      // 子级分类ID
      this.classificationChildSelected = CommonJS.parseInt(childId);
      // 记住选择分类
      this.rememberClassificationSelected(CommonJS.parseInt(parentId), CommonJS.parseInt(childId));
      // 如果是分类顶部布局的话，隐藏子菜单
      if (this.setting.classification.layout == "top") {
        this.classificationChildShowHiddenMap.set(parentId, false);
      }
      // 清空批量操作
      if (this.batchOperation) {
        this.clearItemSortingData();
      }
      // 回到顶部
      if (this.itemContentSimpleBar != null && this.itemContentSimpleBar.getScrollElement() != null) {
        this.itemContentSimpleBar.getScrollElement().scrollTop = 0;
      }
      // 收起其他子分类
      this.collapseOtherSubClassification();
      // 项目排序
      this.$nextTick(() => {
        this.itemSortable();
      });
    },
    /**
     * 获取子级分类列表
     */
    getClassificationChildList(id) {
      let childList = ClassificationJS.getClassificationById(id, null).childList;
      return childList == null ? [] : childList;
    },
    /**
     * 显示分类窗口
     * @param type 0:添加 1:编辑
     * @param id 分类ID
     * @param parentId 父级分类ID
     */
    showClassificationAddEditWindow(type, id, parentId) {
      this.classificationAddEditForm.type = type;
      this.classificationAddEditForm.id = CommonJS.parseInt(id);
      this.classificationAddEditForm.show = true;
      this.classificationAddEditForm.parentId = CommonJS.parseInt(parentId);
    },
    /**
     * 新建分类
     * @param name 名称
     * @param shortcutKey 快捷键
     * @param globalShortcutKey 全局快捷键
     * @param parentId 父级分类ID
     */
    addClassification(name, shortcutKey, globalShortcutKey, parentId) {
      let classificationParentId, classificationChildId;
      // 如果父级分类ID不为空代表添加子分类
      if (parentId != null) {
        // 添加子分类
        // 查找父级分类信息
        let classification = ClassificationJS.getClassificationById(parentId, null);
        // 查询是否有子分类没有的话，初始化子级分类列表
        if (this.arrayIsEmpty(classification.childList)) {
          // 初始化
          classification.childList = [];
          // 父级分类映射文件夹清空
          classification.mapDirectory = null;
          // 删除监听
          ipcRenderer.send(
            "deleteMapDirectoryWatch",
            JSON.stringify({
              classificationParentId: classification.id,
              classificationChildId: null,
            })
          );
          // 清空类型
          classification.type = null;
          classification.aggregateSort = null;
          classification.aggregateItemNumber = null;
        }
        // 获取新ID
        let id = CommonJS.getNewId(classification.childList);
        // 如果当前父级分类下一个子分类都没有的话，就把父级分类的所有项目分给第一个子分类
        let itemList = [];
        if (classification.childList.length == 0 && !this.arrayIsEmpty(classification.itemList)) {
          // 把父级分类的所有项目分给子分类
          itemList = [...classification.itemList];
          // 查询并移除旧图标数据
          for (let item of itemList) {
            // 获取图标
            if (this.$store.state.iconDataMap != null) {
              let icon = this.$store.state.iconDataMap.get(CommonJS.getKey(parentId, null, item.id));
              if (icon != null) {
                item.icon = icon.icon;
              }
            }
            // 删除图标数据
            this.setUpdateIconData(parentId, null, { id: item.id }, "delete");
          }
          // itemId
          let itemId = 1;
          // 设置当前子分类ID
          for (let i = 0; i < itemList.length; i++) {
            itemList[i].classificationParentId = classification.id;
            itemList[i].classificationId = id;
            itemList[i].id = itemId++;
            // 添加图标
            this.setUpdateIconData(classification.id, id, itemList[i], "add");
            // 删除图标
            itemList[i].icon = null;
          }
          // 父级分类项目清空
          classification.itemList = [];
        }
        // 添加分类
        classification.childList.push({
          id: id,
          name: name,
          shortcutKey: shortcutKey,
          globalShortcutKey: globalShortcutKey,
          parentId: parentId,
          itemList: itemList,
        });
        classificationParentId = parentId;
        classificationChildId = id;
      } else {
        let id = CommonJS.getNewId(this.list);
        // 添加父级分类
        this.list.push({
          id: id,
          name: name,
          shortcutKey: shortcutKey,
          globalShortcutKey: globalShortcutKey,
        });
        classificationParentId = id;
      }
      // 保存
      this.setList();
      // 返回ID
      return { classificationParentId, classificationChildId };
    },
    /**
     * 删除分类
     *
     * @param id 分类ID
     * @param parentId 父级分类ID
     */
    deleteClassification(id, parentId) {
      // 如果只剩下一个父级分类的话，则不能删除
      if (this.list.length == 1 && parentId == null) {
        return;
      }
      let list = this.list;
      // 如果父级分类ID不为空的话，代表是删除子分类，先查询到父级分类信息，然后获取父类下面的子级分类列表
      if (parentId != null) {
        // 获取父级分类信息
        let parentClassification = ClassificationJS.getClassificationById(parentId, null);
        // 获取父级分类下的子级列表
        list = parentClassification.childList;
      }
      // index
      let index;
      // 分类信息
      let classification;
      // 寻找需要删除的分类下表和信息
      for (let i = 0; i < list.length; i++) {
        if (list[i].id == id) {
          // 下标
          index = i;
          // 分类信息
          classification = list[i];
          break;
        }
      }
      // 如果删除的是父级分类，判断有没有子级分类
      if (parentId == null && this.haveClassificationChild(id)) {
        let classification = this.getClassificationById(id, null);
        if (!this.arrayIsEmpty(classification.childList)) {
          for (let cc of classification.childList) {
            // 删除监听
            if (!this.strIsEmpty(cc.mapDirectory)) {
              ipcRenderer.send(
                "deleteMapDirectoryWatch",
                JSON.stringify({
                  classificationParentId: cc.parentId,
                  classificationChildId: cc.id,
                })
              );
            }
            // 删除图标数据
            if (!this.arrayIsEmpty(cc.itemList)) {
              for (let item of cc.itemList) {
                let { classificationParentId, classificationChildId } = ClassificationJS.convertClassificationId(
                  item.classificationId,
                  item.classificationParentId
                );
                this.setUpdateIconData(classificationParentId, classificationChildId, { id: item.id }, "delete");
              }
            }
          }
        }
      }
      // 删除当前分类监听
      let { classificationParentId, classificationChildId } = ClassificationJS.convertClassificationId(id, parentId);
      ipcRenderer.send(
        "deleteMapDirectoryWatch",
        JSON.stringify({
          classificationParentId: classificationParentId,
          classificationChildId: classificationChildId,
        })
      );
      // 清空分类下项目图标数据
      if (!this.arrayIsEmpty(classification.itemList)) {
        for (let item of classification.itemList) {
          // 删除图标数据
          this.setUpdateIconData(classificationParentId, classificationChildId, { id: item.id }, "delete");
        }
      }
      // 直接删除
      list.splice(index, 1);
      // 默认选中
      this.defaultSelectedClassification(parentId);
      // 保存
      this.setList();
      // 重新设置宽度
      this.setItemWidth();
    },
    /**
     * 编辑分类
     * @param id
     * @param name
     * @param shortcutKey
     * @param globalShortcutKey
     * @param parentId
     */
    editClassification(id, name, shortcutKey, globalShortcutKey, parentId) {
      let { classificationParentId, classificationChildId } = ClassificationJS.convertClassificationId(id, parentId);
      let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
      if (classification != null) {
        classification.name = name;
        classification.shortcutKey = shortcutKey;
        classification.globalShortcutKey = globalShortcutKey;
        // 保存
        this.setList();
      }
    },
    /**
     * 关联文件夹
     * @param id
     * @param parentId
     * @param mapDirectory
     * @param hiddenItem
     */
    setClassificationAssociatedFolder(id, parentId, mapDirectory, hiddenItem) {
      let { classificationParentId, classificationChildId } = ClassificationJS.convertClassificationId(id, parentId);
      let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
      if (classification != null) {
        // 旧值
        let old = classification.mapDirectory;
        let oldHidden = classification.hiddenItem;
        // 修改
        classification.mapDirectory = mapDirectory;
        classification.hiddenItem = hiddenItem;
        // 保存
        this.setList();
        // 如果和旧路径不一样的话，开始获取项目
        if ((old != mapDirectory && mapDirectory != null) || oldHidden != hiddenItem) {
          ipcRenderer.send(
            "readMapDirectory",
            JSON.stringify({
              classificationParentId: classificationParentId,
              classificationChildId: classificationChildId,
              mapDirectory: classification.mapDirectory,
            })
          );
        } else if (mapDirectory == null) {
          // 删除监听
          ipcRenderer.send(
            "deleteMapDirectoryWatch",
            JSON.stringify({
              classificationParentId: classificationParentId,
              classificationChildId: classificationChildId,
            })
          );
        }
      }
    },
    /**
     * 聚合分类
     * @param id
     * @param parentId
     * @param sort
     * @param itemNumber
     */
    setClassificationAggregate(id, parentId, sort, itemNumber) {
      let { classificationParentId, classificationChildId } = ClassificationJS.convertClassificationId(id, parentId);
      let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
      if (classification != null) {
        if (classification.type == null) {
          classification.type = 1;
        }
        classification.aggregateSort = sort;
        classification.aggregateItemNumber = itemNumber;
        classification.excludeSearch = false;
        this.setList();
        this.itemKey++;
      }
    },
    /**
     * 设置图标
     * @param id
     * @param parentId
     * @param icon
     */
    setIcon(id, parentId, icon) {
      let { classificationParentId, classificationChildId } = ClassificationJS.convertClassificationId(id, parentId);
      let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
      if (classification != null) {
        classification.icon = icon;
        this.setList();
      }
    },
    /**
     * 父级分类拖拽排序
     */
    classificationSortable() {
      // this
      let _this = this;
      // 先销毁
      if (this.classificationParentSortable != null) {
        this.classificationParentSortable.destroy();
      }
      // 子级分类拖拽排序
      this.classificationParentSortable = Sortable.create(document.getElementById("classification-list"), {
        animation: 0,
        disabled: _this.lockClassification,
        forceFallback: true,
        fallbackTolerance: 4,
        onStart(event) {
          _this.classificationSorting = true;
        },
        onEnd({ newIndex, oldIndex }) {
          let classification = _this.list.splice(oldIndex, 1);
          _this.list.splice(newIndex, 0, JSON.parse(JSON.stringify(classification))[0]);
          _this.setList();
          _this.classificationSorting = false;
          _this.classificationKey++;
        },
      });
    },
    /**
     * 子级分类拖拽排序
     */
    classificationChildSortable() {
      // this
      let _this = this;
      // 先销毁
      if (this.classificationChildSortableList != null) {
        for (let sortable of this.classificationChildSortableList) {
          if (sortable != null) {
            sortable.destroy();
          }
        }
      }
      // 子级分类拖拽排序
      let classificationChildElementList = document.getElementsByClassName("classification-child-list");
      this.classificationChildSortableList = [];
      if (!this.arrayIsEmpty(classificationChildElementList)) {
        for (let i = 0; i < classificationChildElementList.length; i++) {
          this.classificationChildSortableList.push(
            Sortable.create(classificationChildElementList[i], {
              animation: 0,
              disabled: _this.lockClassification,
              forceFallback: true,
              fallbackTolerance: 4,
              onStart(event) {
                _this.classificationSorting = true;
              },
              onEnd({ newIndex, oldIndex }) {
                let classification = ClassificationJS.getClassificationById(classificationChildElementList[i].getAttribute("classification-parent-id"), null);
                let item = classification.childList.splice(oldIndex, 1);
                classification.childList.splice(newIndex, 0, JSON.parse(JSON.stringify(item))[0]);
                _this.setList();
                _this.classificationSorting = false;
                _this.classificationKey++;
              },
            })
          );
        }
      }
    },
    /**
     * 项目拖拽排序
     */
    itemSortable() {
      let _this = this;
      // 先销毁
      if (this.itemSortableList != null) {
        for (let sortable of this.itemSortableList) {
          if (sortable != null) {
            sortable.destroy();
          }
        }
      }
      this.itemSortableList = [];
      if (!this.lockItem) {
        // 项目拖拽
        let itemListElementList = document.getElementsByClassName("item-list");
        this.itemSortableList = [];
        for (let itemListElement of itemListElementList) {
          let classificationChildId = _this.classificationChildSelected;
          if (classificationChildId == null) {
            // 尝试获取该分类子分类ID
            classificationChildId = itemListElement.getAttribute("classification-child-id");
          }
          // 获取分类信息
          let classification = ClassificationJS.getClassificationById(_this.classificationParentSelected, classificationChildId);
          // 是否是映射文件夹
          let isMapDirectory = false;
          if (classification != null && !this.strIsEmpty(classification.mapDirectory)) {
            isMapDirectory = true;
          }
          // 是否是聚合分类
          let aggregate = false;
          if (classification != null && classification.type != null && classification.type == 1) {
            aggregate = true;
          }
          this.itemSortableList.push(
            Sortable.create(itemListElement, {
              group:
                _this.classificationChildSelected != null
                  ? "classification-child-" + _this.classificationChildSelected
                  : "classification-parent-" + _this.classificationParentSelected,
              draggable: ".item",
              animation: 0,
              forceFallback: true,
              multiDrag: _this.batchOperation,
              selectedClass: "itemMultiDragSelected",
              fallbackTolerance: 4,
              disabled: isMapDirectory || aggregate,
              /**
               * 多选选择
               * @param event
               */
              onSelect(event) {
                _this.itemSortableItemAdd(event);
              },
              /**
               * 多选取消选择
               * @param event
               */
              onDeselect(event) {
                _this.itemSortableItemDelete(event);
              },
              /**
               * 开始拖拽
               * @param event
               */
              onStart(event) {
                _this.itemSorting = true;
                if (!_this.batchOperation) {
                  _this.removeItemHoverClass();
                  // 放入拖拽的数据
                  _this.itemSortableItemAdd(event);
                }
              },
              /**
               * 结束拖拽
               * @param event
               */
              onEnd(event) {
                if (_this.itemSortingMap != null && _this.itemSortingMap.size > 0) {
                  // 目标分类
                  let toClassificationParentId = null;
                  let toClassificationChildId = null;
                  // 判断移动是在当前分类还是跨分类
                  if (_this.itemSortingClassificationInfo == null) {
                    // 当前分类中移动
                    toClassificationParentId = _this.classificationParentSelected;
                    toClassificationChildId = _this.classificationChildSelected;
                    if (
                      _this.haveClassificationChild(_this.classificationParentSelected) &&
                      _this.classificationChildSelected == null &&
                      event.to.getAttribute("classification-child-item") == "true"
                    ) {
                      // 在父级分类下并且有子级分类
                      // to
                      toClassificationChildId = CommonJS.parseInt(event.to.getAttribute("classification-child-id"));
                    }
                  } else {
                    // 跨分类移动
                    toClassificationParentId = _this.itemSortingClassificationInfo.classificationParentId;
                    toClassificationChildId = _this.itemSortingClassificationInfo.classificationChildId;
                    // 如果子分类ID为空那么判断当前父类是否有子分类，如果有的话，默认移动到第一个子分类
                    if (toClassificationChildId == null) {
                      if (_this.haveClassificationChild(toClassificationParentId)) {
                        let classification = ClassificationJS.getClassificationById(toClassificationParentId, null);
                        if (!_this.arrayIsEmpty(classification.childList)) {
                          toClassificationChildId = classification.childList[0].id;
                        }
                      }
                    }
                  }
                  // 更新数据
                  _this.itemSortingDataUpdate(
                    toClassificationParentId,
                    toClassificationChildId,
                    _this.itemSortingClassificationInfo == null ? event.newIndex : null,
                    true
                  );
                } else {
                  // 清空数据
                  _this.clearItemSortingData();
                }
              },
            })
          );
        }
      }
    },
    /**
     * 获取右键元素的属性
     */
    getRightClickElementInfo(e) {
      let element;
      let classificationParentId;
      let classificationChildId;
      let itemId;
      let aggregateClassificationParentId;
      let aggregateClassificationChildId;
      for (let i = 0; i < e.path.length; i++) {
        if (e.path[i].attributes == null) {
          continue;
        }
        if (e.path[i].id == "classification-content") {
          // 整个分类空白的地方右键
          element = "classification-content";
          break;
        } else if (e.path[i].getAttribute("classification")) {
          // 某个分类上右键
          element = "classification";
          classificationParentId = e.path[i].getAttribute("classification-parent-id");
          break;
        } else if (e.path[i].getAttribute("classification-child")) {
          // 某个子分类上右键
          element = "classification-child";
          classificationParentId = e.path[i].getAttribute("classification-parent-id");
          classificationChildId = e.path[i].getAttribute("classification-child-id");
          break;
        } else if (e.path[i].id == "item-content") {
          // 整个项目空白的地方右键
          element = "item-content";
          break;
        } else if (e.path[i].getAttribute("item-child") != null && e.path[i].getAttribute("item-child") == "false") {
          // 父级分类下某个项目右键
          element = "item";
          classificationParentId = e.path[i].getAttribute("classification-parent-id");
          classificationChildId = e.path[i].getAttribute("classification-child-id");
          aggregateClassificationParentId = e.path[i].getAttribute("aggregate-classification-parent-id");
          itemId = e.path[i].getAttribute("item-id");
          break;
        } else if (e.path[i].getAttribute("item-child") != null && e.path[i].getAttribute("item-child") == "true") {
          // 子级分类下某个项目右键
          element = "item-child";
          classificationParentId = e.path[i].getAttribute("classification-parent-id");
          classificationChildId = e.path[i].getAttribute("classification-child-id");
          itemId = e.path[i].getAttribute("item-id");
          aggregateClassificationParentId = e.path[i].getAttribute("aggregate-classification-parent-id");
          aggregateClassificationChildId = e.path[i].getAttribute("aggregate-classification-child-id");
          break;
        }
      }
      return {
        element,
        classificationParentId,
        classificationChildId,
        itemId,
        aggregateClassificationParentId,
        aggregateClassificationChildId,
      };
    },
    /**
     * 显示项目窗口
     * @param type 0:添加 1:编辑
     * @param classificationParentId 父级分类ID
     * @param classificationChildId 子级分类ID
     * @param id 项目ID
     * @param itemType 类型 0:文件 1:文件夹 2:网址
     */
    showItemAddEditWindow(type, classificationParentId, classificationChildId, id, itemType) {
      this.itemAddEditForm.type = type;
      this.itemAddEditForm.classificationParentId = CommonJS.parseInt(classificationParentId);
      this.itemAddEditForm.classificationChildId = CommonJS.parseInt(classificationChildId);
      this.itemAddEditForm.id = CommonJS.parseInt(id);
      this.itemAddEditForm.itemType = itemType;
      this.itemAddEditForm.show = true;
    },
    /**
     * 添加项目
     * @param classificationParentId 父级分类ID
     * @param classificationChildId 子级分类ID
     * @param itemList 项目列表
     * @param clear
     */
    addItem(classificationParentId, classificationChildId, itemList, clear) {
      // 分类信息
      let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
      if (classification != null) {
        if (clear != null && clear) {
          // 先删除原有图标数据
          if (!this.arrayIsEmpty(classification.itemList)) {
            for (let item of classification.itemList) {
              // 记录图标数据
              this.setUpdateIconData(classificationParentId, classificationChildId, { id: item.id }, "delete");
            }
          }
          classification.itemList = [];
        }
        // 添加项目
        for (let item of itemList) {
          if (classification.itemList == null) {
            classification.itemList = [];
          }
          // 设置分类ID
          item = ItemJS.setItemClassificationId(item, classificationParentId, classificationChildId);
          // 获取新ID
          item.id = CommonJS.getNewId(classification.itemList);
          // 获取文件类型
          if (item.type == 0) {
            item.extension = ipcRenderer.sendSync("getFileExtension", item.path);
          }
          // 拼音
          ItemJS.setPinyin(item);
          // 缩写
          ItemJS.setAbbr(item);
          // 记录图标数据
          this.setUpdateIconData(classificationParentId, classificationChildId, item, "add");
          // 清空图标
          item.icon = null;
          // 添加
          classification.itemList.push(item);
          // 去除符合当前项目无效项目列表里的数据
          this.removeInvalidItem(item);
        }
        // 保存
        this.setList();
      }
    },
    /**
     * 删除项目
     */
    deleteItem(classificationParentId, classificationChildId, id) {
      let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
      if (classification != null && !this.arrayIsEmpty(classification.itemList)) {
        let index;
        let item;
        for (let i = 0; i < classification.itemList.length; i++) {
          if (classification.itemList[i].id == id) {
            index = i;
            item = classification.itemList[i];
            break;
          }
        }
        classification.itemList.splice(index, 1);
        // 删除图标数据
        this.setUpdateIconData(classificationParentId, classificationChildId, { id: id }, "delete");
        // 保存
        this.setList();
        // 去除符合当前项目无效项目列表里的数据
        this.removeInvalidItem(item);
      }
    },
    /**
     * 修改项目
     */
    editItem(classificationParentId, classificationChildId, item) {
      let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
      if (classification != null && !this.arrayIsEmpty(classification.itemList)) {
        for (let i = 0; i < classification.itemList.length; i++) {
          if (classification.itemList[i].id == item.id) {
            // 设置分类ID
            item = ItemJS.setItemClassificationId(item, classificationParentId, classificationChildId);
            // 获取文件类型
            if (item.type == 0) {
              item.extension = ipcRenderer.sendSync("getFileExtension", item.path);
            }
            // 拼音
            ItemJS.setPinyin(item);
            // 缩写
            ItemJS.setAbbr(item);
            // 判断是否需要修改图标数据
            if (this.$store.state.iconDataMap != null) {
              let icon = this.$store.state.iconDataMap.get(CommonJS.getKey(classificationParentId, classificationChildId, item.id));
              if (icon == null || icon.icon != item.icon) {
                this.setUpdateIconData(classificationParentId, classificationChildId, item, "update");
              }
            } else {
              this.setUpdateIconData(classificationParentId, classificationChildId, item, "update");
            }
            // 清空图标
            item.icon = null;
            // 修改
            classification.itemList[i] = item;
            // 去除符合当前项目无效项目列表里的数据
            this.removeInvalidItem(item);
            break;
          }
        }
        // 保存
        this.setList();
      }
    },
    /**
     * 清空分类下所有项目
     * @param classificationParentId 父级分类ID
     * @param classificationChildId 子级分类ID
     * @param confirm 是否弹出确认提示框
     */
    clearItem(classificationParentId, classificationChildId, confirm) {
      // 查询分类
      let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
      if (classification != null && !this.arrayIsEmpty(classification.itemList)) {
        // 是否弹出提示
        if (confirm) {
          // 删除提示
          ipcRenderer.send(
            "clearItemDialog",
            JSON.stringify({
              classificationParentId: classificationParentId,
              classificationChildId: classificationChildId,
            })
          );
        } else {
          // 清空图标数据
          for (let item of classification.itemList) {
            this.setUpdateIconData(classificationParentId, classificationChildId, { id: item.id }, "delete");
          }
          // 直接删除
          classification.itemList = [];
          // 保存
          this.setList();
        }
      }
    },
    /**
     * 添加Appx项目
     * @param classificationParentId 父级分类ID
     * @param classificationChildId 子级分类ID
     * @param item 项目
     */
    addAppxItem(classificationParentId, classificationChildId, item) {
      this.addItem(classificationParentId, classificationChildId, [item]);
    },
    /**
     * 获取分类的项目列表
     * @param classificationParentId
     * @param classificationChildId
     */
    getItemList(classificationParentId, classificationChildId) {
      let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
      let itemList = [];
      if (classification.type != null && classification.type == 1) {
        itemList = this.getAggregateItemList(classification, classification.aggregateSort, classification.aggregateItemNumber);
      } else {
        itemList = classification.itemList;
      }
      return itemList == null ? [] : itemList;
    },
    /**
     * 整理
     */
    formatList() {
      let list = [];
      for (let i = 0; i < this.list.length; i++) {
        let classification = this.list[i];
        if (classification != null && classification != undefined) {
          if (!this.arrayIsEmpty(classification.childList)) {
            let childList = [];
            for (let j = 0; j < classification.childList.length; j++) {
              let childClassification = classification.childList[j];
              if (childClassification != null && childClassification != undefined) {
                childClassification.itemList = this.formatItemList(classification.id, childClassification.id, childClassification);
                childClassification.itemList = this.itemListSort(childClassification, childClassification.itemList);
                childList.push(childClassification);
              }
            }
            classification.childList = childList;
          } else {
            classification.itemList = this.formatItemList(classification.id, null, classification);
            classification.itemList = this.itemListSort(classification, classification.itemList);
          }
          list.push(classification);
        }
      }
      this.list = list;
    },
    /**
     * 整理项目
     */
    formatItemList(classificationParentId, classificationChildId, classification) {
      let itemList = [];
      if (!this.arrayIsEmpty(classification.itemList)) {
        for (let i = 0; i < classification.itemList.length; i++) {
          if (classification.itemList[i] != null && classification.itemList[i] != undefined) {
            let item = classification.itemList[i];
            // 设置分类ID
            item = ItemJS.setItemClassificationId(item, classificationParentId, classificationChildId);
            // 删除无用字段
            delete item.menuIcon;
            // add
            itemList.push(item);
          }
        }
      }
      return itemList;
    },
    /**
     * 保存数据
     */
    setList() {
      // 整理
      this.formatList();
      // 保存数据
      this.$store.state.list = this.list;
      ipcRenderer.send(
        "setList",
        JSON.stringify({
          list: this.list,
          searchWindowGetData: true,
        })
      );
      // 保存图标数据
      if (
        this.updateIconData != null &&
        (!this.arrayIsEmpty(this.updateIconData.add) || !this.arrayIsEmpty(this.updateIconData.update) || !this.arrayIsEmpty(this.updateIconData.delete))
      ) {
        ipcRenderer.send("updateIconData", JSON.stringify(this.updateIconData));
      }
      this.updateIconData = null;
      // 监控项目div宽度
      this.monitorItemWidth();
      // 重新设置快捷键
      this.setShortcutKeyMap();
    },
    /**
     * 如果当前选中的分类在分类列表中不存在的话，就选择第一个分类当默认分类选择
     * @param parentId
     */
    defaultSelectedClassification(parentId) {
      // 如果父级分类ID不为空代表删除的是子级分类，否则就是删除的父级分类
      if (parentId != null) {
        // 通过父级分类ID查询分类信息
        let parentClassification = ClassificationJS.getClassificationById(parentId, null);
        // 如果一个子级分类都没有的话，就设置未null
        if (this.arrayIsEmpty(parentClassification.childList)) {
          // null
          this.classificationChildSelected = null;
        } else {
          let flag = false;
          for (let classification of parentClassification.childList) {
            // 如果子级分类存在的话，什么都不用做
            if (this.classificationChildSelected == classification.id) {
              flag = true;
              break;
            }
          }
          // 如果当前子级分类已经不存在于分类列表中的话，默认选中分类列表中第一个子级分类当默认分类
          if (!flag) {
            this.classificationChildSelected = parentClassification.childList[0].id;
          }
        }
      } else {
        // 父级分类
        let flag = false;
        for (let classification of this.list) {
          // 如果分类存在的话，什么都不用做
          if (this.classificationParentSelected == classification.id) {
            flag = true;
            break;
          }
        }
        // 如果当前分类已经不存在于分类列表中的话，默认选中分类列表中第一个分类当默认分类
        if (!flag) {
          this.classificationParentSelected = this.list[0].id;
        }
      }
    },
    /**
     * 关闭窗口
     */
    close() {
      ipcRenderer.send("close");
    },
    /**
     * 隐藏窗口
     */
    hide() {
      ipcRenderer.send("hide");
    },
    /**
     * 隐藏窗口前
     */
    hideMainWindowBefore() {
      // 隐藏
      this.hide();
      // 获取有没有固定分类
      let fixedClassification = ipcRenderer.sendSync("getFixedClassification");
      if (
        fixedClassification != null &&
        ClassificationJS.getClassificationById(fixedClassification.classificationParentId, fixedClassification.classificationChildId) != null
      ) {
        if (fixedClassification.classificationChildId != null) {
          this.changeChildClassification(fixedClassification.classificationParentId, fixedClassification.classificationChildId);
          this.classificationChildShowHiddenMap.set(CommonJS.parseInt(fixedClassification.classificationParentId), true);
        } else {
          this.changeClassification(fixedClassification.classificationParentId, false);
        }
      } else if (
        fixedClassification != null &&
        ClassificationJS.getClassificationById(fixedClassification.classificationParentId, fixedClassification.classificationChildId) == null
      ) {
        ipcRenderer.send("setFixedClassification", null);
      }
      // 隐藏窗口时折叠子分类
      if (this.setting.classification.hideWindowFoldChildClassification) {
        this.classificationChildShowHiddenMap = new Map();
      }
    },
    /**
     * 设置高度
     */
    setHeight() {
      // 界面高度
      let height = document.documentElement.clientHeight;
      if (this.setting.classification.layout == "left" || this.setting.classification.layout == "right") {
        // 分类
        let classificationListElement = document.getElementById("classification-content");
        classificationListElement.style.height = height - 34 + "px";
      }
      // 项目
      let itemElement = document.getElementById("item-content");
      if (this.setting.classification.layout == "left" || this.setting.classification.layout == "right") {
        itemElement.style.height = height - 34 + "px";
      } else if (this.setting.classification.layout == "top") {
        itemElement.style.height = height - 34 - document.getElementById("classification-content").clientHeight + "px";
      }
    },
    /**
     * 监控项目div宽度
     */
    monitorItemWidth() {
      let itemElementList = document.getElementsByClassName("item-list");
      if (!this.arrayIsEmpty(itemElementList)) {
        for (let i = 0; i < itemElementList.length; i++) {
          const observer = new ResizeObserver((entries) => {
            this.setItemWidth();
          });
          observer.observe(itemElementList[i]);
        }
      }
    },
    /**
     * 设置项目宽度
     */
    setItemWidth() {
      if (this.itemSorting) {
        return;
      }
      let itemElementList = document.getElementsByClassName("item-list");
      if (!this.arrayIsEmpty(itemElementList)) {
        for (let i = 0; i < itemElementList.length; i++) {
          let itemElement = itemElementList[i];
          let classification;
          if (itemElement.getAttribute("classification-child-item") != null && itemElement.getAttribute("classification-child-item") == "true") {
            classification = ClassificationJS.getClassificationById(
              this.classificationParentSelected,
              Number(itemElement.getAttribute("classification-child-id"))
            );
          } else {
            classification = ClassificationJS.getClassificationById(this.classificationParentSelected, this.classificationChildSelected);
          }
          // 当前项目区域宽度
          let width = itemElement.getBoundingClientRect().width;
          // 按列表展示数量
          let listNum = null;
          // 最小宽度
          let minWidth;
          if (this.setting.item.hideItemName) {
            minWidth = (classification.iconSize != null ? classification.iconSize : this.setting.item.iconSize) + 24;
          } else {
            if (
              (classification.layout != null && classification.layout == "tile") ||
              (this.setting.item.layout == "tile" && (classification.layout == null || classification.layout == "default"))
            ) {
              minWidth = this.setting.item.width + 1;
            } else {
              if (classification.columnNumber != null && classification.columnNumber > 0) {
                if (classification.columnNumber == 1) {
                  minWidth = width;
                } else {
                  listNum = classification.columnNumber;
                }
              } else {
                if (this.setting.item.columnNumber == 1) {
                  minWidth = width;
                } else {
                  listNum = this.setting.item.columnNumber;
                }
              }
            }
          }
          let itemList = itemElement.getElementsByClassName("item");
          if (listNum != null) {
            for (let i = 0; i < itemList.length; i++) {
              itemList[i].style.width = width / listNum + "px";
            }
          } else {
            let num = Math.floor(width / minWidth);
            if (itemList.length >= num) {
              for (let i = 0; i < itemList.length; i++) {
                itemList[i].style.width = width / num + "px";
              }
            } else {
              for (let i = 0; i < itemList.length; i++) {
                itemList[i].style.width = minWidth + "px";
              }
            }
          }
        }
      }
    },
    /**
     * 监控分类div宽度
     */
    monitorClassificationWidth() {
      let classificationElementList = document.getElementById("classification-list").getElementsByClassName("classification-parent");
      if (!this.arrayIsEmpty(classificationElementList)) {
        for (let i = 0; i < classificationElementList.length; i++) {
          const observer = new ResizeObserver((entries) => {
            this.setClassificationWidth();
          });
          observer.observe(classificationElementList[i]);
        }
      }
    },
    /**
     * 设置分类宽度
     */
    setClassificationWidth() {
      if (this.setting.classification.layout != "top") {
        return;
      }
      let width = document.getElementById("classification-list").getBoundingClientRect().width - 16;
      let minWidth = this.setting.classification.mode == "icon" ? 50 : this.$store.state.setting.classification.width;
      let num = Math.floor(width / minWidth);
      let classificationElementList = document.getElementById("classification-list").getElementsByClassName("classification-parent");
      if (classificationElementList.length >= num) {
        for (let i = 0; i < classificationElementList.length; i++) {
          classificationElementList[i].style.width = width / num + "px";
        }
      } else {
        for (let i = 0; i < classificationElementList.length; i++) {
          classificationElementList[i].style.width = minWidth + "px";
        }
      }
    },
    /**
     * 更新子分类宽度
     */
    setClassificationChildWidth() {
      // 顶部模式下需要手动设置子菜单宽度
      if (this.setting.classification.layout == "top") {
        // 获取宽度
        let w = document.getElementById("classification-" + this.classificationParentSelected).getBoundingClientRect().width;
        let classificationChildElement = document.getElementById("classification-child-" + this.classificationParentSelected);
        if (classificationChildElement != null) {
          classificationChildElement.style.width = w - 4 + "px";
        }
      }
    },
    /**
     * 获取设置
     */
    getSetting() {
      // 获取数据
      this.setting = ipcRenderer.sendSync("getSetting");
      this.$store.state.setting = this.setting;
      this.$store.state.currentLanguage = this.$store.state.language[this.$store.state.setting.general.language];
      ipcRenderer.send("setCurrentLanguage", JSON.stringify(this.$store.state.currentLanguage));
    },
    /**
     * 判断当前分类是否拥有子分类
     *
     * @param id 分类ID
     */
    haveClassificationChild(id) {
      if (id != null) {
        let classification = ClassificationJS.getClassificationById(id, null);
        if (!this.arrayIsEmpty(classification.childList)) {
          return true;
        } else {
          return false;
        }
      }
    },
    /**
     * 重新设置
     */
    reSetSetting(setting) {
      // 是否更换了分类布局
      if (setting.classification.layout != this.setting.classification.layout) {
        this.classificationChildShowHiddenMap = new Map();
      }
      this.setting = setting;
      this.$store.state.setting = this.setting;
      this.$store.state.currentLanguage = this.$store.state.language[this.$store.state.setting.general.language];
      ipcRenderer.send("setCurrentLanguage", JSON.stringify(this.$store.state.currentLanguage));
      this.createStyle();
    },
    /**
     * 设置
     */
    setSetting() {
      this.$store.state.setting = this.setting;
      ipcRenderer.send(
        "setSetting",
        JSON.stringify({
          setting: this.setting,
          other: {
            main: false,
            search: false,
            setting: true,
          },
        })
      );
    },
    /**
     * 移动项目
     *
     * @param from 来源
     * @param to 目标
     * @param del 是否删除原数据
     */
    moveItem(from, to, del) {
      // 查询分类
      let classification = ClassificationJS.getClassificationById(from.classificationParentId, from.classificationChildId);
      if (classification != null && !this.arrayIsEmpty(classification.itemList)) {
        // 查询项目
        let item = ItemJS.getItemById(classification, from.id);
        if (item != null) {
          // 复制一份对象
          let newItem = JSON.parse(JSON.stringify(item));
          // 获取旧图标
          if (this.$store.state.iconDataMap != null) {
            let icon = this.$store.state.iconDataMap.get(CommonJS.getKey(from.classificationParentId, from.classificationChildId, item.id));
            if (icon != null) {
              newItem.icon = icon.icon;
            }
          }
          if (del) {
            // 删除项目
            this.deleteItem(from.classificationParentId, from.classificationChildId, from.id);
          }
          newItem.classificationId = to.classificationChildId != null ? to.classificationChildId : to.classificationParentId;
          // 移动到新分类下
          this.addItem(to.classificationParentId, to.classificationChildId, [newItem]);
        }
      }
    },
    /**
     * 设置快捷键
     */
    setShortcutKeyMap() {
      this.$store.state.appShortcutKeyMap = new Map();
      for (let p of this.list) {
        // 设置分类快捷键
        this.setClassificationShortcutKey(p.shortcutKey, p.id, p.name);
        // 判断是否有子级分类
        if (!this.arrayIsEmpty(p.childList)) {
          // 有子级分类
          for (let c of p.childList) {
            // 设置子级分类快捷键
            this.setClassificationShortcutKey(c.shortcutKey, p.id, p.name, c.id, c.name);
            // 设置项目快捷键
            this.setItemShortcutKey(c.itemList, p.id, p.name, c.id, c.name);
          }
        } else {
          // 设置项目快捷键
          this.setItemShortcutKey(p.itemList, p.id, p.name);
        }
      }
    },
    /**
     * 设置分类快捷键
     * @param shortcutKey
     * @param classificationParentId
     * @param classificationParentName
     * @param classificationChildId
     * @param classificationChildName
     */
    setClassificationShortcutKey(shortcutKey, classificationParentId, classificationParentName, classificationChildId, classificationChildName) {
      if (!this.strIsEmpty(shortcutKey)) {
        this.$store.state.appShortcutKeyMap.set(shortcutKey, {
          type: "classification",
          classificationParentId: classificationParentId,
          classificationParentName: classificationParentName,
          classificationChildId: classificationChildId,
          classificationChildName: classificationChildName,
        });
      }
    },
    /**
     * 设置项目快捷键
     * @param itemList
     * @param classificationParentId
     * @param classificationParentName
     * @param classificationChildId
     * @param classificationChildName
     */
    setItemShortcutKey(itemList, classificationParentId, classificationParentName, classificationChildId, classificationChildName) {
      if (!this.arrayIsEmpty(itemList)) {
        for (let item of itemList) {
          if (!this.strIsEmpty(item.shortcutKey)) {
            this.$store.state.appShortcutKeyMap.set(item.shortcutKey, {
              type: "item",
              classificationParentId: classificationParentId,
              classificationParentName: classificationParentName,
              classificationChildId: classificationChildId,
              classificationChildName: classificationChildName,
              itemId: item.id,
              itemName: item.name.replace(/\\n/g, " "),
            });
          }
        }
      }
    },
    /**
     * 监听键盘
     * @param e
     */
    keydown(e) {
      if (
        this.classificationAddEditForm.show ||
        this.classificationIconForm.show ||
        this.classificationAssociatedFolderForm.show ||
        this.classificationAggregateForm.show ||
        this.itemAddEditForm.show ||
        this.search ||
        this.showAbout ||
        this.showBackupRestore
      ) {
        if (e.keyCode == 27) {
          if (this.classificationAddEditForm.show) {
            this.classificationAddEditForm.show = false;
          }
          if (this.classificationIconForm.show) {
            this.classificationIconForm.show = false;
          }
          if (this.classificationAssociatedFolderForm.show) {
            this.classificationAssociatedFolderForm.show = false;
          }
          if (this.classificationAggregateForm.show) {
            this.classificationAggregateForm.show = false;
          }
          if (this.search) {
            this.search = false;
          }
          if (this.showAbout) {
            this.showAbout = false;
          }
          if (this.showBackupRestore) {
            this.showBackupRestore = false;
          }
        }
        // 禁止页面刷新
        let sk = CommonJS.setShortcutKey(e, null, false);
        if (!this.strIsEmpty(sk) && (sk.toLowerCase() == "ctrl + r" || sk.toLowerCase() == "ctrl + shift + r" || sk.toLowerCase() == "f5")) {
          e.preventDefault();
        }
        // 禁止关闭页面
        if (!this.strIsEmpty(sk) && sk.toLowerCase() == "ctrl + w") {
          e.preventDefault();
        }
        return;
      }
      // ESC
      if (e.keyCode == 27) {
        this.hideMainWindowBefore();
        e.preventDefault();
        return;
      }
      // 提取快捷键
      let shortcutKey = CommonJS.setShortcutKey(e, null, true);
      if (shortcutKey != null && shortcutKey != "") {
        let s = this.$store.state.appShortcutKeyMap.get(shortcutKey);
        if (s != null) {
          if (s.type == "classification") {
            if (s.classificationChildId != null) {
              this.changeChildClassification(s.classificationParentId, s.classificationChildId);
              this.showHiddenClassificationChildList(null, s.classificationParentId, true);
            } else {
              this.changeClassification(s.classificationParentId, false);
            }
          } else {
            let classification = ClassificationJS.getClassificationById(s.classificationParentId, s.classificationChildId);
            let item = ItemJS.getItemById(classification, s.itemId);
            ItemJS.itemRun(item, false);
          }
        } else if (this.$store.state.setting != null) {
          if (this.$store.state.setting.item != null) {
            if (this.$store.state.setting.item.searchShortcutKey != null && shortcutKey == this.$store.state.setting.item.searchShortcutKey) {
              this.search = true;
              if (this.setting.classification.layout == "top") {
                this.classificationChildShowHiddenMap = new Map();
              }
            }
          }
        }
      }
    },
    /**
     * 显示菜单
     */
    showMenu() {
      this.topRightMenu = !this.topRightMenu;
      this.windowSetting = false;
      this.menuList = [
        {
          name: this.$store.state.currentLanguage.setting,
          func: () => {
            ipcRenderer.send("createSettingWindow");
          },
        },
        {
          type: "separator",
        },
        {
          name: this.$store.state.currentLanguage.backupRestoreData,
          func: () => {
            this.showBackupRestore = true;
          },
        },
        {
          type: "separator",
        },
        {
          name: this.$store.state.currentLanguage.about,
          func: () => {
            this.showAbout = true;
          },
        },
        {
          name: this.$store.state.currentLanguage.rewardAndSponsorship,
          func: () => {
            ipcRenderer.send("rewardAndSponsorship");
          },
        },
        {
          name: this.$store.state.currentLanguage.feedback,
          func: () => {
            ipcRenderer.send("feedback");
          },
        },
        {
          name: this.$store.state.currentLanguage.checkForUpdates,
          func: () => {
            ipcRenderer.send("checkUpdate");
          },
        },
        {
          name: this.$store.state.currentLanguage.exit,
          func: () => {
            this.close();
          },
        },
      ];
      if (this.batchOperation) {
        this.clearItemSortingData();
      }
    },
    // 重新获取所有数据
    getAllData() {
      // 获取设置
      this.getSetting();
      // 获取数据
      this.list = this.getList();
      // 获取图标
      this.$store.state.iconDataMap = this.getIconData();
      // 再次保存
      this.setList();
      // 是否选中了记住选择状态
      let flag = false;
      if (this.setting.classification.rememberSelectionState) {
        let item = localStorage.getItem("classificationSelected");
        if (!this.strIsEmpty(item)) {
          let data = JSON.parse(item);
          if (data != null && data.parentId != null) {
            let classification = ClassificationJS.getClassificationById(data.parentId, data.childId);
            if (classification != null) {
              if (data.childId != null) {
                this.changeChildClassification(data.parentId, data.childId);
              } else {
                this.changeClassification(data.parentId, false);
              }
              if (this.setting.classification.layout == "top") {
                localStorage.removeItem("classificationChildShowHiddenMap");
                this.classificationChildShowHiddenMap = new Map();
              } else {
                let classificationChildShowHiddenMap = localStorage.getItem("classificationChildShowHiddenMap");
                if (classificationChildShowHiddenMap != null) {
                  let arr = JSON.parse(classificationChildShowHiddenMap);
                  if (arr.length > 0) {
                    this.classificationChildShowHiddenMap = new Map();
                    for (let v of arr) {
                      this.classificationChildShowHiddenMap.set(v, true);
                    }
                  }
                }
              }
              flag = true;
            }
          } else {
            localStorage.removeItem("classificationSelected");
            localStorage.removeItem("classificationChildShowHiddenMap");
          }
        }
      }
      if (!flag) {
        // 默认选中第一个分类
        this.changeClassification(this.list[0].id, false);
      }
    },
    /**
     * 通过element信息获取项目
     */
    getItemByElement(e) {
      let classificationParentId = null;
      let classificationChildId = null;
      let itemId = null;
      for (let i = 0; i < e.path.length; i++) {
        if (e.path[i].attributes == null) {
          continue;
        }
        if (!this.strIsEmpty(e.path[i].getAttribute("classification-parent-id"))) {
          classificationParentId = CommonJS.parseInt(e.path[i].getAttribute("classification-parent-id"));
        }
        if (!this.strIsEmpty(e.path[i].getAttribute("classification-child-id"))) {
          classificationChildId = CommonJS.parseInt(e.path[i].getAttribute("classification-child-id"));
        }
        if (!this.strIsEmpty(e.path[i].getAttribute("item-id"))) {
          itemId = CommonJS.parseInt(e.path[i].getAttribute("item-id"));
        }
      }
      let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
      if (classification == null) {
        return null;
      }
      let item = ItemJS.getItemById(classification, itemId);
      if (item == null) {
        return null;
      }
      return item;
    },
    /**
     * 鼠标悬浮
     * @param e
     */
    classificationMouseOver(e) {
      if (this.setting.classification.mouseHover && !this.itemSorting && !this.classificationSorting) {
        // 鼠标悬浮切换
        e.preventDefault();
        let { classificationParentId, classificationChildId } = this.getClassificationByElement(e);
        if (classificationParentId != null) {
          if (this.mouseHoverClassificationParentId == null && this.mouseHoverClassificationChildId == null) {
            this.classificationMouseOverSetTimeout(classificationParentId, classificationChildId, this.setting.classification.mouseHoverMS);
          } else {
            if (this.mouseHoverClassificationParentId != classificationParentId || this.mouseHoverClassificationChildId != classificationChildId) {
              this.classificationMouseOverSetTimeout(classificationParentId, classificationChildId, this.setting.classification.mouseHoverMS);
            }
          }
        } else {
          this.clearMouseOverSetTimeout();
        }
      } else if (this.itemSorting) {
        // 项目拖拽中
        // 获取分类ID
        let { classificationParentId, classificationChildId } = this.getClassificationByElement(e);
        // 记录分类信息
        this.itemSortingClassificationInfo = {
          classificationParentId: classificationParentId,
          classificationChildId: classificationChildId,
        };
        // 如果分类是父级分类并且没有展开的话，那么就展开当前父级分类
        if (classificationChildId == null && this.haveClassificationChild(classificationParentId)) {
          let flag = this.classificationChildShowHiddenMap.get(CommonJS.parseInt(classificationParentId));
          if (flag == null || !flag) {
            this.classificationChildShowHiddenMap.set(CommonJS.parseInt(classificationParentId), true);
          }
        }
      }
    },
    /**
     * 鼠标移出
     * @param e
     */
    classificationMouseOut(e) {
      if (this.itemSorting) {
        // 项目拖拽中
        // 清空分类信息
        this.itemSortingClassificationInfo = null;
      }
      // 清空timeout
      this.clearMouseOverSetTimeout();
    },
    /**
     * 设置timeout
     * @param classificationParentId
     * @param classificationChildId
     * @param timeout
     */
    classificationMouseOverSetTimeout(classificationParentId, classificationChildId, timeout) {
      let _this = this;
      this.mouseHoverClassificationParentId = classificationParentId;
      this.mouseHoverClassificationChildId = classificationChildId;
      clearTimeout(this.mouseHoverSetTimeout);
      this.mouseHoverSetTimeout = setTimeout(() => {
        if (classificationParentId != null) {
          if (classificationChildId != null) {
            _this.changeChildClassification(classificationParentId, classificationChildId);
          } else {
            _this.changeClassification(classificationParentId, false);
          }
          _this.clearMouseOverSetTimeout();
        }
      }, timeout);
    },
    /**
     * 清空timeout
     */
    clearMouseOverSetTimeout() {
      this.mouseHoverClassificationParentId = null;
      this.mouseHoverClassificationChildId = null;
      clearTimeout(this.mouseHoverSetTimeout);
      this.mouseHoverSetTimeout = null;
    },
    /**
     * 设置永远置顶
     */
    setAlwaysTop() {
      this.setSetting();
      ipcRenderer.send("setAlwaysTop", this.setting.general.alwaysTop);
    },
    /**
     * 固定位置
     */
    setFixedPosition() {
      this.setSetting();
      ipcRenderer.send("setFixedPosition", [!this.setting.general.fixedPosition, this.setting.general.alwaysCenter]);
    },
    /**
     * 调整尺寸
     */
    setResize() {
      this.setSetting();
      ipcRenderer.send("setResize", !this.setting.general.lockSize);
    },
    /**
     * 永远居中
     */
    setAlwaysCenter() {
      this.setSetting();
      ipcRenderer.send("setAlwaysCenter", [this.setting.general.alwaysCenter, !this.setting.general.fixedPosition, this.setting.general.alwaysCenter]);
    },
    /**
     * 监听滚轮
     */
    wheel(e) {
      if (!this.setting.classification.mouseWheel) {
        return;
      }
      // 获取是在分类还是项目区域使用鼠标滚轮
      let id;
      for (let i = 0; i < e.path.length; i++) {
        if (e.path[i].id == "classification-content") {
          id = "classification-content";
          break;
        }
      }
      // 分类
      let classificationContent = document.getElementById(id);
      // 获取宽度
      let width = classificationContent.clientWidth;
      // 获取坐标
      let x = e.offsetX;
      // 如果在滚动条区域的话就可以上下滚动，否则就切换分类
      if (width - x <= 10) {
        // 可以滚动
      } else {
        // 滚轮切换分类
        this.wheelChangeClassification(e, id);
      }
    },
    /**
     * 滚轮切换分类
     * @param e
     */
    wheelChangeClassification(e, id) {
      e.preventDefault();
      // 分类
      let classificationContent = document.getElementById(id);
      // 获取是上还是下 -1为上 1为下
      const delta = Math.sign(e.deltaY);
      // 判断当前分类是第几
      let index = 0;
      for (let i = 0; i < this.list.length; i++) {
        if (this.list[i].id == this.classificationParentSelected) {
          index = i;
        }
      }
      let n = index;
      // 切换分类
      if (delta == 1) {
        // 向下
        if (index < this.list.length - 1) {
          n = index + 1;
        }
      } else {
        // 向上
        if (index > 0) {
          n = index - 1;
        }
      }
      if (n != index) {
        let classification = this.list[n];
        this.changeClassification(classification.id, false);
        if (this.setting.classification.layout == "left" || this.setting.classification.layout == "right") {
          // 获取判断可以容纳多少个分类
          let classificationNum = Math.trunc(classificationContent.clientHeight / 34);
          // 获取滚动条实例
          let simpleBar = SimpleBar.instances.get(document.getElementById("classification-content"));
          // 分类坐标
          let elTop = document.getElementById("classification-" + classification.id).offsetTop;
          // 向下
          if (delta == 1 && n + 1 > classificationNum) {
            let newTop = elTop + 34 - classificationContent.clientHeight;
            if (newTop > simpleBar.getScrollElement().scrollTop) {
              simpleBar.getScrollElement().scrollTop = newTop;
            }
          } else if (delta == -1) {
            let down = Math.ceil(simpleBar.getScrollElement().scrollTop / 34);
            let boundingClientRect = document.getElementById("classification-" + classification.id).getBoundingClientRect();
            if (n < down) {
              simpleBar.getScrollElement().scrollTop = simpleBar.getScrollElement().scrollTop - (34 - boundingClientRect.y);
            }
          }
        }
      }
    },
    /**
     * 项目排序
     * @param classificationParentId
     * @param classificationChildId
     * @param sort
     */
    itemSort(classificationParentId, classificationChildId, sort) {
      if (classificationChildId == null && this.haveClassificationChild(classificationParentId)) {
        // 在父级分类下并且有子分类
        let classification = ClassificationJS.getClassificationById(classificationParentId, null);
        if (classification != null && !this.arrayIsEmpty(classification.childList)) {
          for (let child of classification.childList) {
            if (child.type == null || child.type != 1) {
              if (sort == "default") {
                child.sort = null;
                child.sortOrder = null;
              } else {
                this.setSort(child, sort);
                if (!this.arrayIsEmpty(child.itemList)) {
                  child.itemList = this.itemListSort(child, child.itemList);
                }
              }
            }
          }
          classification.sort = null;
          classification.sortOrder = null;
        }
      } else {
        let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
        if (classification != null) {
          if (classification.type == null || classification.type != 1) {
            if (sort == "default") {
              classification.sort = null;
              classification.sortOrder = null;
            } else {
              this.setSort(classification, sort);
              if (!this.arrayIsEmpty(classification.itemList)) {
                classification.itemList = this.itemListSort(classification, classification.itemList);
              }
            }
          }
        }
      }
      this.setList();
    },
    /**
     * 设置排序信息
     * @param classification
     * @param sort
     */
    setSort(classification, sort) {
      if (classification.sort == null || classification.sort != sort) {
        classification.sort = sort;
        if (sort == "openNumber") {
          classification.sortOrder = "desc";
        } else {
          classification.sortOrder = "asc";
        }
      } else {
        if (classification.sortOrder == "asc") {
          classification.sortOrder = "desc";
        } else if ((classification.sortOrder = "desc")) {
          classification.sortOrder = "asc";
        }
      }
    },
    /**
     * 项目列表排序
     * @param classification
     * @param itemList
     */
    itemListSort(classification, itemList) {
      let copyList = JSON.parse(JSON.stringify(itemList));
      if (classification.sort == "initial") {
        copyList = ItemJS.sort(copyList, classification.sort, null);
        if (classification.sortOrder == "desc") {
          copyList.reverse();
        }
      } else if (classification.sort == "openNumber") {
        copyList = ItemJS.sort(copyList, classification.sort, "openNumber");
        if (classification.sortOrder == "desc") {
          copyList.reverse();
        }
      }
      return copyList;
    },
    /**
     * 根据ID获取分类
     */
    getClassificationById: ClassificationJS.getClassificationById,
    /**
     * 记住选择分类
     * @param parentId
     * @param childId
     */
    rememberClassificationSelected(parentId, childId) {
      if (this.setting.classification.rememberSelectionState) {
        let data = {
          parentId: parentId,
          childId: childId,
          show: this.setting.classification.layout == "top" ? false : this.classificationChildShowHiddenMap.get(parentId),
        };
        localStorage.setItem("classificationSelected", JSON.stringify(data));
        if (this.setting.classification.layout != "top" && this.classificationChildShowHiddenMap != null && this.classificationChildShowHiddenMap.size > 0) {
          let arr = [];
          for (let key of this.classificationChildShowHiddenMap.keys()) {
            let v = this.classificationChildShowHiddenMap.get(key);
            if (v != null && v) {
              arr.push(key);
            }
          }
          localStorage.setItem("classificationChildShowHiddenMap", JSON.stringify(arr));
        }
      }
    },
    /**
     * 如果布局是TOP，隐藏子菜单判断
     * @param e
     */
    classificationLayoutTopHiddenChildMenu(e) {
      // 如果是顶部分类先判断是否隐藏子菜单
      if (this.setting.classification.layout == "top") {
        let { classificationParentId } = this.getClassificationByElement(e);
        if (!this.strIsEmpty(classificationParentId)) {
          for (let key of this.classificationChildShowHiddenMap.keys()) {
            if (key != CommonJS.parseInt(classificationParentId)) {
              this.classificationChildShowHiddenMap.set(key, false);
            }
          }
        } else {
          this.classificationChildShowHiddenMap = new Map();
        }
      }
    },
    /**
     * 去除所有项目选中效果
     */
    removeItemHoverClass() {
      let innerItemElementList = document.getElementsByClassName("inner-item");
      for (let innerItemElement of innerItemElementList) {
        innerItemElement.style.removeProperty("background-color");
      }
    },
    /**
     * 获取分类信息
     * @param e
     */
    getClassificationByElement(e) {
      let classificationParentId;
      let classificationChildId;
      let target;
      for (let i = 0; i < e.path.length; i++) {
        if (e.path[i].attributes == null) {
          continue;
        }
        if (e.path[i].getAttribute("classification-child") != null && e.path[i].getAttribute("classification-child") == "true") {
          classificationParentId = e.path[i].getAttribute("classification-parent-id");
          classificationChildId = e.path[i].getAttribute("classification-child-id");
          target = e.path[i];
          break;
        } else if (e.path[i].getAttribute("classification") != null && e.path[i].getAttribute("classification") == "true") {
          classificationParentId = e.path[i].getAttribute("classification-parent-id");
          target = e.path[i];
          break;
        }
      }
      return { classificationParentId, classificationChildId, target };
    },
    /**
     * 去除符合当前项目无效项目列表里的数据
     * @param item
     */
    removeInvalidItem(item) {
      if (!this.arrayIsEmpty(this.invalidItemList)) {
        let key;
        if (item.classificationParentId != null) {
          key = item.classificationParentId + "-" + item.classificationId + "-" + item.id;
        } else {
          key = item.classificationId + "-" + item.id;
        }
        let index = this.invalidItemList.indexOf(key);
        if (index >= 0) {
          this.invalidItemList.splice(index, 1);
        }
      }
    },
    /**
     * 是否选中父级分类
     * @param classification
     * @returns {boolean}
     */
    isClassificationParentSelected(classification) {
      return (
        (this.classificationParentSelected == classification.id && this.classificationChildSelected == null) ||
        (this.setting.classification.layout == "top" && this.classificationParentSelected == classification.id && this.classificationChildSelected != null)
      );
    },
    /**
     * 是否选中子级分类
     * @param classification
     * @param childClassification
     * @returns {boolean}
     */
    isClassificationChildSelected(classification, childClassification) {
      return this.classificationParentSelected == classification.id && this.classificationChildSelected == childClassification.id;
    },
    /**
     * 创建样式
     */
    createStyle() {
      // 找到要删除的 style 标签
      let styleElement = document.getElementById("placeholder-style");
      // 如果找到了 style 标签，则从其父节点中移除
      if (styleElement) {
        styleElement.parentNode.removeChild(styleElement);
      }
      // 创建一个新的伪类样式规则
      let style = document.createElement("style");
      style.setAttribute("id", "placeholder-style");
      style.type = "text/css";
      // 设置伪类样式规则的内容
      style.innerHTML =
        "input::placeholder, textarea::placeholder {" + "color: " + this.$hexToRGBA(this.$store.state.setting.appearance.theme.fontBasic, 0.5) + ";" + "}";
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

      // 背景图
      this.createBackgroundImageStyle();
    },
    /**
     * 背景图Style
     */
    createBackgroundImageStyle() {
      if (this.$store.state.backgroundImage != null && this.setting.appearance.backgroundImageTransparency < 1) {
        // 找到要删除的 style 标签
        let backgroundImageStyle = document.getElementById("background-image-style");
        // 如果找到了 style 标签，则从其父节点中移除
        if (backgroundImageStyle) {
          backgroundImageStyle.parentNode.removeChild(backgroundImageStyle);
        }
        // 创建一个新的伪类样式规则
        backgroundImageStyle = document.createElement("style");
        backgroundImageStyle.setAttribute("id", "background-image-style");
        backgroundImageStyle.type = "text/css";
        // 设置伪类样式规则的内容
        backgroundImageStyle.innerHTML =
          "#main::before {" +
          "z-index: -1;" +
          'content: "";' +
          "position: absolute;" +
          "top: 0;" +
          "left: 0;" +
          "width: 100%;" +
          "height: 100%;" +
          'background-image: url("' +
          this.$store.state.backgroundImage +
          '");' +
          "background-repeat: " +
          this.setting.appearance.backgroundImageMode +
          ";" +
          (this.setting.appearance.backgroundImagePosition == "default"
            ? ""
            : "background-position: " + this.setting.appearance.backgroundImagePosition + ";") +
          "opacity: " +
          this.setting.appearance.backgroundImageTransparency +
          ";" +
          "}";
        // 将伪类样式规则添加到 head 元素中
        document.head.appendChild(backgroundImageStyle);
      }
    },
    /**
     * 获取分类名称
     */
    getClassificationName(classification) {
      let name = "";
      if (classification.icon != null) {
        name += classification.icon;
      }
      if (this.setting.classification.mode == "normal") {
        name += " " + classification.name;
      } else {
        if (name == "" && classification.name.length > 0) {
          name += classification.name.substring(0, 1);
        }
      }
      return name;
    },
    /**
     * 滚轮监听
     */
    mouseWheelListener() {
      // 监听滚轮
      if (this.setting.classification.mouseWheel) {
        document.getElementById("classification-content").addEventListener("wheel", this.wheel, { passive: false, capture: true });
      } else {
        document.getElementById("classification-content").removeEventListener("wheel", this.wheel, true);
      }
    },
    /**
     * 创建分类滚动条
     */
    classificationSimpleBar() {
      if (this.setting.classification.layout == "left" || this.setting.classification.layout == "right") {
        // 分类滚动条
        new SimpleBar(document.getElementById("classification-content"));
      }
    },
    /**
     * 创建项目滚动条
     */
    itemSimpleBar() {
      if (SimpleBar.instances.get(document.getElementById("item-content")) == null) {
        this.itemContentSimpleBar = new SimpleBar(document.getElementById("item-content"));
        if (this.itemContentSimpleBar.getScrollElement() != null) {
          let _this = this;
          this.itemContentSimpleBar.getScrollElement().addEventListener(
            "wheel",
            (e) => {
              if (this.setting.classification.autoSwitchClassification) {
                const delta = Math.sign(e.deltaY);
                if (delta == -1 && _this.itemContentSimpleBar.getScrollElement().scrollTop == 0) {
                  // 上
                  this.wheelChangeClassification(e, "classification-content");
                } else if (delta == 1) {
                  // 下
                  if (
                    _this.itemContentSimpleBar.getScrollElement().scrollTop + _this.itemContentSimpleBar.getScrollElement().clientHeight ==
                    _this.itemContentSimpleBar.getScrollElement().scrollHeight
                  ) {
                    // 滚轮切换分类
                    this.wheelChangeClassification(e, "classification-content");
                  }
                }
              }
            },
            { passive: false, capture: true }
          );
        }
      } else {
        this.itemContentSimpleBar.recalculate();
      }
    },
    /**
     * 项目排序时获取分类ID
     */
    getItemSortableClassificationId(event) {
      let classificationParentId = this.classificationParentSelected;
      let classificationChildId = this.classificationChildSelected;
      let itemElement;
      // 批量操作和不是批量操作获取的节点不同
      if (!this.batchOperation) {
        itemElement = event.from;
      } else {
        itemElement = event.item;
      }
      // 尝试获取子分类ID
      if (!this.strIsEmpty(itemElement.getAttribute("classification-child-id"))) {
        classificationChildId = itemElement.getAttribute("classification-child-id");
      }
      return { classificationParentId, classificationChildId };
    },
    /**
     * 项目排序选中项目
     */
    itemSortableItemAdd(event) {
      if (this.itemSortingMap == null) {
        this.itemSortingMap = new Map();
      }
      let { classificationParentId, classificationChildId } = this.getItemSortableClassificationId(event);
      // 查找相关项目
      let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
      let key = classificationParentId;
      let item;
      if (!this.batchOperation) {
        if (classification != null && !this.arrayIsEmpty(classification.itemList) && classification.itemList.length > event.oldIndex) {
          item = classification.itemList[event.oldIndex];
        }
      } else {
        if (classification != null && !this.arrayIsEmpty(classification.itemList) && !this.strIsEmpty(event.item.getAttribute("item-id"))) {
          item = ItemJS.getItemById(classification, event.item.getAttribute("item-id"));
        }
      }
      if (item != null) {
        let newItem = JSON.parse(JSON.stringify(item));
        if (classificationChildId != null) {
          newItem.classificationId = CommonJS.parseInt(classificationChildId);
          newItem.classificationParentId = CommonJS.parseInt(classificationParentId);
          key += "-" + classificationChildId;
        } else {
          newItem.classificationId = CommonJS.parseInt(classificationParentId);
          newItem.classificationParentId = null;
        }
        key += "-" + newItem.id;
        // 放入map中
        this.itemSortingMap.set(key, newItem);
      }
    },
    /**
     * 项目排序选中项目删除
     * @param event
     */
    itemSortableItemDelete(event) {
      if (this.itemSortingMap != null) {
        let { classificationParentId, classificationChildId } = this.getItemSortableClassificationId(event);
        // 查找相关项目
        let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
        if (classification != null && !this.arrayIsEmpty(classification.itemList)) {
          // 获取分类ID
          if (!this.strIsEmpty(event.item.getAttribute("item-id"))) {
            // 删除
            this.itemSortingMap.delete(CommonJS.getKey(classificationParentId, classificationChildId, event.item.getAttribute("item-id")));
          }
        }
      }
    },
    /**
     * 清空项目排序相关数据
     */
    clearItemSortingData() {
      this.itemSorting = false;
      this.batchOperation = false;
      this.itemSortingMap = null;
      this.itemSortingClassificationInfo = null;
      this.$nextTick(() => {
        this.itemSortable();
        this.removeItemHoverClass();
      });
    },
    /**
     * 删除ItemSortingMap中的数据
     * @param deleteIcon
     */
    deleteItemSortingMapData(deleteIcon) {
      // 循环Map移出原始记录
      for (let key of this.itemSortingMap.keys()) {
        let arr = key.split("-");
        let classificationParentId = arr[0];
        let classificationChildId = arr.length == 3 ? arr[1] : null;
        let itemId = arr[arr.length - 1];
        let classification = ClassificationJS.getClassificationById(classificationParentId, classificationChildId);
        let index;
        for (let i = 0; i < classification.itemList.length; i++) {
          if (classification.itemList[i].id == itemId) {
            index = i;
            break;
          }
        }
        if (index != null) {
          if (deleteIcon != null && deleteIcon) {
            this.setUpdateIconData(classificationParentId, classificationChildId, { id: itemId }, "delete");
          }
          // 删除
          classification.itemList.splice(index, 1);
        }
      }
    },
    /**
     * 项目排序更新数据
     * @param toClassificationParentId
     * @param toClassificationChildId
     * @param newIndex
     * @param del
     */
    itemSortingDataUpdate(toClassificationParentId, toClassificationChildId, newIndex, del) {
      if (del != null && del) {
        // 删除原数据
        this.deleteItemSortingMapData(false);
      }
      // 查询分类
      let toClassification = ClassificationJS.getClassificationById(toClassificationParentId, toClassificationChildId);
      if (toClassification != null) {
        if (toClassification.itemList == null) {
          toClassification.itemList = [];
        }
        let id = CommonJS.getNewId(toClassification.itemList);
        let newItemList = [];
        for (let [key, item] of this.itemSortingMap.entries()) {
          // new
          let newItem = JSON.parse(JSON.stringify(item));
          // 获取原图标数据
          if (this.$store.state.iconDataMap != null) {
            let icon = this.$store.state.iconDataMap.get(key);
            newItem.icon = icon != null ? icon.icon : null;
          }
          if (del != null && del) {
            // 更新图标数据
            let arr = key.split("-");
            let classificationParentId = arr[0];
            let classificationChildId = arr.length == 3 ? arr[1] : null;
            let itemId = arr[arr.length - 1];
            this.setUpdateIconData(classificationParentId, classificationChildId, { id: itemId }, "delete");
          }
          // 更新ID
          newItem.id = id++;
          // 设置分类ID
          newItem = ItemJS.setItemClassificationId(newItem, toClassificationParentId, toClassificationChildId);
          // add
          newItemList.push(newItem);
        }
        if (!this.arrayIsEmpty(newItemList)) {
          for (let item of newItemList) {
            // 记录图标数据
            this.setUpdateIconData(toClassificationParentId, toClassificationChildId, item, "add");
            // 清空图标
            item.icon = null;
            // 去除符合当前项目无效项目列表里的数据
            this.removeInvalidItem(item);
          }
          if (newIndex != null) {
            // 如果是当前分类移动的话,那么就按照新坐标添加数据
            toClassification.itemList.splice(newIndex, 0, ...newItemList);
          } else {
            // 如果是跨分类的话,那么就在最后追加
            toClassification.itemList.push(...newItemList);
          }
        }
      }
      // 清空数据
      this.clearItemSortingData();
      // 更新DOM
      this.itemKey++;
      // 保存数据
      this.setList();
      this.$nextTick(() => {
        // 设置项目宽度
        this.setItemWidth();
      });
    },
    /**
     * 搜索框
     */
    searchInput() {
      this.search = !this.search;
      if (this.batchOperation) {
        this.clearItemSortingData();
      }
    },
    /**
     * 更新图标数据
     * @param classificationParentId
     * @param classificationChildId
     * @param item
     * @param type
     */
    setUpdateIconData(classificationParentId, classificationChildId, item, type) {
      if (this.updateIconData == null) {
        this.updateIconData = {};
      }
      if (type == "add") {
        if (this.updateIconData.add == null) {
          this.updateIconData.add = [];
        }
        if (!this.strIsEmpty(item.icon)) {
          this.updateIconData.add.push({
            classificationParentId: classificationParentId,
            classificationChildId: classificationChildId,
            itemId: item.id,
            icon: item.icon,
          });
          this.updateIconDataMap(classificationParentId, classificationChildId, item, type);
        }
      } else if (type == "update") {
        if (this.updateIconData.update == null) {
          this.updateIconData.update = [];
        }
        this.updateIconData.update.push({
          classificationParentId: classificationParentId,
          classificationChildId: classificationChildId,
          itemId: item.id,
          icon: item.icon,
        });
        this.updateIconDataMap(classificationParentId, classificationChildId, item, type);
      } else if (type == "delete") {
        if (this.updateIconData.delete == null) {
          this.updateIconData.delete = [];
        }
        this.updateIconData.delete.push({
          classificationParentId: classificationParentId,
          classificationChildId: classificationChildId,
          itemId: item.id,
        });
        this.updateIconDataMap(classificationParentId, classificationChildId, item, type);
      }
    },
    /**
     * 添加图标数据Map
     */
    updateIconDataMap(classificationParentId, classificationChildId, item, type) {
      if (this.$store.state.iconDataMap == null) {
        this.$store.state.iconDataMap = new Map();
      }
      if (type == "add" || type == "update") {
        this.$store.state.iconDataMap.set(CommonJS.getKey(classificationParentId, classificationChildId, item.id), {
          classificationParentId: classificationParentId,
          classificationChildId: classificationChildId,
          itemId: item.id,
          icon: item.icon,
        });
      } else if (type == "delete") {
        this.$store.state.iconDataMap.delete(CommonJS.getKey(classificationParentId, classificationChildId, item.id));
      }
    },
    /**
     * 获取聚合项目
     */
    getAggregateItemList(classification, sort, itemNumber) {
      // 提取所有项目
      let itemList = [];
      for (let c of this.list) {
        if (!this.arrayIsEmpty(c.childList)) {
          for (let cc of c.childList) {
            if (!this.arrayIsEmpty(cc.itemList)) {
              for (let item of cc.itemList) {
                if (
                  classification.showOnly == null ||
                  classification.showOnly == "default" ||
                  (classification.showOnly == "file" && item.type != 1) ||
                  (classification.showOnly == "folder" && item.type == 1)
                ) {
                  itemList.push(item);
                }
              }
            }
          }
        } else {
          if (!this.arrayIsEmpty(c.itemList)) {
            for (let item of c.itemList) {
              if (
                classification.showOnly == null ||
                classification.showOnly == "default" ||
                (classification.showOnly == "file" && item.type != 1) ||
                (classification.showOnly == "folder" && item.type == 1)
              ) {
                itemList.push(item);
              }
            }
          }
        }
      }
      // 排序
      this.aggregateItemListSort(sort, itemList);
      // 截取
      if (itemList.length > itemNumber) {
        return itemList.slice(0, itemNumber);
      } else {
        return itemList;
      }
    },
    /**
     * 项目列表排序
     * @param sort
     * @param itemList
     */
    aggregateItemListSort(sort, itemList) {
      if (sort == "initial") {
        itemList = ItemJS.sort(itemList, sort, null);
      } else if (sort == "openNumber") {
        itemList = ItemJS.sort(itemList, sort, "openNumber");
        itemList.reverse();
      } else if (sort == "lastOpen") {
        itemList = ItemJS.sort(itemList, sort, "lastOpen");
        itemList.reverse();
      }
    },
    /**
     * 收起其余子分类
     */
    collapseOtherSubClassification(id) {
      if (this.setting.classification.switchClassificationCollapseOtherSubClassification) {
        id = id == null ? this.classificationParentSelected : id;
        for (let key of this.classificationChildShowHiddenMap.keys()) {
          if (key != id) {
            this.classificationChildShowHiddenMap.set(key, false);
          }
        }
      }
    },
  },
};
</script>
