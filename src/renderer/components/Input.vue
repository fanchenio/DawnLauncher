<template>
  <input
    :type="type != null ? type : 'text'"
    v-model="v"
    :placeholder="placeholder"
    class="border rounded text-sm py-1 px-2 min-w-0 grow hover:outline-0 focus-visible:outline-0"
    :style="{
      color: $store.state.setting.appearance.theme.fontBasic,
      backgroundColor: $store.state.setting.appearance.theme.mainBackground,
      borderColor: $store.state.setting.appearance.theme.border,
    }"
  />
</template>

<script>
export default {
  name: "Input",
  props: ["value", "placeholder", "type"],
  data() {
    return {
      v: null,
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
      this.$emit("update:value", this.v);
      this.$emit("change");
    },
  },
};
</script>

<style scoped></style>
