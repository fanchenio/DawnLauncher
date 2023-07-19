<template>
  <div
    class="h-full"
    style="text-shadow: none"
    :style="{
      color: $store.state.setting.appearance.theme.fontBasic,
      backgroundColor: $store.state.setting.appearance.theme.mainBackground,
      borderRadius: $store.state.setting.appearance.backgroundTransparency < 1 && $store.state.setting.appearance.windowRoundedCorners ? '8px' : null,
    }"
  >
    <TopTitleBar :title="$store.state.currentLanguage.associatedFolder" v-model:show="s"></TopTitleBar>
    <div class="px-2">
      <div>
        <textarea
          rows="2"
          class="w-full resize-none border rounded text-sm py-1 px-2 hover:outline-0 focus-visible:outline-0"
          :style="{
            color: $store.state.setting.appearance.theme.fontBasic,
            backgroundColor: $store.state.setting.appearance.theme.mainBackground,
            borderColor: $store.state.setting.appearance.theme.border,
          }"
          v-model="mapDirectory"
        ></textarea>
      </div>
      <div class="flex items-center">
        <Button
          :text="$store.state.currentLanguage.browse"
          class="w-[30px] h-[30px] mr-1 cursor-pointer"
          type="cancel"
          icon="folder"
          @click="chooseDir"
        ></Button>
        <Button
          :text="$store.state.currentLanguage.delete"
          class="w-[30px] h-[30px] cursor-pointer"
          type="cancel"
          icon="delete"
          @click="mapDirectory = null"
        ></Button>
      </div>
      <div>
        <span class="text-sm h-[34px] block flex items-center">{{ $store.state.currentLanguage.hiddenItem }}</span>
        <textarea
          rows="2"
          class="block w-full resize-none border rounded text-sm py-1 px-2 hover:outline-0 focus-visible:outline-0"
          :style="{
            color: $store.state.setting.appearance.theme.fontBasic,
            backgroundColor: $store.state.setting.appearance.theme.mainBackground,
            borderColor: $store.state.setting.appearance.theme.border,
          }"
          v-model="hiddenItem"
        ></textarea>
        <span class="block text-xs mt-2">{{ $store.state.currentLanguage.hiddenItemNote }}</span>
      </div>
    </div>
    <div class="flex items-center absolute right-2 bottom-[6px]">
      <Button :text="$store.state.currentLanguage.ok" class="w-20 mr-1" @click="edit" type="primary"></Button>
      <Button :text="$store.state.currentLanguage.cancel" class="w-20" type="cancel" @click="close"></Button>
    </div>
  </div>
</template>

<script>
import TopTitleBar from "@/components/TopTitleBar";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ClassificationJS from "@/views/classification/js";
import CommonJS from "@/common/index";
const { ipcRenderer } = window.require("electron");

export default {
  name: "ClassificationAssociatedFolder",
  components: { Input, Button, TopTitleBar },
  props: {
    // 0:添加 1:编辑
    type: {
      type: Number,
    },
    // id
    id: {
      type: Number,
    },
    // 父级分类ID
    parentId: {
      type: Number,
    },
    // 是否显示
    show: {
      type: Boolean,
    },
  },
  data() {
    return {
      s: null,
      // 映射文件夹
      mapDirectory: null,
      // 隐藏项
      hiddenItem: null,
      // 是否为关联文件夹
      associatedFolder: false,
    };
  },
  watch: {
    s: function (newData) {
      this.$emit("update:show", newData);
    },
  },
  created() {
    this.s = this.show;
    let classification = ClassificationJS.getClassificationById(this.parentId != null ? this.parentId : this.id, this.parentId != null ? this.id : null);
    this.mapDirectory = classification.mapDirectory;
    if (!CommonJS.strIsEmpty(this.mapDirectory)) {
      this.associatedFolder = true;
    }
    this.hiddenItem = classification.hiddenItem;
  },
  methods: {
    /**
     * 修改
     */
    edit() {
      if (this.mapDirectory != null && (this.mapDirectory == "" || this.mapDirectory.trim() == "")) {
        this.mapDirectory = null;
      }
      let flag = false;
      if (this.associatedFolder) {
        flag = true;
      } else {
        if (!CommonJS.strIsEmpty(this.mapDirectory)) {
          flag = ipcRenderer.sendSync("showMessageBoxSync", this.$store.state.currentLanguage.associatedFolderMessage);
        } else {
          flag = true;
        }
      }
      if (flag) {
        this.$emit("update:show", false);
        this.$emit("set", this.id, this.parentId, this.mapDirectory, this.hiddenItem);
      }
    },
    /**
     * 关闭
     */
    close() {
      this.$emit("update:show", false);
    },
    /**
     * 选择文件夹
     */
    chooseDir() {
      let filePath = ipcRenderer.sendSync(
        "openDirectory",
        JSON.stringify({
          window: "mainWindow",
          defaultPath: this.mapDirectory,
        })
      );
      if (!CommonJS.strIsEmpty(filePath)) {
        this.mapDirectory = filePath;
      }
    },
  },
};
</script>

<style scoped></style>
