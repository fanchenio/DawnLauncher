<template>
  <div class="popup top-0 left-0 w-full h-full fixed z-10">
    <div :id="id" class="popup-content fixed z-20 drop-shadow-[0_0_6px_rgba(0,0,0,0.2)] app-region-no-drag">
      <slot name="body"></slot>
    </div>
  </div>
</template>

<script>
import CommonJS from "@/common/index";

export default {
  name: "Popup",
  props: {
    id: {
      type: String,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
  },
  data() {
    return {
      // 只运行一次窗口初始化位置
      resize: true,
      // 当前是否选中弹窗
      current: false,
      // 当前弹窗最大移动位置
      maxTop: null,
      maxLeft: null,
      // 弹窗起始位置T
      startTop: null,
      startLeft: null,
      // 鼠标点击的起始位置
      startY: null,
      startX: null,
      // 宽高
      w: null,
      h: null,
    };
  },
  created() {
    this.w = this.width;
    this.h = this.height;
  },
  mounted() {
    let _this = this;
    // 弹窗初始化位置
    if (this.resize) {
      this.resize = false;
      this.setSize();
    }
    window.addEventListener("resize", this.setSize, true);
    // 监听标题拖拽
    let popupHeaderElementList = document.getElementsByClassName("popup-header");
    for (let popupHeaderElement of popupHeaderElementList) {
      popupHeaderElement.addEventListener("mousedown", function (e) {
        // 点击了弹窗
        _this.current = true;
        // 获取弹窗元素
        let popup = document.getElementById(_this.id);
        // 获取popup-content位置
        let { popupContentTop, popupContentLeft } = _this.getPopupContentTopLeft(popup);
        // 获取弹窗所在位置
        _this.startTop = popup.offsetTop;
        _this.startLeft = popup.offsetLeft;
        // 获取鼠标点击位置
        _this.startY = e.clientY;
        _this.startX = e.clientX;
        // 获取屏幕的信息
        let doc = document.documentElement;
        // 计算当前弹窗最大移动位置
        _this.maxLeft = doc.clientWidth - _this.w - popupContentLeft;
        _this.maxTop = doc.clientHeight - _this.h - popupContentTop;
        // 监听鼠标移动
        document.onmousemove = function (e) {
          if (_this.current) {
            // 计算出移动的位置
            let currentLeft = e.clientX - _this.startX + _this.startLeft;
            let currentTop = e.clientY - _this.startY + _this.startTop;
            // 如果超出的话，就用最大移动位置
            currentLeft = currentLeft < 0 - popupContentLeft ? 0 - popupContentLeft : currentLeft > _this.maxLeft ? _this.maxLeft : currentLeft;
            currentTop = currentTop < 0 - popupContentTop ? 0 - popupContentTop : currentTop > _this.maxTop ? _this.maxTop : currentTop;
            // 设置top left
            let popup = document.getElementById(_this.id);
            popup.style.left = currentLeft + "px";
            popup.style.top = currentTop + "px";
          }
        };
        // 监听鼠标释放
        document.onmouseup = function (e) {
          _this.current = false;
          document.onmousemove = document.onmouseup = null;
        };
      });
    }
  },
  unmounted() {
    window.removeEventListener("resize", this.setSize, true);
  },
  watch: {
    width(newVal, oldVal) {
      this.w = newVal;
    },
    height(newVal, oldVal) {
      this.h = newVal;
    },
  },
  methods: {
    /**
     * 设置弹窗初始化位置
     */
    setSize() {
      let popup = document.getElementById(this.id);
      if (popup != null) {
        // 获取popup-content位置
        let { popupContentTop, popupContentLeft } = this.getPopupContentTopLeft(popup);
        let body = document.querySelector("body");
        popup.style.width = this.w + "px";
        popup.style.height = this.h == null ? "auto" : this.h + "px";
        popup.style.top = body.clientHeight / 2 - popup.clientHeight / 2 - popupContentTop + "px";
        popup.style.left = body.clientWidth / 2 - popup.clientWidth / 2 - popupContentLeft + "px";
      }
    },
    /**
     * 判断是否是popupContent
     */
    isPopupContent(el) {
      if (el != null) {
        let classList = el.classList;
        if (!CommonJS.arrayIsEmpty(classList)) {
          for (let clazz of classList) {
            if (clazz == "popup-content") {
              return true;
            }
          }
        }
      }
      return false;
    },
    /**
     * 获取popup-content位置
     * @param popup
     */
    getPopupContentTopLeft(popup) {
      let parent = popup.parentElement;
      let popupContent;
      if (this.isPopupContent(parent)) {
        popupContent = parent;
      }
      while (parent != null) {
        parent = parent.parentElement;
        if (this.isPopupContent(parent)) {
          popupContent = parent;
        }
      }
      let popupContentTop = 0;
      let popupContentLeft = 0;
      if (popupContent != null) {
        if (popupContent.getBoundingClientRect() != null) {
          popupContentTop = popupContent.getBoundingClientRect().top;
          popupContentLeft = popupContent.getBoundingClientRect().left;
        }
      }
      return { popupContentTop, popupContentLeft };
    },
  },
};
</script>

<style scoped></style>
