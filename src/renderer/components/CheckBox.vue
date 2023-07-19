<template>
  <div class="flex items-center">
    <label
      class="w-[16px] h-[16px] text-[12px] border flex items-center justify-center"
      :style="{
        backgroundColor: v ? $store.state.setting.appearance.theme.minorBackground : $store.state.setting.appearance.theme.mainBackground,
        borderColor: $store.state.setting.appearance.theme.border,
        color: v ? $store.state.setting.appearance.theme.fontHover : $store.state.setting.appearance.theme.fontBasic,
      }"
      @click="v = !v"
      >{{ v ? "✓" : "" }}</label
    >
    <span class="pl-2" :class="size == 'small' ? 'text-xs' : 'text-sm'" @click="v = !v">{{ label }}</span>
  </div>
</template>

<script>
export default {
  name: "CheckBox",
  props: {
    value: {
      type: Boolean,
    },
    label: {
      type: String,
    },
    size: {
      type: String,
    },
  },
  data() {
    return {
      v: null,
      init: true,
    };
  },
  created() {
    this.v = this.value;
  },
  watch: {
    value: function () {
      this.v = this.value;
    },
    v: function () {
      if (!this.init) {
        this.$emit("update:value", this.v);
        this.$emit("change");
      } else {
        this.init = false;
      }
    },
  },
};
</script>

<style scoped></style>
