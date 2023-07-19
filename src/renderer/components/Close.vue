<template>
  <div
    class="p-2 app-region-no-drag icon-menu"
    :title="$store.state.currentLanguage.close"
    :style="{ color: this.page == 'main' ? $backgroundTransparencyFontColor($store.state.setting, 1) : $store.state.setting.appearance.theme.fontBasic }"
    @mouseover="
      $styleMouseover(
        $event,
        'icon-menu',
        ['color'],
        [this.page == 'main' ? $backgroundTransparencyFontColor($store.state.setting, 0.8) : $hexToRGBA($store.state.setting.appearance.theme.fontBasic, 0.8)]
      )
    "
    @mouseout="$styleMouseout($event, 'icon-menu', ['color'])"
  >
    <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24">
      <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
    </svg>
  </div>
</template>

<script>
export default {
  name: "Close",
  props: {
    page: {
      type: String,
    },
  },
};
</script>

<style scoped></style>
