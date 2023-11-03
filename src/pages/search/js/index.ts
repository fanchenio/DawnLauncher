import { itemRemoveStyle } from "../../item/js";

/**
 * 删除所有选中项目样式
 * @param className
 * @param selected
 */
function itemAllRemoveStyle(className: string, selected: number) {
  let elementList = document.getElementsByClassName(className);
  for (let i = 0; i < elementList.length; i++) {
    const element = elementList[i];
    let index = element.getAttribute("index");
    if (index && selected !== parseInt(index)) {
      itemRemoveStyle(element, className);
    }
  }
}

/**
 * 移动滚动条
 * @param className
 * @param height
 * @param type
 * @param selected
 */
function searchResultDivMoveScroll(
  className: string,
  height: number,
  type: "up" | "down",
  selected: number
) {
  let listEL = document.getElementById("search-result-list");
  let itemEl = document.getElementById(className + "-" + selected);
  if (listEL && itemEl) {
    let itemRect = itemEl.getBoundingClientRect();
    let realY = itemRect.y - height - 1 + 48;
    if (type === "up") {
      if (realY < 48) {
        let sim = listEL.getElementsByClassName("simplebar-content-wrapper")[0];
        sim.scrollTop = sim.scrollTop - (48 - realY);
      }
    } else {
      if (realY > listEL.clientHeight) {
        let sim = listEL.getElementsByClassName("simplebar-content-wrapper")[0];
        sim.scrollTop = sim.scrollTop + (realY - listEL.clientHeight);
      }
    }
  }
}

export { itemAllRemoveStyle, searchResultDivMoveScroll };
