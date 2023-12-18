<template>
  <span
    class="ml-auto text-[12px] py-[4px] px-[6px]"
    style="border-radius: 4px"
    :style="{
      color: store.setting.appearance.theme.mainFontColor,
      backgroundColor: store.setting.appearance.theme.secondBackgroundColor,
    }"
    >{{ text }}</span
  >
</template>
<script setup lang="ts">
import { useMainStore } from "../store";
// pinia
const store = useMainStore();
// props
const props = defineProps<{
  text: string;
}>();
</script>
