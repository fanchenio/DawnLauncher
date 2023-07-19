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
    <TopTitleBar :title="title()" v-model:show="s"></TopTitleBar>
    <div class="pt-2 px-2">
      <div class="flex items-center justify-center">
        <span class="text-sm">{{ $store.state.currentLanguage.name }}<span v-html="$getColon()"></span></span>
        <Input id="nameInput" class="flex-1" v-model:value="name"></Input>
      </div>
      <div class="flex items-center justify-center flex-wrap mt-3 relative">
        <span class="text-sm">{{ $store.state.currentLanguage.shortcutKey }}<span v-html="$getColon()"></span></span>
        <Input
          id="shortcutKeyInput"
          v-model:value="shortcutKey"
          class="flex-1"
          @keydown="tempShortcutKey = shortcutKey = setShortcutKey($event, shortcutKey, true)"
          @keyup="checkShortcutKeys($event)"
        ></Input>
      </div>
      <div class="flex items-center">
        <check-box v-model:value="globalShortcutKey" :label="$store.state.currentLanguage.globalShortcutKey" class="mt-2 ml-auto" />
      </div>
    </div>
    <div class="absolute right-2 bottom-[6px] flex items-center">
      <Button
        :text="$store.state.currentLanguage.ok"
        class="w-20 mr-1"
        :class="!strIsEmpty(name) && shortcutKeyCheckMessage == null ? '' : 'cursor-not-allowed'"
        @click="addEdit"
        type="primary"
      ></Button>
      <Button :text="$store.state.currentLanguage.cancel" class="w-20" type="cancel" @click="close"></Button>
    </div>
  </div>
</template>

<script>
import TopTitleBar from "@/components/TopTitleBar";
import ClassificationJS from "@/views/classification/js/index.js";
import CommonJS from "@/common/index";
import Button from "@/components/Button";
import Input from "@/components/Input";
import CheckBox from "@/components/CheckBox";
const { ipcRenderer } = window.require("electron");

export default {
  name: "ClassificationAddEdit",
  components: { Input, Button, TopTitleBar, CheckBox },
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
      // 名称
      name: null,
      // 旧名称
      oldName: null,
      // 快捷键
      shortcutKey: null,
      oldShortcutKey: null,
      tempShortcutKey: null,
      // 全局快捷键
      globalShortcutKey: false,
      // 快捷键校验内容
      shortcutKeyCheckMessage: null,
    };
  },
  watch: {
    s: function (newData) {
      this.$emit("update:show", newData);
    },
  },
  created() {
    this.s = this.show;
    this.name = "新分类";
    // 如果类型是1，编辑的话，获取相应名称
    if (this.type == 1) {
      let classification = ClassificationJS.getClassificationById(this.parentId != null ? this.parentId : this.id, this.parentId != null ? this.id : null);
      this.name = classification.name;
      this.shortcutKey = this.oldShortcutKey = classification.shortcutKey;
      this.globalShortcutKey = classification.globalShortcutKey == null ? false : classification.globalShortcutKey;
    }
    this.$watch("shortcutKey", () => {
      if (this.tempShortcutKey != this.shortcutKey) {
        this.shortcutKey = this.tempShortcutKey;
      }
    });
  },
  mounted() {
    this.$nextTick(() => {
      // 输入框默认获取焦点
      document.getElementById("nameInput").focus();
    });
    // 监听键盘
    window.addEventListener("keydown", this.keydown, true);
  },
  unmounted() {
    window.removeEventListener("keydown", this.keydown, true);
  },
  methods: {
    /**
     * 判断字符串是否为空
     */
    strIsEmpty: CommonJS.strIsEmpty,
    /**
     * 标题
     */
    title() {
      if (this.type == 0) {
        if (this.parentId != null) {
          return this.$store.state.currentLanguage.newSubClassification;
        } else {
          return this.$store.state.currentLanguage.newClassification;
        }
      } else {
        if (this.parentId != null) {
          return this.$store.state.currentLanguage.editClassification;
        } else {
          return this.$store.state.currentLanguage.editSubClassification;
        }
      }
    },
    /**
     * 设置快捷键
     */
    setShortcutKey: CommonJS.setShortcutKey,
    /**
     * 校验快捷键
     */
    checkShortcutKeys() {
      this.shortcutKeyCheckMessage = null;
      if (!this.strIsEmpty(this.shortcutKey)) {
        if (!CommonJS.checkShortcutKeys(this.shortcutKey.trim())) {
          this.shortcutKeyCheckMessage = this.$store.state.currentLanguage.shortcutKeyIncompleteMessage;
        } else {
          if (this.oldShortcutKey == null || this.oldShortcutKey.trim() != this.shortcutKey.trim()) {
            // 校验应用程序内快捷是否重复
            this.shortcutKeyCheckMessage = CommonJS.checkAppShortcutKeysDuplicate(this.shortcutKey.trim(), this.$store.state.appShortcutKeyMap);
            if (this.shortcutKeyCheckMessage == null) {
              // 校验设置中的快捷键是否重复
              this.shortcutKeyCheckMessage = CommonJS.checkSettingShortcutKeysDuplicate(this.shortcutKey.trim(), this.$store.state.setting, null);
            }
          }
        }
      }
      if (this.shortcutKeyCheckMessage != null) {
        ipcRenderer.send("errorMessage", this.shortcutKeyCheckMessage);
        this.shortcutKey = null;
        this.tempShortcutKey = null;
        this.shortcutKeyCheckMessage = null;
      }
    },
    /**
     * 添加修改
     */
    addEdit() {
      if (this.type == 0) {
        this.add();
      } else {
        this.edit();
      }
    },
    /**
     * 添加
     */
    add() {
      if (!this.strIsEmpty(this.name)) {
        // 校验快捷键
        this.checkShortcutKeys();
        if (this.shortcutKeyCheckMessage == null) {
          this.$emit("update:show", false);
          this.$emit("add", this.name, this.shortcutKey, this.globalShortcutKey, this.parentId);
        }
      }
    },
    /**
     * 编辑
     */
    edit() {
      if (!this.strIsEmpty(this.name)) {
        // 校验快捷键
        this.checkShortcutKeys();
        if (this.shortcutKeyCheckMessage == null) {
          this.$emit("update:show", false);
          this.$emit("edit", this.id, this.name, this.shortcutKey, this.globalShortcutKey, this.parentId);
        }
      }
    },
    /**
     * 关闭
     */
    close() {
      this.$emit("update:show", false);
    },
    /**
     * 监听键盘
     * @param e
     */
    keydown(e) {
      if (e.keyCode == 13) {
        if (!(document.activeElement.id != null && document.activeElement.id == "shortcutKeyInput")) {
          this.addEdit();
          e.preventDefault();
        }
      }
    },
  },
};
</script>

<style scoped></style>
