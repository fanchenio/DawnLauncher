<template>
  <template v-if="item && item.data">
    <!-- 普通图标 -->
    <template v-if="item.data.icon">
      <!-- 使用背景 -->
      <template v-if="item.data.iconBackgroundColor">
        <div
          class="flex items-center justify-center"
          style="background-color: rgb(0, 120, 215)"
          :style="{
            width: iconSize + 'px',
            height: iconSize + 'px',
            minWidth: iconSize + 'px',
            minHeight: iconSize + 'px',
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
              width: 20 - 8 + 'px',
              height: 20 - 8 + 'px',
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
        :style="{
          width: iconSize + 'px',
          height: iconSize + 'px',
          minWidth: iconSize + 'px',
          minHeight: iconSize + 'px',
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
      v-if="item.data.htmlIcon"
      :style="{
        width: iconSize + 'px',
        height: iconSize + 'px',
        minWidth: iconSize + 'px',
        minHeight: iconSize + 'px',
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
import { useMainStore } from "../store";
// pinia
const store = useMainStore();
// props
const props = defineProps<{
  item: Item | null;
  iconSize: number;
}>();
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
