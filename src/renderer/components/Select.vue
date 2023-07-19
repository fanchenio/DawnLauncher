<template>
  <div class="text-sm">
    <div
      class="border rounded"
      :style="{
        color: $store.state.setting.appearance.theme.fontBasic,
        backgroundColor: $store.state.setting.appearance.theme.mainBackground,
        borderColor: $store.state.setting.appearance.theme.border,
        width: width + 'px',
      }"
      :id="id"
    >
      <div class="flex items-center py-1" @click="showList = !showList">
        <span class="ml-[10px]">{{ label }}</span>
        <svg class="w-4 h-4 ml-auto mr-[6px]" viewBox="0 0 24 24">
          <path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
        </svg>
      </div>
    </div>
    <ul
      class="border rounded mt-[1px] py-1 absolute max-h-[262px]"
      :style="{
        color: $store.state.setting.appearance.theme.fontBasic,
        backgroundColor: $store.state.setting.appearance.theme.mainBackground,
        borderColor: $store.state.setting.appearance.theme.border,
        width: width + 'px',
      }"
      v-if="showList"
    >
      <div class="max-h-[262px]" data-simplebar>
        <li
          class="py-1 px-[10px] select-item"
          v-for="(item, index) of list"
          @click="select(item)"
          :key="'select_item_' + index"
          @mouseover="
            $styleMouseover(
              $event,
              'select-item',
              ['background-color', 'color'],
              [$hexToRGBA($store.state.setting.appearance.theme.minorBackground, 1), $store.state.setting.appearance.theme.fontHover]
            )
          "
          @mouseout="$styleMouseout($event, 'select-item', ['background-color', 'color'])"
        >
          {{ item.label }}
        </li>
      </div>
    </ul>
  </div>
</template>

<script>
import SimpleBar from "simplebar";
import "simplebar/dist/simplebar.css";

export default {
  name: "Select",
  props: {
    id: {
      required: true,
      type: String,
    },
    value: {
      required: true,
    },
    list: {
      type: Array,
    },
    width: {
      type: Number,
    },
  },
  data() {
    return {
      v: null,
      label: null,
      showList: false,
      init: true,
    };
  },
  created() {
    if (this.value != null) {
      this.v = this.value;
      for (let e of this.list) {
        if (e.value == this.v) {
          this.label = e.label;
        }
      }
    }
  },
  mounted() {
    document.addEventListener("click", this.click, true);
  },
  unmounted() {
    document.removeEventListener("click", this.click, true);
  },
  methods: {
    select(item) {
      this.v = item.value;
      this.label = item.label;
      this.showList = false;
    },
    click(e) {
      let flag = false;
      for (let i = 0; i < e.path.length; i++) {
        if (e.path[i].id != null && e.path[i].id == this.id) {
          flag = true;
          return;
        }
      }
      if (!flag) {
        this.showList = false;
      }
    },
  },
  watch: {
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
