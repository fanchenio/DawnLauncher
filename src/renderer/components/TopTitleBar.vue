<template>
  <div
    class="flex items-center"
    :style="{
      color: $store.state.setting.appearance.theme.fontBasic,
      backgroundColor: $store.state.setting.appearance.theme.mainBackground,
      borderRadius: $store.state.setting.appearance.windowRoundedCorners ? '8px' : null,
    }"
  >
    <h1 class="popup-header px-2 w-full text-sm flex items-center h-[34px]">
      {{ title }}
    </h1>
    <Close @click="close" :key="'close-' + $store.state.setting.appearance.theme.name"></Close>
  </div>
</template>

<script>
import Close from "@/components/Close";

export default {
  name: "TopTitleBar",
  components: { Close },
  props: {
    // 标题
    title: {
      type: String,
    },
    // 是否显示
    show: {
      type: Boolean,
    },
  },
  methods: {
    /**
     * 关闭窗口
     */
    close() {
      this.$emit("update:show", false);
    },
  },
};
</script>

<style scoped></style>
