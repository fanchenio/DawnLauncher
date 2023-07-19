<template>
  <div class="relative">
    <div
      class="color-content border rounded w-[60px] h-[30px] p-1"
      :style="{
        borderColor: $store.state.setting.appearance.theme.border,
      }"
      @click="show = !show"
      :id="id + '-content'"
    >
      <div class="color-component rounded w-full h-full" :style="{ backgroundColor: typeof c == 'string' ? c : c.hex8 }"></div>
    </div>
    <Chrome :id="id + '-component'" v-model="c" class="color-component absolute" v-if="show"></Chrome>
  </div>
</template>

<script>
import { Chrome } from "@ckpack/vue-color";

export default {
  name: "Color",
  props: {
    id: {
      type: String,
    },
    value: {
      type: String,
    },
  },
  components: {
    Chrome,
  },
  data() {
    return {
      c: null,
      show: false,
    };
  },
  created() {
    if (this.value == null) {
      this.c = "#FFFFFF";
    } else {
      this.c = this.value;
    }
  },
  watch: {
    value: function () {
      this.c = this.value;
    },
    show: function () {
      if (this.show) {
        document.addEventListener("mousedown", this.mousedown, true);
        this.$nextTick(() => {
          // 定位
          let componentEl = document.getElementById(this.id + "-component");
          componentEl.style.top = -121 + "px";
          componentEl.style.left = 62 + "px";
          componentEl.style.zIndex = 9;
          // 修改图标颜色
          let divEl = componentEl.getElementsByClassName("vc-chrome-toggle-icon");
          let svgEl = divEl[0].getElementsByTagName("svg");
          let pathEl = svgEl[0].getElementsByTagName("path");
          pathEl[0].setAttribute("fill", this.$store.state.setting.appearance.theme.fontBasic);
        });
      } else {
        document.removeEventListener("mousedown", this.mousedown, true);
        this.$emit("update:value", typeof this.c == "string" ? this.c : this.c.hex8);
        this.$emit("change");
      }
    },
  },
  methods: {
    mousedown(e) {
      // 颜色插件
      let colorFlag = false;
      for (let i = 0; i < e.path.length; i++) {
        if (e.path[i].id == null) {
          continue;
        }
        if (e.path[i].id == this.id + "-content" || e.path[i].id == this.id + "-component") {
          colorFlag = true;
          break;
        }
      }
      if (!colorFlag) {
        this.show = false;
      }
    },
  },
};
</script>

<style scoped></style>
