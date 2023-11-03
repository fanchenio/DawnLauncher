<template>
  <div
    class="text-sm h-screen"
    :style="{
      backgroundColor: store.setting.appearance.theme.mainBackgroundColor,
      color: store.setting.appearance.theme.mainFontColor,
    }"
  >
    <div class="flex items-center px-2 app-region-drag">
      <h1 class="w-full text-sm flex items-center h-[34px] app-region-drag">
        {{ store.language.setClassificationIcon }}
      </h1>
      <Icon
        class="close-icon app-region-no-drag"
        size="18"
        @click="close"
        @mouseover="setIconStyle($event, 'close-icon', store.setting)"
        @mouseout="removeIconStyle($event, 'close-icon')"
        :title="store.language.close"
      >
        <CloseRound></CloseRound>
      </Icon>
    </div>
    <div class="text-[20px] w-full content">
      <div
        class="flex pb-[4px] border-b-[1px] px-2"
        style="border-bottom-style: solid"
        :style="{ borderColor: store.setting.appearance.theme.borderColor }"
        @mouseover="mouseover($event, 'icon-classification')"
        @mouseout="mouseout($event, 'icon-classification')"
      >
        <span
          class="icon-classification w-[36px] h-[36px] ml-[2px] flex items-center justify-center rounded leading-4"
          :style="{
            backgroundColor:
              selected === key.toString()
                ? store.setting.appearance.theme.secondBackgroundColor
                : undefined,
          }"
          v-for="(values, key) in emoji"
          :key="key"
          :name="key"
          @click="selected = key.toString()"
        >
          <span
            :title="key.toString()"
            class="w-[36px] h-[36px] flex items-center justify-center"
            >{{ values[0]["value"] }}</span
          >
        </span>
      </div>
      <div id="content" class="max-h-[425px] overflow-x-hidden" :key="selected">
        <ul
          class="flex flex-wrap my-[4px] px-2"
          @mouseover="mouseover($event, 'icon-item')"
          @mouseout="mouseout($event, 'icon-item')"
        >
          <li
            class="icon-item w-[36px] h-[36px] flex items-center justify-center ml-[2px] rounded truncate leading-4"
            v-for="e in emoji[selected]"
            @click="setIcon(e.value)"
          >
            <span
              :title="e.name"
              class="w-[36px] h-[36px] flex items-center justify-center"
              >{{ e.value }}</span
            >
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, onUpdated } from "vue";
import { Icon } from "@vicons/utils";
import { CloseRound } from "@vicons/material";
import SimpleBar from "simplebar";
import "simplebar/dist/simplebar.css";
import {
  getClassElement,
  setStyle,
  removeStyle,
  setIconStyle,
  removeIconStyle,
} from "../../utils/style";
import { useMainStore } from "../../store";
// pinia
const store = useMainStore();
// 获取页面参数
const queryParams = new URLSearchParams(window.location.search);
// 获取ID
let id = parseInt(queryParams.get("id")!);
// 选中
let selected = ref("笑脸和情感");
// emoji
let emoji: any = {
  笑脸和情感: [
    {
      name: "嘿嘿",
      value: "😀",
    },
    {
      name: "哈哈",
      value: "😃",
    },
    {
      name: "大笑",
      value: "😄",
    },
    {
      name: "嘻嘻",
      value: "😁",
    },
    {
      name: "斜眼笑",
      value: "😆",
    },
    {
      name: "苦笑",
      value: "😅",
    },
    {
      name: "笑得满地打滚",
      value: "🤣",
    },
    {
      name: "笑哭了",
      value: "😂",
    },
    {
      name: "呵呵",
      value: "🙂",
    },
    {
      name: "倒脸",
      value: "🙃",
    },
    {
      name: "眨眼",
      value: "😉",
    },
    {
      name: "羞涩微笑",
      value: "😊",
    },
    {
      name: "微笑天使",
      value: "😇",
    },
    {
      name: "喜笑颜开",
      value: "🥰",
    },
    {
      name: "花痴",
      value: "😍",
    },
    {
      name: "好崇拜哦",
      value: "🤩",
    },
    {
      name: "飞吻",
      value: "😘",
    },
    {
      name: "亲亲",
      value: "😗",
    },
    {
      name: "微笑",
      value: "☺",
    },
    {
      name: "羞涩亲亲",
      value: "😚",
    },
    {
      name: "微笑亲亲",
      value: "😙",
    },
    {
      name: "含泪的笑脸",
      value: "🥲",
    },
    {
      name: "好吃",
      value: "😋",
    },
    {
      name: "吐舌",
      value: "😛",
    },
    {
      name: "单眼吐舌",
      value: "😜",
    },
    {
      name: "滑稽",
      value: "🤪",
    },
    {
      name: "眯眼吐舌",
      value: "😝",
    },
    {
      name: "发财",
      value: "🤑",
    },
    {
      name: "抱抱",
      value: "🤗",
    },
    {
      name: "不说",
      value: "🤭",
    },
    {
      name: "安静的脸",
      value: "🤫",
    },
    {
      name: "想一想",
      value: "🤔",
    },
    {
      name: "闭嘴",
      value: "🤐",
    },
    {
      name: "挑眉",
      value: "🤨",
    },
    {
      name: "冷漠",
      value: "😐",
    },
    {
      name: "无语",
      value: "😑",
    },
    {
      name: "沉默",
      value: "😶",
    },
    {
      name: "得意",
      value: "😏",
    },
    {
      name: "不高兴",
      value: "😒",
    },
    {
      name: "翻白眼",
      value: "🙄",
    },
    {
      name: "龇牙咧嘴",
      value: "😬",
    },
    {
      name: "说谎",
      value: "🤥",
    },
    {
      name: "松了口气",
      value: "😌",
    },
    {
      name: "沉思",
      value: "😔",
    },
    {
      name: "困",
      value: "😪",
    },
    {
      name: "流口水",
      value: "🤤",
    },
    {
      name: "睡着了",
      value: "😴",
    },
    {
      name: "感冒",
      value: "😷",
    },
    {
      name: "发烧",
      value: "🤒",
    },
    {
      name: "受伤",
      value: "🤕",
    },
    {
      name: "恶心",
      value: "🤢",
    },
    {
      name: "呕吐",
      value: "🤮",
    },
    {
      name: "打喷嚏",
      value: "🤧",
    },
    {
      name: "脸发烧",
      value: "🥵",
    },
    {
      name: "冷脸",
      value: "🥶",
    },
    {
      name: "头昏眼花",
      value: "🥴",
    },
    {
      name: "晕头转向",
      value: "😵",
    },
    {
      name: "爆炸头",
      value: "🤯",
    },
    {
      name: "牛仔帽脸",
      value: "🤠",
    },
    {
      name: "聚会笑脸",
      value: "🥳",
    },
    {
      name: "伪装的脸",
      value: "🥸",
    },
    {
      name: "墨镜笑脸",
      value: "😎",
    },
    {
      name: "书呆子脸",
      value: "🤓",
    },
    {
      name: "带单片眼镜的脸",
      value: "🧐",
    },
    {
      name: "困扰",
      value: "😕",
    },
    {
      name: "担心",
      value: "😟",
    },
    {
      name: "微微不满",
      value: "🙁",
    },
    {
      name: "不满",
      value: "☹",
    },
    {
      name: "吃惊",
      value: "😮",
    },
    {
      name: "缄默",
      value: "😯",
    },
    {
      name: "震惊",
      value: "😲",
    },
    {
      name: "脸红",
      value: "😳",
    },
    {
      name: "恳求的脸",
      value: "🥺",
    },
    {
      name: "啊",
      value: "😦",
    },
    {
      name: "极度痛苦",
      value: "😧",
    },
    {
      name: "害怕",
      value: "😨",
    },
    {
      name: "冷汗",
      value: "😰",
    },
    {
      name: "失望但如释重负",
      value: "😥",
    },
    {
      name: "哭",
      value: "😢",
    },
    {
      name: "放声大哭",
      value: "😭",
    },
    {
      name: "吓死了",
      value: "😱",
    },
    {
      name: "困惑",
      value: "😖",
    },
    {
      name: "痛苦",
      value: "😣",
    },
    {
      name: "失望",
      value: "😞",
    },
    {
      name: "汗",
      value: "😓",
    },
    {
      name: "累死了",
      value: "😩",
    },
    {
      name: "累",
      value: "😫",
    },
    {
      name: "打呵欠",
      value: "🥱",
    },
    {
      name: "傲慢",
      value: "😤",
    },
    {
      name: "怒火中烧",
      value: "😡",
    },
    {
      name: "生气",
      value: "😠",
    },
    {
      name: "嘴上有符号的脸",
      value: "🤬",
    },
    {
      name: "恶魔微笑",
      value: "😈",
    },
    {
      name: "生气的恶魔",
      value: "👿",
    },
    {
      name: "头骨",
      value: "💀",
    },
    {
      name: "骷髅",
      value: "☠",
    },
    {
      name: "大便",
      value: "💩",
    },
    {
      name: "小丑脸",
      value: "🤡",
    },
    {
      name: "食人魔",
      value: "👹",
    },
    {
      name: "小妖精",
      value: "👺",
    },
    {
      name: "鬼",
      value: "👻",
    },
    {
      name: "外星人",
      value: "👽",
    },
    {
      name: "外星怪物",
      value: "👾",
    },
    {
      name: "机器人",
      value: "🤖",
    },
    {
      name: "大笑的猫",
      value: "😺",
    },
    {
      name: "微笑的猫",
      value: "😸",
    },
    {
      name: "笑出眼泪的猫",
      value: "😹",
    },
    {
      name: "花痴的猫",
      value: "😻",
    },
    {
      name: "奸笑的猫",
      value: "😼",
    },
    {
      name: "亲亲猫",
      value: "😽",
    },
    {
      name: "疲倦的猫",
      value: "🙀",
    },
    {
      name: "哭泣的猫",
      value: "😿",
    },
    {
      name: "生气的猫",
      value: "😾",
    },
    {
      name: "非礼勿视",
      value: "🙈",
    },
    {
      name: "非礼勿听",
      value: "🙉",
    },
    {
      name: "非礼勿言",
      value: "🙊",
    },
    {
      name: "唇印",
      value: "💋",
    },
    {
      name: "情书",
      value: "💌",
    },
    {
      name: "心中箭了",
      value: "💘",
    },
    {
      name: "系有缎带的心",
      value: "💝",
    },
    {
      name: "闪亮的心",
      value: "💖",
    },
    {
      name: "搏动的心",
      value: "💗",
    },
    {
      name: "心跳",
      value: "💓",
    },
    {
      name: "舞动的心",
      value: "💞",
    },
    {
      name: "两颗心",
      value: "💕",
    },
    {
      name: "心型装饰",
      value: "💟",
    },
    {
      name: "心叹号",
      value: "❣",
    },
    {
      name: "心碎",
      value: "💔",
    },
    {
      name: "红心",
      value: "❤",
    },
    {
      name: "橙心",
      value: "🧡",
    },
    {
      name: "黄心",
      value: "💛",
    },
    {
      name: "绿心",
      value: "💚",
    },
    {
      name: "蓝心",
      value: "💙",
    },
    {
      name: "紫心",
      value: "💜",
    },
    {
      name: "棕心",
      value: "🤎",
    },
    {
      name: "黑心",
      value: "🖤",
    },
    {
      name: "白心",
      value: "🤍",
    },
    {
      name: "一百分",
      value: "💯",
    },
    {
      name: "怒",
      value: "💢",
    },
    {
      name: "爆炸",
      value: "💥",
    },
    {
      name: "头晕",
      value: "💫",
    },
    {
      name: "汗滴",
      value: "💦",
    },
    {
      name: "尾气",
      value: "💨",
    },
    {
      name: "洞",
      value: "🕳",
    },
    {
      name: "话语气泡",
      value: "💬",
    },
    {
      name: "讲话泡泡中的眼睛",
      value: "👁️‍🗨️",
    },
    {
      name: "朝左的话语气泡",
      value: "🗨",
    },
    {
      name: "愤怒话语气泡",
      value: "🗯",
    },
    {
      name: "内心活动气泡",
      value: "💭",
    },
    {
      name: "睡着",
      value: "💤",
    },
  ],
  人类和身体: [
    {
      name: "挥手",
      value: "👋",
    },
    {
      name: "挥手: 较浅肤色",
      value: "👋🏻",
    },
    {
      name: "挥手: 中等-浅肤色",
      value: "👋🏼",
    },
    {
      name: "挥手: 中等肤色",
      value: "👋🏽",
    },
    {
      name: "挥手: 中等-深肤色",
      value: "👋🏾",
    },
    {
      name: "挥手: 较深肤色",
      value: "👋🏿",
    },
    {
      name: "立起的手背",
      value: "🤚",
    },
    {
      name: "立起的手背: 较浅肤色",
      value: "🤚🏻",
    },
    {
      name: "立起的手背: 中等-浅肤色",
      value: "🤚🏼",
    },
    {
      name: "立起的手背: 中等肤色",
      value: "🤚🏽",
    },
    {
      name: "立起的手背: 中等-深肤色",
      value: "🤚🏾",
    },
    {
      name: "立起的手背: 较深肤色",
      value: "🤚🏿",
    },
    {
      name: "手掌",
      value: "🖐",
    },
    {
      name: "手掌: 较浅肤色",
      value: "🖐🏻",
    },
    {
      name: "手掌: 中等-浅肤色",
      value: "🖐🏼",
    },
    {
      name: "手掌: 中等肤色",
      value: "🖐🏽",
    },
    {
      name: "手掌: 中等-深肤色",
      value: "🖐🏾",
    },
    {
      name: "手掌: 较深肤色",
      value: "🖐🏿",
    },
    {
      name: "举起手",
      value: "✋",
    },
    {
      name: "举起手: 较浅肤色",
      value: "✋🏻",
    },
    {
      name: "举起手: 中等-浅肤色",
      value: "✋🏼",
    },
    {
      name: "举起手: 中等肤色",
      value: "✋🏽",
    },
    {
      name: "举起手: 中等-深肤色",
      value: "✋🏾",
    },
    {
      name: "举起手: 较深肤色",
      value: "✋🏿",
    },
    {
      name: "瓦肯举手礼",
      value: "🖖",
    },
    {
      name: "瓦肯举手礼: 较浅肤色",
      value: "🖖🏻",
    },
    {
      name: "瓦肯举手礼: 中等-浅肤色",
      value: "🖖🏼",
    },
    {
      name: "瓦肯举手礼: 中等肤色",
      value: "🖖🏽",
    },
    {
      name: "瓦肯举手礼: 中等-深肤色",
      value: "🖖🏾",
    },
    {
      name: "瓦肯举手礼: 较深肤色",
      value: "🖖🏿",
    },
    {
      name: "OK",
      value: "👌",
    },
    {
      name: "OK: 较浅肤色",
      value: "👌🏻",
    },
    {
      name: "OK: 中等-浅肤色",
      value: "👌🏼",
    },
    {
      name: "OK: 中等肤色",
      value: "👌🏽",
    },
    {
      name: "OK: 中等-深肤色",
      value: "👌🏾",
    },
    {
      name: "OK: 较深肤色",
      value: "👌🏿",
    },
    {
      name: "捏手指",
      value: "🤌",
    },
    {
      name: "捏手指: 较浅肤色",
      value: "🤌🏻",
    },
    {
      name: "捏手指: 中等-浅肤色",
      value: "🤌🏼",
    },
    {
      name: "捏手指: 中等肤色",
      value: "🤌🏽",
    },
    {
      name: "捏手指: 中等-深肤色",
      value: "🤌🏾",
    },
    {
      name: "捏手指: 较深肤色",
      value: "🤌🏿",
    },
    {
      name: "捏合的手势",
      value: "🤏",
    },
    {
      name: "捏合的手势: 较浅肤色",
      value: "🤏🏻",
    },
    {
      name: "捏合的手势: 中等-浅肤色",
      value: "🤏🏼",
    },
    {
      name: "捏合的手势: 中等肤色",
      value: "🤏🏽",
    },
    {
      name: "捏合的手势: 中等-深肤色",
      value: "🤏🏾",
    },
    {
      name: "捏合的手势: 较深肤色",
      value: "🤏🏿",
    },
    {
      name: "胜利手势",
      value: "✌",
    },
    {
      name: "胜利手势: 较浅肤色",
      value: "✌🏻",
    },
    {
      name: "胜利手势: 中等-浅肤色",
      value: "✌🏼",
    },
    {
      name: "胜利手势: 中等肤色",
      value: "✌🏽",
    },
    {
      name: "胜利手势: 中等-深肤色",
      value: "✌🏾",
    },
    {
      name: "胜利手势: 较深肤色",
      value: "✌🏿",
    },
    {
      name: "交叉的手指",
      value: "🤞",
    },
    {
      name: "交叉的手指: 较浅肤色",
      value: "🤞🏻",
    },
    {
      name: "交叉的手指: 中等-浅肤色",
      value: "🤞🏼",
    },
    {
      name: "交叉的手指: 中等肤色",
      value: "🤞🏽",
    },
    {
      name: "交叉的手指: 中等-深肤色",
      value: "🤞🏾",
    },
    {
      name: "交叉的手指: 较深肤色",
      value: "🤞🏿",
    },
    {
      name: "爱你的手势",
      value: "🤟",
    },
    {
      name: "爱你的手势: 较浅肤色",
      value: "🤟🏻",
    },
    {
      name: "爱你的手势: 中等-浅肤色",
      value: "🤟🏼",
    },
    {
      name: "爱你的手势: 中等肤色",
      value: "🤟🏽",
    },
    {
      name: "爱你的手势: 中等-深肤色",
      value: "🤟🏾",
    },
    {
      name: "爱你的手势: 较深肤色",
      value: "🤟🏿",
    },
    {
      name: "摇滚",
      value: "🤘",
    },
    {
      name: "摇滚: 较浅肤色",
      value: "🤘🏻",
    },
    {
      name: "摇滚: 中等-浅肤色",
      value: "🤘🏼",
    },
    {
      name: "摇滚: 中等肤色",
      value: "🤘🏽",
    },
    {
      name: "摇滚: 中等-深肤色",
      value: "🤘🏾",
    },
    {
      name: "摇滚: 较深肤色",
      value: "🤘🏿",
    },
    {
      name: "给我打电话",
      value: "🤙",
    },
    {
      name: "给我打电话: 较浅肤色",
      value: "🤙🏻",
    },
    {
      name: "给我打电话: 中等-浅肤色",
      value: "🤙🏼",
    },
    {
      name: "给我打电话: 中等肤色",
      value: "🤙🏽",
    },
    {
      name: "给我打电话: 中等-深肤色",
      value: "🤙🏾",
    },
    {
      name: "给我打电话: 较深肤色",
      value: "🤙🏿",
    },
    {
      name: "反手食指向左指",
      value: "👈",
    },
    {
      name: "反手食指向左指: 较浅肤色",
      value: "👈🏻",
    },
    {
      name: "反手食指向左指: 中等-浅肤色",
      value: "👈🏼",
    },
    {
      name: "反手食指向左指: 中等肤色",
      value: "👈🏽",
    },
    {
      name: "反手食指向左指: 中等-深肤色",
      value: "👈🏾",
    },
    {
      name: "反手食指向左指: 较深肤色",
      value: "👈🏿",
    },
    {
      name: "反手食指向右指",
      value: "👉",
    },
    {
      name: "反手食指向右指: 较浅肤色",
      value: "👉🏻",
    },
    {
      name: "反手食指向右指: 中等-浅肤色",
      value: "👉🏼",
    },
    {
      name: "反手食指向右指: 中等肤色",
      value: "👉🏽",
    },
    {
      name: "反手食指向右指: 中等-深肤色",
      value: "👉🏾",
    },
    {
      name: "反手食指向右指: 较深肤色",
      value: "👉🏿",
    },
    {
      name: "反手食指向上指",
      value: "👆",
    },
    {
      name: "反手食指向上指: 较浅肤色",
      value: "👆🏻",
    },
    {
      name: "反手食指向上指: 中等-浅肤色",
      value: "👆🏼",
    },
    {
      name: "反手食指向上指: 中等肤色",
      value: "👆🏽",
    },
    {
      name: "反手食指向上指: 中等-深肤色",
      value: "👆🏾",
    },
    {
      name: "反手食指向上指: 较深肤色",
      value: "👆🏿",
    },
    {
      name: "竖中指",
      value: "🖕",
    },
    {
      name: "竖中指: 较浅肤色",
      value: "🖕🏻",
    },
    {
      name: "竖中指: 中等-浅肤色",
      value: "🖕🏼",
    },
    {
      name: "竖中指: 中等肤色",
      value: "🖕🏽",
    },
    {
      name: "竖中指: 中等-深肤色",
      value: "🖕🏾",
    },
    {
      name: "竖中指: 较深肤色",
      value: "🖕🏿",
    },
    {
      name: "反手食指向下指",
      value: "👇",
    },
    {
      name: "反手食指向下指: 较浅肤色",
      value: "👇🏻",
    },
    {
      name: "反手食指向下指: 中等-浅肤色",
      value: "👇🏼",
    },
    {
      name: "反手食指向下指: 中等肤色",
      value: "👇🏽",
    },
    {
      name: "反手食指向下指: 中等-深肤色",
      value: "👇🏾",
    },
    {
      name: "反手食指向下指: 较深肤色",
      value: "👇🏿",
    },
    {
      name: "食指向上指",
      value: "☝",
    },
    {
      name: "食指向上指: 较浅肤色",
      value: "☝🏻",
    },
    {
      name: "食指向上指: 中等-浅肤色",
      value: "☝🏼",
    },
    {
      name: "食指向上指: 中等肤色",
      value: "☝🏽",
    },
    {
      name: "食指向上指: 中等-深肤色",
      value: "☝🏾",
    },
    {
      name: "食指向上指: 较深肤色",
      value: "☝🏿",
    },
    {
      name: "拇指向上",
      value: "👍",
    },
    {
      name: "拇指向上: 较浅肤色",
      value: "👍🏻",
    },
    {
      name: "拇指向上: 中等-浅肤色",
      value: "👍🏼",
    },
    {
      name: "拇指向上: 中等肤色",
      value: "👍🏽",
    },
    {
      name: "拇指向上: 中等-深肤色",
      value: "👍🏾",
    },
    {
      name: "拇指向上: 较深肤色",
      value: "👍🏿",
    },
    {
      name: "拇指向下",
      value: "👎",
    },
    {
      name: "拇指向下: 较浅肤色",
      value: "👎🏻",
    },
    {
      name: "拇指向下: 中等-浅肤色",
      value: "👎🏼",
    },
    {
      name: "拇指向下: 中等肤色",
      value: "👎🏽",
    },
    {
      name: "拇指向下: 中等-深肤色",
      value: "👎🏾",
    },
    {
      name: "拇指向下: 较深肤色",
      value: "👎🏿",
    },
    {
      name: "举起拳头",
      value: "✊",
    },
    {
      name: "举起拳头: 较浅肤色",
      value: "✊🏻",
    },
    {
      name: "举起拳头: 中等-浅肤色",
      value: "✊🏼",
    },
    {
      name: "举起拳头: 中等肤色",
      value: "✊🏽",
    },
    {
      name: "举起拳头: 中等-深肤色",
      value: "✊🏾",
    },
    {
      name: "举起拳头: 较深肤色",
      value: "✊🏿",
    },
    {
      name: "出拳",
      value: "👊",
    },
    {
      name: "出拳: 较浅肤色",
      value: "👊🏻",
    },
    {
      name: "出拳: 中等-浅肤色",
      value: "👊🏼",
    },
    {
      name: "出拳: 中等肤色",
      value: "👊🏽",
    },
    {
      name: "出拳: 中等-深肤色",
      value: "👊🏾",
    },
    {
      name: "出拳: 较深肤色",
      value: "👊🏿",
    },
    {
      name: "朝左的拳头",
      value: "🤛",
    },
    {
      name: "朝左的拳头: 较浅肤色",
      value: "🤛🏻",
    },
    {
      name: "朝左的拳头: 中等-浅肤色",
      value: "🤛🏼",
    },
    {
      name: "朝左的拳头: 中等肤色",
      value: "🤛🏽",
    },
    {
      name: "朝左的拳头: 中等-深肤色",
      value: "🤛🏾",
    },
    {
      name: "朝左的拳头: 较深肤色",
      value: "🤛🏿",
    },
    {
      name: "朝右的拳头",
      value: "🤜",
    },
    {
      name: "朝右的拳头: 较浅肤色",
      value: "🤜🏻",
    },
    {
      name: "朝右的拳头: 中等-浅肤色",
      value: "🤜🏼",
    },
    {
      name: "朝右的拳头: 中等肤色",
      value: "🤜🏽",
    },
    {
      name: "朝右的拳头: 中等-深肤色",
      value: "🤜🏾",
    },
    {
      name: "朝右的拳头: 较深肤色",
      value: "🤜🏿",
    },
    {
      name: "鼓掌",
      value: "👏",
    },
    {
      name: "鼓掌: 较浅肤色",
      value: "👏🏻",
    },
    {
      name: "鼓掌: 中等-浅肤色",
      value: "👏🏼",
    },
    {
      name: "鼓掌: 中等肤色",
      value: "👏🏽",
    },
    {
      name: "鼓掌: 中等-深肤色",
      value: "👏🏾",
    },
    {
      name: "鼓掌: 较深肤色",
      value: "👏🏿",
    },
    {
      name: "举双手",
      value: "🙌",
    },
    {
      name: "举双手: 较浅肤色",
      value: "🙌🏻",
    },
    {
      name: "举双手: 中等-浅肤色",
      value: "🙌🏼",
    },
    {
      name: "举双手: 中等肤色",
      value: "🙌🏽",
    },
    {
      name: "举双手: 中等-深肤色",
      value: "🙌🏾",
    },
    {
      name: "举双手: 较深肤色",
      value: "🙌🏿",
    },
    {
      name: "张开双手",
      value: "👐",
    },
    {
      name: "张开双手: 较浅肤色",
      value: "👐🏻",
    },
    {
      name: "张开双手: 中等-浅肤色",
      value: "👐🏼",
    },
    {
      name: "张开双手: 中等肤色",
      value: "👐🏽",
    },
    {
      name: "张开双手: 中等-深肤色",
      value: "👐🏾",
    },
    {
      name: "张开双手: 较深肤色",
      value: "👐🏿",
    },
    {
      name: "掌心向上托起",
      value: "🤲",
    },
    {
      name: "掌心向上托起: 较浅肤色",
      value: "🤲🏻",
    },
    {
      name: "掌心向上托起: 中等-浅肤色",
      value: "🤲🏼",
    },
    {
      name: "掌心向上托起: 中等肤色",
      value: "🤲🏽",
    },
    {
      name: "掌心向上托起: 中等-深肤色",
      value: "🤲🏾",
    },
    {
      name: "掌心向上托起: 较深肤色",
      value: "🤲🏿",
    },
    {
      name: "握手",
      value: "🤝",
    },
    {
      name: "双手合十",
      value: "🙏",
    },
    {
      name: "双手合十: 较浅肤色",
      value: "🙏🏻",
    },
    {
      name: "双手合十: 中等-浅肤色",
      value: "🙏🏼",
    },
    {
      name: "双手合十: 中等肤色",
      value: "🙏🏽",
    },
    {
      name: "双手合十: 中等-深肤色",
      value: "🙏🏾",
    },
    {
      name: "双手合十: 较深肤色",
      value: "🙏🏿",
    },
    {
      name: "写字",
      value: "✍",
    },
    {
      name: "写字: 较浅肤色",
      value: "✍🏻",
    },
    {
      name: "写字: 中等-浅肤色",
      value: "✍🏼",
    },
    {
      name: "写字: 中等肤色",
      value: "✍🏽",
    },
    {
      name: "写字: 中等-深肤色",
      value: "✍🏾",
    },
    {
      name: "写字: 较深肤色",
      value: "✍🏿",
    },
    {
      name: "涂指甲油",
      value: "💅",
    },
    {
      name: "涂指甲油: 较浅肤色",
      value: "💅🏻",
    },
    {
      name: "涂指甲油: 中等-浅肤色",
      value: "💅🏼",
    },
    {
      name: "涂指甲油: 中等肤色",
      value: "💅🏽",
    },
    {
      name: "涂指甲油: 中等-深肤色",
      value: "💅🏾",
    },
    {
      name: "涂指甲油: 较深肤色",
      value: "💅🏿",
    },
    {
      name: "自拍",
      value: "🤳",
    },
    {
      name: "自拍: 较浅肤色",
      value: "🤳🏻",
    },
    {
      name: "自拍: 中等-浅肤色",
      value: "🤳🏼",
    },
    {
      name: "自拍: 中等肤色",
      value: "🤳🏽",
    },
    {
      name: "自拍: 中等-深肤色",
      value: "🤳🏾",
    },
    {
      name: "自拍: 较深肤色",
      value: "🤳🏿",
    },
    {
      name: "肌肉",
      value: "💪",
    },
    {
      name: "肌肉: 较浅肤色",
      value: "💪🏻",
    },
    {
      name: "肌肉: 中等-浅肤色",
      value: "💪🏼",
    },
    {
      name: "肌肉: 中等肤色",
      value: "💪🏽",
    },
    {
      name: "肌肉: 中等-深肤色",
      value: "💪🏾",
    },
    {
      name: "肌肉: 较深肤色",
      value: "💪🏿",
    },
    {
      name: "机械手臂",
      value: "🦾",
    },
    {
      name: "机械腿",
      value: "🦿",
    },
    {
      name: "腿",
      value: "🦵",
    },
    {
      name: "腿: 较浅肤色",
      value: "🦵🏻",
    },
    {
      name: "腿: 中等-浅肤色",
      value: "🦵🏼",
    },
    {
      name: "腿: 中等肤色",
      value: "🦵🏽",
    },
    {
      name: "腿: 中等-深肤色",
      value: "🦵🏾",
    },
    {
      name: "腿: 较深肤色",
      value: "🦵🏿",
    },
    {
      name: "脚",
      value: "🦶",
    },
    {
      name: "脚: 较浅肤色",
      value: "🦶🏻",
    },
    {
      name: "脚: 中等-浅肤色",
      value: "🦶🏼",
    },
    {
      name: "脚: 中等肤色",
      value: "🦶🏽",
    },
    {
      name: "脚: 中等-深肤色",
      value: "🦶🏾",
    },
    {
      name: "脚: 较深肤色",
      value: "🦶🏿",
    },
    {
      name: "耳朵",
      value: "👂",
    },
    {
      name: "耳朵: 较浅肤色",
      value: "👂🏻",
    },
    {
      name: "耳朵: 中等-浅肤色",
      value: "👂🏼",
    },
    {
      name: "耳朵: 中等肤色",
      value: "👂🏽",
    },
    {
      name: "耳朵: 中等-深肤色",
      value: "👂🏾",
    },
    {
      name: "耳朵: 较深肤色",
      value: "👂🏿",
    },
    {
      name: "戴助听器的耳朵",
      value: "🦻",
    },
    {
      name: "戴助听器的耳朵: 较浅肤色",
      value: "🦻🏻",
    },
    {
      name: "戴助听器的耳朵: 中等-浅肤色",
      value: "🦻🏼",
    },
    {
      name: "戴助听器的耳朵: 中等肤色",
      value: "🦻🏽",
    },
    {
      name: "戴助听器的耳朵: 中等-深肤色",
      value: "🦻🏾",
    },
    {
      name: "戴助听器的耳朵: 较深肤色",
      value: "🦻🏿",
    },
    {
      name: "鼻子",
      value: "👃",
    },
    {
      name: "鼻子: 较浅肤色",
      value: "👃🏻",
    },
    {
      name: "鼻子: 中等-浅肤色",
      value: "👃🏼",
    },
    {
      name: "鼻子: 中等肤色",
      value: "👃🏽",
    },
    {
      name: "鼻子: 中等-深肤色",
      value: "👃🏾",
    },
    {
      name: "鼻子: 较深肤色",
      value: "👃🏿",
    },
    {
      name: "脑",
      value: "🧠",
    },
    {
      name: "心脏器官",
      value: "🫀",
    },
    {
      name: "肺",
      value: "🫁",
    },
    {
      name: "牙齿",
      value: "🦷",
    },
    {
      name: "骨头",
      value: "🦴",
    },
    {
      name: "双眼",
      value: "👀",
    },
    {
      name: "眼睛",
      value: "👁",
    },
    {
      name: "舌头",
      value: "👅",
    },
    {
      name: "嘴",
      value: "👄",
    },
    {
      name: "小宝贝",
      value: "👶",
    },
    {
      name: "小宝贝: 较浅肤色",
      value: "👶🏻",
    },
    {
      name: "小宝贝: 中等-浅肤色",
      value: "👶🏼",
    },
    {
      name: "小宝贝: 中等肤色",
      value: "👶🏽",
    },
    {
      name: "小宝贝: 中等-深肤色",
      value: "👶🏾",
    },
    {
      name: "小宝贝: 较深肤色",
      value: "👶🏿",
    },
    {
      name: "儿童",
      value: "🧒",
    },
    {
      name: "儿童: 较浅肤色",
      value: "🧒🏻",
    },
    {
      name: "儿童: 中等-浅肤色",
      value: "🧒🏼",
    },
    {
      name: "儿童: 中等肤色",
      value: "🧒🏽",
    },
    {
      name: "儿童: 中等-深肤色",
      value: "🧒🏾",
    },
    {
      name: "儿童: 较深肤色",
      value: "🧒🏿",
    },
    {
      name: "男孩",
      value: "👦",
    },
    {
      name: "男孩: 较浅肤色",
      value: "👦🏻",
    },
    {
      name: "男孩: 中等-浅肤色",
      value: "👦🏼",
    },
    {
      name: "男孩: 中等肤色",
      value: "👦🏽",
    },
    {
      name: "男孩: 中等-深肤色",
      value: "👦🏾",
    },
    {
      name: "男孩: 较深肤色",
      value: "👦🏿",
    },
    {
      name: "女孩",
      value: "👧",
    },
    {
      name: "女孩: 较浅肤色",
      value: "👧🏻",
    },
    {
      name: "女孩: 中等-浅肤色",
      value: "👧🏼",
    },
    {
      name: "女孩: 中等肤色",
      value: "👧🏽",
    },
    {
      name: "女孩: 中等-深肤色",
      value: "👧🏾",
    },
    {
      name: "女孩: 较深肤色",
      value: "👧🏿",
    },
    {
      name: "成人",
      value: "🧑",
    },
    {
      name: "成人: 较浅肤色",
      value: "🧑🏻",
    },
    {
      name: "成人: 中等-浅肤色",
      value: "🧑🏼",
    },
    {
      name: "成人: 中等肤色",
      value: "🧑🏽",
    },
    {
      name: "成人: 中等-深肤色",
      value: "🧑🏾",
    },
    {
      name: "成人: 较深肤色",
      value: "🧑🏿",
    },
    {
      name: "金色头发的人",
      value: "👱",
    },
    {
      name: "金色头发的人: 较浅肤色",
      value: "👱🏻",
    },
    {
      name: "金色头发的人: 中等-浅肤色",
      value: "👱🏼",
    },
    {
      name: "金色头发的人: 中等肤色",
      value: "👱🏽",
    },
    {
      name: "金色头发的人: 中等-深肤色",
      value: "👱🏾",
    },
    {
      name: "金色头发的人: 较深肤色",
      value: "👱🏿",
    },
    {
      name: "男人",
      value: "👨",
    },
    {
      name: "男人: 较浅肤色",
      value: "👨🏻",
    },
    {
      name: "男人: 中等-浅肤色",
      value: "👨🏼",
    },
    {
      name: "男人: 中等肤色",
      value: "👨🏽",
    },
    {
      name: "男人: 中等-深肤色",
      value: "👨🏾",
    },
    {
      name: "男人: 较深肤色",
      value: "👨🏿",
    },
    {
      name: "有胡子的人",
      value: "🧔",
    },
    {
      name: "有胡子的人: 较浅肤色",
      value: "🧔🏻",
    },
    {
      name: "有胡子的人: 中等-浅肤色",
      value: "🧔🏼",
    },
    {
      name: "有胡子的人: 中等肤色",
      value: "🧔🏽",
    },
    {
      name: "有胡子的人: 中等-深肤色",
      value: "🧔🏾",
    },
    {
      name: "有胡子的人: 较深肤色",
      value: "🧔🏿",
    },
    {
      name: "男人: 红发",
      value: "👨‍🦰",
    },
    {
      name: "男人: 较浅肤色红发",
      value: "👨🏻‍🦰",
    },
    {
      name: "男人: 中等-浅肤色红发",
      value: "👨🏼‍🦰",
    },
    {
      name: "男人: 中等肤色红发",
      value: "👨🏽‍🦰",
    },
    {
      name: "男人: 中等-深肤色红发",
      value: "👨🏾‍🦰",
    },
    {
      name: "男人: 较深肤色红发",
      value: "👨🏿‍🦰",
    },
    {
      name: "男人: 卷发",
      value: "👨‍🦱",
    },
    {
      name: "男人: 较浅肤色卷发",
      value: "👨🏻‍🦱",
    },
    {
      name: "男人: 中等-浅肤色卷发",
      value: "👨🏼‍🦱",
    },
    {
      name: "男人: 中等肤色卷发",
      value: "👨🏽‍🦱",
    },
    {
      name: "男人: 中等-深肤色卷发",
      value: "👨🏾‍🦱",
    },
    {
      name: "男人: 较深肤色卷发",
      value: "👨🏿‍🦱",
    },
    {
      name: "男人: 白发",
      value: "👨‍🦳",
    },
    {
      name: "男人: 较浅肤色白发",
      value: "👨🏻‍🦳",
    },
    {
      name: "男人: 中等-浅肤色白发",
      value: "👨🏼‍🦳",
    },
    {
      name: "男人: 中等肤色白发",
      value: "👨🏽‍🦳",
    },
    {
      name: "男人: 中等-深肤色白发",
      value: "👨🏾‍🦳",
    },
    {
      name: "男人: 较深肤色白发",
      value: "👨🏿‍🦳",
    },
    {
      name: "男人: 秃顶",
      value: "👨‍🦲",
    },
    {
      name: "男人: 较浅肤色秃顶",
      value: "👨🏻‍🦲",
    },
    {
      name: "男人: 中等-浅肤色秃顶",
      value: "👨🏼‍🦲",
    },
    {
      name: "男人: 中等肤色秃顶",
      value: "👨🏽‍🦲",
    },
    {
      name: "男人: 中等-深肤色秃顶",
      value: "👨🏾‍🦲",
    },
    {
      name: "男人: 较深肤色秃顶",
      value: "👨🏿‍🦲",
    },
    {
      name: "女人",
      value: "👩",
    },
    {
      name: "女人: 较浅肤色",
      value: "👩🏻",
    },
    {
      name: "女人: 中等-浅肤色",
      value: "👩🏼",
    },
    {
      name: "女人: 中等肤色",
      value: "👩🏽",
    },
    {
      name: "女人: 中等-深肤色",
      value: "👩🏾",
    },
    {
      name: "女人: 较深肤色",
      value: "👩🏿",
    },
    {
      name: "女人: 红发",
      value: "👩‍🦰",
    },
    {
      name: "女人: 较浅肤色红发",
      value: "👩🏻‍🦰",
    },
    {
      name: "女人: 中等-浅肤色红发",
      value: "👩🏼‍🦰",
    },
    {
      name: "女人: 中等肤色红发",
      value: "👩🏽‍🦰",
    },
    {
      name: "女人: 中等-深肤色红发",
      value: "👩🏾‍🦰",
    },
    {
      name: "女人: 较深肤色红发",
      value: "👩🏿‍🦰",
    },
    {
      name: "成人: 红发",
      value: "🧑‍🦰",
    },
    {
      name: "成人: 较浅肤色红发",
      value: "🧑🏻‍🦰",
    },
    {
      name: "成人: 中等-浅肤色红发",
      value: "🧑🏼‍🦰",
    },
    {
      name: "成人: 中等肤色红发",
      value: "🧑🏽‍🦰",
    },
    {
      name: "成人: 中等-深肤色红发",
      value: "🧑🏾‍🦰",
    },
    {
      name: "成人: 较深肤色红发",
      value: "🧑🏿‍🦰",
    },
    {
      name: "女人: 卷发",
      value: "👩‍🦱",
    },
    {
      name: "女人: 较浅肤色卷发",
      value: "👩🏻‍🦱",
    },
    {
      name: "女人: 中等-浅肤色卷发",
      value: "👩🏼‍🦱",
    },
    {
      name: "女人: 中等肤色卷发",
      value: "👩🏽‍🦱",
    },
    {
      name: "女人: 中等-深肤色卷发",
      value: "👩🏾‍🦱",
    },
    {
      name: "女人: 较深肤色卷发",
      value: "👩🏿‍🦱",
    },
    {
      name: "成人: 卷发",
      value: "🧑‍🦱",
    },
    {
      name: "成人: 较浅肤色卷发",
      value: "🧑🏻‍🦱",
    },
    {
      name: "成人: 中等-浅肤色卷发",
      value: "🧑🏼‍🦱",
    },
    {
      name: "成人: 中等肤色卷发",
      value: "🧑🏽‍🦱",
    },
    {
      name: "成人: 中等-深肤色卷发",
      value: "🧑🏾‍🦱",
    },
    {
      name: "成人: 较深肤色卷发",
      value: "🧑🏿‍🦱",
    },
    {
      name: "女人: 白发",
      value: "👩‍🦳",
    },
    {
      name: "女人: 较浅肤色白发",
      value: "👩🏻‍🦳",
    },
    {
      name: "女人: 中等-浅肤色白发",
      value: "👩🏼‍🦳",
    },
    {
      name: "女人: 中等肤色白发",
      value: "👩🏽‍🦳",
    },
    {
      name: "女人: 中等-深肤色白发",
      value: "👩🏾‍🦳",
    },
    {
      name: "女人: 较深肤色白发",
      value: "👩🏿‍🦳",
    },
    {
      name: "成人: 白发",
      value: "🧑‍🦳",
    },
    {
      name: "成人: 较浅肤色白发",
      value: "🧑🏻‍🦳",
    },
    {
      name: "成人: 中等-浅肤色白发",
      value: "🧑🏼‍🦳",
    },
    {
      name: "成人: 中等肤色白发",
      value: "🧑🏽‍🦳",
    },
    {
      name: "成人: 中等-深肤色白发",
      value: "🧑🏾‍🦳",
    },
    {
      name: "成人: 较深肤色白发",
      value: "🧑🏿‍🦳",
    },
    {
      name: "女人: 秃顶",
      value: "👩‍🦲",
    },
    {
      name: "女人: 较浅肤色秃顶",
      value: "👩🏻‍🦲",
    },
    {
      name: "女人: 中等-浅肤色秃顶",
      value: "👩🏼‍🦲",
    },
    {
      name: "女人: 中等肤色秃顶",
      value: "👩🏽‍🦲",
    },
    {
      name: "女人: 中等-深肤色秃顶",
      value: "👩🏾‍🦲",
    },
    {
      name: "女人: 较深肤色秃顶",
      value: "👩🏿‍🦲",
    },
    {
      name: "成人: 秃顶",
      value: "🧑‍🦲",
    },
    {
      name: "成人: 较浅肤色秃顶",
      value: "🧑🏻‍🦲",
    },
    {
      name: "成人: 中等-浅肤色秃顶",
      value: "🧑🏼‍🦲",
    },
    {
      name: "成人: 中等肤色秃顶",
      value: "🧑🏽‍🦲",
    },
    {
      name: "成人: 中等-深肤色秃顶",
      value: "🧑🏾‍🦲",
    },
    {
      name: "成人: 较深肤色秃顶",
      value: "🧑🏿‍🦲",
    },
    {
      name: "女人：金色的头发",
      value: "👱‍♀️",
    },
    {
      name: "女人：浅肤色，金色的头发",
      value: "👱🏻‍♀️",
    },
    {
      name: "女人：中浅肤色，金色的头发",
      value: "👱🏼‍♀️",
    },
    {
      name: "女人：中等肤色，金色的头发",
      value: "👱🏽‍♀️",
    },
    {
      name: "女人：中深肤色，金色的头发",
      value: "👱🏾‍♀️",
    },
    {
      name: "女人：深肤色，金色的头发",
      value: "👱🏿‍♀️",
    },
    {
      name: "男人：金色的头发",
      value: "👱‍♂️",
    },
    {
      name: "男人：浅肤色，金色的头发",
      value: "👱🏻‍♂️",
    },
    {
      name: "男人：中浅肤色，金色的头发",
      value: "👱🏼‍♂️",
    },
    {
      name: "男人：中等肤色，金色的头发",
      value: "👱🏽‍♂️",
    },
    {
      name: "男人：中深肤色，金色的头发",
      value: "👱🏾‍♂️",
    },
    {
      name: "男人：深肤色，金色的头发",
      value: "👱🏿‍♂️",
    },
    {
      name: "老年人",
      value: "🧓",
    },
    {
      name: "老年人: 较浅肤色",
      value: "🧓🏻",
    },
    {
      name: "老年人: 中等-浅肤色",
      value: "🧓🏼",
    },
    {
      name: "老年人: 中等肤色",
      value: "🧓🏽",
    },
    {
      name: "老年人: 中等-深肤色",
      value: "🧓🏾",
    },
    {
      name: "老年人: 较深肤色",
      value: "🧓🏿",
    },
    {
      name: "老爷爷",
      value: "👴",
    },
    {
      name: "老爷爷: 较浅肤色",
      value: "👴🏻",
    },
    {
      name: "老爷爷: 中等-浅肤色",
      value: "👴🏼",
    },
    {
      name: "老爷爷: 中等肤色",
      value: "👴🏽",
    },
    {
      name: "老爷爷: 中等-深肤色",
      value: "👴🏾",
    },
    {
      name: "老爷爷: 较深肤色",
      value: "👴🏿",
    },
    {
      name: "老奶奶",
      value: "👵",
    },
    {
      name: "老奶奶: 较浅肤色",
      value: "👵🏻",
    },
    {
      name: "老奶奶: 中等-浅肤色",
      value: "👵🏼",
    },
    {
      name: "老奶奶: 中等肤色",
      value: "👵🏽",
    },
    {
      name: "老奶奶: 中等-深肤色",
      value: "👵🏾",
    },
    {
      name: "老奶奶: 较深肤色",
      value: "👵🏿",
    },
    {
      name: "皱眉",
      value: "🙍",
    },
    {
      name: "皱眉: 较浅肤色",
      value: "🙍🏻",
    },
    {
      name: "皱眉: 中等-浅肤色",
      value: "🙍🏼",
    },
    {
      name: "皱眉: 中等肤色",
      value: "🙍🏽",
    },
    {
      name: "皱眉: 中等-深肤色",
      value: "🙍🏾",
    },
    {
      name: "皱眉: 较深肤色",
      value: "🙍🏿",
    },
    {
      name: "皱眉的男人",
      value: "🙍‍♂️",
    },
    {
      name: "男人皱着眉头：浅肤色",
      value: "🙍🏻‍♂️",
    },
    {
      name: "男人皱着眉头：中浅肤色",
      value: "🙍🏼‍♂️",
    },
    {
      name: "男人皱着眉头：中等肤色",
      value: "🙍🏽‍♂️",
    },
    {
      name: "男人皱着眉头：中深肤色",
      value: "🙍🏾‍♂️",
    },
    {
      name: "男人皱着眉头：深肤色",
      value: "🙍🏿‍♂️",
    },
    {
      name: "女人皱着眉头",
      value: "🙍‍♀️",
    },
    {
      name: "女人皱着眉头：浅肤色",
      value: "🙍🏻‍♀️",
    },
    {
      name: "女人皱着眉头：中浅肤色",
      value: "🙍🏼‍♀️",
    },
    {
      name: "女人皱着眉头：中等肤色",
      value: "🙍🏽‍♀️",
    },
    {
      name: "女人皱着眉头：中深肤色",
      value: "🙍🏾‍♀️",
    },
    {
      name: "女人皱着眉头：深肤色",
      value: "🙍🏿‍♀️",
    },
    {
      name: "撅嘴",
      value: "🙎",
    },
    {
      name: "撅嘴: 较浅肤色",
      value: "🙎🏻",
    },
    {
      name: "撅嘴: 中等-浅肤色",
      value: "🙎🏼",
    },
    {
      name: "撅嘴: 中等肤色",
      value: "🙎🏽",
    },
    {
      name: "撅嘴: 中等-深肤色",
      value: "🙎🏾",
    },
    {
      name: "撅嘴: 较深肤色",
      value: "🙎🏿",
    },
    {
      name: "噘嘴的男人",
      value: "🙎‍♂️",
    },
    {
      name: "男人噘嘴：浅肤色",
      value: "🙎🏻‍♂️",
    },
    {
      name: "男人噘嘴：中浅肤色",
      value: "🙎🏼‍♂️",
    },
    {
      name: "男人噘嘴：中等肤色",
      value: "🙎🏽‍♂️",
    },
    {
      name: "男人噘嘴：中深肤色",
      value: "🙎🏾‍♂️",
    },
    {
      name: "男人噘嘴：深肤色",
      value: "🙎🏿‍♂️",
    },
    {
      name: "噘嘴的女人",
      value: "🙎‍♀️",
    },
    {
      name: "女人噘嘴：淡肤色",
      value: "🙎🏻‍♀️",
    },
    {
      name: "女人噘嘴：中浅肤色",
      value: "🙎🏼‍♀️",
    },
    {
      name: "女人噘嘴：中等肤色",
      value: "🙎🏽‍♀️",
    },
    {
      name: "女人噘嘴：中深肤色",
      value: "🙎🏾‍♀️",
    },
    {
      name: "女人噘嘴：深肤色",
      value: "🙎🏿‍♀️",
    },
    {
      name: "禁止手势",
      value: "🙅",
    },
    {
      name: "禁止手势: 较浅肤色",
      value: "🙅🏻",
    },
    {
      name: "禁止手势: 中等-浅肤色",
      value: "🙅🏼",
    },
    {
      name: "禁止手势: 中等肤色",
      value: "🙅🏽",
    },
    {
      name: "禁止手势: 中等-深肤色",
      value: "🙅🏾",
    },
    {
      name: "禁止手势: 较深肤色",
      value: "🙅🏿",
    },
    {
      name: "男人打手势不同意",
      value: "🙅‍♂️",
    },
    {
      name: "男人打手势不同意：浅肤色",
      value: "🙅🏻‍♂️",
    },
    {
      name: "男人打手势不同意：中浅肤色",
      value: "🙅🏼‍♂️",
    },
    {
      name: "男人打手势不同意：中等肤色",
      value: "🙅🏽‍♂️",
    },
    {
      name: "男人打手势不同意：中深肤色",
      value: "🙅🏾‍♂️",
    },
    {
      name: "男人打手势不同意：深肤色",
      value: "🙅🏿‍♂️",
    },
    {
      name: "女人打手势不同意",
      value: "🙅‍♀️",
    },
    {
      name: "女人打手势不同意：浅肤色",
      value: "🙅🏻‍♀️",
    },
    {
      name: "女人打手势不同意：中浅肤色",
      value: "🙅🏼‍♀️",
    },
    {
      name: "女人打手势不同意：中等肤色",
      value: "🙅🏽‍♀️",
    },
    {
      name: "女人打手势不同意：中深肤色",
      value: "🙅🏾‍♀️",
    },
    {
      name: "女人打手势不同意：深肤色",
      value: "🙅🏿‍♀️",
    },
    {
      name: "OK手势",
      value: "🙆",
    },
    {
      name: "OK手势: 较浅肤色",
      value: "🙆🏻",
    },
    {
      name: "OK手势: 中等-浅肤色",
      value: "🙆🏼",
    },
    {
      name: "OK手势: 中等肤色",
      value: "🙆🏽",
    },
    {
      name: "OK手势: 中等-深肤色",
      value: "🙆🏾",
    },
    {
      name: "OK手势: 较深肤色",
      value: "🙆🏿",
    },
    {
      name: "男人打手势同意",
      value: "🙆‍♂️",
    },
    {
      name: "男人打手势同意：浅肤色",
      value: "🙆🏻‍♂️",
    },
    {
      name: "男人打手势同意：中浅肤色",
      value: "🙆🏼‍♂️",
    },
    {
      name: "男人打手势同意：中等肤色",
      value: "🙆🏽‍♂️",
    },
    {
      name: "男子打手势同意：中深肤色",
      value: "🙆🏾‍♂️",
    },
    {
      name: "男子打手势同意：深肤色",
      value: "🙆🏿‍♂️",
    },
    {
      name: "女人打手势同意",
      value: "🙆‍♀️",
    },
    {
      name: "女人打手势同意：浅肤色",
      value: "🙆🏻‍♀️",
    },
    {
      name: "女人打手势同意：中浅肤色",
      value: "🙆🏼‍♀️",
    },
    {
      name: "女人打手势同意：中等肤色",
      value: "🙆🏽‍♀️",
    },
    {
      name: "女人打手势同意：中深肤色",
      value: "🙆🏾‍♀️",
    },
    {
      name: "女人打手势同意：深肤色",
      value: "🙆🏿‍♀️",
    },
    {
      name: "前台",
      value: "💁",
    },
    {
      name: "前台: 较浅肤色",
      value: "💁🏻",
    },
    {
      name: "前台: 中等-浅肤色",
      value: "💁🏼",
    },
    {
      name: "前台: 中等肤色",
      value: "💁🏽",
    },
    {
      name: "前台: 中等-深肤色",
      value: "💁🏾",
    },
    {
      name: "前台: 较深肤色",
      value: "💁🏿",
    },
    {
      name: "男子举起的手",
      value: "💁‍♂️",
    },
    {
      name: "男子倾手：浅肤色",
      value: "💁🏻‍♂️",
    },
    {
      name: "男士倾手：中浅肤色",
      value: "💁🏼‍♂️",
    },
    {
      name: "男士倾手：中等肤色",
      value: "💁🏽‍♂️",
    },
    {
      name: "男士倾手：中深肤色",
      value: "💁🏾‍♂️",
    },
    {
      name: "男人倾手：深肤色",
      value: "💁🏿‍♂️",
    },
    {
      name: "女人举起的手",
      value: "💁‍♀️",
    },
    {
      name: "女人倾手：淡肤色",
      value: "💁🏻‍♀️",
    },
    {
      name: "女人倾手：中浅肤色",
      value: "💁🏼‍♀️",
    },
    {
      name: "女人倾手：中等肤色",
      value: "💁🏽‍♀️",
    },
    {
      name: "女人倾手：中深肤色",
      value: "💁🏾‍♀️",
    },
    {
      name: "女人倾手：深肤色",
      value: "💁🏿‍♀️",
    },
    {
      name: "举手",
      value: "🙋",
    },
    {
      name: "举手: 较浅肤色",
      value: "🙋🏻",
    },
    {
      name: "举手: 中等-浅肤色",
      value: "🙋🏼",
    },
    {
      name: "举手: 中等肤色",
      value: "🙋🏽",
    },
    {
      name: "举手: 中等-深肤色",
      value: "🙋🏾",
    },
    {
      name: "举手: 较深肤色",
      value: "🙋🏿",
    },
    {
      name: "举手的男人",
      value: "🙋‍♂️",
    },
    {
      name: "举手的男人：浅肤色",
      value: "🙋🏻‍♂️",
    },
    {
      name: "举手的男人：中浅肤色",
      value: "🙋🏼‍♂️",
    },
    {
      name: "举手的男人：中等肤色",
      value: "🙋🏽‍♂️",
    },
    {
      name: "举手的男人：中深肤色",
      value: "🙋🏾‍♂️",
    },
    {
      name: "举手的男人：深肤色",
      value: "🙋🏿‍♂️",
    },
    {
      name: "举手的女人",
      value: "🙋‍♀️",
    },
    {
      name: "举手的女人：浅肤色",
      value: "🙋🏻‍♀️",
    },
    {
      name: "举手的女人：中浅肤色",
      value: "🙋🏼‍♀️",
    },
    {
      name: "举手的女人：中等肤色",
      value: "🙋🏽‍♀️",
    },
    {
      name: "举手的女人：中深肤色",
      value: "🙋🏾‍♀️",
    },
    {
      name: "举手的女人：深肤色",
      value: "🙋🏿‍♀️",
    },
    {
      name: "失聪者",
      value: "🧏",
    },
    {
      name: "失聪者: 较浅肤色",
      value: "🧏🏻",
    },
    {
      name: "失聪者: 中等-浅肤色",
      value: "🧏🏼",
    },
    {
      name: "失聪者: 中等肤色",
      value: "🧏🏽",
    },
    {
      name: "失聪者: 中等-深肤色",
      value: "🧏🏾",
    },
    {
      name: "失聪者: 较深肤色",
      value: "🧏🏿",
    },
    {
      name: "聋哑男人",
      value: "🧏‍♂️",
    },
    {
      name: "聋哑男人：浅肤色",
      value: "🧏🏻‍♂️",
    },
    {
      name: "聋哑男人：中浅肤色",
      value: "🧏🏼‍♂️",
    },
    {
      name: "聋哑男人：中等肤色",
      value: "🧏🏽‍♂️",
    },
    {
      name: "聋哑男人：中深肤色",
      value: "🧏🏾‍♂️",
    },
    {
      name: "聋哑男人：深肤色",
      value: "🧏🏿‍♂️",
    },
    {
      name: "聋哑女人",
      value: "🧏‍♀️",
    },
    {
      name: "聋哑女人：浅肤色",
      value: "🧏🏻‍♀️",
    },
    {
      name: "聋哑女人：中浅肤色",
      value: "🧏🏼‍♀️",
    },
    {
      name: "聋哑女人：中等肤色",
      value: "🧏🏽‍♀️",
    },
    {
      name: "聋哑女人：中深肤色",
      value: "🧏🏾‍♀️",
    },
    {
      name: "聋哑女人：深肤色",
      value: "🧏🏿‍♀️",
    },
    {
      name: "鞠躬",
      value: "🙇",
    },
    {
      name: "鞠躬: 较浅肤色",
      value: "🙇🏻",
    },
    {
      name: "鞠躬: 中等-浅肤色",
      value: "🙇🏼",
    },
    {
      name: "鞠躬: 中等肤色",
      value: "🙇🏽",
    },
    {
      name: "鞠躬: 中等-深肤色",
      value: "🙇🏾",
    },
    {
      name: "鞠躬: 较深肤色",
      value: "🙇🏿",
    },
    {
      name: "男人鞠躬",
      value: "🙇‍♂️",
    },
    {
      name: "男人鞠躬：浅肤色",
      value: "🙇🏻‍♂️",
    },
    {
      name: "男人鞠躬：中浅肤色",
      value: "🙇🏼‍♂️",
    },
    {
      name: "男人鞠躬：中等肤色",
      value: "🙇🏽‍♂️",
    },
    {
      name: "男人鞠躬：中深肤色",
      value: "🙇🏾‍♂️",
    },
    {
      name: "男人鞠躬：深肤色",
      value: "🙇🏿‍♂️",
    },
    {
      name: "女人鞠躬",
      value: "🙇‍♀️",
    },
    {
      name: "女人鞠躬：浅肤色",
      value: "🙇🏻‍♀️",
    },
    {
      name: "女人鞠躬：中浅肤色",
      value: "🙇🏼‍♀️",
    },
    {
      name: "女人鞠躬：中等肤色",
      value: "🙇🏽‍♀️",
    },
    {
      name: "女人鞠躬：中深肤色",
      value: "🙇🏾‍♀️",
    },
    {
      name: "女人鞠躬：深肤色",
      value: "🙇🏿‍♀️",
    },
    {
      name: "捂脸",
      value: "🤦",
    },
    {
      name: "捂脸: 较浅肤色",
      value: "🤦🏻",
    },
    {
      name: "捂脸: 中等-浅肤色",
      value: "🤦🏼",
    },
    {
      name: "捂脸: 中等肤色",
      value: "🤦🏽",
    },
    {
      name: "捂脸: 中等-深肤色",
      value: "🤦🏾",
    },
    {
      name: "捂脸: 较深肤色",
      value: "🤦🏿",
    },
    {
      name: "男人捂脸",
      value: "🤦‍♂️",
    },
    {
      name: "男人捂脸：浅肤色",
      value: "🤦🏻‍♂️",
    },
    {
      name: "男人捂脸：中浅肤色",
      value: "🤦🏼‍♂️",
    },
    {
      name: "男人捂脸：中等肤色",
      value: "🤦🏽‍♂️",
    },
    {
      name: "男人捂脸：中深肤色",
      value: "🤦🏾‍♂️",
    },
    {
      name: "男人捂脸：深肤色",
      value: "🤦🏿‍♂️",
    },
    {
      name: "女人捂脸",
      value: "🤦‍♀️",
    },
    {
      name: "女人捂脸：浅肤色",
      value: "🤦🏻‍♀️",
    },
    {
      name: "女人捂脸：中浅肤色",
      value: "🤦🏼‍♀️",
    },
    {
      name: "女人捂脸：中等肤色",
      value: "🤦🏽‍♀️",
    },
    {
      name: "女人捂脸：中深肤色",
      value: "🤦🏾‍♀️",
    },
    {
      name: "女人捂脸：深肤色",
      value: "🤦🏿‍♀️",
    },
    {
      name: "耸肩",
      value: "🤷",
    },
    {
      name: "耸肩: 较浅肤色",
      value: "🤷🏻",
    },
    {
      name: "耸肩: 中等-浅肤色",
      value: "🤷🏼",
    },
    {
      name: "耸肩: 中等肤色",
      value: "🤷🏽",
    },
    {
      name: "耸肩: 中等-深肤色",
      value: "🤷🏾",
    },
    {
      name: "耸肩: 较深肤色",
      value: "🤷🏿",
    },
    {
      name: "男人耸肩",
      value: "🤷‍♂️",
    },
    {
      name: "男人耸肩：浅肤色",
      value: "🤷🏻‍♂️",
    },
    {
      name: "男人耸肩：中浅肤色",
      value: "🤷🏼‍♂️",
    },
    {
      name: "男人耸肩：中等肤色",
      value: "🤷🏽‍♂️",
    },
    {
      name: "男人耸肩：中深肤色",
      value: "🤷🏾‍♂️",
    },
    {
      name: "男人耸肩：深肤色",
      value: "🤷🏿‍♂️",
    },
    {
      name: "女人耸肩",
      value: "🤷‍♀️",
    },
    {
      name: "女人耸肩：浅肤色",
      value: "🤷🏻‍♀️",
    },
    {
      name: "女人耸肩：中浅肤色",
      value: "🤷🏼‍♀️",
    },
    {
      name: "女人耸肩：中等肤色",
      value: "🤷🏽‍♀️",
    },
    {
      name: "女人耸肩：中深肤色",
      value: "🤷🏾‍♀️",
    },
    {
      name: "女人耸肩：深肤色",
      value: "🤷🏿‍♀️",
    },
    {
      name: "卫生工作者",
      value: "🧑‍⚕️",
    },
    {
      name: "卫生工作者: 较浅肤色",
      value: "🧑🏻‍⚕️",
    },
    {
      name: "卫生工作者: 中等-浅肤色",
      value: "🧑🏼‍⚕️",
    },
    {
      name: "卫生工作者: 中等肤色",
      value: "🧑🏽‍⚕️",
    },
    {
      name: "卫生工作者: 中等-深肤色",
      value: "🧑🏾‍⚕️",
    },
    {
      name: "卫生工作者: 较深肤色",
      value: "🧑🏿‍⚕️",
    },
    {
      name: "男子健康工作者",
      value: "👨‍⚕️",
    },
    {
      name: "男医生: 较浅肤色",
      value: "👨🏻‍⚕️",
    },
    {
      name: "男士健康工作者：中浅肤色",
      value: "👨🏼‍⚕️",
    },
    {
      name: "男性健康工作者：中等肤色",
      value: "👨🏽‍⚕️",
    },
    {
      name: "男性健康工作者：中深肤色",
      value: "👨🏾‍⚕️",
    },
    {
      name: "男性健康工作者：深肤色",
      value: "👨🏿‍⚕️",
    },
    {
      name: "女卫生工作者",
      value: "👩‍⚕️",
    },
    {
      name: "女性健康工作者：浅肤色",
      value: "👩🏻‍⚕️",
    },
    {
      name: "女性健康工作者：中浅肤色",
      value: "👩🏼‍⚕️",
    },
    {
      name: "女性健康工作者：中等肤色",
      value: "👩🏽‍⚕️",
    },
    {
      name: "女性健康工作者：中深肤色",
      value: "👩🏾‍⚕️",
    },
    {
      name: "女性健康工作者：深肤色",
      value: "👩🏿‍⚕️",
    },
    {
      name: "学生",
      value: "🧑‍🎓",
    },
    {
      name: "学生: 较浅肤色",
      value: "🧑🏻‍🎓",
    },
    {
      name: "学生: 中等-浅肤色",
      value: "🧑🏼‍🎓",
    },
    {
      name: "学生: 中等肤色",
      value: "🧑🏽‍🎓",
    },
    {
      name: "学生: 中等-深肤色",
      value: "🧑🏾‍🎓",
    },
    {
      name: "学生: 较深肤色",
      value: "🧑🏿‍🎓",
    },
    {
      name: "男学生",
      value: "👨‍🎓",
    },
    {
      name: "男学生: 较浅肤色",
      value: "👨🏻‍🎓",
    },
    {
      name: "男学生: 中等-浅肤色",
      value: "👨🏼‍🎓",
    },
    {
      name: "男学生: 中等肤色",
      value: "👨🏽‍🎓",
    },
    {
      name: "男学生: 中等-深肤色",
      value: "👨🏾‍🎓",
    },
    {
      name: "男学生: 较深肤色",
      value: "👨🏿‍🎓",
    },
    {
      name: "女学生",
      value: "👩‍🎓",
    },
    {
      name: "女学生: 较浅肤色",
      value: "👩🏻‍🎓",
    },
    {
      name: "女学生: 中等-浅肤色",
      value: "👩🏼‍🎓",
    },
    {
      name: "女学生: 中等肤色",
      value: "👩🏽‍🎓",
    },
    {
      name: "女学生: 中等-深肤色",
      value: "👩🏾‍🎓",
    },
    {
      name: "女学生: 较深肤色",
      value: "👩🏿‍🎓",
    },
    {
      name: "老师",
      value: "🧑‍🏫",
    },
    {
      name: "老师: 较浅肤色",
      value: "🧑🏻‍🏫",
    },
    {
      name: "老师: 中等-浅肤色",
      value: "🧑🏼‍🏫",
    },
    {
      name: "老师: 中等肤色",
      value: "🧑🏽‍🏫",
    },
    {
      name: "老师: 中等-深肤色",
      value: "🧑🏾‍🏫",
    },
    {
      name: "老师: 较深肤色",
      value: "🧑🏿‍🏫",
    },
    {
      name: "男老师",
      value: "👨‍🏫",
    },
    {
      name: "男老师: 较浅肤色",
      value: "👨🏻‍🏫",
    },
    {
      name: "男老师: 中等-浅肤色",
      value: "👨🏼‍🏫",
    },
    {
      name: "男老师: 中等肤色",
      value: "👨🏽‍🏫",
    },
    {
      name: "男老师: 中等-深肤色",
      value: "👨🏾‍🏫",
    },
    {
      name: "男老师: 较深肤色",
      value: "👨🏿‍🏫",
    },
    {
      name: "女老师",
      value: "👩‍🏫",
    },
    {
      name: "女老师: 较浅肤色",
      value: "👩🏻‍🏫",
    },
    {
      name: "女老师: 中等-浅肤色",
      value: "👩🏼‍🏫",
    },
    {
      name: "女老师: 中等肤色",
      value: "👩🏽‍🏫",
    },
    {
      name: "女老师: 中等-深肤色",
      value: "👩🏾‍🏫",
    },
    {
      name: "女老师: 较深肤色",
      value: "👩🏿‍🏫",
    },
    {
      name: "法官",
      value: "🧑‍⚖️",
    },
    {
      name: "法官: 较浅肤色",
      value: "🧑🏻‍⚖️",
    },
    {
      name: "法官: 中等-浅肤色",
      value: "🧑🏼‍⚖️",
    },
    {
      name: "法官: 中等肤色",
      value: "🧑🏽‍⚖️",
    },
    {
      name: "法官: 中等-深肤色",
      value: "🧑🏾‍⚖️",
    },
    {
      name: "法官: 较深肤色",
      value: "🧑🏿‍⚖️",
    },
    {
      name: "男子法官",
      value: "👨‍⚖️",
    },
    {
      name: "男人法官：浅肤色",
      value: "👨🏻‍⚖️",
    },
    {
      name: "男人法官：中浅肤色",
      value: "👨🏼‍⚖️",
    },
    {
      name: "男人法官：中等肤色",
      value: "👨🏽‍⚖️",
    },
    {
      name: "男人法官：中深肤色",
      value: "👨🏾‍⚖️",
    },
    {
      name: "男子法官：深肤色",
      value: "👨🏿‍⚖️",
    },
    {
      name: "女法官",
      value: "👩‍⚖️",
    },
    {
      name: "女法官：浅肤色",
      value: "👩🏻‍⚖️",
    },
    {
      name: "女法官：中浅肤色",
      value: "👩🏼‍⚖️",
    },
    {
      name: "女法官：中等肤色",
      value: "👩🏽‍⚖️",
    },
    {
      name: "女法官：中深肤色",
      value: "👩🏾‍⚖️",
    },
    {
      name: "女法官：深肤色",
      value: "👩🏿‍⚖️",
    },
    {
      name: "农民",
      value: "🧑‍🌾",
    },
    {
      name: "农民: 较浅肤色",
      value: "🧑🏻‍🌾",
    },
    {
      name: "农民: 中等-浅肤色",
      value: "🧑🏼‍🌾",
    },
    {
      name: "农民: 中等肤色",
      value: "🧑🏽‍🌾",
    },
    {
      name: "农民: 中等-深肤色",
      value: "🧑🏾‍🌾",
    },
    {
      name: "农民: 较深肤色",
      value: "🧑🏿‍🌾",
    },
    {
      name: "农夫",
      value: "👨‍🌾",
    },
    {
      name: "农夫: 较浅肤色",
      value: "👨🏻‍🌾",
    },
    {
      name: "农夫: 中等-浅肤色",
      value: "👨🏼‍🌾",
    },
    {
      name: "农夫: 中等肤色",
      value: "👨🏽‍🌾",
    },
    {
      name: "农夫: 中等-深肤色",
      value: "👨🏾‍🌾",
    },
    {
      name: "农夫: 较深肤色",
      value: "👨🏿‍🌾",
    },
    {
      name: "农妇",
      value: "👩‍🌾",
    },
    {
      name: "农妇: 较浅肤色",
      value: "👩🏻‍🌾",
    },
    {
      name: "农妇: 中等-浅肤色",
      value: "👩🏼‍🌾",
    },
    {
      name: "农妇: 中等肤色",
      value: "👩🏽‍🌾",
    },
    {
      name: "农妇: 中等-深肤色",
      value: "👩🏾‍🌾",
    },
    {
      name: "农妇: 较深肤色",
      value: "👩🏿‍🌾",
    },
    {
      name: "厨师",
      value: "🧑‍🍳",
    },
    {
      name: "厨师: 较浅肤色",
      value: "🧑🏻‍🍳",
    },
    {
      name: "厨师: 中等-浅肤色",
      value: "🧑🏼‍🍳",
    },
    {
      name: "厨师: 中等肤色",
      value: "🧑🏽‍🍳",
    },
    {
      name: "厨师: 中等-深肤色",
      value: "🧑🏾‍🍳",
    },
    {
      name: "厨师: 较深肤色",
      value: "🧑🏿‍🍳",
    },
    {
      name: "男厨师",
      value: "👨‍🍳",
    },
    {
      name: "男厨师: 较浅肤色",
      value: "👨🏻‍🍳",
    },
    {
      name: "男厨师: 中等-浅肤色",
      value: "👨🏼‍🍳",
    },
    {
      name: "男厨师: 中等肤色",
      value: "👨🏽‍🍳",
    },
    {
      name: "男厨师: 中等-深肤色",
      value: "👨🏾‍🍳",
    },
    {
      name: "男厨师: 较深肤色",
      value: "👨🏿‍🍳",
    },
    {
      name: "女厨师",
      value: "👩‍🍳",
    },
    {
      name: "女厨师: 较浅肤色",
      value: "👩🏻‍🍳",
    },
    {
      name: "女厨师: 中等-浅肤色",
      value: "👩🏼‍🍳",
    },
    {
      name: "女厨师: 中等肤色",
      value: "👩🏽‍🍳",
    },
    {
      name: "女厨师: 中等-深肤色",
      value: "👩🏾‍🍳",
    },
    {
      name: "女厨师: 较深肤色",
      value: "👩🏿‍🍳",
    },
    {
      name: "技工",
      value: "🧑‍🔧",
    },
    {
      name: "技工: 较浅肤色",
      value: "🧑🏻‍🔧",
    },
    {
      name: "技工: 中等-浅肤色",
      value: "🧑🏼‍🔧",
    },
    {
      name: "技工: 中等肤色",
      value: "🧑🏽‍🔧",
    },
    {
      name: "技工: 中等-深肤色",
      value: "🧑🏾‍🔧",
    },
    {
      name: "技工: 较深肤色",
      value: "🧑🏿‍🔧",
    },
    {
      name: "男技工",
      value: "👨‍🔧",
    },
    {
      name: "男技工: 较浅肤色",
      value: "👨🏻‍🔧",
    },
    {
      name: "男技工: 中等-浅肤色",
      value: "👨🏼‍🔧",
    },
    {
      name: "男技工: 中等肤色",
      value: "👨🏽‍🔧",
    },
    {
      name: "男技工: 中等-深肤色",
      value: "👨🏾‍🔧",
    },
    {
      name: "男技工: 较深肤色",
      value: "👨🏿‍🔧",
    },
    {
      name: "女技工",
      value: "👩‍🔧",
    },
    {
      name: "女技工: 较浅肤色",
      value: "👩🏻‍🔧",
    },
    {
      name: "女技工: 中等-浅肤色",
      value: "👩🏼‍🔧",
    },
    {
      name: "女技工: 中等肤色",
      value: "👩🏽‍🔧",
    },
    {
      name: "女技工: 中等-深肤色",
      value: "👩🏾‍🔧",
    },
    {
      name: "女技工: 较深肤色",
      value: "👩🏿‍🔧",
    },
    {
      name: "工人",
      value: "🧑‍🏭",
    },
    {
      name: "工人: 较浅肤色",
      value: "🧑🏻‍🏭",
    },
    {
      name: "工人: 中等-浅肤色",
      value: "🧑🏼‍🏭",
    },
    {
      name: "工人: 中等肤色",
      value: "🧑🏽‍🏭",
    },
    {
      name: "工人: 中等-深肤色",
      value: "🧑🏾‍🏭",
    },
    {
      name: "工人: 较深肤色",
      value: "🧑🏿‍🏭",
    },
    {
      name: "男工人",
      value: "👨‍🏭",
    },
    {
      name: "男工人: 较浅肤色",
      value: "👨🏻‍🏭",
    },
    {
      name: "男工人: 中等-浅肤色",
      value: "👨🏼‍🏭",
    },
    {
      name: "男工人: 中等肤色",
      value: "👨🏽‍🏭",
    },
    {
      name: "男工人: 中等-深肤色",
      value: "👨🏾‍🏭",
    },
    {
      name: "男工人: 较深肤色",
      value: "👨🏿‍🏭",
    },
    {
      name: "女工人",
      value: "👩‍🏭",
    },
    {
      name: "女工人: 较浅肤色",
      value: "👩🏻‍🏭",
    },
    {
      name: "女工人: 中等-浅肤色",
      value: "👩🏼‍🏭",
    },
    {
      name: "女工人: 中等肤色",
      value: "👩🏽‍🏭",
    },
    {
      name: "女工人: 中等-深肤色",
      value: "👩🏾‍🏭",
    },
    {
      name: "女工人: 较深肤色",
      value: "👩🏿‍🏭",
    },
    {
      name: "白领",
      value: "🧑‍💼",
    },
    {
      name: "白领: 较浅肤色",
      value: "🧑🏻‍💼",
    },
    {
      name: "白领: 中等-浅肤色",
      value: "🧑🏼‍💼",
    },
    {
      name: "白领: 中等肤色",
      value: "🧑🏽‍💼",
    },
    {
      name: "白领: 中等-深肤色",
      value: "🧑🏾‍💼",
    },
    {
      name: "白领: 较深肤色",
      value: "🧑🏿‍💼",
    },
    {
      name: "男白领",
      value: "👨‍💼",
    },
    {
      name: "男白领: 较浅肤色",
      value: "👨🏻‍💼",
    },
    {
      name: "男白领: 中等-浅肤色",
      value: "👨🏼‍💼",
    },
    {
      name: "男白领: 中等肤色",
      value: "👨🏽‍💼",
    },
    {
      name: "男白领: 中等-深肤色",
      value: "👨🏾‍💼",
    },
    {
      name: "男白领: 较深肤色",
      value: "👨🏿‍💼",
    },
    {
      name: "女白领",
      value: "👩‍💼",
    },
    {
      name: "女白领: 较浅肤色",
      value: "👩🏻‍💼",
    },
    {
      name: "女白领: 中等-浅肤色",
      value: "👩🏼‍💼",
    },
    {
      name: "女白领: 中等肤色",
      value: "👩🏽‍💼",
    },
    {
      name: "女白领: 中等-深肤色",
      value: "👩🏾‍💼",
    },
    {
      name: "女白领: 较深肤色",
      value: "👩🏿‍💼",
    },
    {
      name: "科学家",
      value: "🧑‍🔬",
    },
    {
      name: "科学家: 较浅肤色",
      value: "🧑🏻‍🔬",
    },
    {
      name: "科学家: 中等-浅肤色",
      value: "🧑🏼‍🔬",
    },
    {
      name: "科学家: 中等肤色",
      value: "🧑🏽‍🔬",
    },
    {
      name: "科学家: 中等-深肤色",
      value: "🧑🏾‍🔬",
    },
    {
      name: "科学家: 较深肤色",
      value: "🧑🏿‍🔬",
    },
    {
      name: "男科学家",
      value: "👨‍🔬",
    },
    {
      name: "男科学家: 较浅肤色",
      value: "👨🏻‍🔬",
    },
    {
      name: "男科学家: 中等-浅肤色",
      value: "👨🏼‍🔬",
    },
    {
      name: "男科学家: 中等肤色",
      value: "👨🏽‍🔬",
    },
    {
      name: "男科学家: 中等-深肤色",
      value: "👨🏾‍🔬",
    },
    {
      name: "男科学家: 较深肤色",
      value: "👨🏿‍🔬",
    },
    {
      name: "女科学家",
      value: "👩‍🔬",
    },
    {
      name: "女科学家: 较浅肤色",
      value: "👩🏻‍🔬",
    },
    {
      name: "女科学家: 中等-浅肤色",
      value: "👩🏼‍🔬",
    },
    {
      name: "女科学家: 中等肤色",
      value: "👩🏽‍🔬",
    },
    {
      name: "女科学家: 中等-深肤色",
      value: "👩🏾‍🔬",
    },
    {
      name: "女科学家: 较深肤色",
      value: "👩🏿‍🔬",
    },
    {
      name: "程序员",
      value: "🧑‍💻",
    },
    {
      name: "程序员: 较浅肤色",
      value: "🧑🏻‍💻",
    },
    {
      name: "程序员: 中等-浅肤色",
      value: "🧑🏼‍💻",
    },
    {
      name: "程序员: 中等肤色",
      value: "🧑🏽‍💻",
    },
    {
      name: "程序员: 中等-深肤色",
      value: "🧑🏾‍💻",
    },
    {
      name: "程序员: 较深肤色",
      value: "🧑🏿‍💻",
    },
    {
      name: "男程序员",
      value: "👨‍💻",
    },
    {
      name: "男程序员: 较浅肤色",
      value: "👨🏻‍💻",
    },
    {
      name: "男程序员: 中等-浅肤色",
      value: "👨🏼‍💻",
    },
    {
      name: "男程序员: 中等肤色",
      value: "👨🏽‍💻",
    },
    {
      name: "男程序员: 中等-深肤色",
      value: "👨🏾‍💻",
    },
    {
      name: "男程序员: 较深肤色",
      value: "👨🏿‍💻",
    },
    {
      name: "女程序员",
      value: "👩‍💻",
    },
    {
      name: "女程序员: 较浅肤色",
      value: "👩🏻‍💻",
    },
    {
      name: "女程序员: 中等-浅肤色",
      value: "👩🏼‍💻",
    },
    {
      name: "女程序员: 中等肤色",
      value: "👩🏽‍💻",
    },
    {
      name: "女程序员: 中等-深肤色",
      value: "👩🏾‍💻",
    },
    {
      name: "女程序员: 较深肤色",
      value: "👩🏿‍💻",
    },
    {
      name: "歌手",
      value: "🧑‍🎤",
    },
    {
      name: "歌手: 较浅肤色",
      value: "🧑🏻‍🎤",
    },
    {
      name: "歌手: 中等-浅肤色",
      value: "🧑🏼‍🎤",
    },
    {
      name: "歌手: 中等肤色",
      value: "🧑🏽‍🎤",
    },
    {
      name: "歌手: 中等-深肤色",
      value: "🧑🏾‍🎤",
    },
    {
      name: "歌手: 较深肤色",
      value: "🧑🏿‍🎤",
    },
    {
      name: "男歌手",
      value: "👨‍🎤",
    },
    {
      name: "男歌手: 较浅肤色",
      value: "👨🏻‍🎤",
    },
    {
      name: "男歌手: 中等-浅肤色",
      value: "👨🏼‍🎤",
    },
    {
      name: "男歌手: 中等肤色",
      value: "👨🏽‍🎤",
    },
    {
      name: "男歌手: 中等-深肤色",
      value: "👨🏾‍🎤",
    },
    {
      name: "男歌手: 较深肤色",
      value: "👨🏿‍🎤",
    },
    {
      name: "女歌手",
      value: "👩‍🎤",
    },
    {
      name: "女歌手: 较浅肤色",
      value: "👩🏻‍🎤",
    },
    {
      name: "女歌手: 中等-浅肤色",
      value: "👩🏼‍🎤",
    },
    {
      name: "女歌手: 中等肤色",
      value: "👩🏽‍🎤",
    },
    {
      name: "女歌手: 中等-深肤色",
      value: "👩🏾‍🎤",
    },
    {
      name: "女歌手: 较深肤色",
      value: "👩🏿‍🎤",
    },
    {
      name: "艺术家",
      value: "🧑‍🎨",
    },
    {
      name: "艺术家: 较浅肤色",
      value: "🧑🏻‍🎨",
    },
    {
      name: "艺术家: 中等-浅肤色",
      value: "🧑🏼‍🎨",
    },
    {
      name: "艺术家: 中等肤色",
      value: "🧑🏽‍🎨",
    },
    {
      name: "艺术家: 中等-深肤色",
      value: "🧑🏾‍🎨",
    },
    {
      name: "艺术家: 较深肤色",
      value: "🧑🏿‍🎨",
    },
    {
      name: "男艺术家",
      value: "👨‍🎨",
    },
    {
      name: "男艺术家: 较浅肤色",
      value: "👨🏻‍🎨",
    },
    {
      name: "男艺术家: 中等-浅肤色",
      value: "👨🏼‍🎨",
    },
    {
      name: "男艺术家: 中等肤色",
      value: "👨🏽‍🎨",
    },
    {
      name: "男艺术家: 中等-深肤色",
      value: "👨🏾‍🎨",
    },
    {
      name: "男艺术家: 较深肤色",
      value: "👨🏿‍🎨",
    },
    {
      name: "女艺术家",
      value: "👩‍🎨",
    },
    {
      name: "女艺术家: 较浅肤色",
      value: "👩🏻‍🎨",
    },
    {
      name: "女艺术家: 中等-浅肤色",
      value: "👩🏼‍🎨",
    },
    {
      name: "女艺术家: 中等肤色",
      value: "👩🏽‍🎨",
    },
    {
      name: "女艺术家: 中等-深肤色",
      value: "👩🏾‍🎨",
    },
    {
      name: "女艺术家: 较深肤色",
      value: "👩🏿‍🎨",
    },
    {
      name: "飞行员",
      value: "🧑‍✈️",
    },
    {
      name: "飞行员: 较浅肤色",
      value: "🧑🏻‍✈️",
    },
    {
      name: "飞行员: 中等-浅肤色",
      value: "🧑🏼‍✈️",
    },
    {
      name: "飞行员: 中等肤色",
      value: "🧑🏽‍✈️",
    },
    {
      name: "飞行员: 中等-深肤色",
      value: "🧑🏾‍✈️",
    },
    {
      name: "飞行员: 较深肤色",
      value: "🧑🏿‍✈️",
    },
    {
      name: "男子飞行员",
      value: "👨‍✈️",
    },
    {
      name: "男人飞行员：浅肤色",
      value: "👨🏻‍✈️",
    },
    {
      name: "男子飞行员：中浅肤色",
      value: "👨🏼‍✈️",
    },
    {
      name: "男子飞行员：中等肤色",
      value: "👨🏽‍✈️",
    },
    {
      name: "男子飞行员：中深肤色",
      value: "👨🏾‍✈️",
    },
    {
      name: "男子飞行员：深肤色",
      value: "👨🏿‍✈️",
    },
    {
      name: "女飞行员",
      value: "👩‍✈️",
    },
    {
      name: "女飞行员：浅肤色",
      value: "👩🏻‍✈️",
    },
    {
      name: "女飞行员：中浅肤色",
      value: "👩🏼‍✈️",
    },
    {
      name: "女飞行员：中等肤色",
      value: "👩🏽‍✈️",
    },
    {
      name: "女飞行员：中深肤色",
      value: "👩🏾‍✈️",
    },
    {
      name: "女飞行员：深肤色",
      value: "👩🏿‍✈️",
    },
    {
      name: "宇航员",
      value: "🧑‍🚀",
    },
    {
      name: "宇航员: 较浅肤色",
      value: "🧑🏻‍🚀",
    },
    {
      name: "宇航员: 中等-浅肤色",
      value: "🧑🏼‍🚀",
    },
    {
      name: "宇航员: 中等肤色",
      value: "🧑🏽‍🚀",
    },
    {
      name: "宇航员: 中等-深肤色",
      value: "🧑🏾‍🚀",
    },
    {
      name: "宇航员: 较深肤色",
      value: "🧑🏿‍🚀",
    },
    {
      name: "男宇航员",
      value: "👨‍🚀",
    },
    {
      name: "男宇航员: 较浅肤色",
      value: "👨🏻‍🚀",
    },
    {
      name: "男宇航员: 中等-浅肤色",
      value: "👨🏼‍🚀",
    },
    {
      name: "男宇航员: 中等肤色",
      value: "👨🏽‍🚀",
    },
    {
      name: "男宇航员: 中等-深肤色",
      value: "👨🏾‍🚀",
    },
    {
      name: "男宇航员: 较深肤色",
      value: "👨🏿‍🚀",
    },
    {
      name: "女宇航员",
      value: "👩‍🚀",
    },
    {
      name: "女宇航员: 较浅肤色",
      value: "👩🏻‍🚀",
    },
    {
      name: "女宇航员: 中等-浅肤色",
      value: "👩🏼‍🚀",
    },
    {
      name: "女宇航员: 中等肤色",
      value: "👩🏽‍🚀",
    },
    {
      name: "女宇航员: 中等-深肤色",
      value: "👩🏾‍🚀",
    },
    {
      name: "女宇航员: 较深肤色",
      value: "👩🏿‍🚀",
    },
    {
      name: "消防员",
      value: "🧑‍🚒",
    },
    {
      name: "消防员: 较浅肤色",
      value: "🧑🏻‍🚒",
    },
    {
      name: "消防员: 中等-浅肤色",
      value: "🧑🏼‍🚒",
    },
    {
      name: "消防员: 中等肤色",
      value: "🧑🏽‍🚒",
    },
    {
      name: "消防员: 中等-深肤色",
      value: "🧑🏾‍🚒",
    },
    {
      name: "消防员: 较深肤色",
      value: "🧑🏿‍🚒",
    },
    {
      name: "男消防员",
      value: "👨‍🚒",
    },
    {
      name: "男消防员: 较浅肤色",
      value: "👨🏻‍🚒",
    },
    {
      name: "男消防员: 中等-浅肤色",
      value: "👨🏼‍🚒",
    },
    {
      name: "男消防员: 中等肤色",
      value: "👨🏽‍🚒",
    },
    {
      name: "男消防员: 中等-深肤色",
      value: "👨🏾‍🚒",
    },
    {
      name: "男消防员: 较深肤色",
      value: "👨🏿‍🚒",
    },
    {
      name: "女消防员",
      value: "👩‍🚒",
    },
    {
      name: "女消防员: 较浅肤色",
      value: "👩🏻‍🚒",
    },
    {
      name: "女消防员: 中等-浅肤色",
      value: "👩🏼‍🚒",
    },
    {
      name: "女消防员: 中等肤色",
      value: "👩🏽‍🚒",
    },
    {
      name: "女消防员: 中等-深肤色",
      value: "👩🏾‍🚒",
    },
    {
      name: "女消防员: 较深肤色",
      value: "👩🏿‍🚒",
    },
    {
      name: "警察",
      value: "👮",
    },
    {
      name: "警察: 较浅肤色",
      value: "👮🏻",
    },
    {
      name: "警察: 中等-浅肤色",
      value: "👮🏼",
    },
    {
      name: "警察: 中等肤色",
      value: "👮🏽",
    },
    {
      name: "警察: 中等-深肤色",
      value: "👮🏾",
    },
    {
      name: "警察: 较深肤色",
      value: "👮🏿",
    },
    {
      name: "男警官",
      value: "👮‍♂️",
    },
    {
      name: "男警官：浅肤色",
      value: "👮🏻‍♂️",
    },
    {
      name: "男警察: 中等-浅肤色",
      value: "👮🏼‍♂️",
    },
    {
      name: "男警官：中等肤色",
      value: "👮🏽‍♂️",
    },
    {
      name: "男警官：中深肤色",
      value: "👮🏾‍♂️",
    },
    {
      name: "男警察: 较深肤色",
      value: "👮🏿‍♂️",
    },
    {
      name: "女警官",
      value: "👮‍♀️",
    },
    {
      name: "女警官：浅肤色",
      value: "👮🏻‍♀️",
    },
    {
      name: "女警官：中浅肤色",
      value: "👮🏼‍♀️",
    },
    {
      name: "女警察: 中等肤色",
      value: "👮🏽‍♀️",
    },
    {
      name: "女警官：中深肤色",
      value: "👮🏾‍♀️",
    },
    {
      name: "女警察: 较深肤色",
      value: "👮🏿‍♀️",
    },
    {
      name: "侦探",
      value: "🕵",
    },
    {
      name: "侦探: 较浅肤色",
      value: "🕵🏻",
    },
    {
      name: "侦探: 中等-浅肤色",
      value: "🕵🏼",
    },
    {
      name: "侦探: 中等肤色",
      value: "🕵🏽",
    },
    {
      name: "侦探: 中等-深肤色",
      value: "🕵🏾",
    },
    {
      name: "侦探: 较深肤色",
      value: "🕵🏿",
    },
    {
      name: "男侦探",
      value: "🕵️‍♂️",
    },
    {
      name: "男侦探：浅肤色",
      value: "🕵🏻‍♂️",
    },
    {
      name: "男侦探：中浅肤色",
      value: "🕵🏼‍♂️",
    },
    {
      name: "男侦探：中等肤色",
      value: "🕵🏽‍♂️",
    },
    {
      name: "男侦探：中深肤色",
      value: "🕵🏾‍♂️",
    },
    {
      name: "男侦探：深肤色",
      value: "🕵🏿‍♂️",
    },
    {
      name: "女侦探",
      value: "🕵️‍♀️",
    },
    {
      name: "女侦探：浅肤色",
      value: "🕵🏻‍♀️",
    },
    {
      name: "女侦探：中浅肤色",
      value: "🕵🏼‍♀️",
    },
    {
      name: "女侦探：中等肤色",
      value: "🕵🏽‍♀️",
    },
    {
      name: "女侦探：中深肤色",
      value: "🕵🏾‍♀️",
    },
    {
      name: "女侦探：深肤色",
      value: "🕵🏿‍♀️",
    },
    {
      name: "卫兵",
      value: "💂",
    },
    {
      name: "卫兵: 较浅肤色",
      value: "💂🏻",
    },
    {
      name: "卫兵: 中等-浅肤色",
      value: "💂🏼",
    },
    {
      name: "卫兵: 中等肤色",
      value: "💂🏽",
    },
    {
      name: "卫兵: 中等-深肤色",
      value: "💂🏾",
    },
    {
      name: "卫兵: 较深肤色",
      value: "💂🏿",
    },
    {
      name: "男警卫",
      value: "💂‍♂️",
    },
    {
      name: "男警卫：浅肤色",
      value: "💂🏻‍♂️",
    },
    {
      name: "男警卫：中浅肤色",
      value: "💂🏼‍♂️",
    },
    {
      name: "男警卫：中等肤色",
      value: "💂🏽‍♂️",
    },
    {
      name: "男警卫：中深肤色",
      value: "💂🏾‍♂️",
    },
    {
      name: "男警卫：深肤色",
      value: "💂🏿‍♂️",
    },
    {
      name: "女警卫",
      value: "💂‍♀️",
    },
    {
      name: "女警卫：浅肤色",
      value: "💂🏻‍♀️",
    },
    {
      name: "女警卫：中浅肤色",
      value: "💂🏼‍♀️",
    },
    {
      name: "女警卫：中等肤色",
      value: "💂🏽‍♀️",
    },
    {
      name: "女警卫：中深肤色",
      value: "💂🏾‍♀️",
    },
    {
      name: "女警卫：深肤色",
      value: "💂🏿‍♀️",
    },
    {
      name: "忍者",
      value: "🥷",
    },
    {
      name: "忍者: 较浅肤色",
      value: "🥷🏻",
    },
    {
      name: "忍者: 中等-浅肤色",
      value: "🥷🏼",
    },
    {
      name: "忍者: 中等肤色",
      value: "🥷🏽",
    },
    {
      name: "忍者: 中等-深肤色",
      value: "🥷🏾",
    },
    {
      name: "忍者: 较深肤色",
      value: "🥷🏿",
    },
    {
      name: "建筑工人",
      value: "👷",
    },
    {
      name: "建筑工人: 较浅肤色",
      value: "👷🏻",
    },
    {
      name: "建筑工人: 中等-浅肤色",
      value: "👷🏼",
    },
    {
      name: "建筑工人: 中等肤色",
      value: "👷🏽",
    },
    {
      name: "建筑工人: 中等-深肤色",
      value: "👷🏾",
    },
    {
      name: "建筑工人: 较深肤色",
      value: "👷🏿",
    },
    {
      name: "男子建筑工人",
      value: "👷‍♂️",
    },
    {
      name: "男人建筑工人：浅肤色",
      value: "👷🏻‍♂️",
    },
    {
      name: "男人建筑工人：中浅肤色",
      value: "👷🏼‍♂️",
    },
    {
      name: "男子建筑工人：中等肤色",
      value: "👷🏽‍♂️",
    },
    {
      name: "男子建筑工人：中深肤色",
      value: "👷🏾‍♂️",
    },
    {
      name: "男子建筑工人：深肤色",
      value: "👷🏿‍♂️",
    },
    {
      name: "女建筑工人",
      value: "👷‍♀️",
    },
    {
      name: "女建筑工人：浅肤色",
      value: "👷🏻‍♀️",
    },
    {
      name: "女建筑工人：中浅肤色",
      value: "👷🏼‍♀️",
    },
    {
      name: "女建筑工人：中等肤色",
      value: "👷🏽‍♀️",
    },
    {
      name: "女建筑工人：中深肤色",
      value: "👷🏾‍♀️",
    },
    {
      name: "女建筑工人：深肤色",
      value: "👷🏿‍♀️",
    },
    {
      name: "王子",
      value: "🤴",
    },
    {
      name: "王子: 较浅肤色",
      value: "🤴🏻",
    },
    {
      name: "王子: 中等-浅肤色",
      value: "🤴🏼",
    },
    {
      name: "王子: 中等肤色",
      value: "🤴🏽",
    },
    {
      name: "王子: 中等-深肤色",
      value: "🤴🏾",
    },
    {
      name: "王子: 较深肤色",
      value: "🤴🏿",
    },
    {
      name: "公主",
      value: "👸",
    },
    {
      name: "公主: 较浅肤色",
      value: "👸🏻",
    },
    {
      name: "公主: 中等-浅肤色",
      value: "👸🏼",
    },
    {
      name: "公主: 中等肤色",
      value: "👸🏽",
    },
    {
      name: "公主: 中等-深肤色",
      value: "👸🏾",
    },
    {
      name: "公主: 较深肤色",
      value: "👸🏿",
    },
    {
      name: "戴头巾的人",
      value: "👳",
    },
    {
      name: "戴头巾的人: 较浅肤色",
      value: "👳🏻",
    },
    {
      name: "戴头巾的人: 中等-浅肤色",
      value: "👳🏼",
    },
    {
      name: "戴头巾的人: 中等肤色",
      value: "👳🏽",
    },
    {
      name: "戴头巾的人: 中等-深肤色",
      value: "👳🏾",
    },
    {
      name: "戴头巾的人: 较深肤色",
      value: "👳🏿",
    },
    {
      name: "男子戴着头巾",
      value: "👳‍♂️",
    },
    {
      name: "男子戴头巾：浅肤色",
      value: "👳🏻‍♂️",
    },
    {
      name: "男士戴头巾：中浅肤色",
      value: "👳🏼‍♂️",
    },
    {
      name: "男士戴头巾：中等肤色",
      value: "👳🏽‍♂️",
    },
    {
      name: "男士戴头巾：中深肤色",
      value: "👳🏾‍♂️",
    },
    {
      name: "男子戴头巾：深肤色",
      value: "👳🏿‍♂️",
    },
    {
      name: "女人戴着头巾",
      value: "👳‍♀️",
    },
    {
      name: "女人戴着头巾：浅肤色",
      value: "👳🏻‍♀️",
    },
    {
      name: "女人戴着头巾：中浅肤色",
      value: "👳🏼‍♀️",
    },
    {
      name: "女人戴着头巾：中等肤色",
      value: "👳🏽‍♀️",
    },
    {
      name: "女人戴着头巾：中深肤色",
      value: "👳🏾‍♀️",
    },
    {
      name: "女人戴着头巾：深肤色",
      value: "👳🏿‍♀️",
    },
    {
      name: "戴瓜皮帽的人",
      value: "👲",
    },
    {
      name: "戴瓜皮帽的人: 较浅肤色",
      value: "👲🏻",
    },
    {
      name: "戴瓜皮帽的人: 中等-浅肤色",
      value: "👲🏼",
    },
    {
      name: "戴瓜皮帽的人: 中等肤色",
      value: "👲🏽",
    },
    {
      name: "戴瓜皮帽的人: 中等-深肤色",
      value: "👲🏾",
    },
    {
      name: "戴瓜皮帽的人: 较深肤色",
      value: "👲🏿",
    },
    {
      name: "带头饰的女人",
      value: "🧕",
    },
    {
      name: "带头饰的女人: 较浅肤色",
      value: "🧕🏻",
    },
    {
      name: "带头饰的女人: 中等-浅肤色",
      value: "🧕🏼",
    },
    {
      name: "带头饰的女人: 中等肤色",
      value: "🧕🏽",
    },
    {
      name: "带头饰的女人: 中等-深肤色",
      value: "🧕🏾",
    },
    {
      name: "带头饰的女人: 较深肤色",
      value: "🧕🏿",
    },
    {
      name: "穿燕尾服的人",
      value: "🤵",
    },
    {
      name: "穿燕尾服的人: 较浅肤色",
      value: "🤵🏻",
    },
    {
      name: "穿燕尾服的人: 中等-浅肤色",
      value: "🤵🏼",
    },
    {
      name: "穿燕尾服的人: 中等肤色",
      value: "🤵🏽",
    },
    {
      name: "穿燕尾服的人: 中等-深肤色",
      value: "🤵🏾",
    },
    {
      name: "穿燕尾服的人: 较深肤色",
      value: "🤵🏿",
    },
    {
      name: "穿礼服的男人",
      value: "🤵‍♂️",
    },
    {
      name: "穿礼服的男人: 较浅肤色",
      value: "🤵🏻‍♂️",
    },
    {
      name: "穿礼服的男人: 中等-浅肤色",
      value: "🤵🏼‍♂️",
    },
    {
      name: "穿礼服的男人: 中等肤色",
      value: "🤵🏽‍♂️",
    },
    {
      name: "穿礼服的男人: 中等-深肤色",
      value: "🤵🏾‍♂️",
    },
    {
      name: "穿礼服的男人: 较深肤色",
      value: "🤵🏿‍♂️",
    },
    {
      name: "穿礼服的女人",
      value: "🤵‍♀️",
    },
    {
      name: "穿礼服的女人: 较浅肤色",
      value: "🤵🏻‍♀️",
    },
    {
      name: "穿礼服的女人: 中等-浅肤色",
      value: "🤵🏼‍♀️",
    },
    {
      name: "穿礼服的女人: 中等肤色",
      value: "🤵🏽‍♀️",
    },
    {
      name: "穿礼服的女人: 中等-深肤色",
      value: "🤵🏾‍♀️",
    },
    {
      name: "穿礼服的女人: 较深肤色",
      value: "🤵🏿‍♀️",
    },
    {
      name: "戴头纱的人",
      value: "👰",
    },
    {
      name: "戴头纱的人: 较浅肤色",
      value: "👰🏻",
    },
    {
      name: "戴头纱的人: 中等-浅肤色",
      value: "👰🏼",
    },
    {
      name: "戴头纱的人: 中等肤色",
      value: "👰🏽",
    },
    {
      name: "戴头纱的人: 中等-深肤色",
      value: "👰🏾",
    },
    {
      name: "戴头纱的人: 较深肤色",
      value: "👰🏿",
    },
    {
      name: "戴头纱的男人",
      value: "👰‍♂️",
    },
    {
      name: "戴头纱的男人: 较浅肤色",
      value: "👰🏻‍♂️",
    },
    {
      name: "戴头纱的男人: 中等-浅肤色",
      value: "👰🏼‍♂️",
    },
    {
      name: "戴头纱的男人: 中等肤色",
      value: "👰🏽‍♂️",
    },
    {
      name: "戴头纱的男人: 中等-深肤色",
      value: "👰🏾‍♂️",
    },
    {
      name: "戴头纱的男人: 较深肤色",
      value: "👰🏿‍♂️",
    },
    {
      name: "戴头纱的女人",
      value: "👰‍♀️",
    },
    {
      name: "戴头纱的女人: 较浅肤色",
      value: "👰🏻‍♀️",
    },
    {
      name: "戴头纱的女人: 中等-浅肤色",
      value: "👰🏼‍♀️",
    },
    {
      name: "戴头纱的女人: 中等肤色",
      value: "👰🏽‍♀️",
    },
    {
      name: "戴头纱的女人: 中等-深肤色",
      value: "👰🏾‍♀️",
    },
    {
      name: "戴头纱的女人: 较深肤色",
      value: "👰🏿‍♀️",
    },
    {
      name: "孕妇",
      value: "🤰",
    },
    {
      name: "孕妇: 较浅肤色",
      value: "🤰🏻",
    },
    {
      name: "孕妇: 中等-浅肤色",
      value: "🤰🏼",
    },
    {
      name: "孕妇: 中等肤色",
      value: "🤰🏽",
    },
    {
      name: "孕妇: 中等-深肤色",
      value: "🤰🏾",
    },
    {
      name: "孕妇: 较深肤色",
      value: "🤰🏿",
    },
    {
      name: "母乳喂养",
      value: "🤱",
    },
    {
      name: "母乳喂养: 较浅肤色",
      value: "🤱🏻",
    },
    {
      name: "母乳喂养: 中等-浅肤色",
      value: "🤱🏼",
    },
    {
      name: "母乳喂养: 中等肤色",
      value: "🤱🏽",
    },
    {
      name: "母乳喂养: 中等-深肤色",
      value: "🤱🏾",
    },
    {
      name: "母乳喂养: 较深肤色",
      value: "🤱🏿",
    },
    {
      name: "哺乳的女人",
      value: "👩‍🍼",
    },
    {
      name: "哺乳的女人: 较浅肤色",
      value: "👩🏻‍🍼",
    },
    {
      name: "哺乳的女人: 中等-浅肤色",
      value: "👩🏼‍🍼",
    },
    {
      name: "哺乳的女人: 中等肤色",
      value: "👩🏽‍🍼",
    },
    {
      name: "哺乳的女人: 中等-深肤色",
      value: "👩🏾‍🍼",
    },
    {
      name: "哺乳的女人: 较深肤色",
      value: "👩🏿‍🍼",
    },
    {
      name: "哺乳的男人",
      value: "👨‍🍼",
    },
    {
      name: "哺乳的男人: 较浅肤色",
      value: "👨🏻‍🍼",
    },
    {
      name: "哺乳的男人: 中等-浅肤色",
      value: "👨🏼‍🍼",
    },
    {
      name: "哺乳的男人: 中等肤色",
      value: "👨🏽‍🍼",
    },
    {
      name: "哺乳的男人: 中等-深肤色",
      value: "👨🏾‍🍼",
    },
    {
      name: "哺乳的男人: 较深肤色",
      value: "👨🏿‍🍼",
    },
    {
      name: "哺乳的人",
      value: "🧑‍🍼",
    },
    {
      name: "哺乳的人: 较浅肤色",
      value: "🧑🏻‍🍼",
    },
    {
      name: "哺乳的人: 中等-浅肤色",
      value: "🧑🏼‍🍼",
    },
    {
      name: "哺乳的人: 中等肤色",
      value: "🧑🏽‍🍼",
    },
    {
      name: "哺乳的人: 中等-深肤色",
      value: "🧑🏾‍🍼",
    },
    {
      name: "哺乳的人: 较深肤色",
      value: "🧑🏿‍🍼",
    },
    {
      name: "小天使",
      value: "👼",
    },
    {
      name: "小天使: 较浅肤色",
      value: "👼🏻",
    },
    {
      name: "小天使: 中等-浅肤色",
      value: "👼🏼",
    },
    {
      name: "小天使: 中等肤色",
      value: "👼🏽",
    },
    {
      name: "小天使: 中等-深肤色",
      value: "👼🏾",
    },
    {
      name: "小天使: 较深肤色",
      value: "👼🏿",
    },
    {
      name: "圣诞老人",
      value: "🎅",
    },
    {
      name: "圣诞老人: 较浅肤色",
      value: "🎅🏻",
    },
    {
      name: "圣诞老人: 中等-浅肤色",
      value: "🎅🏼",
    },
    {
      name: "圣诞老人: 中等肤色",
      value: "🎅🏽",
    },
    {
      name: "圣诞老人: 中等-深肤色",
      value: "🎅🏾",
    },
    {
      name: "圣诞老人: 较深肤色",
      value: "🎅🏿",
    },
    {
      name: "圣诞奶奶",
      value: "🤶",
    },
    {
      name: "圣诞奶奶: 较浅肤色",
      value: "🤶🏻",
    },
    {
      name: "圣诞奶奶: 中等-浅肤色",
      value: "🤶🏼",
    },
    {
      name: "圣诞奶奶: 中等肤色",
      value: "🤶🏽",
    },
    {
      name: "圣诞奶奶: 中等-深肤色",
      value: "🤶🏾",
    },
    {
      name: "圣诞奶奶: 较深肤色",
      value: "🤶🏿",
    },
    {
      name: "圣诞人",
      value: "🧑‍🎄",
    },
    {
      name: "圣诞人: 较浅肤色",
      value: "🧑🏻‍🎄",
    },
    {
      name: "圣诞人: 中等-浅肤色",
      value: "🧑🏼‍🎄",
    },
    {
      name: "圣诞人: 中等肤色",
      value: "🧑🏽‍🎄",
    },
    {
      name: "圣诞人: 中等-深肤色",
      value: "🧑🏾‍🎄",
    },
    {
      name: "圣诞人: 较深肤色",
      value: "🧑🏿‍🎄",
    },
    {
      name: "超级英雄",
      value: "🦸",
    },
    {
      name: "超级英雄: 较浅肤色",
      value: "🦸🏻",
    },
    {
      name: "超级英雄: 中等-浅肤色",
      value: "🦸🏼",
    },
    {
      name: "超级英雄: 中等肤色",
      value: "🦸🏽",
    },
    {
      name: "超级英雄: 中等-深肤色",
      value: "🦸🏾",
    },
    {
      name: "超级英雄: 较深肤色",
      value: "🦸🏿",
    },
    {
      name: "男超级英雄",
      value: "🦸‍♂️",
    },
    {
      name: "男超级英雄：浅肤色",
      value: "🦸🏻‍♂️",
    },
    {
      name: "男超级英雄：中浅肤色",
      value: "🦸🏼‍♂️",
    },
    {
      name: "男超级英雄：中等肤色",
      value: "🦸🏽‍♂️",
    },
    {
      name: "男超级英雄：中深肤色",
      value: "🦸🏾‍♂️",
    },
    {
      name: "男超级英雄：深肤色",
      value: "🦸🏿‍♂️",
    },
    {
      name: "女超级英雄",
      value: "🦸‍♀️",
    },
    {
      name: "女超级英雄：浅肤色",
      value: "🦸🏻‍♀️",
    },
    {
      name: "女超级英雄：中浅肤色",
      value: "🦸🏼‍♀️",
    },
    {
      name: "女超级英雄：中等肤色",
      value: "🦸🏽‍♀️",
    },
    {
      name: "女超级英雄：中深肤色",
      value: "🦸🏾‍♀️",
    },
    {
      name: "女超级英雄：深肤色",
      value: "🦸🏿‍♀️",
    },
    {
      name: "超级大坏蛋",
      value: "🦹",
    },
    {
      name: "超级大坏蛋: 较浅肤色",
      value: "🦹🏻",
    },
    {
      name: "超级大坏蛋: 中等-浅肤色",
      value: "🦹🏼",
    },
    {
      name: "超级大坏蛋: 中等肤色",
      value: "🦹🏽",
    },
    {
      name: "超级大坏蛋: 中等-深肤色",
      value: "🦹🏾",
    },
    {
      name: "超级大坏蛋: 较深肤色",
      value: "🦹🏿",
    },
    {
      name: "男超级反派",
      value: "🦹‍♂️",
    },
    {
      name: "男超级反派：浅肤色",
      value: "🦹🏻‍♂️",
    },
    {
      name: "男超级反派：中浅肤色",
      value: "🦹🏼‍♂️",
    },
    {
      name: "男超级反派：中等肤色",
      value: "🦹🏽‍♂️",
    },
    {
      name: "男超级反派：中深肤色",
      value: "🦹🏾‍♂️",
    },
    {
      name: "男超级反派：深肤色",
      value: "🦹🏿‍♂️",
    },
    {
      name: "女超级反派",
      value: "🦹‍♀️",
    },
    {
      name: "女超级反派：浅肤色",
      value: "🦹🏻‍♀️",
    },
    {
      name: "女超级反派：中浅肤色",
      value: "🦹🏼‍♀️",
    },
    {
      name: "女超级反派：中等肤色",
      value: "🦹🏽‍♀️",
    },
    {
      name: "女超级反派：中深肤色",
      value: "🦹🏾‍♀️",
    },
    {
      name: "女超级反派：深肤色",
      value: "🦹🏿‍♀️",
    },
    {
      name: "法师",
      value: "🧙",
    },
    {
      name: "法师: 较浅肤色",
      value: "🧙🏻",
    },
    {
      name: "法师: 中等-浅肤色",
      value: "🧙🏼",
    },
    {
      name: "法师: 中等肤色",
      value: "🧙🏽",
    },
    {
      name: "法师: 中等-深肤色",
      value: "🧙🏾",
    },
    {
      name: "法师: 较深肤色",
      value: "🧙🏿",
    },
    {
      name: "男法师",
      value: "🧙‍♂️",
    },
    {
      name: "男法师：浅肤色",
      value: "🧙🏻‍♂️",
    },
    {
      name: "男法师：中浅肤色",
      value: "🧙🏼‍♂️",
    },
    {
      name: "男法师：中等肤色",
      value: "🧙🏽‍♂️",
    },
    {
      name: "男法师：中深肤色",
      value: "🧙🏾‍♂️",
    },
    {
      name: "男法师：深肤色",
      value: "🧙🏿‍♂️",
    },
    {
      name: "女法师",
      value: "🧙‍♀️",
    },
    {
      name: "女法师：浅肤色",
      value: "🧙🏻‍♀️",
    },
    {
      name: "女法师：中浅肤色",
      value: "🧙🏼‍♀️",
    },
    {
      name: "女法师：中等肤色",
      value: "🧙🏽‍♀️",
    },
    {
      name: "女法师：中深肤色",
      value: "🧙🏾‍♀️",
    },
    {
      name: "女法师：深肤色",
      value: "🧙🏿‍♀️",
    },
    {
      name: "精灵",
      value: "🧚",
    },
    {
      name: "精灵: 较浅肤色",
      value: "🧚🏻",
    },
    {
      name: "精灵: 中等-浅肤色",
      value: "🧚🏼",
    },
    {
      name: "精灵: 中等肤色",
      value: "🧚🏽",
    },
    {
      name: "精灵: 中等-深肤色",
      value: "🧚🏾",
    },
    {
      name: "精灵: 较深肤色",
      value: "🧚🏿",
    },
    {
      name: "男仙子",
      value: "🧚‍♂️",
    },
    {
      name: "男仙子：浅肤色",
      value: "🧚🏻‍♂️",
    },
    {
      name: "男仙子：中浅肤色",
      value: "🧚🏼‍♂️",
    },
    {
      name: "男仙子：中等肤色",
      value: "🧚🏽‍♂️",
    },
    {
      name: "男仙子：中深肤色",
      value: "🧚🏾‍♂️",
    },
    {
      name: "男仙子：深肤色",
      value: "🧚🏿‍♂️",
    },
    {
      name: "女仙子",
      value: "🧚‍♀️",
    },
    {
      name: "女仙子：浅肤色",
      value: "🧚🏻‍♀️",
    },
    {
      name: "女仙子：中浅肤色",
      value: "🧚🏼‍♀️",
    },
    {
      name: "女仙子：中等肤色",
      value: "🧚🏽‍♀️",
    },
    {
      name: "女仙子：中深肤色",
      value: "🧚🏾‍♀️",
    },
    {
      name: "女仙子：深肤色",
      value: "🧚🏿‍♀️",
    },
    {
      name: "吸血鬼",
      value: "🧛",
    },
    {
      name: "吸血鬼: 较浅肤色",
      value: "🧛🏻",
    },
    {
      name: "吸血鬼: 中等-浅肤色",
      value: "🧛🏼",
    },
    {
      name: "吸血鬼: 中等肤色",
      value: "🧛🏽",
    },
    {
      name: "吸血鬼: 中等-深肤色",
      value: "🧛🏾",
    },
    {
      name: "吸血鬼: 较深肤色",
      value: "🧛🏿",
    },
    {
      name: "男吸血鬼",
      value: "🧛‍♂️",
    },
    {
      name: "男吸血鬼：浅肤色",
      value: "🧛🏻‍♂️",
    },
    {
      name: "男吸血鬼：中浅肤色",
      value: "🧛🏼‍♂️",
    },
    {
      name: "男吸血鬼：中等肤色",
      value: "🧛🏽‍♂️",
    },
    {
      name: "男吸血鬼：中深肤色",
      value: "🧛🏾‍♂️",
    },
    {
      name: "男吸血鬼：深肤色",
      value: "🧛🏿‍♂️",
    },
    {
      name: "女吸血鬼",
      value: "🧛‍♀️",
    },
    {
      name: "女吸血鬼：浅肤色",
      value: "🧛🏻‍♀️",
    },
    {
      name: "女吸血鬼：中浅肤色",
      value: "🧛🏼‍♀️",
    },
    {
      name: "女吸血鬼：中等肤色",
      value: "🧛🏽‍♀️",
    },
    {
      name: "女吸血鬼：中深肤色",
      value: "🧛🏾‍♀️",
    },
    {
      name: "女吸血鬼：深肤色",
      value: "🧛🏿‍♀️",
    },
    {
      name: "人鱼",
      value: "🧜",
    },
    {
      name: "人鱼: 较浅肤色",
      value: "🧜🏻",
    },
    {
      name: "人鱼: 中等-浅肤色",
      value: "🧜🏼",
    },
    {
      name: "人鱼: 中等肤色",
      value: "🧜🏽",
    },
    {
      name: "人鱼: 中等-深肤色",
      value: "🧜🏾",
    },
    {
      name: "人鱼: 较深肤色",
      value: "🧜🏿",
    },
    {
      name: "男人鱼",
      value: "🧜‍♂️",
    },
    {
      name: "男人鱼：浅肤色",
      value: "🧜🏻‍♂️",
    },
    {
      name: "男人鱼：中浅肤色",
      value: "🧜🏼‍♂️",
    },
    {
      name: "男人鱼：中等肤色",
      value: "🧜🏽‍♂️",
    },
    {
      name: "男人鱼：中深肤色",
      value: "🧜🏾‍♂️",
    },
    {
      name: "男人鱼：深肤色",
      value: "🧜🏿‍♂️",
    },
    {
      name: "美人鱼",
      value: "🧜‍♀️",
    },
    {
      name: "美人鱼：浅肤色",
      value: "🧜🏻‍♀️",
    },
    {
      name: "美人鱼：中浅肤色",
      value: "🧜🏼‍♀️",
    },
    {
      name: "美人鱼：中等肤色",
      value: "🧜🏽‍♀️",
    },
    {
      name: "美人鱼：中深肤色",
      value: "🧜🏾‍♀️",
    },
    {
      name: "美人鱼：深肤色",
      value: "🧜🏿‍♀️",
    },
    {
      name: "小精灵",
      value: "🧝",
    },
    {
      name: "小精灵: 较浅肤色",
      value: "🧝🏻",
    },
    {
      name: "小精灵: 中等-浅肤色",
      value: "🧝🏼",
    },
    {
      name: "小精灵: 中等肤色",
      value: "🧝🏽",
    },
    {
      name: "小精灵: 中等-深肤色",
      value: "🧝🏾",
    },
    {
      name: "小精灵: 较深肤色",
      value: "🧝🏿",
    },
    {
      name: "男精灵",
      value: "🧝‍♂️",
    },
    {
      name: "男精灵：浅肤色",
      value: "🧝🏻‍♂️",
    },
    {
      name: "男精灵：中浅肤色",
      value: "🧝🏼‍♂️",
    },
    {
      name: "男精灵：中等肤色",
      value: "🧝🏽‍♂️",
    },
    {
      name: "男精灵：中深肤色",
      value: "🧝🏾‍♂️",
    },
    {
      name: "男精灵：深肤色",
      value: "🧝🏿‍♂️",
    },
    {
      name: "女精灵",
      value: "🧝‍♀️",
    },
    {
      name: "女精灵：浅肤色",
      value: "🧝🏻‍♀️",
    },
    {
      name: "女精灵：中浅肤色",
      value: "🧝🏼‍♀️",
    },
    {
      name: "女精灵：中等肤色",
      value: "🧝🏽‍♀️",
    },
    {
      name: "女精灵：中深肤色",
      value: "🧝🏾‍♀️",
    },
    {
      name: "女精灵：深肤色",
      value: "🧝🏿‍♀️",
    },
    {
      name: "妖怪",
      value: "🧞",
    },
    {
      name: "男人精灵",
      value: "🧞‍♂️",
    },
    {
      name: "女人精灵",
      value: "🧞‍♀️",
    },
    {
      name: "僵尸",
      value: "🧟",
    },
    {
      name: "男人僵尸",
      value: "🧟‍♂️",
    },
    {
      name: "女人僵尸",
      value: "🧟‍♀️",
    },
    {
      name: "按摩",
      value: "💆",
    },
    {
      name: "按摩: 较浅肤色",
      value: "💆🏻",
    },
    {
      name: "按摩: 中等-浅肤色",
      value: "💆🏼",
    },
    {
      name: "按摩: 中等肤色",
      value: "💆🏽",
    },
    {
      name: "按摩: 中等-深肤色",
      value: "💆🏾",
    },
    {
      name: "按摩: 较深肤色",
      value: "💆🏿",
    },
    {
      name: "男人接受按摩",
      value: "💆‍♂️",
    },
    {
      name: "男人接受按摩：浅肤色",
      value: "💆🏻‍♂️",
    },
    {
      name: "男人接受按摩：中浅肤色",
      value: "💆🏼‍♂️",
    },
    {
      name: "男人接受按摩：中等肤色",
      value: "💆🏽‍♂️",
    },
    {
      name: "男人接受按摩：中深肤色",
      value: "💆🏾‍♂️",
    },
    {
      name: "男人接受按摩：深肤色",
      value: "💆🏿‍♂️",
    },
    {
      name: "女人接受按摩",
      value: "💆‍♀️",
    },
    {
      name: "女人接受按摩：浅肤色",
      value: "💆🏻‍♀️",
    },
    {
      name: "女人接受按摩：中浅肤色",
      value: "💆🏼‍♀️",
    },
    {
      name: "女人接受按摩：中等肤色",
      value: "💆🏽‍♀️",
    },
    {
      name: "女人接受按摩：中深肤色",
      value: "💆🏾‍♀️",
    },
    {
      name: "女人接受按摩：深肤色",
      value: "💆🏿‍♀️",
    },
    {
      name: "理发",
      value: "💇",
    },
    {
      name: "理发: 较浅肤色",
      value: "💇🏻",
    },
    {
      name: "理发: 中等-浅肤色",
      value: "💇🏼",
    },
    {
      name: "理发: 中等肤色",
      value: "💇🏽",
    },
    {
      name: "理发: 中等-深肤色",
      value: "💇🏾",
    },
    {
      name: "理发: 较深肤色",
      value: "💇🏿",
    },
    {
      name: "男人理发",
      value: "💇‍♂️",
    },
    {
      name: "男士理发：浅肤色",
      value: "💇🏻‍♂️",
    },
    {
      name: "男士理发：中浅肤色",
      value: "💇🏼‍♂️",
    },
    {
      name: "男士理发：中等肤色",
      value: "💇🏽‍♂️",
    },
    {
      name: "男士理发：中深肤色",
      value: "💇🏾‍♂️",
    },
    {
      name: "男士理发：深肤色",
      value: "💇🏿‍♂️",
    },
    {
      name: "女人理发",
      value: "💇‍♀️",
    },
    {
      name: "女人理发：浅肤色",
      value: "💇🏻‍♀️",
    },
    {
      name: "女人理发：中浅肤色",
      value: "💇🏼‍♀️",
    },
    {
      name: "女人理发：中等肤色",
      value: "💇🏽‍♀️",
    },
    {
      name: "女人理发：中深肤色",
      value: "💇🏾‍♀️",
    },
    {
      name: "女人理发：深肤色",
      value: "💇🏿‍♀️",
    },
    {
      name: "行人",
      value: "🚶",
    },
    {
      name: "行人: 较浅肤色",
      value: "🚶🏻",
    },
    {
      name: "行人: 中等-浅肤色",
      value: "🚶🏼",
    },
    {
      name: "行人: 中等肤色",
      value: "🚶🏽",
    },
    {
      name: "行人: 中等-深肤色",
      value: "🚶🏾",
    },
    {
      name: "行人: 较深肤色",
      value: "🚶🏿",
    },
    {
      name: "男人走路",
      value: "🚶‍♂️",
    },
    {
      name: "男人走路：浅肤色",
      value: "🚶🏻‍♂️",
    },
    {
      name: "男子走路：中浅肤色",
      value: "🚶🏼‍♂️",
    },
    {
      name: "男子走路：中等肤色",
      value: "🚶🏽‍♂️",
    },
    {
      name: "男子走路：中深肤色",
      value: "🚶🏾‍♂️",
    },
    {
      name: "男子走路：深肤色",
      value: "🚶🏿‍♂️",
    },
    {
      name: "女人走路",
      value: "🚶‍♀️",
    },
    {
      name: "女人走路：浅肤色",
      value: "🚶🏻‍♀️",
    },
    {
      name: "女人走路：中浅肤色",
      value: "🚶🏼‍♀️",
    },
    {
      name: "女人走路：中等肤色",
      value: "🚶🏽‍♀️",
    },
    {
      name: "女人走路：中深肤色",
      value: "🚶🏾‍♀️",
    },
    {
      name: "女人走路：深肤色",
      value: "🚶🏿‍♀️",
    },
    {
      name: "站立者",
      value: "🧍",
    },
    {
      name: "站立者: 较浅肤色",
      value: "🧍🏻",
    },
    {
      name: "站立者: 中等-浅肤色",
      value: "🧍🏼",
    },
    {
      name: "站立者: 中等肤色",
      value: "🧍🏽",
    },
    {
      name: "站立者: 中等-深肤色",
      value: "🧍🏾",
    },
    {
      name: "站立者: 较深肤色",
      value: "🧍🏿",
    },
    {
      name: "男人站立",
      value: "🧍‍♂️",
    },
    {
      name: "男人站立：浅肤色",
      value: "🧍🏻‍♂️",
    },
    {
      name: "男人站立：中浅肤色",
      value: "🧍🏼‍♂️",
    },
    {
      name: "男人站立：中等肤色",
      value: "🧍🏽‍♂️",
    },
    {
      name: "男人站立：中深肤色",
      value: "🧍🏾‍♂️",
    },
    {
      name: "男人站立：深肤色",
      value: "🧍🏿‍♂️",
    },
    {
      name: "女人站立",
      value: "🧍‍♀️",
    },
    {
      name: "女人站立：浅肤色",
      value: "🧍🏻‍♀️",
    },
    {
      name: "女人站立：中浅肤色",
      value: "🧍🏼‍♀️",
    },
    {
      name: "女人站立：中等肤色",
      value: "🧍🏽‍♀️",
    },
    {
      name: "女人站立：中深肤色",
      value: "🧍🏾‍♀️",
    },
    {
      name: "女人站立：深肤色",
      value: "🧍🏿‍♀️",
    },
    {
      name: "下跪者",
      value: "🧎",
    },
    {
      name: "下跪者: 较浅肤色",
      value: "🧎🏻",
    },
    {
      name: "下跪者: 中等-浅肤色",
      value: "🧎🏼",
    },
    {
      name: "下跪者: 中等肤色",
      value: "🧎🏽",
    },
    {
      name: "下跪者: 中等-深肤色",
      value: "🧎🏾",
    },
    {
      name: "下跪者: 较深肤色",
      value: "🧎🏿",
    },
    {
      name: "男人跪着",
      value: "🧎‍♂️",
    },
    {
      name: "男人跪着：浅肤色",
      value: "🧎🏻‍♂️",
    },
    {
      name: "男子跪着：中浅肤色",
      value: "🧎🏼‍♂️",
    },
    {
      name: "男人跪着：中等肤色",
      value: "🧎🏽‍♂️",
    },
    {
      name: "男子跪着：中深肤色",
      value: "🧎🏾‍♂️",
    },
    {
      name: "男子跪着：深肤色",
      value: "🧎🏿‍♂️",
    },
    {
      name: "女人跪着",
      value: "🧎‍♀️",
    },
    {
      name: "女人跪着：浅肤色",
      value: "🧎🏻‍♀️",
    },
    {
      name: "女人跪着：中浅肤色",
      value: "🧎🏼‍♀️",
    },
    {
      name: "女人跪着：中等肤色",
      value: "🧎🏽‍♀️",
    },
    {
      name: "女人跪着：中深肤色",
      value: "🧎🏾‍♀️",
    },
    {
      name: "女人跪着：深肤色",
      value: "🧎🏿‍♀️",
    },
    {
      name: "拄盲杖的人",
      value: "🧑‍🦯",
    },
    {
      name: "拄盲杖的人: 较浅肤色",
      value: "🧑🏻‍🦯",
    },
    {
      name: "拄盲杖的人: 中等-浅肤色",
      value: "🧑🏼‍🦯",
    },
    {
      name: "拄盲杖的人: 中等肤色",
      value: "🧑🏽‍🦯",
    },
    {
      name: "拄盲杖的人: 中等-深肤色",
      value: "🧑🏾‍🦯",
    },
    {
      name: "拄盲杖的人: 较深肤色",
      value: "🧑🏿‍🦯",
    },
    {
      name: "拄盲杖的男人",
      value: "👨‍🦯",
    },
    {
      name: "拄盲杖的男人: 较浅肤色",
      value: "👨🏻‍🦯",
    },
    {
      name: "拄盲杖的男人: 中等-浅肤色",
      value: "👨🏼‍🦯",
    },
    {
      name: "拄盲杖的男人: 中等肤色",
      value: "👨🏽‍🦯",
    },
    {
      name: "拄盲杖的男人: 中等-深肤色",
      value: "👨🏾‍🦯",
    },
    {
      name: "拄盲杖的男人: 较深肤色",
      value: "👨🏿‍🦯",
    },
    {
      name: "拄盲杖的女人",
      value: "👩‍🦯",
    },
    {
      name: "拄盲杖的女人: 较浅肤色",
      value: "👩🏻‍🦯",
    },
    {
      name: "拄盲杖的女人: 中等-浅肤色",
      value: "👩🏼‍🦯",
    },
    {
      name: "拄盲杖的女人: 中等肤色",
      value: "👩🏽‍🦯",
    },
    {
      name: "拄盲杖的女人: 中等-深肤色",
      value: "👩🏾‍🦯",
    },
    {
      name: "拄盲杖的女人: 较深肤色",
      value: "👩🏿‍🦯",
    },
    {
      name: "坐电动轮椅的人",
      value: "🧑‍🦼",
    },
    {
      name: "坐电动轮椅的人: 较浅肤色",
      value: "🧑🏻‍🦼",
    },
    {
      name: "坐电动轮椅的人: 中等-浅肤色",
      value: "🧑🏼‍🦼",
    },
    {
      name: "坐电动轮椅的人: 中等肤色",
      value: "🧑🏽‍🦼",
    },
    {
      name: "坐电动轮椅的人: 中等-深肤色",
      value: "🧑🏾‍🦼",
    },
    {
      name: "坐电动轮椅的人: 较深肤色",
      value: "🧑🏿‍🦼",
    },
    {
      name: "坐电动轮椅的男人",
      value: "👨‍🦼",
    },
    {
      name: "坐电动轮椅的男人: 较浅肤色",
      value: "👨🏻‍🦼",
    },
    {
      name: "坐电动轮椅的男人: 中等-浅肤色",
      value: "👨🏼‍🦼",
    },
    {
      name: "坐电动轮椅的男人: 中等肤色",
      value: "👨🏽‍🦼",
    },
    {
      name: "坐电动轮椅的男人: 中等-深肤色",
      value: "👨🏾‍🦼",
    },
    {
      name: "坐电动轮椅的男人: 较深肤色",
      value: "👨🏿‍🦼",
    },
    {
      name: "坐电动轮椅的女人",
      value: "👩‍🦼",
    },
    {
      name: "坐电动轮椅的女人: 较浅肤色",
      value: "👩🏻‍🦼",
    },
    {
      name: "坐电动轮椅的女人: 中等-浅肤色",
      value: "👩🏼‍🦼",
    },
    {
      name: "坐电动轮椅的女人: 中等肤色",
      value: "👩🏽‍🦼",
    },
    {
      name: "坐电动轮椅的女人: 中等-深肤色",
      value: "👩🏾‍🦼",
    },
    {
      name: "坐电动轮椅的女人: 较深肤色",
      value: "👩🏿‍🦼",
    },
    {
      name: "坐手动轮椅的人",
      value: "🧑‍🦽",
    },
    {
      name: "坐手动轮椅的人: 较浅肤色",
      value: "🧑🏻‍🦽",
    },
    {
      name: "坐手动轮椅的人: 中等-浅肤色",
      value: "🧑🏼‍🦽",
    },
    {
      name: "坐手动轮椅的人: 中等肤色",
      value: "🧑🏽‍🦽",
    },
    {
      name: "坐手动轮椅的人: 中等-深肤色",
      value: "🧑🏾‍🦽",
    },
    {
      name: "坐手动轮椅的人: 较深肤色",
      value: "🧑🏿‍🦽",
    },
    {
      name: "坐手动轮椅的男人",
      value: "👨‍🦽",
    },
    {
      name: "坐手动轮椅的男人: 较浅肤色",
      value: "👨🏻‍🦽",
    },
    {
      name: "坐手动轮椅的男人: 中等-浅肤色",
      value: "👨🏼‍🦽",
    },
    {
      name: "坐手动轮椅的男人: 中等肤色",
      value: "👨🏽‍🦽",
    },
    {
      name: "坐手动轮椅的男人: 中等-深肤色",
      value: "👨🏾‍🦽",
    },
    {
      name: "坐手动轮椅的男人: 较深肤色",
      value: "👨🏿‍🦽",
    },
    {
      name: "坐手动轮椅的女人",
      value: "👩‍🦽",
    },
    {
      name: "坐手动轮椅的女人: 较浅肤色",
      value: "👩🏻‍🦽",
    },
    {
      name: "坐手动轮椅的女人: 中等-浅肤色",
      value: "👩🏼‍🦽",
    },
    {
      name: "坐手动轮椅的女人: 中等肤色",
      value: "👩🏽‍🦽",
    },
    {
      name: "坐手动轮椅的女人: 中等-深肤色",
      value: "👩🏾‍🦽",
    },
    {
      name: "坐手动轮椅的女人: 较深肤色",
      value: "👩🏿‍🦽",
    },
    {
      name: "跑步者",
      value: "🏃",
    },
    {
      name: "跑步者: 较浅肤色",
      value: "🏃🏻",
    },
    {
      name: "跑步者: 中等-浅肤色",
      value: "🏃🏼",
    },
    {
      name: "跑步者: 中等肤色",
      value: "🏃🏽",
    },
    {
      name: "跑步者: 中等-深肤色",
      value: "🏃🏾",
    },
    {
      name: "跑步者: 较深肤色",
      value: "🏃🏿",
    },
    {
      name: "跑步的男人",
      value: "🏃‍♂️",
    },
    {
      name: "跑步的男人：浅肤色",
      value: "🏃🏻‍♂️",
    },
    {
      name: "跑步的男人：中浅肤色",
      value: "🏃🏼‍♂️",
    },
    {
      name: "跑步的男人：中等肤色",
      value: "🏃🏽‍♂️",
    },
    {
      name: "跑步的男人：中深肤色",
      value: "🏃🏾‍♂️",
    },
    {
      name: "跑步的男人：深肤色",
      value: "🏃🏿‍♂️",
    },
    {
      name: "跑步的女人",
      value: "🏃‍♀️",
    },
    {
      name: "跑步的女人：浅肤色",
      value: "🏃🏻‍♀️",
    },
    {
      name: "跑步的女人：中浅肤色",
      value: "🏃🏼‍♀️",
    },
    {
      name: "跑步的女人：中等肤色",
      value: "🏃🏽‍♀️",
    },
    {
      name: "跑步的女人：中深肤色",
      value: "🏃🏾‍♀️",
    },
    {
      name: "跑步的女人：深肤色",
      value: "🏃🏿‍♀️",
    },
    {
      name: "跳舞的女人",
      value: "💃",
    },
    {
      name: "跳舞的女人: 较浅肤色",
      value: "💃🏻",
    },
    {
      name: "跳舞的女人: 中等-浅肤色",
      value: "💃🏼",
    },
    {
      name: "跳舞的女人: 中等肤色",
      value: "💃🏽",
    },
    {
      name: "跳舞的女人: 中等-深肤色",
      value: "💃🏾",
    },
    {
      name: "跳舞的女人: 较深肤色",
      value: "💃🏿",
    },
    {
      name: "跳舞的男人",
      value: "🕺",
    },
    {
      name: "跳舞的男人: 较浅肤色",
      value: "🕺🏻",
    },
    {
      name: "跳舞的男人: 中等-浅肤色",
      value: "🕺🏼",
    },
    {
      name: "跳舞的男人: 中等肤色",
      value: "🕺🏽",
    },
    {
      name: "跳舞的男人: 中等-深肤色",
      value: "🕺🏾",
    },
    {
      name: "跳舞的男人: 较深肤色",
      value: "🕺🏿",
    },
    {
      name: "西装革履的人",
      value: "🕴",
    },
    {
      name: "西装革履的人: 较浅肤色",
      value: "🕴🏻",
    },
    {
      name: "西装革履的人: 中等-浅肤色",
      value: "🕴🏼",
    },
    {
      name: "西装革履的人: 中等肤色",
      value: "🕴🏽",
    },
    {
      name: "西装革履的人: 中等-深肤色",
      value: "🕴🏾",
    },
    {
      name: "西装革履的人: 较深肤色",
      value: "🕴🏿",
    },
    {
      name: "戴兔耳朵的人",
      value: "👯",
    },
    {
      name: "戴兔子耳朵的男人们",
      value: "👯‍♂️",
    },
    {
      name: "戴兔子耳朵的女人们",
      value: "👯‍♀️",
    },
    {
      name: "蒸房里的人",
      value: "🧖",
    },
    {
      name: "蒸房里的人: 较浅肤色",
      value: "🧖🏻",
    },
    {
      name: "蒸房里的人: 中等-浅肤色",
      value: "🧖🏼",
    },
    {
      name: "蒸房里的人: 中等肤色",
      value: "🧖🏽",
    },
    {
      name: "蒸房里的人: 中等-深肤色",
      value: "🧖🏾",
    },
    {
      name: "蒸房里的人: 较深肤色",
      value: "🧖🏿",
    },
    {
      name: "蒸汽房间里的男人",
      value: "🧖‍♂️",
    },
    {
      name: "蒸汽房间里的男人：浅肤色",
      value: "🧖🏻‍♂️",
    },
    {
      name: "蒸汽房间里的男人：中浅肤色",
      value: "🧖🏼‍♂️",
    },
    {
      name: "蒸汽房间里的男人：中等肤色",
      value: "🧖🏽‍♂️",
    },
    {
      name: "蒸汽房间里的男人：中深肤色",
      value: "🧖🏾‍♂️",
    },
    {
      name: "蒸汽房间里的男人：深肤色",
      value: "🧖🏿‍♂️",
    },
    {
      name: "蒸汽房间里的女人",
      value: "🧖‍♀️",
    },
    {
      name: "蒸汽房间里的女人：浅肤色",
      value: "🧖🏻‍♀️",
    },
    {
      name: "蒸汽房间里的女人：中浅肤色",
      value: "🧖🏼‍♀️",
    },
    {
      name: "蒸汽房间里的女人：中等肤色",
      value: "🧖🏽‍♀️",
    },
    {
      name: "蒸汽房间里的女人：中深肤色",
      value: "🧖🏾‍♀️",
    },
    {
      name: "蒸汽房间里的女人：深肤色",
      value: "🧖🏿‍♀️",
    },
    {
      name: "攀爬的人",
      value: "🧗",
    },
    {
      name: "攀爬的人: 较浅肤色",
      value: "🧗🏻",
    },
    {
      name: "攀爬的人: 中等-浅肤色",
      value: "🧗🏼",
    },
    {
      name: "攀爬的人: 中等肤色",
      value: "🧗🏽",
    },
    {
      name: "攀爬的人: 中等-深肤色",
      value: "🧗🏾",
    },
    {
      name: "攀爬的人: 较深肤色",
      value: "🧗🏿",
    },
    {
      name: "男子攀爬",
      value: "🧗‍♂️",
    },
    {
      name: "男子攀爬：浅肤色",
      value: "🧗🏻‍♂️",
    },
    {
      name: "男子攀爬：中浅肤色",
      value: "🧗🏼‍♂️",
    },
    {
      name: "男子攀爬：中等肤色",
      value: "🧗🏽‍♂️",
    },
    {
      name: "男子攀爬：中深肤色",
      value: "🧗🏾‍♂️",
    },
    {
      name: "男子攀爬：深肤色",
      value: "🧗🏿‍♂️",
    },
    {
      name: "女人攀爬",
      value: "🧗‍♀️",
    },
    {
      name: "女子攀爬：浅肤色",
      value: "🧗🏻‍♀️",
    },
    {
      name: "女子攀爬：中浅肤色",
      value: "🧗🏼‍♀️",
    },
    {
      name: "女子攀爬：中等肤色",
      value: "🧗🏽‍♀️",
    },
    {
      name: "女子攀爬：中深肤色",
      value: "🧗🏾‍♀️",
    },
    {
      name: "女子攀爬：深肤色",
      value: "🧗🏿‍♀️",
    },
    {
      name: "击剑选手",
      value: "🤺",
    },
    {
      name: "赛马",
      value: "🏇",
    },
    {
      name: "赛马: 较浅肤色",
      value: "🏇🏻",
    },
    {
      name: "赛马: 中等-浅肤色",
      value: "🏇🏼",
    },
    {
      name: "赛马: 中等肤色",
      value: "🏇🏽",
    },
    {
      name: "赛马: 中等-深肤色",
      value: "🏇🏾",
    },
    {
      name: "赛马: 较深肤色",
      value: "🏇🏿",
    },
    {
      name: "滑雪的人",
      value: "⛷",
    },
    {
      name: "滑雪板",
      value: "🏂",
    },
    {
      name: "滑雪板: 较浅肤色",
      value: "🏂🏻",
    },
    {
      name: "滑雪板: 中等-浅肤色",
      value: "🏂🏼",
    },
    {
      name: "滑雪板: 中等肤色",
      value: "🏂🏽",
    },
    {
      name: "滑雪板: 中等-深肤色",
      value: "🏂🏾",
    },
    {
      name: "滑雪板: 较深肤色",
      value: "🏂🏿",
    },
    {
      name: "打高尔夫的人",
      value: "🏌",
    },
    {
      name: "打高尔夫的人: 较浅肤色",
      value: "🏌🏻",
    },
    {
      name: "打高尔夫的人: 中等-浅肤色",
      value: "🏌🏼",
    },
    {
      name: "打高尔夫的人: 中等肤色",
      value: "🏌🏽",
    },
    {
      name: "打高尔夫的人: 中等-深肤色",
      value: "🏌🏾",
    },
    {
      name: "打高尔夫的人: 较深肤色",
      value: "🏌🏿",
    },
    {
      name: "男子高尔夫球",
      value: "🏌️‍♂️",
    },
    {
      name: "男子高尔夫球：浅肤色",
      value: "🏌🏻‍♂️",
    },
    {
      name: "男子高尔夫球：中浅肤色",
      value: "🏌🏼‍♂️",
    },
    {
      name: "男子高尔夫球：中等肤色",
      value: "🏌🏽‍♂️",
    },
    {
      name: "男子高尔夫球：中深肤色",
      value: "🏌🏾‍♂️",
    },
    {
      name: "男子高尔夫球：深肤色",
      value: "🏌🏿‍♂️",
    },
    {
      name: "女子高尔夫球",
      value: "🏌️‍♀️",
    },
    {
      name: "女子高尔夫球：浅肤色",
      value: "🏌🏻‍♀️",
    },
    {
      name: "女子高尔夫球：中浅肤色",
      value: "🏌🏼‍♀️",
    },
    {
      name: "女子高尔夫球：中等肤色",
      value: "🏌🏽‍♀️",
    },
    {
      name: "女子高尔夫球：中深肤色",
      value: "🏌🏾‍♀️",
    },
    {
      name: "女子高尔夫球：深肤色",
      value: "🏌🏿‍♀️",
    },
    {
      name: "冲浪",
      value: "🏄",
    },
    {
      name: "冲浪: 较浅肤色",
      value: "🏄🏻",
    },
    {
      name: "冲浪: 中等-浅肤色",
      value: "🏄🏼",
    },
    {
      name: "冲浪: 中等肤色",
      value: "🏄🏽",
    },
    {
      name: "冲浪: 中等-深肤色",
      value: "🏄🏾",
    },
    {
      name: "冲浪: 较深肤色",
      value: "🏄🏿",
    },
    {
      name: "冲浪的男人",
      value: "🏄‍♂️",
    },
    {
      name: "冲浪的男人：浅肤色",
      value: "🏄🏻‍♂️",
    },
    {
      name: "冲浪的男人：中浅肤色",
      value: "🏄🏼‍♂️",
    },
    {
      name: "冲浪的男人：中等肤色",
      value: "🏄🏽‍♂️",
    },
    {
      name: "冲浪的男人：中深肤色",
      value: "🏄🏾‍♂️",
    },
    {
      name: "冲浪的男人：深肤色",
      value: "🏄🏿‍♂️",
    },
    {
      name: "冲浪的女人",
      value: "🏄‍♀️",
    },
    {
      name: "冲浪的女人：浅肤色",
      value: "🏄🏻‍♀️",
    },
    {
      name: "冲浪的女人：中浅肤色",
      value: "🏄🏼‍♀️",
    },
    {
      name: "冲浪的女人：中等肤色",
      value: "🏄🏽‍♀️",
    },
    {
      name: "冲浪的女人：中深肤色",
      value: "🏄🏾‍♀️",
    },
    {
      name: "冲浪的女人：深肤色",
      value: "🏄🏿‍♀️",
    },
    {
      name: "划艇",
      value: "🚣",
    },
    {
      name: "划艇: 较浅肤色",
      value: "🚣🏻",
    },
    {
      name: "划艇: 中等-浅肤色",
      value: "🚣🏼",
    },
    {
      name: "划艇: 中等肤色",
      value: "🚣🏽",
    },
    {
      name: "划艇: 中等-深肤色",
      value: "🚣🏾",
    },
    {
      name: "划艇: 较深肤色",
      value: "🚣🏿",
    },
    {
      name: "男子划艇",
      value: "🚣‍♂️",
    },
    {
      name: "男子划艇：浅肤色",
      value: "🚣🏻‍♂️",
    },
    {
      name: "男子划艇：中浅肤色",
      value: "🚣🏼‍♂️",
    },
    {
      name: "男子划艇：中等肤色",
      value: "🚣🏽‍♂️",
    },
    {
      name: "男子划艇：中深肤色",
      value: "🚣🏾‍♂️",
    },
    {
      name: "男子划艇：深肤色",
      value: "🚣🏿‍♂️",
    },
    {
      name: "女子划艇",
      value: "🚣‍♀️",
    },
    {
      name: "女子划艇：浅肤色",
      value: "🚣🏻‍♀️",
    },
    {
      name: "女子划艇：中浅肤色",
      value: "🚣🏼‍♀️",
    },
    {
      name: "女子划艇：中等肤色",
      value: "🚣🏽‍♀️",
    },
    {
      name: "女子划艇：中深肤色",
      value: "🚣🏾‍♀️",
    },
    {
      name: "女子划艇：深肤色",
      value: "🚣🏿‍♀️",
    },
    {
      name: "游泳",
      value: "🏊",
    },
    {
      name: "游泳: 较浅肤色",
      value: "🏊🏻",
    },
    {
      name: "游泳: 中等-浅肤色",
      value: "🏊🏼",
    },
    {
      name: "游泳: 中等肤色",
      value: "🏊🏽",
    },
    {
      name: "游泳: 中等-深肤色",
      value: "🏊🏾",
    },
    {
      name: "游泳: 较深肤色",
      value: "🏊🏿",
    },
    {
      name: "游泳的男人",
      value: "🏊‍♂️",
    },
    {
      name: "游泳的男人：浅肤色",
      value: "🏊🏻‍♂️",
    },
    {
      name: "游泳的男人：中浅肤色",
      value: "🏊🏼‍♂️",
    },
    {
      name: "游泳的男人：中等肤色",
      value: "🏊🏽‍♂️",
    },
    {
      name: "游泳的男人：中深肤色",
      value: "🏊🏾‍♂️",
    },
    {
      name: "游泳的男人：深肤色",
      value: "🏊🏿‍♂️",
    },
    {
      name: "游泳的女人",
      value: "🏊‍♀️",
    },
    {
      name: "游泳的女人：浅肤色",
      value: "🏊🏻‍♀️",
    },
    {
      name: "游泳的女人：中浅肤色",
      value: "🏊🏼‍♀️",
    },
    {
      name: "游泳的女人：中等肤色",
      value: "🏊🏽‍♀️",
    },
    {
      name: "游泳的女人：中深肤色",
      value: "🏊🏾‍♀️",
    },
    {
      name: "游泳的女人：深肤色",
      value: "🏊🏿‍♀️",
    },
    {
      name: "玩球",
      value: "⛹",
    },
    {
      name: "玩球: 较浅肤色",
      value: "⛹🏻",
    },
    {
      name: "玩球: 中等-浅肤色",
      value: "⛹🏼",
    },
    {
      name: "玩球: 中等肤色",
      value: "⛹🏽",
    },
    {
      name: "玩球: 中等-深肤色",
      value: "⛹🏾",
    },
    {
      name: "玩球: 较深肤色",
      value: "⛹🏿",
    },
    {
      name: "拍球的男人",
      value: "⛹️‍♂️",
    },
    {
      name: "拍球的男人：浅肤色",
      value: "⛹🏻‍♂️",
    },
    {
      name: "拍球的男人：中浅肤色",
      value: "⛹🏼‍♂️",
    },
    {
      name: "拍球的男人：中等肤色",
      value: "⛹🏽‍♂️",
    },
    {
      name: "拍球的男人：中深肤色",
      value: "⛹🏾‍♂️",
    },
    {
      name: "拍球的男人：深肤色",
      value: "⛹🏿‍♂️",
    },
    {
      name: "拍球的女人",
      value: "⛹️‍♀️",
    },
    {
      name: "拍球的女人：浅肤色",
      value: "⛹🏻‍♀️",
    },
    {
      name: "拍球的女人：中浅肤色",
      value: "⛹🏼‍♀️",
    },
    {
      name: "拍球的女人：中等肤色",
      value: "⛹🏽‍♀️",
    },
    {
      name: "拍球的女人：中深肤色",
      value: "⛹🏾‍♀️",
    },
    {
      name: "拍球的女人：深肤色",
      value: "⛹🏿‍♀️",
    },
    {
      name: "举重",
      value: "🏋",
    },
    {
      name: "举重: 较浅肤色",
      value: "🏋🏻",
    },
    {
      name: "举重: 中等-浅肤色",
      value: "🏋🏼",
    },
    {
      name: "举重: 中等肤色",
      value: "🏋🏽",
    },
    {
      name: "举重: 中等-深肤色",
      value: "🏋🏾",
    },
    {
      name: "举重: 较深肤色",
      value: "🏋🏿",
    },
    {
      name: "男子举重",
      value: "🏋️‍♂️",
    },
    {
      name: "男子举重：浅肤色",
      value: "🏋🏻‍♂️",
    },
    {
      name: "男子举重：中浅肤色",
      value: "🏋🏼‍♂️",
    },
    {
      name: "男子举重：中等肤色",
      value: "🏋🏽‍♂️",
    },
    {
      name: "男子举重：中深肤色",
      value: "🏋🏾‍♂️",
    },
    {
      name: "男子举重：深肤色",
      value: "🏋🏿‍♂️",
    },
    {
      name: "女子举重",
      value: "🏋️‍♀️",
    },
    {
      name: "女子举重：浅肤色",
      value: "🏋🏻‍♀️",
    },
    {
      name: "女子举重：中浅肤色",
      value: "🏋🏼‍♀️",
    },
    {
      name: "女子举重：中等肤色",
      value: "🏋🏽‍♀️",
    },
    {
      name: "女子举重：中深肤色",
      value: "🏋🏾‍♀️",
    },
    {
      name: "女子举重：深肤色",
      value: "🏋🏿‍♀️",
    },
    {
      name: "骑自行车",
      value: "🚴",
    },
    {
      name: "骑自行车: 较浅肤色",
      value: "🚴🏻",
    },
    {
      name: "骑自行车: 中等-浅肤色",
      value: "🚴🏼",
    },
    {
      name: "骑自行车: 中等肤色",
      value: "🚴🏽",
    },
    {
      name: "骑自行车: 中等-深肤色",
      value: "🚴🏾",
    },
    {
      name: "骑自行车: 较深肤色",
      value: "🚴🏿",
    },
    {
      name: "骑自行车的男人",
      value: "🚴‍♂️",
    },
    {
      name: "骑自行车的男人：浅肤色",
      value: "🚴🏻‍♂️",
    },
    {
      name: "骑自行车的男人：中浅肤色",
      value: "🚴🏼‍♂️",
    },
    {
      name: "骑自行车的男人：中等肤色",
      value: "🚴🏽‍♂️",
    },
    {
      name: "骑自行车的男人：中深肤色",
      value: "🚴🏾‍♂️",
    },
    {
      name: "男生骑自行车: 较深肤色",
      value: "🚴🏿‍♂️",
    },
    {
      name: "骑自行车的女人",
      value: "🚴‍♀️",
    },
    {
      name: "骑自行车的女人：浅肤色",
      value: "🚴🏻‍♀️",
    },
    {
      name: "骑自行车的女人：中浅肤色",
      value: "🚴🏼‍♀️",
    },
    {
      name: "骑自行车的女人：中等肤色",
      value: "🚴🏽‍♀️",
    },
    {
      name: "骑自行车的女人：中深肤色",
      value: "🚴🏾‍♀️",
    },
    {
      name: "女生骑自行车: 较深肤色",
      value: "🚴🏿‍♀️",
    },
    {
      name: "骑山地车",
      value: "🚵",
    },
    {
      name: "骑山地车: 较浅肤色",
      value: "🚵🏻",
    },
    {
      name: "骑山地车: 中等-浅肤色",
      value: "🚵🏼",
    },
    {
      name: "骑山地车: 中等肤色",
      value: "🚵🏽",
    },
    {
      name: "骑山地车: 中等-深肤色",
      value: "🚵🏾",
    },
    {
      name: "骑山地车: 较深肤色",
      value: "🚵🏿",
    },
    {
      name: "男子山地自行车",
      value: "🚵‍♂️",
    },
    {
      name: "男子山地自行车：浅肤色",
      value: "🚵🏻‍♂️",
    },
    {
      name: "男子山地自行车：中浅肤色",
      value: "🚵🏼‍♂️",
    },
    {
      name: "男子山地自行车：中等肤色",
      value: "🚵🏽‍♂️",
    },
    {
      name: "男子山地自行车：中深肤色",
      value: "🚵🏾‍♂️",
    },
    {
      name: "男子山地自行车：深肤色",
      value: "🚵🏿‍♂️",
    },
    {
      name: "女子山地自行车",
      value: "🚵‍♀️",
    },
    {
      name: "女子山地自行车：浅肤色",
      value: "🚵🏻‍♀️",
    },
    {
      name: "女子山地自行车：中浅肤色",
      value: "🚵🏼‍♀️",
    },
    {
      name: "女子山地自行车：中等肤色",
      value: "🚵🏽‍♀️",
    },
    {
      name: "女子山地自行车：中深肤色",
      value: "🚵🏾‍♀️",
    },
    {
      name: "女子山地自行车：深肤色",
      value: "🚵🏿‍♀️",
    },
    {
      name: "侧手翻",
      value: "🤸",
    },
    {
      name: "侧手翻: 较浅肤色",
      value: "🤸🏻",
    },
    {
      name: "侧手翻: 中等-浅肤色",
      value: "🤸🏼",
    },
    {
      name: "侧手翻: 中等肤色",
      value: "🤸🏽",
    },
    {
      name: "侧手翻: 中等-深肤色",
      value: "🤸🏾",
    },
    {
      name: "侧手翻: 较深肤色",
      value: "🤸🏿",
    },
    {
      name: "男人翻筋斗",
      value: "🤸‍♂️",
    },
    {
      name: "男人翻筋斗：浅肤色",
      value: "🤸🏻‍♂️",
    },
    {
      name: "男人翻筋斗：中浅肤色",
      value: "🤸🏼‍♂️",
    },
    {
      name: "男人翻筋斗：中等肤色",
      value: "🤸🏽‍♂️",
    },
    {
      name: "男人翻筋斗：中深肤色",
      value: "🤸🏾‍♂️",
    },
    {
      name: "男人翻筋斗：深肤色",
      value: "🤸🏿‍♂️",
    },
    {
      name: "女人翻筋斗",
      value: "🤸‍♀️",
    },
    {
      name: "女人翻筋斗：浅肤色",
      value: "🤸🏻‍♀️",
    },
    {
      name: "女人翻筋斗：中浅肤色",
      value: "🤸🏼‍♀️",
    },
    {
      name: "女人翻筋斗：中等肤色",
      value: "🤸🏽‍♀️",
    },
    {
      name: "女人翻筋斗：中深肤色",
      value: "🤸🏾‍♀️",
    },
    {
      name: "女人翻筋斗：深肤色",
      value: "🤸🏿‍♀️",
    },
    {
      name: "摔跤选手",
      value: "🤼",
    },
    {
      name: "男子摔跤",
      value: "🤼‍♂️",
    },
    {
      name: "女子摔跤",
      value: "🤼‍♀️",
    },
    {
      name: "水球",
      value: "🤽",
    },
    {
      name: "水球: 较浅肤色",
      value: "🤽🏻",
    },
    {
      name: "水球: 中等-浅肤色",
      value: "🤽🏼",
    },
    {
      name: "水球: 中等肤色",
      value: "🤽🏽",
    },
    {
      name: "水球: 中等-深肤色",
      value: "🤽🏾",
    },
    {
      name: "水球: 较深肤色",
      value: "🤽🏿",
    },
    {
      name: "男子玩水球",
      value: "🤽‍♂️",
    },
    {
      name: "男子打水球：浅肤色",
      value: "🤽🏻‍♂️",
    },
    {
      name: "男子打水球：中浅肤色",
      value: "🤽🏼‍♂️",
    },
    {
      name: "男子打水球：中等肤色",
      value: "🤽🏽‍♂️",
    },
    {
      name: "男子打水球：中深肤色",
      value: "🤽🏾‍♂️",
    },
    {
      name: "男子打水球：深肤色",
      value: "🤽🏿‍♂️",
    },
    {
      name: "女人玩水球",
      value: "🤽‍♀️",
    },
    {
      name: "女人玩水球：浅肤色",
      value: "🤽🏻‍♀️",
    },
    {
      name: "女子打水球：中浅肤色",
      value: "🤽🏼‍♀️",
    },
    {
      name: "女子打水球：中等肤色",
      value: "🤽🏽‍♀️",
    },
    {
      name: "女子打水球：中深肤色",
      value: "🤽🏾‍♀️",
    },
    {
      name: "女子打水球：深肤色",
      value: "🤽🏿‍♀️",
    },
    {
      name: "手球",
      value: "🤾",
    },
    {
      name: "手球: 较浅肤色",
      value: "🤾🏻",
    },
    {
      name: "手球: 中等-浅肤色",
      value: "🤾🏼",
    },
    {
      name: "手球: 中等肤色",
      value: "🤾🏽",
    },
    {
      name: "手球: 中等-深肤色",
      value: "🤾🏾",
    },
    {
      name: "手球: 较深肤色",
      value: "🤾🏿",
    },
    {
      name: "男子玩手球",
      value: "🤾‍♂️",
    },
    {
      name: "男子手球：浅肤色",
      value: "🤾🏻‍♂️",
    },
    {
      name: "男子手球：中浅肤色",
      value: "🤾🏼‍♂️",
    },
    {
      name: "男子手球：中等肤色",
      value: "🤾🏽‍♂️",
    },
    {
      name: "男子手球：中深肤色",
      value: "🤾🏾‍♂️",
    },
    {
      name: "男子手球：深肤色",
      value: "🤾🏿‍♂️",
    },
    {
      name: "女人玩手球",
      value: "🤾‍♀️",
    },
    {
      name: "女子手球：浅肤色",
      value: "🤾🏻‍♀️",
    },
    {
      name: "女子手球：中浅肤色",
      value: "🤾🏼‍♀️",
    },
    {
      name: "女子手球：中等肤色",
      value: "🤾🏽‍♀️",
    },
    {
      name: "女子手球：中深肤色",
      value: "🤾🏾‍♀️",
    },
    {
      name: "女子手球：深肤色",
      value: "🤾🏿‍♀️",
    },
    {
      name: "抛接杂耍",
      value: "🤹",
    },
    {
      name: "抛接杂耍: 较浅肤色",
      value: "🤹🏻",
    },
    {
      name: "抛接杂耍: 中等-浅肤色",
      value: "🤹🏼",
    },
    {
      name: "抛接杂耍: 中等肤色",
      value: "🤹🏽",
    },
    {
      name: "抛接杂耍: 中等-深肤色",
      value: "🤹🏾",
    },
    {
      name: "抛接杂耍: 较深肤色",
      value: "🤹🏿",
    },
    {
      name: "男人玩杂耍",
      value: "🤹‍♂️",
    },
    {
      name: "男人玩杂耍：浅肤色",
      value: "🤹🏻‍♂️",
    },
    {
      name: "男人玩杂耍：中浅肤色",
      value: "🤹🏼‍♂️",
    },
    {
      name: "男人玩杂耍：中等肤色",
      value: "🤹🏽‍♂️",
    },
    {
      name: "男人玩杂耍：中深肤色",
      value: "🤹🏾‍♂️",
    },
    {
      name: "男人玩杂耍：深肤色",
      value: "🤹🏿‍♂️",
    },
    {
      name: "女人玩杂耍",
      value: "🤹‍♀️",
    },
    {
      name: "女人玩杂耍：浅肤色",
      value: "🤹🏻‍♀️",
    },
    {
      name: "女人玩杂耍：中浅肤色",
      value: "🤹🏼‍♀️",
    },
    {
      name: "女人玩杂耍：中等肤色",
      value: "🤹🏽‍♀️",
    },
    {
      name: "女人玩杂耍：中深肤色",
      value: "🤹🏾‍♀️",
    },
    {
      name: "女人玩杂耍：深肤色",
      value: "🤹🏿‍♀️",
    },
    {
      name: "盘腿的人",
      value: "🧘",
    },
    {
      name: "盘腿的人: 较浅肤色",
      value: "🧘🏻",
    },
    {
      name: "盘腿的人: 中等-浅肤色",
      value: "🧘🏼",
    },
    {
      name: "盘腿的人: 中等肤色",
      value: "🧘🏽",
    },
    {
      name: "盘腿的人: 中等-深肤色",
      value: "🧘🏾",
    },
    {
      name: "盘腿的人: 较深肤色",
      value: "🧘🏿",
    },
    {
      name: "打坐的男人",
      value: "🧘‍♂️",
    },
    {
      name: "打坐的男人：浅肤色",
      value: "🧘🏻‍♂️",
    },
    {
      name: "打坐的男人：中浅肤色",
      value: "🧘🏼‍♂️",
    },
    {
      name: "打坐的男人：中等肤色",
      value: "🧘🏽‍♂️",
    },
    {
      name: "打坐的男人：中深肤色",
      value: "🧘🏾‍♂️",
    },
    {
      name: "打坐的男人：深肤色",
      value: "🧘🏿‍♂️",
    },
    {
      name: "打坐的女人",
      value: "🧘‍♀️",
    },
    {
      name: "打坐的女人：浅肤色",
      value: "🧘🏻‍♀️",
    },
    {
      name: "打坐的女人：中浅肤色",
      value: "🧘🏼‍♀️",
    },
    {
      name: "打坐的女人：中等肤色",
      value: "🧘🏽‍♀️",
    },
    {
      name: "打坐的女人：中深肤色",
      value: "🧘🏾‍♀️",
    },
    {
      name: "打坐的女人：深肤色",
      value: "🧘🏿‍♀️",
    },
    {
      name: "洗澡的人",
      value: "🛀",
    },
    {
      name: "洗澡的人: 较浅肤色",
      value: "🛀🏻",
    },
    {
      name: "洗澡的人: 中等-浅肤色",
      value: "🛀🏼",
    },
    {
      name: "洗澡的人: 中等肤色",
      value: "🛀🏽",
    },
    {
      name: "洗澡的人: 中等-深肤色",
      value: "🛀🏾",
    },
    {
      name: "洗澡的人: 较深肤色",
      value: "🛀🏿",
    },
    {
      name: "躺在床上的人",
      value: "🛌",
    },
    {
      name: "躺在床上的人: 较浅肤色",
      value: "🛌🏻",
    },
    {
      name: "躺在床上的人: 中等-浅肤色",
      value: "🛌🏼",
    },
    {
      name: "躺在床上的人: 中等肤色",
      value: "🛌🏽",
    },
    {
      name: "躺在床上的人: 中等-深肤色",
      value: "🛌🏾",
    },
    {
      name: "躺在床上的人: 较深肤色",
      value: "🛌🏿",
    },
    {
      name: "手拉手的两个人",
      value: "🧑‍🤝‍🧑",
    },
    {
      name: "手拉手的两个人: 较浅肤色",
      value: "🧑🏻‍🤝‍🧑🏻",
    },
    {
      name: "手拉手的两个人: 较浅肤色中等-浅肤色",
      value: "🧑🏻‍🤝‍🧑🏼",
    },
    {
      name: "手拉手的两个人: 较浅肤色中等肤色",
      value: "🧑🏻‍🤝‍🧑🏽",
    },
    {
      name: "手拉手的两个人: 较浅肤色中等-深肤色",
      value: "🧑🏻‍🤝‍🧑🏾",
    },
    {
      name: "手拉手的两个人: 较浅肤色较深肤色",
      value: "🧑🏻‍🤝‍🧑🏿",
    },
    {
      name: "手拉手的两个人: 中等-浅肤色较浅肤色",
      value: "🧑🏼‍🤝‍🧑🏻",
    },
    {
      name: "手拉手的两个人: 中等-浅肤色",
      value: "🧑🏼‍🤝‍🧑🏼",
    },
    {
      name: "手拉手的两个人: 中等-浅肤色中等肤色",
      value: "🧑🏼‍🤝‍🧑🏽",
    },
    {
      name: "手拉手的两个人: 中等-浅肤色中等-深肤色",
      value: "🧑🏼‍🤝‍🧑🏾",
    },
    {
      name: "手拉手的两个人: 中等-浅肤色较深肤色",
      value: "🧑🏼‍🤝‍🧑🏿",
    },
    {
      name: "手拉手的两个人: 中等肤色较浅肤色",
      value: "🧑🏽‍🤝‍🧑🏻",
    },
    {
      name: "手拉手的两个人: 中等肤色中等-浅肤色",
      value: "🧑🏽‍🤝‍🧑🏼",
    },
    {
      name: "手拉手的两个人: 中等肤色",
      value: "🧑🏽‍🤝‍🧑🏽",
    },
    {
      name: "手拉手的两个人: 中等肤色中等-深肤色",
      value: "🧑🏽‍🤝‍🧑🏾",
    },
    {
      name: "手拉手的两个人: 中等肤色较深肤色",
      value: "🧑🏽‍🤝‍🧑🏿",
    },
    {
      name: "手拉手的两个人: 中等-深肤色较浅肤色",
      value: "🧑🏾‍🤝‍🧑🏻",
    },
    {
      name: "手拉手的两个人: 中等-深肤色中等-浅肤色",
      value: "🧑🏾‍🤝‍🧑🏼",
    },
    {
      name: "手拉手的两个人: 中等-深肤色中等肤色",
      value: "🧑🏾‍🤝‍🧑🏽",
    },
    {
      name: "手拉手的两个人: 中等-深肤色",
      value: "🧑🏾‍🤝‍🧑🏾",
    },
    {
      name: "手拉手的两个人: 中等-深肤色较深肤色",
      value: "🧑🏾‍🤝‍🧑🏿",
    },
    {
      name: "手拉手的两个人: 较深肤色较浅肤色",
      value: "🧑🏿‍🤝‍🧑🏻",
    },
    {
      name: "手拉手的两个人: 较深肤色中等-浅肤色",
      value: "🧑🏿‍🤝‍🧑🏼",
    },
    {
      name: "手拉手的两个人: 较深肤色中等肤色",
      value: "🧑🏿‍🤝‍🧑🏽",
    },
    {
      name: "手拉手的两个人: 较深肤色中等-深肤色",
      value: "🧑🏿‍🤝‍🧑🏾",
    },
    {
      name: "手拉手的两个人: 较深肤色",
      value: "🧑🏿‍🤝‍🧑🏿",
    },
    {
      name: "手拉手的两个女人",
      value: "👭",
    },
    {
      name: "手拉手的两个女人: 较浅肤色",
      value: "👭🏻",
    },
    {
      name: "手拉手的两个女人: 较浅肤色中等-浅肤色",
      value: "👩🏻‍🤝‍👩🏼",
    },
    {
      name: "手拉手的两个女人: 较浅肤色中等肤色",
      value: "👩🏻‍🤝‍👩🏽",
    },
    {
      name: "手拉手的两个女人: 较浅肤色中等-深肤色",
      value: "👩🏻‍🤝‍👩🏾",
    },
    {
      name: "手拉手的两个女人: 较浅肤色较深肤色",
      value: "👩🏻‍🤝‍👩🏿",
    },
    {
      name: "手拉手的两个女人: 中等-浅肤色较浅肤色",
      value: "👩🏼‍🤝‍👩🏻",
    },
    {
      name: "手拉手的两个女人: 中等-浅肤色",
      value: "👭🏼",
    },
    {
      name: "手拉手的两个女人: 中等-浅肤色中等肤色",
      value: "👩🏼‍🤝‍👩🏽",
    },
    {
      name: "手拉手的两个女人: 中等-浅肤色中等-深肤色",
      value: "👩🏼‍🤝‍👩🏾",
    },
    {
      name: "手拉手的两个女人: 中等-浅肤色较深肤色",
      value: "👩🏼‍🤝‍👩🏿",
    },
    {
      name: "手拉手的两个女人: 中等肤色较浅肤色",
      value: "👩🏽‍🤝‍👩🏻",
    },
    {
      name: "手拉手的两个女人: 中等肤色中等-浅肤色",
      value: "👩🏽‍🤝‍👩🏼",
    },
    {
      name: "手拉手的两个女人: 中等肤色",
      value: "👭🏽",
    },
    {
      name: "手拉手的两个女人: 中等肤色中等-深肤色",
      value: "👩🏽‍🤝‍👩🏾",
    },
    {
      name: "手拉手的两个女人: 中等肤色较深肤色",
      value: "👩🏽‍🤝‍👩🏿",
    },
    {
      name: "手拉手的两个女人: 中等-深肤色较浅肤色",
      value: "👩🏾‍🤝‍👩🏻",
    },
    {
      name: "手拉手的两个女人: 中等-深肤色中等-浅肤色",
      value: "👩🏾‍🤝‍👩🏼",
    },
    {
      name: "手拉手的两个女人: 中等-深肤色中等肤色",
      value: "👩🏾‍🤝‍👩🏽",
    },
    {
      name: "手拉手的两个女人: 中等-深肤色",
      value: "👭🏾",
    },
    {
      name: "手拉手的两个女人: 中等-深肤色较深肤色",
      value: "👩🏾‍🤝‍👩🏿",
    },
    {
      name: "手拉手的两个女人: 较深肤色较浅肤色",
      value: "👩🏿‍🤝‍👩🏻",
    },
    {
      name: "手拉手的两个女人: 较深肤色中等-浅肤色",
      value: "👩🏿‍🤝‍👩🏼",
    },
    {
      name: "手拉手的两个女人: 较深肤色中等肤色",
      value: "👩🏿‍🤝‍👩🏽",
    },
    {
      name: "手拉手的两个女人: 较深肤色中等-深肤色",
      value: "👩🏿‍🤝‍👩🏾",
    },
    {
      name: "手拉手的两个女人: 较深肤色",
      value: "👭🏿",
    },
    {
      name: "手拉手的一男一女",
      value: "👫",
    },
    {
      name: "手拉手的一男一女: 较浅肤色",
      value: "👫🏻",
    },
    {
      name: "手拉手的一男一女: 较浅肤色中等-浅肤色",
      value: "👩🏻‍🤝‍👨🏼",
    },
    {
      name: "手拉手的一男一女: 较浅肤色中等肤色",
      value: "👩🏻‍🤝‍👨🏽",
    },
    {
      name: "手拉手的一男一女: 较浅肤色中等-深肤色",
      value: "👩🏻‍🤝‍👨🏾",
    },
    {
      name: "手拉手的一男一女: 较浅肤色较深肤色",
      value: "👩🏻‍🤝‍👨🏿",
    },
    {
      name: "手拉手的一男一女: 中等-浅肤色较浅肤色",
      value: "👩🏼‍🤝‍👨🏻",
    },
    {
      name: "手拉手的一男一女: 中等-浅肤色",
      value: "👫🏼",
    },
    {
      name: "手拉手的一男一女: 中等-浅肤色中等肤色",
      value: "👩🏼‍🤝‍👨🏽",
    },
    {
      name: "手拉手的一男一女: 中等-浅肤色中等-深肤色",
      value: "👩🏼‍🤝‍👨🏾",
    },
    {
      name: "手拉手的一男一女: 中等-浅肤色较深肤色",
      value: "👩🏼‍🤝‍👨🏿",
    },
    {
      name: "手拉手的一男一女: 中等肤色较浅肤色",
      value: "👩🏽‍🤝‍👨🏻",
    },
    {
      name: "手拉手的一男一女: 中等肤色中等-浅肤色",
      value: "👩🏽‍🤝‍👨🏼",
    },
    {
      name: "手拉手的一男一女: 中等肤色",
      value: "👫🏽",
    },
    {
      name: "手拉手的一男一女: 中等肤色中等-深肤色",
      value: "👩🏽‍🤝‍👨🏾",
    },
    {
      name: "手拉手的一男一女: 中等肤色较深肤色",
      value: "👩🏽‍🤝‍👨🏿",
    },
    {
      name: "手拉手的一男一女: 中等-深肤色较浅肤色",
      value: "👩🏾‍🤝‍👨🏻",
    },
    {
      name: "手拉手的一男一女: 中等-深肤色中等-浅肤色",
      value: "👩🏾‍🤝‍👨🏼",
    },
    {
      name: "手拉手的一男一女: 中等-深肤色中等肤色",
      value: "👩🏾‍🤝‍👨🏽",
    },
    {
      name: "手拉手的一男一女: 中等-深肤色",
      value: "👫🏾",
    },
    {
      name: "手拉手的一男一女: 中等-深肤色较深肤色",
      value: "👩🏾‍🤝‍👨🏿",
    },
    {
      name: "手拉手的一男一女: 较深肤色较浅肤色",
      value: "👩🏿‍🤝‍👨🏻",
    },
    {
      name: "手拉手的一男一女: 较深肤色中等-浅肤色",
      value: "👩🏿‍🤝‍👨🏼",
    },
    {
      name: "手拉手的一男一女: 较深肤色中等肤色",
      value: "👩🏿‍🤝‍👨🏽",
    },
    {
      name: "手拉手的一男一女: 较深肤色中等-深肤色",
      value: "👩🏿‍🤝‍👨🏾",
    },
    {
      name: "手拉手的一男一女: 较深肤色",
      value: "👫🏿",
    },
    {
      name: "手拉手的两个男人",
      value: "👬",
    },
    {
      name: "手拉手的两个男人: 较浅肤色",
      value: "👬🏻",
    },
    {
      name: "手拉手的两个男人: 较浅肤色中等-浅肤色",
      value: "👨🏻‍🤝‍👨🏼",
    },
    {
      name: "手拉手的两个男人: 较浅肤色中等肤色",
      value: "👨🏻‍🤝‍👨🏽",
    },
    {
      name: "手拉手的两个男人: 较浅肤色中等-深肤色",
      value: "👨🏻‍🤝‍👨🏾",
    },
    {
      name: "手拉手的两个男人: 较浅肤色较深肤色",
      value: "👨🏻‍🤝‍👨🏿",
    },
    {
      name: "手拉手的两个男人: 中等-浅肤色较浅肤色",
      value: "👨🏼‍🤝‍👨🏻",
    },
    {
      name: "手拉手的两个男人: 中等-浅肤色",
      value: "👬🏼",
    },
    {
      name: "手拉手的两个男人: 中等-浅肤色中等肤色",
      value: "👨🏼‍🤝‍👨🏽",
    },
    {
      name: "手拉手的两个男人: 中等-浅肤色中等-深肤色",
      value: "👨🏼‍🤝‍👨🏾",
    },
    {
      name: "手拉手的两个男人: 中等-浅肤色较深肤色",
      value: "👨🏼‍🤝‍👨🏿",
    },
    {
      name: "手拉手的两个男人: 中等肤色较浅肤色",
      value: "👨🏽‍🤝‍👨🏻",
    },
    {
      name: "手拉手的两个男人: 中等肤色中等-浅肤色",
      value: "👨🏽‍🤝‍👨🏼",
    },
    {
      name: "手拉手的两个男人: 中等肤色",
      value: "👬🏽",
    },
    {
      name: "手拉手的两个男人: 中等肤色中等-深肤色",
      value: "👨🏽‍🤝‍👨🏾",
    },
    {
      name: "手拉手的两个男人: 中等肤色较深肤色",
      value: "👨🏽‍🤝‍👨🏿",
    },
    {
      name: "手拉手的两个男人: 中等-深肤色较浅肤色",
      value: "👨🏾‍🤝‍👨🏻",
    },
    {
      name: "手拉手的两个男人: 中等-深肤色中等-浅肤色",
      value: "👨🏾‍🤝‍👨🏼",
    },
    {
      name: "手拉手的两个男人: 中等-深肤色中等肤色",
      value: "👨🏾‍🤝‍👨🏽",
    },
    {
      name: "手拉手的两个男人: 中等-深肤色",
      value: "👬🏾",
    },
    {
      name: "手拉手的两个男人: 中等-深肤色较深肤色",
      value: "👨🏾‍🤝‍👨🏿",
    },
    {
      name: "手拉手的两个男人: 较深肤色较浅肤色",
      value: "👨🏿‍🤝‍👨🏻",
    },
    {
      name: "手拉手的两个男人: 较深肤色中等-浅肤色",
      value: "👨🏿‍🤝‍👨🏼",
    },
    {
      name: "手拉手的两个男人: 较深肤色中等肤色",
      value: "👨🏿‍🤝‍👨🏽",
    },
    {
      name: "手拉手的两个男人: 较深肤色中等-深肤色",
      value: "👨🏿‍🤝‍👨🏾",
    },
    {
      name: "手拉手的两个男人: 较深肤色",
      value: "👬🏿",
    },
    {
      name: "亲吻",
      value: "💏",
    },
    {
      name: "吻：女人和男人",
      value: "👩‍❤️‍💋‍👨",
    },
    {
      name: "亲吻：男人和男人",
      value: "👨‍❤️‍💋‍👨",
    },
    {
      name: "亲吻: 女人女人",
      value: "👩‍❤️‍💋‍👩",
    },
    {
      name: "情侣",
      value: "💑",
    },
    {
      name: "带心的夫妇：女人和男人",
      value: "👩‍❤️‍👨",
    },
    {
      name: "带心的夫妇：男人和男人",
      value: "👨‍❤️‍👨",
    },
    {
      name: "情侣: 女人女人",
      value: "👩‍❤️‍👩",
    },
    {
      name: "家庭",
      value: "👪",
    },
    {
      name: "家庭: 男人女人男孩",
      value: "👨‍👩‍👦",
    },
    {
      name: "家庭: 男人女人女孩",
      value: "👨‍👩‍👧",
    },
    {
      name: "家庭: 男人女人女孩男孩",
      value: "👨‍👩‍👧‍👦",
    },
    {
      name: "家庭: 男人女人男孩男孩",
      value: "👨‍👩‍👦‍👦",
    },
    {
      name: "家庭: 男人女人女孩女孩",
      value: "👨‍👩‍👧‍👧",
    },
    {
      name: "家庭: 男人男人男孩",
      value: "👨‍👨‍👦",
    },
    {
      name: "家庭: 男人男人女孩",
      value: "👨‍👨‍👧",
    },
    {
      name: "家庭: 男人男人女孩男孩",
      value: "👨‍👨‍👧‍👦",
    },
    {
      name: "家庭: 男人男人男孩男孩",
      value: "👨‍👨‍👦‍👦",
    },
    {
      name: "家庭: 男人男人女孩女孩",
      value: "👨‍👨‍👧‍👧",
    },
    {
      name: "家庭: 女人女人男孩",
      value: "👩‍👩‍👦",
    },
    {
      name: "家庭: 女人女人女孩",
      value: "👩‍👩‍👧",
    },
    {
      name: "家庭: 女人女人女孩男孩",
      value: "👩‍👩‍👧‍👦",
    },
    {
      name: "家庭: 女人女人男孩男孩",
      value: "👩‍👩‍👦‍👦",
    },
    {
      name: "家庭: 女人女人女孩女孩",
      value: "👩‍👩‍👧‍👧",
    },
    {
      name: "家庭: 男人男孩",
      value: "👨‍👦",
    },
    {
      name: "家庭: 男人男孩男孩",
      value: "👨‍👦‍👦",
    },
    {
      name: "家庭: 男人女孩",
      value: "👨‍👧",
    },
    {
      name: "家庭: 男人女孩男孩",
      value: "👨‍👧‍👦",
    },
    {
      name: "家庭: 男人女孩女孩",
      value: "👨‍👧‍👧",
    },
    {
      name: "家庭: 女人男孩",
      value: "👩‍👦",
    },
    {
      name: "家庭: 女人男孩男孩",
      value: "👩‍👦‍👦",
    },
    {
      name: "家庭: 女人女孩",
      value: "👩‍👧",
    },
    {
      name: "家庭: 女人女孩男孩",
      value: "👩‍👧‍👦",
    },
    {
      name: "家庭: 女人女孩女孩",
      value: "👩‍👧‍👧",
    },
    {
      name: "说话",
      value: "🗣",
    },
    {
      name: "人像",
      value: "👤",
    },
    {
      name: "双人像",
      value: "👥",
    },
    {
      name: "人的拥抱",
      value: "🫂",
    },
    {
      name: "脚印",
      value: "👣",
    },
  ],
  动物和自然: [
    {
      name: "猴头",
      value: "🐵",
    },
    {
      name: "猴子",
      value: "🐒",
    },
    {
      name: "大猩猩",
      value: "🦍",
    },
    {
      name: "红毛猩猩",
      value: "🦧",
    },
    {
      name: "狗脸",
      value: "🐶",
    },
    {
      name: "狗",
      value: "🐕",
    },
    {
      name: "导盲犬",
      value: "🦮",
    },
    {
      name: "服务犬",
      value: "🐕‍🦺",
    },
    {
      name: "贵宾犬",
      value: "🐩",
    },
    {
      name: "狼",
      value: "🐺",
    },
    {
      name: "狐狸",
      value: "🦊",
    },
    {
      name: "浣熊",
      value: "🦝",
    },
    {
      name: "猫脸",
      value: "🐱",
    },
    {
      name: "猫",
      value: "🐈",
    },
    {
      name: "黑猫",
      value: "🐈‍⬛",
    },
    {
      name: "狮子",
      value: "🦁",
    },
    {
      name: "老虎头",
      value: "🐯",
    },
    {
      name: "老虎",
      value: "🐅",
    },
    {
      name: "豹子",
      value: "🐆",
    },
    {
      name: "马头",
      value: "🐴",
    },
    {
      name: "马",
      value: "🐎",
    },
    {
      name: "独角兽",
      value: "🦄",
    },
    {
      name: "斑马",
      value: "🦓",
    },
    {
      name: "鹿",
      value: "🦌",
    },
    {
      name: "大野牛",
      value: "🦬",
    },
    {
      name: "奶牛头",
      value: "🐮",
    },
    {
      name: "公牛",
      value: "🐂",
    },
    {
      name: "水牛",
      value: "🐃",
    },
    {
      name: "奶牛",
      value: "🐄",
    },
    {
      name: "猪头",
      value: "🐷",
    },
    {
      name: "猪",
      value: "🐖",
    },
    {
      name: "野猪",
      value: "🐗",
    },
    {
      name: "猪鼻子",
      value: "🐽",
    },
    {
      name: "公羊",
      value: "🐏",
    },
    {
      name: "母羊",
      value: "🐑",
    },
    {
      name: "山羊",
      value: "🐐",
    },
    {
      name: "骆驼",
      value: "🐪",
    },
    {
      name: "双峰骆驼",
      value: "🐫",
    },
    {
      name: "美洲驼",
      value: "🦙",
    },
    {
      name: "长颈鹿",
      value: "🦒",
    },
    {
      name: "大象",
      value: "🐘",
    },
    {
      name: "猛犸",
      value: "🦣",
    },
    {
      name: "犀牛",
      value: "🦏",
    },
    {
      name: "河马",
      value: "🦛",
    },
    {
      name: "老鼠头",
      value: "🐭",
    },
    {
      name: "老鼠",
      value: "🐁",
    },
    {
      name: "耗子",
      value: "🐀",
    },
    {
      name: "仓鼠",
      value: "🐹",
    },
    {
      name: "兔子头",
      value: "🐰",
    },
    {
      name: "兔子",
      value: "🐇",
    },
    {
      name: "松鼠",
      value: "🐿",
    },
    {
      name: "海狸",
      value: "🦫",
    },
    {
      name: "刺猬",
      value: "🦔",
    },
    {
      name: "蝙蝠",
      value: "🦇",
    },
    {
      name: "熊",
      value: "🐻",
    },
    {
      name: "北极熊",
      value: "🐻‍❄️",
    },
    {
      name: "考拉",
      value: "🐨",
    },
    {
      name: "熊猫",
      value: "🐼",
    },
    {
      name: "树懒",
      value: "🦥",
    },
    {
      name: "水獭",
      value: "🦦",
    },
    {
      name: "臭鼬",
      value: "🦨",
    },
    {
      name: "袋鼠",
      value: "🦘",
    },
    {
      name: "獾",
      value: "🦡",
    },
    {
      name: "爪印",
      value: "🐾",
    },
    {
      name: "火鸡",
      value: "🦃",
    },
    {
      name: "鸡",
      value: "🐔",
    },
    {
      name: "公鸡",
      value: "🐓",
    },
    {
      name: "小鸡破壳",
      value: "🐣",
    },
    {
      name: "小鸡",
      value: "🐤",
    },
    {
      name: "正面朝向的小鸡",
      value: "🐥",
    },
    {
      name: "鸟",
      value: "🐦",
    },
    {
      name: "企鹅",
      value: "🐧",
    },
    {
      name: "鸽",
      value: "🕊",
    },
    {
      name: "鹰",
      value: "🦅",
    },
    {
      name: "鸭子",
      value: "🦆",
    },
    {
      name: "天鹅",
      value: "🦢",
    },
    {
      name: "猫头鹰",
      value: "🦉",
    },
    {
      name: "渡渡鸟",
      value: "🦤",
    },
    {
      name: "羽毛",
      value: "🪶",
    },
    {
      name: "火烈鸟",
      value: "🦩",
    },
    {
      name: "孔雀",
      value: "🦚",
    },
    {
      name: "鹦鹉",
      value: "🦜",
    },
    {
      name: "青蛙",
      value: "🐸",
    },
    {
      name: "鳄鱼",
      value: "🐊",
    },
    {
      name: "龟",
      value: "🐢",
    },
    {
      name: "蜥蜴",
      value: "🦎",
    },
    {
      name: "蛇",
      value: "🐍",
    },
    {
      name: "龙头",
      value: "🐲",
    },
    {
      name: "龙",
      value: "🐉",
    },
    {
      name: "蜥蜴类",
      value: "🦕",
    },
    {
      name: "霸王龙",
      value: "🦖",
    },
    {
      name: "喷水的鲸",
      value: "🐳",
    },
    {
      name: "鲸鱼",
      value: "🐋",
    },
    {
      name: "海豚",
      value: "🐬",
    },
    {
      name: "海豹",
      value: "🦭",
    },
    {
      name: "鱼",
      value: "🐟",
    },
    {
      name: "热带鱼",
      value: "🐠",
    },
    {
      name: "河豚",
      value: "🐡",
    },
    {
      name: "鲨鱼",
      value: "🦈",
    },
    {
      name: "章鱼",
      value: "🐙",
    },
    {
      name: "海螺",
      value: "🐚",
    },
    {
      name: "蜗牛",
      value: "🐌",
    },
    {
      name: "蝴蝶",
      value: "🦋",
    },
    {
      name: "毛毛虫",
      value: "🐛",
    },
    {
      name: "蚂蚁",
      value: "🐜",
    },
    {
      name: "蜜蜂",
      value: "🐝",
    },
    {
      name: "甲虫",
      value: "🪲",
    },
    {
      name: "瓢虫",
      value: "🐞",
    },
    {
      name: "蟋蟀",
      value: "🦗",
    },
    {
      name: "蟑螂",
      value: "🪳",
    },
    {
      name: "蜘蛛",
      value: "🕷",
    },
    {
      name: "蜘蛛网",
      value: "🕸",
    },
    {
      name: "蝎子",
      value: "🦂",
    },
    {
      name: "蚊子",
      value: "🦟",
    },
    {
      name: "苍蝇",
      value: "🪰",
    },
    {
      name: "蠕虫",
      value: "🪱",
    },
    {
      name: "细菌",
      value: "🦠",
    },
    {
      name: "花束",
      value: "💐",
    },
    {
      name: "樱花",
      value: "🌸",
    },
    {
      name: "白花",
      value: "💮",
    },
    {
      name: "圆形花饰",
      value: "🏵",
    },
    {
      name: "玫瑰",
      value: "🌹",
    },
    {
      name: "枯萎的花",
      value: "🥀",
    },
    {
      name: "芙蓉",
      value: "🌺",
    },
    {
      name: "向日葵",
      value: "🌻",
    },
    {
      name: "开花",
      value: "🌼",
    },
    {
      name: "郁金香",
      value: "🌷",
    },
    {
      name: "幼苗",
      value: "🌱",
    },
    {
      name: "盆栽植物",
      value: "🪴",
    },
    {
      name: "松树",
      value: "🌲",
    },
    {
      name: "落叶树",
      value: "🌳",
    },
    {
      name: "棕榈树",
      value: "🌴",
    },
    {
      name: "仙人掌",
      value: "🌵",
    },
    {
      name: "稻子",
      value: "🌾",
    },
    {
      name: "药草",
      value: "🌿",
    },
    {
      name: "三叶草",
      value: "☘",
    },
    {
      name: "四叶草",
      value: "🍀",
    },
    {
      name: "枫叶",
      value: "🍁",
    },
    {
      name: "落叶",
      value: "🍂",
    },
    {
      name: "风吹叶落",
      value: "🍃",
    },
    {
      name: "蘑菇",
      value: "🍄",
    },
  ],
  食物和饮料: [
    {
      name: "葡萄",
      value: "🍇",
    },
    {
      name: "甜瓜",
      value: "🍈",
    },
    {
      name: "西瓜",
      value: "🍉",
    },
    {
      name: "橘子",
      value: "🍊",
    },
    {
      name: "柠檬",
      value: "🍋",
    },
    {
      name: "香蕉",
      value: "🍌",
    },
    {
      name: "菠萝",
      value: "🍍",
    },
    {
      name: "芒果",
      value: "🥭",
    },
    {
      name: "红苹果",
      value: "🍎",
    },
    {
      name: "青苹果",
      value: "🍏",
    },
    {
      name: "梨",
      value: "🍐",
    },
    {
      name: "桃",
      value: "🍑",
    },
    {
      name: "樱桃",
      value: "🍒",
    },
    {
      name: "草莓",
      value: "🍓",
    },
    {
      name: "蓝莓",
      value: "🫐",
    },
    {
      name: "猕猴桃",
      value: "🥝",
    },
    {
      name: "西红柿",
      value: "🍅",
    },
    {
      name: "橄榄",
      value: "🫒",
    },
    {
      name: "椰子",
      value: "🥥",
    },
    {
      name: "鳄梨",
      value: "🥑",
    },
    {
      name: "茄子",
      value: "🍆",
    },
    {
      name: "土豆",
      value: "🥔",
    },
    {
      name: "胡萝卜",
      value: "🥕",
    },
    {
      name: "玉米",
      value: "🌽",
    },
    {
      name: "红辣椒",
      value: "🌶",
    },
    {
      name: "灯笼椒",
      value: "🫑",
    },
    {
      name: "黄瓜",
      value: "🥒",
    },
    {
      name: "绿叶蔬菜",
      value: "🥬",
    },
    {
      name: "西兰花",
      value: "🥦",
    },
    {
      name: "蒜",
      value: "🧄",
    },
    {
      name: "洋葱",
      value: "🧅",
    },
    {
      name: "花生",
      value: "🥜",
    },
    {
      name: "栗子",
      value: "🌰",
    },
    {
      name: "面包",
      value: "🍞",
    },
    {
      name: "羊角面包",
      value: "🥐",
    },
    {
      name: "法式长棍面包",
      value: "🥖",
    },
    {
      name: "扁面包",
      value: "🫓",
    },
    {
      name: "椒盐卷饼",
      value: "🥨",
    },
    {
      name: "面包圈",
      value: "🥯",
    },
    {
      name: "烙饼",
      value: "🥞",
    },
    {
      name: "华夫饼",
      value: "🧇",
    },
    {
      name: "芝士",
      value: "🧀",
    },
    {
      name: "排骨",
      value: "🍖",
    },
    {
      name: "家禽的腿",
      value: "🍗",
    },
    {
      name: "肉块",
      value: "🥩",
    },
    {
      name: "培根",
      value: "🥓",
    },
    {
      name: "汉堡",
      value: "🍔",
    },
    {
      name: "薯条",
      value: "🍟",
    },
    {
      name: "披萨",
      value: "🍕",
    },
    {
      name: "热狗",
      value: "🌭",
    },
    {
      name: "三明治",
      value: "🥪",
    },
    {
      name: "墨西哥卷饼",
      value: "🌮",
    },
    {
      name: "墨西哥玉米煎饼",
      value: "🌯",
    },
    {
      name: "墨西哥粽子",
      value: "🫔",
    },
    {
      name: "夹心饼",
      value: "🥙",
    },
    {
      name: "炸豆丸子",
      value: "🧆",
    },
    {
      name: "蛋",
      value: "🥚",
    },
    {
      name: "煎蛋",
      value: "🍳",
    },
    {
      name: "装有食物的浅底锅",
      value: "🥘",
    },
    {
      name: "一锅食物",
      value: "🍲",
    },
    {
      name: "奶酪火锅",
      value: "🫕",
    },
    {
      name: "碗勺",
      value: "🥣",
    },
    {
      name: "绿色沙拉",
      value: "🥗",
    },
    {
      name: "爆米花",
      value: "🍿",
    },
    {
      name: "黄油",
      value: "🧈",
    },
    {
      name: "盐",
      value: "🧂",
    },
    {
      name: "罐头食品",
      value: "🥫",
    },
    {
      name: "盒饭",
      value: "🍱",
    },
    {
      name: "米饼",
      value: "🍘",
    },
    {
      name: "饭团",
      value: "🍙",
    },
    {
      name: "米饭",
      value: "🍚",
    },
    {
      name: "咖喱饭",
      value: "🍛",
    },
    {
      name: "面条",
      value: "🍜",
    },
    {
      name: "意粉",
      value: "🍝",
    },
    {
      name: "烤红薯",
      value: "🍠",
    },
    {
      name: "关东煮",
      value: "🍢",
    },
    {
      name: "寿司",
      value: "🍣",
    },
    {
      name: "天妇罗",
      value: "🍤",
    },
    {
      name: "鱼板",
      value: "🍥",
    },
    {
      name: "月饼",
      value: "🥮",
    },
    {
      name: "团子",
      value: "🍡",
    },
    {
      name: "饺子",
      value: "🥟",
    },
    {
      name: "幸运饼干",
      value: "🥠",
    },
    {
      name: "外卖盒",
      value: "🥡",
    },
    {
      name: "蟹",
      value: "🦀",
    },
    {
      name: "龙虾",
      value: "🦞",
    },
    {
      name: "虾",
      value: "🦐",
    },
    {
      name: "乌贼",
      value: "🦑",
    },
    {
      name: "牡蛎",
      value: "🦪",
    },
    {
      name: "圆筒冰激凌",
      value: "🍦",
    },
    {
      name: "刨冰",
      value: "🍧",
    },
    {
      name: "冰淇淋",
      value: "🍨",
    },
    {
      name: "甜甜圈",
      value: "🍩",
    },
    {
      name: "饼干",
      value: "🍪",
    },
    {
      name: "生日蛋糕",
      value: "🎂",
    },
    {
      name: "水果蛋糕",
      value: "🍰",
    },
    {
      name: "纸杯蛋糕",
      value: "🧁",
    },
    {
      name: "派",
      value: "🥧",
    },
    {
      name: "巧克力",
      value: "🍫",
    },
    {
      name: "糖",
      value: "🍬",
    },
    {
      name: "棒棒糖",
      value: "🍭",
    },
    {
      name: "奶黄",
      value: "🍮",
    },
    {
      name: "蜂蜜",
      value: "🍯",
    },
    {
      name: "奶瓶",
      value: "🍼",
    },
    {
      name: "一杯奶",
      value: "🥛",
    },
    {
      name: "热饮",
      value: "☕",
    },
    {
      name: "茶壶",
      value: "🫖",
    },
    {
      name: "热茶",
      value: "🍵",
    },
    {
      name: "清酒",
      value: "🍶",
    },
    {
      name: "开香槟",
      value: "🍾",
    },
    {
      name: "葡萄酒",
      value: "🍷",
    },
    {
      name: "鸡尾酒",
      value: "🍸",
    },
    {
      name: "热带水果饮料",
      value: "🍹",
    },
    {
      name: "啤酒",
      value: "🍺",
    },
    {
      name: "干杯",
      value: "🍻",
    },
    {
      name: "碰杯",
      value: "🥂",
    },
    {
      name: "平底杯",
      value: "🥃",
    },
    {
      name: "带吸管杯",
      value: "🥤",
    },
    {
      name: "珍珠奶茶",
      value: "🧋",
    },
    {
      name: "饮料盒",
      value: "🧃",
    },
    {
      name: "马黛茶",
      value: "🧉",
    },
    {
      name: "冰块",
      value: "🧊",
    },
    {
      name: "筷子",
      value: "🥢",
    },
    {
      name: "餐具",
      value: "🍽",
    },
    {
      name: "刀叉",
      value: "🍴",
    },
    {
      name: "匙",
      value: "🥄",
    },
    {
      name: "菜刀",
      value: "🔪",
    },
    {
      name: "双耳瓶",
      value: "🏺",
    },
  ],
  旅行和地点: [
    {
      name: "地球上的欧洲非洲",
      value: "🌍",
    },
    {
      name: "地球上的美洲",
      value: "🌎",
    },
    {
      name: "地球上的亚洲澳洲",
      value: "🌏",
    },
    {
      name: "带经纬线的地球",
      value: "🌐",
    },
    {
      name: "世界地图",
      value: "🗺",
    },
    {
      name: "日本地图",
      value: "🗾",
    },
    {
      name: "指南针",
      value: "🧭",
    },
    {
      name: "雪山",
      value: "🏔",
    },
    {
      name: "山",
      value: "⛰",
    },
    {
      name: "火山",
      value: "🌋",
    },
    {
      name: "富士山",
      value: "🗻",
    },
    {
      name: "露营",
      value: "🏕",
    },
    {
      name: "沙滩伞",
      value: "🏖",
    },
    {
      name: "沙漠",
      value: "🏜",
    },
    {
      name: "无人荒岛",
      value: "🏝",
    },
    {
      name: "国家公园",
      value: "🏞",
    },
    {
      name: "体育馆",
      value: "🏟",
    },
    {
      name: "古典建筑",
      value: "🏛",
    },
    {
      name: "施工",
      value: "🏗",
    },
    {
      name: "砖",
      value: "🧱",
    },
    {
      name: "岩石",
      value: "🪨",
    },
    {
      name: "木头",
      value: "🪵",
    },
    {
      name: "小屋",
      value: "🛖",
    },
    {
      name: "房屋建筑",
      value: "🏘",
    },
    {
      name: "废墟",
      value: "🏚",
    },
    {
      name: "房子",
      value: "🏠",
    },
    {
      name: "别墅",
      value: "🏡",
    },
    {
      name: "办公楼",
      value: "🏢",
    },
    {
      name: "日本邮局",
      value: "🏣",
    },
    {
      name: "邮局",
      value: "🏤",
    },
    {
      name: "医院",
      value: "🏥",
    },
    {
      name: "银行",
      value: "🏦",
    },
    {
      name: "酒店",
      value: "🏨",
    },
    {
      name: "情人酒店",
      value: "🏩",
    },
    {
      name: "便利店",
      value: "🏪",
    },
    {
      name: "学校",
      value: "🏫",
    },
    {
      name: "商场",
      value: "🏬",
    },
    {
      name: "工厂",
      value: "🏭",
    },
    {
      name: "日本城堡",
      value: "🏯",
    },
    {
      name: "欧洲城堡",
      value: "🏰",
    },
    {
      name: "婚礼",
      value: "💒",
    },
    {
      name: "东京塔",
      value: "🗼",
    },
    {
      name: "自由女神像",
      value: "🗽",
    },
    {
      name: "教堂",
      value: "⛪",
    },
    {
      name: "清真寺",
      value: "🕌",
    },
    {
      name: "印度寺庙",
      value: "🛕",
    },
    {
      name: "犹太教堂",
      value: "🕍",
    },
    {
      name: "神社",
      value: "⛩",
    },
    {
      name: "克尔白",
      value: "🕋",
    },
    {
      name: "喷泉",
      value: "⛲",
    },
    {
      name: "帐篷",
      value: "⛺",
    },
    {
      name: "有雾",
      value: "🌁",
    },
    {
      name: "夜晚",
      value: "🌃",
    },
    {
      name: "城市风光",
      value: "🏙",
    },
    {
      name: "山顶日出",
      value: "🌄",
    },
    {
      name: "日出",
      value: "🌅",
    },
    {
      name: "城市黄昏",
      value: "🌆",
    },
    {
      name: "日落",
      value: "🌇",
    },
    {
      name: "夜幕下的桥",
      value: "🌉",
    },
    {
      name: "温泉",
      value: "♨",
    },
    {
      name: "旋转木马",
      value: "🎠",
    },
    {
      name: "摩天轮",
      value: "🎡",
    },
    {
      name: "过山车",
      value: "🎢",
    },
    {
      name: "理发店",
      value: "💈",
    },
    {
      name: "马戏团帐篷",
      value: "🎪",
    },
    {
      name: "蒸汽火车",
      value: "🚂",
    },
    {
      name: "轨道车",
      value: "🚃",
    },
    {
      name: "高速列车",
      value: "🚄",
    },
    {
      name: "子弹头高速列车",
      value: "🚅",
    },
    {
      name: "火车",
      value: "🚆",
    },
    {
      name: "地铁",
      value: "🚇",
    },
    {
      name: "轻轨",
      value: "🚈",
    },
    {
      name: "车站",
      value: "🚉",
    },
    {
      name: "路面电车",
      value: "🚊",
    },
    {
      name: "单轨",
      value: "🚝",
    },
    {
      name: "山区铁路",
      value: "🚞",
    },
    {
      name: "有轨电车",
      value: "🚋",
    },
    {
      name: "公交车",
      value: "🚌",
    },
    {
      name: "迎面驶来的公交车",
      value: "🚍",
    },
    {
      name: "无轨电车",
      value: "🚎",
    },
    {
      name: "小巴",
      value: "🚐",
    },
    {
      name: "救护车",
      value: "🚑",
    },
    {
      name: "消防车",
      value: "🚒",
    },
    {
      name: "警车",
      value: "🚓",
    },
    {
      name: "迎面驶来的警车",
      value: "🚔",
    },
    {
      name: "出租车",
      value: "🚕",
    },
    {
      name: "迎面驶来的出租车",
      value: "🚖",
    },
    {
      name: "汽车",
      value: "🚗",
    },
    {
      name: "迎面驶来的汽车",
      value: "🚘",
    },
    {
      name: "运动型多用途车",
      value: "🚙",
    },
    {
      name: "敞蓬小型载货卡车",
      value: "🛻",
    },
    {
      name: "货车",
      value: "🚚",
    },
    {
      name: "铰接式货车",
      value: "🚛",
    },
    {
      name: "拖拉机",
      value: "🚜",
    },
    {
      name: "赛车",
      value: "🏎",
    },
    {
      name: "摩托车",
      value: "🏍",
    },
    {
      name: "小型摩托车",
      value: "🛵",
    },
    {
      name: "手动轮椅",
      value: "🦽",
    },
    {
      name: "电动轮椅",
      value: "🦼",
    },
    {
      name: "三轮摩托车",
      value: "🛺",
    },
    {
      name: "自行车",
      value: "🚲",
    },
    {
      name: "滑板车",
      value: "🛴",
    },
    {
      name: "滑板",
      value: "🛹",
    },
    {
      name: "四轮滑冰鞋",
      value: "🛼",
    },
    {
      name: "公交车站",
      value: "🚏",
    },
    {
      name: "高速公路",
      value: "🛣",
    },
    {
      name: "铁轨",
      value: "🛤",
    },
    {
      name: "石油桶",
      value: "🛢",
    },
    {
      name: "油泵",
      value: "⛽",
    },
    {
      name: "警车灯",
      value: "🚨",
    },
    {
      name: "横向的红绿灯",
      value: "🚥",
    },
    {
      name: "纵向的红绿灯",
      value: "🚦",
    },
    {
      name: "停止标志",
      value: "🛑",
    },
    {
      name: "路障",
      value: "🚧",
    },
    {
      name: "锚",
      value: "⚓",
    },
    {
      name: "帆船",
      value: "⛵",
    },
    {
      name: "独木舟",
      value: "🛶",
    },
    {
      name: "快艇",
      value: "🚤",
    },
    {
      name: "客轮",
      value: "🛳",
    },
    {
      name: "渡轮",
      value: "⛴",
    },
    {
      name: "摩托艇",
      value: "🛥",
    },
    {
      name: "船",
      value: "🚢",
    },
    {
      name: "飞机",
      value: "✈",
    },
    {
      name: "小型飞机",
      value: "🛩",
    },
    {
      name: "航班起飞",
      value: "🛫",
    },
    {
      name: "航班降落",
      value: "🛬",
    },
    {
      name: "降落伞",
      value: "🪂",
    },
    {
      name: "座位",
      value: "💺",
    },
    {
      name: "直升机",
      value: "🚁",
    },
    {
      name: "空轨",
      value: "🚟",
    },
    {
      name: "缆车",
      value: "🚠",
    },
    {
      name: "索道",
      value: "🚡",
    },
    {
      name: "卫星",
      value: "🛰",
    },
    {
      name: "火箭",
      value: "🚀",
    },
    {
      name: "飞碟",
      value: "🛸",
    },
    {
      name: "服务铃",
      value: "🛎",
    },
    {
      name: "行李箱",
      value: "🧳",
    },
    {
      name: "沙漏",
      value: "⌛",
    },
    {
      name: "沙正往下流的沙漏",
      value: "⏳",
    },
    {
      name: "手表",
      value: "⌚",
    },
    {
      name: "闹钟",
      value: "⏰",
    },
    {
      name: "秒表",
      value: "⏱",
    },
    {
      name: "定时器",
      value: "⏲",
    },
    {
      name: "座钟",
      value: "🕰",
    },
    {
      name: "十二点",
      value: "🕛",
    },
    {
      name: "十二点半",
      value: "🕧",
    },
    {
      name: "一点",
      value: "🕐",
    },
    {
      name: "一点半",
      value: "🕜",
    },
    {
      name: "两点",
      value: "🕑",
    },
    {
      name: "两点半",
      value: "🕝",
    },
    {
      name: "三点",
      value: "🕒",
    },
    {
      name: "三点半",
      value: "🕞",
    },
    {
      name: "四点",
      value: "🕓",
    },
    {
      name: "四点半",
      value: "🕟",
    },
    {
      name: "五点",
      value: "🕔",
    },
    {
      name: "五点半",
      value: "🕠",
    },
    {
      name: "六点",
      value: "🕕",
    },
    {
      name: "六点半",
      value: "🕡",
    },
    {
      name: "七点",
      value: "🕖",
    },
    {
      name: "七点半",
      value: "🕢",
    },
    {
      name: "八点",
      value: "🕗",
    },
    {
      name: "八点半",
      value: "🕣",
    },
    {
      name: "九点",
      value: "🕘",
    },
    {
      name: "九点半",
      value: "🕤",
    },
    {
      name: "十点",
      value: "🕙",
    },
    {
      name: "十点半",
      value: "🕥",
    },
    {
      name: "十一点",
      value: "🕚",
    },
    {
      name: "十一点半",
      value: "🕦",
    },
    {
      name: "朔月",
      value: "🌑",
    },
    {
      name: "娥眉月",
      value: "🌒",
    },
    {
      name: "上弦月",
      value: "🌓",
    },
    {
      name: "盈凸月",
      value: "🌔",
    },
    {
      name: "满月",
      value: "🌕",
    },
    {
      name: "亏凸月",
      value: "🌖",
    },
    {
      name: "下弦月",
      value: "🌗",
    },
    {
      name: "残月",
      value: "🌘",
    },
    {
      name: "弯月",
      value: "🌙",
    },
    {
      name: "微笑的朔月",
      value: "🌚",
    },
    {
      name: "微笑的上弦月",
      value: "🌛",
    },
    {
      name: "微笑的下弦月",
      value: "🌜",
    },
    {
      name: "温度计",
      value: "🌡",
    },
    {
      name: "太阳",
      value: "☀",
    },
    {
      name: "微笑的月亮",
      value: "🌝",
    },
    {
      name: "微笑的太阳",
      value: "🌞",
    },
    {
      name: "有环行星",
      value: "🪐",
    },
    {
      name: "星星",
      value: "⭐",
    },
    {
      name: "闪亮的星星",
      value: "🌟",
    },
    {
      name: "流星",
      value: "🌠",
    },
    {
      name: "银河",
      value: "🌌",
    },
    {
      name: "云",
      value: "☁",
    },
    {
      name: "阴",
      value: "⛅",
    },
    {
      name: "雷阵雨",
      value: "⛈",
    },
    {
      name: "晴偶有云",
      value: "🌤",
    },
    {
      name: "多云",
      value: "🌥",
    },
    {
      name: "晴转雨",
      value: "🌦",
    },
    {
      name: "下雨",
      value: "🌧",
    },
    {
      name: "下雪",
      value: "🌨",
    },
    {
      name: "打雷",
      value: "🌩",
    },
    {
      name: "龙卷风",
      value: "🌪",
    },
    {
      name: "雾",
      value: "🌫",
    },
    {
      name: "大风",
      value: "🌬",
    },
    {
      name: "台风",
      value: "🌀",
    },
    {
      name: "彩虹",
      value: "🌈",
    },
    {
      name: "收起的伞",
      value: "🌂",
    },
    {
      name: "伞",
      value: "☂",
    },
    {
      name: "雨伞",
      value: "☔",
    },
    {
      name: "阳伞",
      value: "⛱",
    },
    {
      name: "高压",
      value: "⚡",
    },
    {
      name: "雪花",
      value: "❄",
    },
    {
      name: "雪与雪人",
      value: "☃",
    },
    {
      name: "雪人",
      value: "⛄",
    },
    {
      name: "彗星",
      value: "☄",
    },
    {
      name: "火焰",
      value: "🔥",
    },
    {
      name: "水滴",
      value: "💧",
    },
    {
      name: "浪花",
      value: "🌊",
    },
  ],
  活动: [
    {
      name: "南瓜灯",
      value: "🎃",
    },
    {
      name: "圣诞树",
      value: "🎄",
    },
    {
      name: "焰火",
      value: "🎆",
    },
    {
      name: "烟花",
      value: "🎇",
    },
    {
      name: "爆竹",
      value: "🧨",
    },
    {
      name: "闪亮",
      value: "✨",
    },
    {
      name: "气球",
      value: "🎈",
    },
    {
      name: "拉炮彩带",
      value: "🎉",
    },
    {
      name: "五彩纸屑球",
      value: "🎊",
    },
    {
      name: "七夕树",
      value: "🎋",
    },
    {
      name: "门松",
      value: "🎍",
    },
    {
      name: "日本人形",
      value: "🎎",
    },
    {
      name: "鲤鱼旗",
      value: "🎏",
    },
    {
      name: "风铃",
      value: "🎐",
    },
    {
      name: "赏月",
      value: "🎑",
    },
    {
      name: "红包",
      value: "🧧",
    },
    {
      name: "蝴蝶结",
      value: "🎀",
    },
    {
      name: "礼物",
      value: "🎁",
    },
    {
      name: "提示丝带",
      value: "🎗",
    },
    {
      name: "入场券",
      value: "🎟",
    },
    {
      name: "票",
      value: "🎫",
    },
    {
      name: "军功章",
      value: "🎖",
    },
    {
      name: "奖杯",
      value: "🏆",
    },
    {
      name: "奖牌",
      value: "🏅",
    },
    {
      name: "金牌",
      value: "🥇",
    },
    {
      name: "银牌",
      value: "🥈",
    },
    {
      name: "铜牌",
      value: "🥉",
    },
    {
      name: "足球",
      value: "⚽",
    },
    {
      name: "棒球",
      value: "⚾",
    },
    {
      name: "垒球",
      value: "🥎",
    },
    {
      name: "篮球",
      value: "🏀",
    },
    {
      name: "排球",
      value: "🏐",
    },
    {
      name: "美式橄榄球",
      value: "🏈",
    },
    {
      name: "英式橄榄球",
      value: "🏉",
    },
    {
      name: "网球",
      value: "🎾",
    },
    {
      name: "飞盘",
      value: "🥏",
    },
    {
      name: "保龄球",
      value: "🎳",
    },
    {
      name: "板球",
      value: "🏏",
    },
    {
      name: "曲棍球",
      value: "🏑",
    },
    {
      name: "冰球",
      value: "🏒",
    },
    {
      name: "袋棍球",
      value: "🥍",
    },
    {
      name: "乒乓球",
      value: "🏓",
    },
    {
      name: "羽毛球",
      value: "🏸",
    },
    {
      name: "拳击手套",
      value: "🥊",
    },
    {
      name: "练武服",
      value: "🥋",
    },
    {
      name: "球门",
      value: "🥅",
    },
    {
      name: "高尔夫球洞",
      value: "⛳",
    },
    {
      name: "滑冰",
      value: "⛸",
    },
    {
      name: "钓鱼竿",
      value: "🎣",
    },
    {
      name: "潜水面罩",
      value: "🤿",
    },
    {
      name: "运动背心",
      value: "🎽",
    },
    {
      name: "滑雪",
      value: "🎿",
    },
    {
      name: "雪橇",
      value: "🛷",
    },
    {
      name: "冰壶",
      value: "🥌",
    },
    {
      name: "正中靶心的飞镖",
      value: "🎯",
    },
    {
      name: "悠悠球",
      value: "🪀",
    },
    {
      name: "风筝",
      value: "🪁",
    },
    {
      name: "台球",
      value: "🎱",
    },
    {
      name: "水晶球",
      value: "🔮",
    },
    {
      name: "魔棒",
      value: "🪄",
    },
    {
      name: "游戏手柄",
      value: "🎮",
    },
    {
      name: "游戏操控杆",
      value: "🕹",
    },
    {
      name: "老虎机",
      value: "🎰",
    },
    {
      name: "骰子",
      value: "🎲",
    },
    {
      name: "拼图",
      value: "🧩",
    },
    {
      name: "泰迪熊",
      value: "🧸",
    },
    {
      name: "彩罐",
      value: "🪅",
    },
    {
      name: "套娃",
      value: "🪆",
    },
    {
      name: "黑桃",
      value: "♠",
    },
    {
      name: "红桃",
      value: "♥",
    },
    {
      name: "方片",
      value: "♦",
    },
    {
      name: "梅花",
      value: "♣",
    },
    {
      name: "兵",
      value: "♟",
    },
    {
      name: "大小王",
      value: "🃏",
    },
    {
      name: "红中",
      value: "🀄",
    },
    {
      name: "花札",
      value: "🎴",
    },
    {
      name: "表演艺术",
      value: "🎭",
    },
    {
      name: "带框的画",
      value: "🖼",
    },
    {
      name: "调色盘",
      value: "🎨",
    },
    {
      name: "线",
      value: "🧵",
    },
    {
      name: "缝合针",
      value: "🪡",
    },
    {
      name: "毛线",
      value: "🧶",
    },
    {
      name: "结",
      value: "🪢",
    },
    {
      name: "水枪",
      value: "🔫",
    },
  ],
  物品: [
    {
      name: "炸弹",
      value: "💣",
    },
    {
      name: "纳扎尔护身符",
      value: "🧿",
    },
    {
      name: "眼镜",
      value: "👓",
    },
    {
      name: "墨镜",
      value: "🕶",
    },
    {
      name: "护目镜",
      value: "🥽",
    },
    {
      name: "白大褂",
      value: "🥼",
    },
    {
      name: "救生衣",
      value: "🦺",
    },
    {
      name: "领带",
      value: "👔",
    },
    {
      name: "T恤",
      value: "👕",
    },
    {
      name: "牛仔裤",
      value: "👖",
    },
    {
      name: "围巾",
      value: "🧣",
    },
    {
      name: "手套",
      value: "🧤",
    },
    {
      name: "外套",
      value: "🧥",
    },
    {
      name: "袜子",
      value: "🧦",
    },
    {
      name: "连衣裙",
      value: "👗",
    },
    {
      name: "和服",
      value: "👘",
    },
    {
      name: "纱丽",
      value: "🥻",
    },
    {
      name: "连体泳衣",
      value: "🩱",
    },
    {
      name: "三角裤",
      value: "🩲",
    },
    {
      name: "短裤",
      value: "🩳",
    },
    {
      name: "比基尼",
      value: "👙",
    },
    {
      name: "女装",
      value: "👚",
    },
    {
      name: "钱包",
      value: "👛",
    },
    {
      name: "手提包",
      value: "👜",
    },
    {
      name: "手袋",
      value: "👝",
    },
    {
      name: "购物袋",
      value: "🛍",
    },
    {
      name: "书包",
      value: "🎒",
    },
    {
      name: "夹趾凉鞋",
      value: "🩴",
    },
    {
      name: "男鞋",
      value: "👞",
    },
    {
      name: "跑鞋",
      value: "👟",
    },
    {
      name: "登山鞋",
      value: "🥾",
    },
    {
      name: "平底鞋",
      value: "🥿",
    },
    {
      name: "高跟鞋",
      value: "👠",
    },
    {
      name: "女式凉鞋",
      value: "👡",
    },
    {
      name: "芭蕾舞鞋",
      value: "🩰",
    },
    {
      name: "女靴",
      value: "👢",
    },
    {
      name: "皇冠",
      value: "👑",
    },
    {
      name: "女帽",
      value: "👒",
    },
    {
      name: "礼帽",
      value: "🎩",
    },
    {
      name: "毕业帽",
      value: "🎓",
    },
    {
      name: "鸭舌帽",
      value: "🧢",
    },
    {
      name: "军用头盔",
      value: "🪖",
    },
    {
      name: "白十字头盔",
      value: "⛑",
    },
    {
      name: "念珠",
      value: "📿",
    },
    {
      name: "唇膏",
      value: "💄",
    },
    {
      name: "戒指",
      value: "💍",
    },
    {
      name: "宝石",
      value: "💎",
    },
    {
      name: "已静音的扬声器",
      value: "🔇",
    },
    {
      name: "低音量的扬声器",
      value: "🔈",
    },
    {
      name: "中等音量的扬声器",
      value: "🔉",
    },
    {
      name: "高音量的扬声器",
      value: "🔊",
    },
    {
      name: "喇叭",
      value: "📢",
    },
    {
      name: "扩音器",
      value: "📣",
    },
    {
      name: "邮号",
      value: "📯",
    },
    {
      name: "铃铛",
      value: "🔔",
    },
    {
      name: "禁止响铃",
      value: "🔕",
    },
    {
      name: "乐谱",
      value: "🎼",
    },
    {
      name: "音符",
      value: "🎵",
    },
    {
      name: "多个音符",
      value: "🎶",
    },
    {
      name: "录音室麦克风",
      value: "🎙",
    },
    {
      name: "电平滑块",
      value: "🎚",
    },
    {
      name: "控制旋钮",
      value: "🎛",
    },
    {
      name: "麦克风",
      value: "🎤",
    },
    {
      name: "耳机",
      value: "🎧",
    },
    {
      name: "收音机",
      value: "📻",
    },
    {
      name: "萨克斯管",
      value: "🎷",
    },
    {
      name: "手风琴",
      value: "🪗",
    },
    {
      name: "吉他",
      value: "🎸",
    },
    {
      name: "音乐键盘",
      value: "🎹",
    },
    {
      name: "小号",
      value: "🎺",
    },
    {
      name: "小提琴",
      value: "🎻",
    },
    {
      name: "班卓琴",
      value: "🪕",
    },
    {
      name: "鼓",
      value: "🥁",
    },
    {
      name: "长鼓",
      value: "🪘",
    },
    {
      name: "手机",
      value: "📱",
    },
    {
      name: "带有箭头的手机",
      value: "📲",
    },
    {
      name: "电话",
      value: "☎",
    },
    {
      name: "电话听筒",
      value: "📞",
    },
    {
      name: "寻呼机",
      value: "📟",
    },
    {
      name: "传真机",
      value: "📠",
    },
    {
      name: "电池",
      value: "🔋",
    },
    {
      name: "电源插头",
      value: "🔌",
    },
    {
      name: "笔记本电脑",
      value: "💻",
    },
    {
      name: "台式电脑",
      value: "🖥",
    },
    {
      name: "打印机",
      value: "🖨",
    },
    {
      name: "键盘",
      value: "⌨",
    },
    {
      name: "电脑鼠标",
      value: "🖱",
    },
    {
      name: "轨迹球",
      value: "🖲",
    },
    {
      name: "电脑光盘",
      value: "💽",
    },
    {
      name: "软盘",
      value: "💾",
    },
    {
      name: "光盘",
      value: "💿",
    },
    {
      name: "DVD",
      value: "📀",
    },
    {
      name: "算盘",
      value: "🧮",
    },
    {
      name: "电影摄影机",
      value: "🎥",
    },
    {
      name: "影片帧",
      value: "🎞",
    },
    {
      name: "电影放映机",
      value: "📽",
    },
    {
      name: "场记板",
      value: "🎬",
    },
    {
      name: "电视机",
      value: "📺",
    },
    {
      name: "相机",
      value: "📷",
    },
    {
      name: "开闪光灯的相机",
      value: "📸",
    },
    {
      name: "摄像机",
      value: "📹",
    },
    {
      name: "录像带",
      value: "📼",
    },
    {
      name: "左斜的放大镜",
      value: "🔍",
    },
    {
      name: "右斜的放大镜",
      value: "🔎",
    },
    {
      name: "蜡烛",
      value: "🕯",
    },
    {
      name: "灯泡",
      value: "💡",
    },
    {
      name: "手电筒",
      value: "🔦",
    },
    {
      name: "红灯笼",
      value: "🏮",
    },
    {
      name: "印度油灯",
      value: "🪔",
    },
    {
      name: "精装笔记本",
      value: "📔",
    },
    {
      name: "合上的书本",
      value: "📕",
    },
    {
      name: "打开的书本",
      value: "📖",
    },
    {
      name: "绿色书本",
      value: "📗",
    },
    {
      name: "蓝色书本",
      value: "📘",
    },
    {
      name: "橙色书本",
      value: "📙",
    },
    {
      name: "书",
      value: "📚",
    },
    {
      name: "笔记本",
      value: "📓",
    },
    {
      name: "账本",
      value: "📒",
    },
    {
      name: "带卷边的页面",
      value: "📃",
    },
    {
      name: "卷轴",
      value: "📜",
    },
    {
      name: "文件",
      value: "📄",
    },
    {
      name: "报纸",
      value: "📰",
    },
    {
      name: "报纸卷",
      value: "🗞",
    },
    {
      name: "标签页",
      value: "📑",
    },
    {
      name: "书签",
      value: "🔖",
    },
    {
      name: "标签",
      value: "🏷",
    },
    {
      name: "钱袋",
      value: "💰",
    },
    {
      name: "硬币",
      value: "🪙",
    },
    {
      name: "日元",
      value: "💴",
    },
    {
      name: "美元",
      value: "💵",
    },
    {
      name: "欧元",
      value: "💶",
    },
    {
      name: "英镑",
      value: "💷",
    },
    {
      name: "长翅膀的钱",
      value: "💸",
    },
    {
      name: "信用卡",
      value: "💳",
    },
    {
      name: "收据",
      value: "🧾",
    },
    {
      name: "趋势向上且带有日元符号的图表",
      value: "💹",
    },
    {
      name: "信封",
      value: "✉",
    },
    {
      name: "电子邮件",
      value: "📧",
    },
    {
      name: "来信",
      value: "📨",
    },
    {
      name: "收邮件",
      value: "📩",
    },
    {
      name: "发件箱",
      value: "📤",
    },
    {
      name: "收件箱",
      value: "📥",
    },
    {
      name: "包裹",
      value: "📦",
    },
    {
      name: "有待收信件",
      value: "📫",
    },
    {
      name: "无待收信件",
      value: "📪",
    },
    {
      name: "有新信件",
      value: "📬",
    },
    {
      name: "无新信件",
      value: "📭",
    },
    {
      name: "邮筒",
      value: "📮",
    },
    {
      name: "投票箱",
      value: "🗳",
    },
    {
      name: "铅笔",
      value: "✏",
    },
    {
      name: "钢笔尖",
      value: "✒",
    },
    {
      name: "钢笔",
      value: "🖋",
    },
    {
      name: "笔",
      value: "🖊",
    },
    {
      name: "画笔",
      value: "🖌",
    },
    {
      name: "蜡笔",
      value: "🖍",
    },
    {
      name: "备忘录",
      value: "📝",
    },
    {
      name: "公文包",
      value: "💼",
    },
    {
      name: "文件夹",
      value: "📁",
    },
    {
      name: "打开的文件夹",
      value: "📂",
    },
    {
      name: "索引分隔文件夹",
      value: "🗂",
    },
    {
      name: "日历",
      value: "📅",
    },
    {
      name: "手撕日历",
      value: "📆",
    },
    {
      name: "线圈本",
      value: "🗒",
    },
    {
      name: "线圈日历",
      value: "🗓",
    },
    {
      name: "卡片索引",
      value: "📇",
    },
    {
      name: "趋势向上的图表",
      value: "📈",
    },
    {
      name: "趋势向下的图表",
      value: "📉",
    },
    {
      name: "条形图",
      value: "📊",
    },
    {
      name: "剪贴板",
      value: "📋",
    },
    {
      name: "图钉",
      value: "📌",
    },
    {
      name: "圆图钉",
      value: "📍",
    },
    {
      name: "回形针",
      value: "📎",
    },
    {
      name: "连起来的两个回形针",
      value: "🖇",
    },
    {
      name: "直尺",
      value: "📏",
    },
    {
      name: "三角尺",
      value: "📐",
    },
    {
      name: "剪刀",
      value: "✂",
    },
    {
      name: "卡片盒",
      value: "🗃",
    },
    {
      name: "文件柜",
      value: "🗄",
    },
    {
      name: "垃圾桶",
      value: "🗑",
    },
    {
      name: "合上的锁",
      value: "🔒",
    },
    {
      name: "打开的锁",
      value: "🔓",
    },
    {
      name: "墨水笔和锁",
      value: "🔏",
    },
    {
      name: "钥匙和锁",
      value: "🔐",
    },
    {
      name: "钥匙",
      value: "🔑",
    },
    {
      name: "老式钥匙",
      value: "🗝",
    },
    {
      name: "锤子",
      value: "🔨",
    },
    {
      name: "斧头",
      value: "🪓",
    },
    {
      name: "铁镐",
      value: "⛏",
    },
    {
      name: "锤子与镐",
      value: "⚒",
    },
    {
      name: "锤子与扳手",
      value: "🛠",
    },
    {
      name: "匕首",
      value: "🗡",
    },
    {
      name: "交叉放置的剑",
      value: "⚔",
    },
    {
      name: "回旋镖",
      value: "🪃",
    },
    {
      name: "弓和箭",
      value: "🏹",
    },
    {
      name: "盾牌",
      value: "🛡",
    },
    {
      name: "木工锯",
      value: "🪚",
    },
    {
      name: "扳手",
      value: "🔧",
    },
    {
      name: "螺丝刀",
      value: "🪛",
    },
    {
      name: "螺母与螺栓",
      value: "🔩",
    },
    {
      name: "齿轮",
      value: "⚙",
    },
    {
      name: "夹钳",
      value: "🗜",
    },
    {
      name: "天平",
      value: "⚖",
    },
    {
      name: "盲杖",
      value: "🦯",
    },
    {
      name: "链接",
      value: "🔗",
    },
    {
      name: "链条",
      value: "⛓",
    },
    {
      name: "挂钩",
      value: "🪝",
    },
    {
      name: "工具箱",
      value: "🧰",
    },
    {
      name: "磁铁",
      value: "🧲",
    },
    {
      name: "梯子",
      value: "🪜",
    },
    {
      name: "蒸馏器",
      value: "⚗",
    },
    {
      name: "试管",
      value: "🧪",
    },
    {
      name: "培养皿",
      value: "🧫",
    },
    {
      name: "DNA",
      value: "🧬",
    },
    {
      name: "显微镜",
      value: "🔬",
    },
    {
      name: "望远镜",
      value: "🔭",
    },
    {
      name: "卫星天线",
      value: "📡",
    },
    {
      name: "注射器",
      value: "💉",
    },
    {
      name: "血滴",
      value: "🩸",
    },
    {
      name: "药丸",
      value: "💊",
    },
    {
      name: "创可贴",
      value: "🩹",
    },
    {
      name: "听诊器",
      value: "🩺",
    },
    {
      name: "门",
      value: "🚪",
    },
    {
      name: "电梯",
      value: "🛗",
    },
    {
      name: "镜子",
      value: "🪞",
    },
    {
      name: "窗户",
      value: "🪟",
    },
    {
      name: "床",
      value: "🛏",
    },
    {
      name: "沙发和灯",
      value: "🛋",
    },
    {
      name: "椅子",
      value: "🪑",
    },
    {
      name: "马桶",
      value: "🚽",
    },
    {
      name: "活塞",
      value: "🪠",
    },
    {
      name: "淋浴",
      value: "🚿",
    },
    {
      name: "浴缸",
      value: "🛁",
    },
    {
      name: "捕鼠器",
      value: "🪤",
    },
    {
      name: "剃须刀",
      value: "🪒",
    },
    {
      name: "乳液瓶",
      value: "🧴",
    },
    {
      name: "安全别针",
      value: "🧷",
    },
    {
      name: "扫帚",
      value: "🧹",
    },
    {
      name: "筐",
      value: "🧺",
    },
    {
      name: "卷纸",
      value: "🧻",
    },
    {
      name: "桶",
      value: "🪣",
    },
    {
      name: "皂",
      value: "🧼",
    },
    {
      name: "牙刷",
      value: "🪥",
    },
    {
      name: "海绵",
      value: "🧽",
    },
    {
      name: "灭火器",
      value: "🧯",
    },
    {
      name: "购物车",
      value: "🛒",
    },
    {
      name: "香烟",
      value: "🚬",
    },
    {
      name: "棺材",
      value: "⚰",
    },
    {
      name: "墓碑",
      value: "🪦",
    },
    {
      name: "骨灰缸",
      value: "⚱",
    },
    {
      name: "摩埃",
      value: "🗿",
    },
    {
      name: "标语牌",
      value: "🪧",
    },
  ],
  符号: [
    {
      name: "取款机",
      value: "🏧",
    },
    {
      name: "倒垃圾",
      value: "🚮",
    },
    {
      name: "饮用水",
      value: "🚰",
    },
    {
      name: "轮椅标识",
      value: "♿",
    },
    {
      name: "男厕",
      value: "🚹",
    },
    {
      name: "女厕",
      value: "🚺",
    },
    {
      name: "卫生间",
      value: "🚻",
    },
    {
      name: "宝宝",
      value: "🚼",
    },
    {
      name: "厕所",
      value: "🚾",
    },
    {
      name: "护照检查",
      value: "🛂",
    },
    {
      name: "海关",
      value: "🛃",
    },
    {
      name: "提取行李",
      value: "🛄",
    },
    {
      name: "寄存行李",
      value: "🛅",
    },
    {
      name: "警告",
      value: "⚠",
    },
    {
      name: "儿童过街",
      value: "🚸",
    },
    {
      name: "禁止通行",
      value: "⛔",
    },
    {
      name: "禁止",
      value: "🚫",
    },
    {
      name: "禁止自行车",
      value: "🚳",
    },
    {
      name: "禁止吸烟",
      value: "🚭",
    },
    {
      name: "禁止乱扔垃圾",
      value: "🚯",
    },
    {
      name: "非饮用水",
      value: "🚱",
    },
    {
      name: "禁止行人通行",
      value: "🚷",
    },
    {
      name: "禁止使用手机",
      value: "📵",
    },
    {
      name: "18禁",
      value: "🔞",
    },
    {
      name: "辐射",
      value: "☢",
    },
    {
      name: "生物危害",
      value: "☣",
    },
    {
      name: "向上箭头",
      value: "⬆",
    },
    {
      name: "右上箭头",
      value: "↗",
    },
    {
      name: "向右箭头",
      value: "➡",
    },
    {
      name: "右下箭头",
      value: "↘",
    },
    {
      name: "向下箭头",
      value: "⬇",
    },
    {
      name: "左下箭头",
      value: "↙",
    },
    {
      name: "向左箭头",
      value: "⬅",
    },
    {
      name: "左上箭头",
      value: "↖",
    },
    {
      name: "上下箭头",
      value: "↕",
    },
    {
      name: "左右箭头",
      value: "↔",
    },
    {
      name: "右转弯箭头",
      value: "↩",
    },
    {
      name: "左转弯箭头",
      value: "↪",
    },
    {
      name: "右上弯箭头",
      value: "⤴",
    },
    {
      name: "右下弯箭头",
      value: "⤵",
    },
    {
      name: "顺时针垂直箭头",
      value: "🔃",
    },
    {
      name: "逆时针箭头按钮",
      value: "🔄",
    },
    {
      name: "返回箭头",
      value: "🔙",
    },
    {
      name: "结束箭头",
      value: "🔚",
    },
    {
      name: "ON! 箭头",
      value: "🔛",
    },
    {
      name: "SOON 箭头",
      value: "🔜",
    },
    {
      name: "置顶",
      value: "🔝",
    },
    {
      name: "宗教场所",
      value: "🛐",
    },
    {
      name: "原子符号",
      value: "⚛",
    },
    {
      name: "奥姆",
      value: "🕉",
    },
    {
      name: "六芒星",
      value: "✡",
    },
    {
      name: "法轮",
      value: "☸",
    },
    {
      name: "阴阳",
      value: "☯",
    },
    {
      name: "十字架",
      value: "✝",
    },
    {
      name: "东正教十字架",
      value: "☦",
    },
    {
      name: "星月",
      value: "☪",
    },
    {
      name: "和平符号",
      value: "☮",
    },
    {
      name: "烛台",
      value: "🕎",
    },
    {
      name: "带中间点的六芒星",
      value: "🔯",
    },
    {
      name: "白羊座",
      value: "♈",
    },
    {
      name: "金牛座",
      value: "♉",
    },
    {
      name: "双子座",
      value: "♊",
    },
    {
      name: "巨蟹座",
      value: "♋",
    },
    {
      name: "狮子座",
      value: "♌",
    },
    {
      name: "处女座",
      value: "♍",
    },
    {
      name: "天秤座",
      value: "♎",
    },
    {
      name: "天蝎座",
      value: "♏",
    },
    {
      name: "射手座",
      value: "♐",
    },
    {
      name: "摩羯座",
      value: "♑",
    },
    {
      name: "水瓶座",
      value: "♒",
    },
    {
      name: "双鱼座",
      value: "♓",
    },
    {
      name: "蛇夫座",
      value: "⛎",
    },
    {
      name: "随机播放音轨按钮",
      value: "🔀",
    },
    {
      name: "重复按钮",
      value: "🔁",
    },
    {
      name: "重复一次按钮",
      value: "🔂",
    },
    {
      name: "播放按钮",
      value: "▶",
    },
    {
      name: "快进按钮",
      value: "⏩",
    },
    {
      name: "下一个音轨按钮",
      value: "⏭",
    },
    {
      name: "播放或暂停按钮",
      value: "⏯",
    },
    {
      name: "倒退按钮",
      value: "◀",
    },
    {
      name: "快退按钮",
      value: "⏪",
    },
    {
      name: "上一个音轨按钮",
      value: "⏮",
    },
    {
      name: "向上三角形按钮",
      value: "🔼",
    },
    {
      name: "快速上升按钮",
      value: "⏫",
    },
    {
      name: "向下三角形按钮",
      value: "🔽",
    },
    {
      name: "快速下降按钮",
      value: "⏬",
    },
    {
      name: "暂停按钮",
      value: "⏸",
    },
    {
      name: "停止按钮",
      value: "⏹",
    },
    {
      name: "录制按钮",
      value: "⏺",
    },
    {
      name: "推出按钮",
      value: "⏏",
    },
    {
      name: "电影院",
      value: "🎦",
    },
    {
      name: "低亮度按钮",
      value: "🔅",
    },
    {
      name: "高亮度按钮",
      value: "🔆",
    },
    {
      name: "信号强度条",
      value: "📶",
    },
    {
      name: "振动模式",
      value: "📳",
    },
    {
      name: "手机关机",
      value: "📴",
    },
    {
      name: "女性符号",
      value: "♀",
    },
    {
      name: "男性符号",
      value: "♂",
    },
    {
      name: "跨性别符号",
      value: "⚧",
    },
    {
      name: "乘",
      value: "✖",
    },
    {
      name: "加",
      value: "➕",
    },
    {
      name: "减",
      value: "➖",
    },
    {
      name: "除",
      value: "➗",
    },
    {
      name: "无穷大",
      value: "♾",
    },
    {
      name: "双感叹号",
      value: "‼",
    },
    {
      name: "感叹疑问号",
      value: "⁉",
    },
    {
      name: "红色问号",
      value: "❓",
    },
    {
      name: "白色问号",
      value: "❔",
    },
    {
      name: "白色感叹号",
      value: "❕",
    },
    {
      name: "红色感叹号",
      value: "❗",
    },
    {
      name: "波浪型破折号",
      value: "〰",
    },
    {
      name: "货币兑换",
      value: "💱",
    },
    {
      name: "粗美元符号",
      value: "💲",
    },
    {
      name: "医疗标志",
      value: "⚕",
    },
    {
      name: "回收标志",
      value: "♻",
    },
    {
      name: "百合花饰",
      value: "⚜",
    },
    {
      name: "三叉戟徽章",
      value: "🔱",
    },
    {
      name: "姓名牌",
      value: "📛",
    },
    {
      name: "日本新手驾驶标志",
      value: "🔰",
    },
    {
      name: "红色空心圆圈",
      value: "⭕",
    },
    {
      name: "勾号按钮",
      value: "✅",
    },
    {
      name: "勾选框",
      value: "☑",
    },
    {
      name: "勾号",
      value: "✔",
    },
    {
      name: "叉号",
      value: "❌",
    },
    {
      name: "叉号按钮",
      value: "❎",
    },
    {
      name: "卷曲环",
      value: "➰",
    },
    {
      name: "双卷曲环",
      value: "➿",
    },
    {
      name: "庵点",
      value: "〽",
    },
    {
      name: "八轮辐星号",
      value: "✳",
    },
    {
      name: "八角星",
      value: "✴",
    },
    {
      name: "火花",
      value: "❇",
    },
    {
      name: "版权",
      value: "©",
    },
    {
      name: "注册",
      value: "®",
    },
    {
      name: "商标",
      value: "™",
    },
    {
      name: "按键: #",
      value: "#️⃣",
    },
    {
      name: "键帽：*",
      value: "*️⃣",
    },
    {
      name: "键帽：0",
      value: "0️⃣",
    },
    {
      name: "键帽：1",
      value: "1️⃣",
    },
    {
      name: "键帽：2",
      value: "2️⃣",
    },
    {
      name: "键帽：3",
      value: "3️⃣",
    },
    {
      name: "键帽：4",
      value: "4️⃣",
    },
    {
      name: "键帽：5",
      value: "5️⃣",
    },
    {
      name: "键帽：6",
      value: "6️⃣",
    },
    {
      name: "键帽：7",
      value: "7️⃣",
    },
    {
      name: "键帽：8",
      value: "8️⃣",
    },
    {
      name: "键帽：9",
      value: "9️⃣",
    },
    {
      name: "按键: 10",
      value: "🔟",
    },
    {
      name: "输入大写拉丁字母",
      value: "🔠",
    },
    {
      name: "输入小写拉丁字母",
      value: "🔡",
    },
    {
      name: "输入数字",
      value: "🔢",
    },
    {
      name: "输入符号",
      value: "🔣",
    },
    {
      name: "输入拉丁字母",
      value: "🔤",
    },
    {
      name: "A型血",
      value: "🅰",
    },
    {
      name: "AB型血",
      value: "🆎",
    },
    {
      name: "B型血",
      value: "🅱",
    },
    {
      name: "CL按钮",
      value: "🆑",
    },
    {
      name: "cool按钮",
      value: "🆒",
    },
    {
      name: "免费按钮",
      value: "🆓",
    },
    {
      name: "信息",
      value: "ℹ",
    },
    {
      name: "ID按钮",
      value: "🆔",
    },
    {
      name: "圆圈包围的M",
      value: "Ⓜ",
    },
    {
      name: "new按钮",
      value: "🆕",
    },
    {
      name: "NG按钮",
      value: "🆖",
    },
    {
      name: "O 型血",
      value: "🅾",
    },
    {
      name: "OK按钮",
      value: "🆗",
    },
    {
      name: "停车按钮",
      value: "🅿",
    },
    {
      name: "SOS按钮",
      value: "🆘",
    },
    {
      name: "up按钮",
      value: "🆙",
    },
    {
      name: "VS按钮",
      value: "🆚",
    },
    {
      name: "日文的“这里”按钮",
      value: "🈁",
    },
    {
      name: "日文的“服务费”按钮",
      value: "🈂",
    },
    {
      name: "日文的“月总量”按钮",
      value: "🈷",
    },
    {
      name: "日文的“收费”按钮",
      value: "🈶",
    },
    {
      name: "日文的“预留”按钮",
      value: "🈯",
    },
    {
      name: "日文的“议价”按钮",
      value: "🉐",
    },
    {
      name: "日文的“打折”按钮",
      value: "🈹",
    },
    {
      name: "日文的“免费”按钮",
      value: "🈚",
    },
    {
      name: "日文的“禁止”按钮",
      value: "🈲",
    },
    {
      name: "日文的“可接受”按钮",
      value: "🉑",
    },
    {
      name: "日文的“申请”按钮",
      value: "🈸",
    },
    {
      name: "日文的“合格”按钮",
      value: "🈴",
    },
    {
      name: "日文的“有空位”按钮",
      value: "🈳",
    },
    {
      name: "日文的“祝贺”按钮",
      value: "㊗",
    },
    {
      name: "日文的“秘密”按钮",
      value: "㊙",
    },
    {
      name: "日文的“开始营业”按钮",
      value: "🈺",
    },
    {
      name: "日文的“没有空位”按钮",
      value: "🈵",
    },
    {
      name: "红色圆",
      value: "🔴",
    },
    {
      name: "橙色圆",
      value: "🟠",
    },
    {
      name: "黄色圆",
      value: "🟡",
    },
    {
      name: "绿色圆",
      value: "🟢",
    },
    {
      name: "蓝色圆",
      value: "🔵",
    },
    {
      name: "紫色圆",
      value: "🟣",
    },
    {
      name: "棕色圆",
      value: "🟤",
    },
    {
      name: "黑色圆",
      value: "⚫",
    },
    {
      name: "白色圆",
      value: "⚪",
    },
    {
      name: "红色方块",
      value: "🟥",
    },
    {
      name: "橙色方块",
      value: "🟧",
    },
    {
      name: "黄色方块",
      value: "🟨",
    },
    {
      name: "绿色方块",
      value: "🟩",
    },
    {
      name: "蓝色方块",
      value: "🟦",
    },
    {
      name: "紫色方块",
      value: "🟪",
    },
    {
      name: "棕色方块",
      value: "🟫",
    },
    {
      name: "黑线大方框",
      value: "⬛",
    },
    {
      name: "白线大方框",
      value: "⬜",
    },
    {
      name: "黑色中方块",
      value: "◼",
    },
    {
      name: "白色中方块",
      value: "◻",
    },
    {
      name: "黑色中小方块",
      value: "◾",
    },
    {
      name: "白色中小方块",
      value: "◽",
    },
    {
      name: "黑色小方块",
      value: "▪",
    },
    {
      name: "白色小方块",
      value: "▫",
    },
    {
      name: "橙色大菱形",
      value: "🔶",
    },
    {
      name: "蓝色大菱形",
      value: "🔷",
    },
    {
      name: "橙色小菱形",
      value: "🔸",
    },
    {
      name: "蓝色小菱形",
      value: "🔹",
    },
    {
      name: "红色正三角",
      value: "🔺",
    },
    {
      name: "红色倒三角",
      value: "🔻",
    },
    {
      name: "带圆点的菱形",
      value: "💠",
    },
    {
      name: "单选按钮",
      value: "🔘",
    },
    {
      name: "白色方形按钮",
      value: "🔳",
    },
    {
      name: "黑色方形按钮",
      value: "🔲",
    },
  ],
  旗帜: [
    {
      name: "终点旗",
      value: "🏁",
    },
    {
      name: "三角旗",
      value: "🚩",
    },
    {
      name: "交叉旗",
      value: "🎌",
    },
    {
      name: "举黑旗",
      value: "🏴",
    },
    {
      name: "举白旗",
      value: "🏳",
    },
    {
      name: "彩虹旗",
      value: "🏳️‍🌈",
    },
    {
      name: "跨性别旗",
      value: "🏳️‍⚧️",
    },
    {
      name: "海盗旗",
      value: "🏴‍☠️",
    },
  ],
};
// 设置图标
async function setIcon(icon: string) {
  let res: boolean = window.classification.updateIcon(id, icon);
  if (res) {
    window.api.emit("mainWindow", "onUpdateClassificationIcon", {
      id: id,
      icon: icon,
    });
  }
  close();
}
// 加载完dom后再显示页面
nextTick(() => {
  window.classification.showSetIconWindow();
});
// 关闭窗口
function close() {
  window.classification.closeSetIconWindow();
}
// 键盘按下
function keydown(e: any) {
  if (e.keyCode === 27) {
    // ESC
    close();
    e.preventDefault();
    e.stopPropagation();
    return;
  }
}
// mouseover
function mouseover(e: any, cls: string) {
  // 鼠标经过添加分类样式
  if (cls === "icon-classification") {
    if (getClassElement(e, cls)) {
      let style: Map<string, string> = new Map();
      style.set(
        "background-color",
        store.setting.appearance.theme.secondBackgroundColor
      );
      setStyle(e, cls, style);
    }
  } else if (cls === "icon-item") {
    if (getClassElement(e, cls)) {
      let style: Map<string, string> = new Map();
      style.set(
        "background-color",
        store.setting.appearance.theme.secondBackgroundColor
      );
      setStyle(e, cls, style);
    }
  }
}
// mouseout
function mouseout(e: any, cls: string) {
  // 鼠标移走删除分类样式
  if (cls === "icon-classification") {
    if (getClassElement(e, cls)) {
      let element = getClassElement(e, cls);
      let key = element.getAttribute("name");
      if (selected.value !== key) {
        let style: Map<string, string | null> = new Map();
        style.set("background-color", null);
        removeStyle(e, cls, style);
      }
    }
  } else if (cls === "icon-item") {
    let style: Map<string, string | null> = new Map();
    style.set("background-color", null);
    removeStyle(e, cls, style);
  }
}
// 创建滚动条
function createSimpleBar() {
  let element = document.getElementById("content");
  if (element) {
    new SimpleBar(element);
  }
}
// updated
onUpdated(() => {
  // 刷新DOM完毕执行
  nextTick(() => {
    // 滚动条
    createSimpleBar();
  });
});
// moutned
onMounted(() => {
  // 监听键盘
  window.addEventListener("keydown", keydown, true);
  // 刷新DOM完毕执行
  nextTick(() => {
    // 滚动条
    createSimpleBar();
  });
});
// unmounted
onUnmounted(() => {
  // 监听键盘
  window.removeEventListener("keydown", keydown, true);
});
</script>
