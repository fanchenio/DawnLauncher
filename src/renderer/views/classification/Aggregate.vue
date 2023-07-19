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
    <TopTitleBar :title="$store.state.currentLanguage.aggregateClassification" v-model:show="s"></TopTitleBar>
    <div class="px-2">
      <span class="block text-xs">{{ $store.state.currentLanguage.aggregateClassificationNote }}</span>
      <div class="flex items-center mt-2">
        <span class="text-sm h-[34px] block flex items-center">{{ $store.state.currentLanguage.sort }}<span v-html="$getColon()"></span></span>
        <Select id="sortSelect" :list="sortList" v-model:value="sort" :width="180" :key="sort"></Select>
      </div>
      <span class="block text-xs mt-2">{{ $store.state.currentLanguage.aggregateClassificationSortNote }}</span>
      <div class="flex items-center justify-center mt-2">
        <span class="text-sm h-[34px] block flex items-center">{{ $store.state.currentLanguage.itemNumber }}<span v-html="$getColon()"></span></span>
        <Input class="flex-1" v-model:value="itemNumber" @blur="setOpenNumber" type="number" />
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
import Select from "@/components/Select";
const { ipcRenderer } = window.require("electron");
export default {
  name: "Aggregate",
  components: { Input, Button, Select, TopTitleBar },
  props: {
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
      // 临时变量
      s: null,
      // 排序列表
      sortList: null,
      // 默认排序
      sort: "initial",
      // 项目数
      itemNumber: 50,
      // 是否为聚合分类
      aggregate: false,
    };
  },
  watch: {
    s: function (newData) {
      this.$emit("update:show", newData);
    },
    "$store.state.setting.general.language": {
      handler() {
        this.setSelectList();
      },
    },
  },
  created() {
    this.s = this.show;
    let classification = ClassificationJS.getClassificationById(this.parentId != null ? this.parentId : this.id, this.parentId != null ? this.id : null);
    if (classification.type != null && classification.type == 1) {
      this.aggregate = true;
      if (classification.aggregateSort != null) {
        this.sort = classification.aggregateSort;
      }
      if (classification.aggregateItemNumber != null) {
        this.itemNumber = classification.aggregateItemNumber;
      }
    }
    this.setSelectList();
  },
  mounted() {
    this.setSelectList();
  },
  methods: {
    setSelectList() {
      this.sortList = [
        {
          value: "initial",
          label: this.$store.state.currentLanguage.byInitial,
        },
        {
          value: "openNumber",
          label: this.$store.state.currentLanguage.byOpenNumber,
        },
        {
          value: "lastOpen",
          label: this.$store.state.currentLanguage.byLastOpen,
        },
      ];
    },
    /**
     * 关闭
     */
    close() {
      this.$emit("update:show", false);
    },
    /**
     * 修改
     */
    edit() {
      let flag = false;
      if (this.aggregate) {
        flag = true;
      } else {
        flag = ipcRenderer.sendSync("showMessageBoxSync", this.$store.state.currentLanguage.aggregateClassificationMessage);
      }
      if (flag) {
        this.$emit("update:show", false);
        this.$emit("set", this.id, this.parentId, this.sort, this.itemNumber);
      }
    },
    /**
     * 设置项目数量
     */
    setOpenNumber() {
      if (this.itemNumber == null || typeof this.itemNumber == "string") {
        this.itemNumber = 0;
      }
    },
  },
};
</script>

<style scoped></style>
