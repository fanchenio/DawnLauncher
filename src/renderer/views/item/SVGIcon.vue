<template>
  <div
    class="text-sm h-full"
    style="text-shadow: none"
    :style="{
      color: $store.state.setting.appearance.theme.fontBasic,
      backgroundColor: $store.state.setting.appearance.theme.mainBackground,
      borderRadius: $store.state.setting.appearance.backgroundTransparency < 1 && $store.state.setting.appearance.windowRoundedCorners ? '8px' : null,
    }"
  >
    <TopTitleBar :title="$store.state.currentLanguage.svgCodeIcon" v-model:show="s"></TopTitleBar>
    <div class="px-2">
      <div>
        <div class="flex items-center">
          <div
            v-if="strIsEmpty(svgHtml)"
            class="w-[40px] h-[40px] min-w-[40px] min-h-[40px] border rounded flex items-center justify-center"
            :style="{ borderColor: $store.state.setting.appearance.theme.border }"
          ></div>
          <div v-else class="w-[40px] h-[40px] min-w-[40px] min-h-[40px]" v-html="sanitize(svgHtml)"></div>
          <span class="block text-xs ml-2">{{ $store.state.currentLanguage.svgCodeIconValidationNote }}</span>
        </div>
        <textarea
          rows="3"
          class="mt-2 block w-full resize-none border rounded text-sm py-1 px-2 hover:outline-0 focus-visible:outline-0"
          :style="{
            color: $store.state.setting.appearance.theme.fontBasic,
            backgroundColor: $store.state.setting.appearance.theme.mainBackground,
            borderColor: $store.state.setting.appearance.theme.border,
          }"
          :placeholder="$store.state.currentLanguage.svgCodeIconPlaceholder"
          v-model="svg"
        ></textarea>
        <Button text="校验" class="w-20 mt-2" type="primary" @click="check"></Button>
      </div>
    </div>
    <div class="flex items-center absolute right-2 bottom-[6px]">
      <Button :text="$store.state.currentLanguage.ok" class="w-20 mr-1" type="primary" @click="set"></Button>
      <Button :text="$store.state.currentLanguage.cancel" class="w-20" type="cancel" @click="close"></Button>
    </div>
  </div>
</template>

<script>
import CommonJS from "@/common";
import TopTitleBar from "@/components/TopTitleBar";
import Input from "@/components/Input";
import Button from "@/components/Button";
const { ipcRenderer } = window.require("electron");

export default {
  name: "SVGIcon",
  components: { Input, Button, TopTitleBar },
  props: {
    // 是否显示
    show: {
      type: Boolean,
    },
  },
  data() {
    return {
      s: null,
      // svg
      svg: null,
      // svg
      svgHtml: null,
    };
  },
  watch: {
    s: function (newData) {
      this.$emit("update:show", newData);
    },
  },
  created() {
    this.s = this.show;
  },
  methods: {
    /**
     * 判断字符串是否为空
     */
    strIsEmpty: CommonJS.strIsEmpty,
    /**
     * 过滤XSS
     */
    sanitize: CommonJS.DOMPurify.sanitize,
    /**
     * 关闭
     */
    close() {
      this.$emit("update:show", false);
    },
    /**
     * 校验
     */
    check() {
      if (!this.strIsEmpty(this.svg)) {
        let svg = this.sanitize(this.svg);
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, "image/svg+xml");
        const svgElements = doc.getElementsByTagName("svg");
        if (svgElements.length == 1) {
          const serializer = new XMLSerializer();
          let svgElement = svgElements[0];
          svgElement.removeAttribute("class");
          svgElement.removeAttribute("style");
          svgElement.setAttribute("width", "100%");
          svgElement.setAttribute("height", "100%");
          this.svgHtml = serializer.serializeToString(svgElement);
          this.svg = this.svgHtml;
          return;
        }
      }
      this.svgHtml = null;
      this.svg = null;
    },
    /**
     * 设置图标
     */
    set() {
      this.$emit("set", this.svgHtml);
      this.close();
    },
  },
};
</script>

<style scoped></style>
