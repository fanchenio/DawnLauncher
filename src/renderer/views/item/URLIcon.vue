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
    <TopTitleBar :title="$store.state.currentLanguage.networkIcon" v-model:show="s"></TopTitleBar>
    <div class="px-2">
      <div>
        <div class="flex items-center">
          <div
            v-if="icon == null"
            class="w-[40px] h-[40px] min-w-[40px] min-h-[40px] border rounded flex items-center justify-center"
            :style="{ borderColor: $store.state.setting.appearance.theme.border }"
          ></div>
          <img v-else :src="icon" class="w-[40px] h-[40px]" />
          <span class="block text-xs ml-2">{{ $store.state.currentLanguage.networkIconNote }}</span>
        </div>
        <textarea
          rows="3"
          class="mt-2 block w-full resize-none border rounded text-sm py-1 px-2 hover:outline-0 focus-visible:outline-0"
          :style="{
            color: $store.state.setting.appearance.theme.fontBasic,
            backgroundColor: $store.state.setting.appearance.theme.mainBackground,
            borderColor: $store.state.setting.appearance.theme.border,
          }"
          :placeholder="$store.state.currentLanguage.networkIconPlaceholder"
          v-model="url"
        ></textarea>
        <div class="flex mt-2 items-center">
          <Button :text="$store.state.currentLanguage.getIcon" class="w-20" type="primary" @click="downloadImage"></Button>
          <span class="ml-auto" v-if="urlGetting">{{ urlGettingMessage }}</span>
          <span class="ml-auto" v-if="urlError">{{ urlErrorMessage }}</span>
        </div>
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
  name: "URLIcon",
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
      // url
      url: null,
      // 图标
      icon: null,
      // 获取图片中
      urlGetting: false,
      urlGettingMessage: null,
      urlGettingInterval: null,
      // 获取图片信息失败
      urlError: false,
      urlErrorMessage: null,
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
  mounted() {
    // 获取下载图片
    ipcRenderer.on("returnDownloadImage", (event, args) => {
      this.urlGetting = false;
      let result = JSON.parse(args);
      if (result.status) {
        this.icon = result.icon;
      } else {
        this.icon = null;
        this.urlError = true;
        this.urlErrorMessage = result.message;
      }
      clearInterval(this.urlGettingInterval);
      this.urlGettingMessage = null;
    });
  },
  unmounted() {
    clearInterval(this.urlGettingInterval);
  },
  methods: {
    /**
     * 判断字符串是否为空
     */
    strIsEmpty: CommonJS.strIsEmpty,
    /**
     * 关闭
     */
    close() {
      this.$emit("update:show", false);
    },
    /**
     * 下载图标
     */
    downloadImage() {
      if (!this.strIsEmpty(this.url)) {
        this.urlGetting = true;
        this.urlError = false;
        this.urlErrorMessage = null;
        ipcRenderer.send("downloadImage", this.url);
        let _this = this;
        this.urlGettingMessage = this.$store.state.currentLanguage.gettingUrlInfo + "...";
        this.urlGettingInterval = setInterval(() => {
          let split = _this.urlGettingMessage.split(".");
          if (split.length < 4) {
            _this.urlGettingMessage += ".";
          } else {
            _this.urlGettingMessage = _this.$store.state.currentLanguage.gettingUrlInfo + ".";
          }
        }, 500);
      }
    },
    /**
     * 设置图标
     */
    set() {
      this.$emit("set", this.icon);
      this.close();
    },
  },
};
</script>

<style scoped></style>
