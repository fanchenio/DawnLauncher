<template>
  <span
    class="flex items-center justify-center h-[28px] text-sm rounded button"
    :style="{
      backgroundColor: type == 'primary' ? $store.state.setting.appearance.theme.minorBackground : null,
      color: type == 'primary' ? $store.state.setting.appearance.theme.fontHover : $store.state.setting.appearance.theme.fontBasic,
      borderColor: type == 'cancel' ? $store.state.setting.appearance.theme.border : null,
    }"
    :class="[`${type == 'cancel' ? 'border' : ''}`]"
    @mouseover="
      $styleMouseover($event, 'button', type == 'primary' ? ['background-color'] : [], [$hexToRGBA($store.state.setting.appearance.theme.minorBackground, 0.8)])
    "
    @mouseout="$styleMouseout($event, 'button', ['background-color'], type == 'primary' ? [$store.state.setting.appearance.theme.minorBackground] : [])"
    :title="text"
  >
    <svg v-if="icon != null && icon == 'folder'" class="w-[18px] h-[18px]" viewBox="0 0 24 24">
      <path fill="currentColor" d="M9.17 6l2 2H20v10H4V6h5.17M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
    </svg>
    <svg v-if="icon != null && icon == 'delete'" class="w-[18px] h-[18px]" viewBox="0 0 24 24">
      <path fill="currentColor" d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" />
    </svg>
    <svg v-if="icon != null && icon == 'upload'" class="w-[18px] h-[18px]" viewBox="0 0 24 24">
      <g><rect fill="none" height="18" width="18" /></g>
      <g>
        <path fill="currentColor" d="M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M7,9l1.41,1.41L11,7.83V16h2V7.83l2.59,2.58L17,9l-5-5L7,9z" />
      </g>
    </svg>
    <svg v-if="icon != null && icon == 'link'" class="w-[18px] h-[18px]" viewBox="0 0 24 24">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path
        fill="currentColor"
        d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm-3-4h8v2H8z"
      />
    </svg>
    <svg v-if="icon != null && icon == 'code'" class="w-[18px] h-[18px]" viewBox="0 0 24 24">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path fill="currentColor" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
    </svg>
    <svg v-if="icon != null && icon == 'reset'" class="w-[18px] h-[18px]" viewBox="0 0 24 24">
      <g><path d="M0,0h24v24H0V0z" fill="none" /></g>
      <g>
        <g>
          <path
            fill="currentColor"
            d="M6,13c0-1.65,0.67-3.15,1.76-4.24L6.34,7.34C4.9,8.79,4,10.79,4,13c0,4.08,3.05,7.44,7,7.93v-2.02 C8.17,18.43,6,15.97,6,13z M20,13c0-4.42-3.58-8-8-8c-0.06,0-0.12,0.01-0.18,0.01l1.09-1.09L11.5,2.5L8,6l3.5,3.5l1.41-1.41 l-1.08-1.08C11.89,7.01,11.95,7,12,7c3.31,0,6,2.69,6,6c0,2.97-2.17,5.43-5,5.91v2.02C16.95,20.44,20,17.08,20,13z"
          />
        </g>
      </g>
    </svg>
    <span v-else-if="icon == null">{{ text }}</span>
  </span>
</template>

<script>
export default {
  name: "Button",
  props: {
    text: {
      type: String,
    },
    type: {
      type: String,
    },
    icon: {
      type: String,
    },
  },
};
</script>

<style scoped></style>
