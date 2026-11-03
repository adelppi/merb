// KaTeX の書体。WebView の中の数式に使う。katex.min.css の @font-face と同じ組み合わせ。
// Metro は require の引数が文字列リテラルでないと読めないので、1つずつ書く。
export type KatexFont = {
  family: string;
  weight: "normal" | "bold";
  style: "normal" | "italic";
  // woff2 のファイル（アセットの番号）
  woff2: number;
};

export const katexFonts: KatexFont[] = [
  {
    family: "KaTeX_AMS",
    weight: "normal",
    style: "normal",
    woff2: require("katex/dist/fonts/KaTeX_AMS-Regular.woff2"),
  },
  {
    family: "KaTeX_Caligraphic",
    weight: "bold",
    style: "normal",
    woff2: require("katex/dist/fonts/KaTeX_Caligraphic-Bold.woff2"),
  },
  {
    family: "KaTeX_Caligraphic",
    weight: "normal",
    style: "normal",
    woff2: require("katex/dist/fonts/KaTeX_Caligraphic-Regular.woff2"),
  },
  {
    family: "KaTeX_Fraktur",
    weight: "bold",
    style: "normal",
    woff2: require("katex/dist/fonts/KaTeX_Fraktur-Bold.woff2"),
  },
  {
    family: "KaTeX_Fraktur",
    weight: "normal",
    style: "normal",
    woff2: require("katex/dist/fonts/KaTeX_Fraktur-Regular.woff2"),
  },
  {
    family: "KaTeX_Main",
    weight: "bold",
    style: "normal",
    woff2: require("katex/dist/fonts/KaTeX_Main-Bold.woff2"),
  },
  {
    family: "KaTeX_Main",
    weight: "bold",
    style: "italic",
    woff2: require("katex/dist/fonts/KaTeX_Main-BoldItalic.woff2"),
  },
  {
    family: "KaTeX_Main",
    weight: "normal",
    style: "italic",
    woff2: require("katex/dist/fonts/KaTeX_Main-Italic.woff2"),
  },
  {
    family: "KaTeX_Main",
    weight: "normal",
    style: "normal",
    woff2: require("katex/dist/fonts/KaTeX_Main-Regular.woff2"),
  },
  {
    family: "KaTeX_Math",
    weight: "bold",
    style: "italic",
    woff2: require("katex/dist/fonts/KaTeX_Math-BoldItalic.woff2"),
  },
  {
    family: "KaTeX_Math",
    weight: "normal",
    style: "italic",
    woff2: require("katex/dist/fonts/KaTeX_Math-Italic.woff2"),
  },
  {
    family: "KaTeX_SansSerif",
    weight: "bold",
    style: "normal",
    woff2: require("katex/dist/fonts/KaTeX_SansSerif-Bold.woff2"),
  },
  {
    family: "KaTeX_SansSerif",
    weight: "normal",
    style: "italic",
    woff2: require("katex/dist/fonts/KaTeX_SansSerif-Italic.woff2"),
  },
  {
    family: "KaTeX_SansSerif",
    weight: "normal",
    style: "normal",
    woff2: require("katex/dist/fonts/KaTeX_SansSerif-Regular.woff2"),
  },
  {
    family: "KaTeX_Script",
    weight: "normal",
    style: "normal",
    woff2: require("katex/dist/fonts/KaTeX_Script-Regular.woff2"),
  },
  {
    family: "KaTeX_Size1",
    weight: "normal",
    style: "normal",
    woff2: require("katex/dist/fonts/KaTeX_Size1-Regular.woff2"),
  },
  {
    family: "KaTeX_Size2",
    weight: "normal",
    style: "normal",
    woff2: require("katex/dist/fonts/KaTeX_Size2-Regular.woff2"),
  },
  {
    family: "KaTeX_Size3",
    weight: "normal",
    style: "normal",
    woff2: require("katex/dist/fonts/KaTeX_Size3-Regular.woff2"),
  },
  {
    family: "KaTeX_Size4",
    weight: "normal",
    style: "normal",
    woff2: require("katex/dist/fonts/KaTeX_Size4-Regular.woff2"),
  },
  {
    family: "KaTeX_Typewriter",
    weight: "normal",
    style: "normal",
    woff2: require("katex/dist/fonts/KaTeX_Typewriter-Regular.woff2"),
  },
];
