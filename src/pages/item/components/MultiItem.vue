<template>
  <div class="mt-2">
    <span class="block">{{ store.language.itemList }}</span>
    <NSelect
      class="mt-1.5"
      multiple
      :options="options"
      :render-label="renderLabel"
      :render-tag="renderMultipleSelectTag"
      :filterable="true"
      :filter="filter"
      v-model:value="selectedItemIdList"
      @update:value="update"
      :placeholder="store.language.selectItem"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, watch, h } from "vue";
import {
  NSelect,
  NTag,
  SelectRenderTag,
  SelectRenderLabel,
  SelectOption,
  SelectGroupOption,
} from "naive-ui";
import { convert } from "../../../../commons/utils/common";
import CustomItemIcon from "../../../components/CustomItemIcon.vue";
import { convertItemList, getItemById, hasChinese } from "../js/index";
import { match } from "pinyin-pro";
import {
  convertClassificationList,
  getClassificationById,
} from "../../classification/js";
import { useMainStore } from "../../../store";
// pinia
const store = useMainStore();
// props
const props = defineProps<{
  multiItemIdList: Array<number>;
}>();
// 查询分类
store.classificationList = convertClassificationList(
  window.classification.list()
);
// 查询项目
store.itemMap = convertItemList(convert(window.item.list()));
// 菜单项
let options = ref<Array<SelectOption | SelectGroupOption>>([]);
for (const [key, value] of store.itemMap.entries()) {
  let classification = getClassificationById(key);
  if (classification && classification.name) {
    let group: SelectGroupOption = {
      type: "group",
      label: classification.name,
      key: classification.name,
    };
    let children: Array<SelectOption> = [];
    for (const item of value) {
      if (item.name) {
        children.push({
          label: item.name,
          value: item.id,
        });
      }
    }
    group.children = children;
    options.value.push(group);
  }
}

const renderMultipleSelectTag: SelectRenderTag = ({ option, handleClose }) => {
  let item = getItemById(parseInt(option.value as string));
  return h(
    NTag,
    {
      style: {
        padding: "0 6px 0 4px",
      },
      closable: true,
      onClose: (e) => {
        e.stopPropagation();
        handleClose();
      },
    },
    {
      default: () =>
        h(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
            },
          },
          [
            h(CustomItemIcon, {
              item: item,
              iconSize: 20,
            }),
            h(
              "div",
              {
                style: {
                  marginLeft: "4px",
                },
              },
              [h("div", null, [option.label as string])]
            ),
          ]
        ),
    }
  );
};
const renderLabel: SelectRenderLabel = (option) => {
  let item = getItemById(parseInt(option.value as string));
  return h(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
      },
    },
    [
      h(CustomItemIcon, {
        item: item,
        iconSize: 20,
      }),
      h(
        "div",
        {
          style: {
            marginLeft: "8px",
          },
        },
        [h("div", null, [option.label as string])]
      ),
    ]
  );
};
// 过滤
function filter(pattern: string, option: any) {
  // 查询项目
  let item = getItemById(parseInt(option.value as string));
  if (item && item.name) {
    // 转换为小写
    pattern = pattern.toLowerCase();
    // 名称
    let name = item.name.toLowerCase();
    if (hasChinese(name)) {
      // 包含中文
      let res: Array<any> = match(name, pattern, {
        continuous: true,
        space: "preserve",
      });
      if (res && res.length > 0) {
        return true;
      }
    } else {
      // 其他情况
      return name.indexOf(pattern) >= 0;
    }
  }
  return false;
}
// 更新
function update(value: Array<number>) {
  $emit("update", value);
}
// 选中项目
let selectedItemIdList = ref<Array<number>>([]);
// 设置选中项目
setSelectedItemIdList(props.multiItemIdList);
function setSelectedItemIdList(list: Array<number>) {
  selectedItemIdList.value = list;
}
// 监听
watch(
  () => props.multiItemIdList,
  (newValue: Array<number>) => {
    setSelectedItemIdList(newValue);
  }
);
// emit
const $emit = defineEmits(["update"]);
</script>
