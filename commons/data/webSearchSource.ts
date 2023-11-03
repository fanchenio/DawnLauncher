import { WebSearchSource } from "../../types/setting";

const webSearchSourceList: Array<WebSearchSource> = [
  {
    id: 1,
    keyword: "g",
    name: "Google",
    url: "https://www.google.com/search?q={w}",
    description: null,
  },
  {
    id: 2,
    keyword: "b",
    name: "Baidu",
    url: "https://www.baidu.com/s?wd={w}",
    description: null,
  },
  {
    id: 3,
    keyword: "bing",
    name: "Bing",
    url: "https://cn.bing.com/search?q={w}",
    description: null,
  },
  {
    id: 4,
    keyword: "so",
    name: "360",
    url: "https://www.so.com/s?q={w}",
    description: null,
  },
  {
    id: 5,
    keyword: "sogou",
    name: "Sogou",
    url: "https://www.sogou.com/web?query={w}",
    description: null,
  },
];

export { webSearchSourceList };
