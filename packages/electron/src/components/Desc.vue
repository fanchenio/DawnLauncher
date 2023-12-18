<template>
  <span
    v-if="content"
    class="block text-xs"
    :style="{
      color: hexToRGBA(store.setting.appearance.theme.mainFontColor, 0.7),
    }"
    >{{ content }}</span
  >
</template>
<script setup lang="ts">
import { useMainStore } from "../store";
import { hexToRGBA } from "../utils/style";
// pinia
const store = useMainStore();
// props
const props = defineProps<{
  content: string | null;
}>();
</script>
