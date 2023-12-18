<template>
  <template v-if="item && item.data">
    <!-- 无效项目 -->
    <template
      v-if="
        store.setting.item.checkInvalidItem &&
        store.invalidItemIdList.includes(item.id)
      "
    >
      <svg
        class="block"
        :class="[
          `${
            getLayout(classificationId) === 'tile' ||
            store.setting.item.hideItemName
              ? 'mx-auto'
              : 'ml-2'
          } `,
        ]"
        viewBox="0 0 1024 1024"
        :style="{
          width: getIconSize(classificationId) + 'px',
          height: getIconSize(classificationId) + 'px',
          minWidth: getIconSize(classificationId) + 'px',
          minHeight: getIconSize(classificationId) + 'px',
          filter: store.setting.appearance.fontShadow
            ? 'drop-shadow(1px 1px 1px ' +
              store.setting.appearance.fontShadowColor +
              ')'
            : undefined,
        }"
      >
        <path
          d="M969.182003 701.303054C942.98583 761.818425 907.560805 814.394635 862.909139 859.030351 818.273423 903.682017 765.86402 939.121773 705.727336 965.303215 645.576031 991.515341 581.182839 1004.606061 512.545547 1004.606061 443.925315 1004.606061 379.349482 991.515341 318.818158 965.303215 258.302785 939.121773 205.726577 903.682017 161.090861 859.030351 116.439196 814.393527 80.999438 761.818425 54.817996 701.303054 28.605873 640.772838 15.515152 576.197117 15.515152 507.575665 15.515152 438.938373 28.605873 374.545181 54.817996 314.393878 80.999438 254.257304 116.439196 201.8479 161.090861 157.212073 205.726577 112.560409 258.302785 77.135381 318.818158 50.939208 379.349482 24.743034 443.925203 11.636364 512.545547 11.636364 581.182839 11.636364 645.576031 24.742924 705.727336 50.939208 765.8628 77.1366 818.273311 112.560409 862.909139 157.212073 907.560805 201.848897 942.984611 254.258412 969.182003 314.393878 995.378179 374.545181 1008.484848 438.938373 1008.484848 507.575665 1008.484848 576.197117 995.379287 640.772838 969.182003 701.303054L969.182003 701.303054Z"
          fill="#d81e06"
          data-spm-anchor-id="a313x.7781069.0.i1"
          class="selected"
        ></path>
        <path
          d="M512 709.220647C472.332325 709.220647 440.203301 741.349668 440.203301 781.017346 440.203301 820.68502 472.332325 852.814044 512 852.814044 551.667675 852.814044 583.796699 820.68502 583.796699 781.017346 583.796699 741.349668 551.667675 709.220647 512 709.220647L512 709.220647Z"
          fill="#FFFFFF"
        ></path>
        <path
          d="M512 639.709091C492.184111 639.709091 476.101651 606.196596 476.101651 564.820837L440.203301 227.823683C440.203301 186.447921 472.332325 152.935427 512 152.935427 551.667675 152.935427 583.796699 186.447921 583.796699 227.823683L547.898349 564.820837C547.898349 606.196596 531.815889 639.709091 512 639.709091L512 639.709091Z"
          fill="#FFFFFF"
        ></path>
      </svg>
    </template>
    <!-- 普通图标 -->
    <template v-else-if="item.data.icon && item.data.icon.trim() !== ''">
      <!-- 使用背景 -->
      <template v-if="item.data.iconBackgroundColor">
        <div
          class="flex items-center justify-center"
          :class="[
            `${
              getLayout(classificationId) === 'tile' ||
              store.setting.item.hideItemName
                ? 'mx-auto'
                : 'ml-2'
            } `,
          ]"
          style="background-color: rgb(0, 120, 215)"
          :style="{
            width: getIconSize(classificationId) + 'px',
            height: getIconSize(classificationId) + 'px',
            minWidth: getIconSize(classificationId) + 'px',
            minHeight: getIconSize(classificationId) + 'px',
            filter: store.setting.appearance.fontShadow
              ? 'drop-shadow(1px 1px 1px ' +
                store.setting.appearance.fontShadowColor +
                ')'
              : undefined,
          }"
        >
          <img
            :src="item.data.icon"
            :style="{
              width: getIconSize(classificationId) - 8 + 'px',
              height: getIconSize(classificationId) - 8 + 'px',
            }"
            :draggable="false"
          />
        </div>
      </template>
      <!-- 不使用背景 -->
      <img
        v-else
        :src="item.data.icon"
        class="block"
        :class="[
          `${
            getLayout(classificationId) === 'tile' ||
            store.setting.item.hideItemName
              ? 'mx-auto'
              : 'ml-2'
          } `,
        ]"
        :style="{
          width: getIconSize(classificationId) + 'px',
          height: getIconSize(classificationId) + 'px',
          minWidth: getIconSize(classificationId) + 'px',
          minHeight: getIconSize(classificationId) + 'px',
          filter: store.setting.appearance.fontShadow
            ? 'drop-shadow(1px 1px 1px ' +
              store.setting.appearance.fontShadowColor +
              ')'
            : undefined,
        }"
        :draggable="false"
      />
    </template>
    <!-- SVG代码图标 -->
    <div
      v-else-if="item.data.htmlIcon && item.data.htmlIcon.trim() !== ''"
      :class="[
        `${
          getLayout(classificationId) === 'tile' ||
          store.setting.item.hideItemName
            ? 'mx-auto'
            : 'ml-2'
        } `,
      ]"
      :style="{
        width: getIconSize(classificationId) + 'px',
        height: getIconSize(classificationId) + 'px',
        minWidth: getIconSize(classificationId) + 'px',
        minHeight: getIconSize(classificationId) + 'px',
        filter: store.setting.appearance.fontShadow
          ? 'drop-shadow(1px 1px 1px ' +
            store.setting.appearance.fontShadowColor +
            ')'
          : undefined,
      }"
      v-html="DOMPurify.sanitize(item.data.htmlIcon)"
    ></div>
  </template>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import DOMPurify from "dompurify";
import { Item } from "../../types/item";
import { getLayout, getIconSize } from "../pages/item/js/index";
import { useMainStore } from "../store";
// pinia
const store = useMainStore();
// props
const props = defineProps<{
  classificationId: number | null;
  item: Item | null;
}>();
// 当前分类ID
let classificationId = ref(props.classificationId);
// 监听
watch(
  () => props.classificationId,
  (newValue: number | null) => {
    // 新数据
    classificationId.value = newValue;
  }
);
// 项目
let item = ref<Item | null>(props.item);
// 监听
watch(
  () => props.item,
  (newValue: Item | null) => {
    item.value = newValue;
  }
);
</script>
../../types/item
