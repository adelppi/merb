import { Asset } from "expo-asset";
import { EncodingType, readAsStringAsync } from "expo-file-system/legacy";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { renderLatexHtml } from "../questions/latex";
import { katexFonts } from "./katex-fonts";

// KaTeX の CSS。@font-face は取り除き、書体は下で base64 にして入れる。
const katexCss: number = require("katex/dist/katex.min.css");

type Assets = { css: string };

let assetsPromise: Promise<Assets> | null = null;

// アプリに同梱した KaTeX の CSS と書体を読み込み、HTML に入れる CSS にする。通信はしない。
function loadAssets(): Promise<Assets> {
  assetsPromise ??= (async () => {
    const [css, ...fonts] = await Promise.all([
      readAsset(katexCss, EncodingType.UTF8),
      ...katexFonts.map((font) => readAsset(font.woff2, EncodingType.Base64)),
    ]);
    const fontFaces = katexFonts
      .map(
        (font, i) =>
          `@font-face{font-family:${font.family};font-style:${font.style};font-weight:${font.weight};src:url(data:font/woff2;base64,${fonts[i]}) format("woff2")}`,
      )
      .join("");
    return { css: css.replace(/@font-face\{[^}]*\}/g, "") + fontFaces };
  })();
  return assetsPromise;
}

async function readAsset(
  module: number,
  encoding: EncodingType,
): Promise<string> {
  const asset = Asset.fromModule(module);
  await asset.downloadAsync();
  if (!asset.localUri) {
    throw new Error("アセットを読めない");
  }
  return readAsStringAsync(asset.localUri, { encoding });
}

function buildHtml(css: string, body: string, color: string): string {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}
html,body{margin:0;background:transparent;color:${color};-webkit-text-size-adjust:none}
#m{padding:4px 0}
.katex{font-size:1.5em}
.katex-display{margin:0}
</style></head><body><div id="m">${body}</div><script>
function post(){var r=document.getElementById("m").getBoundingClientRect();window.ReactNativeWebView.postMessage(JSON.stringify({height:Math.ceil(r.height)}))}
post();
if(document.fonts&&document.fonts.ready){document.fonts.ready.then(post)}
window.addEventListener("load",post);
</script></body></html>`;
}

type Props = { latex: string; color?: string };

// 問題の latex を KaTeX で描く。WebView の中で描き、高さを数式に合わせる。
export function MathView({ latex, color = "#000000" }: Props) {
  const [css, setCss] = useState<string | null>(null);
  const [height, setHeight] = useState(48);

  useEffect(() => {
    let alive = true;
    loadAssets().then((assets) => {
      if (alive) {
        setCss(assets.css);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const html = useMemo(
    () => (css === null ? null : buildHtml(css, renderLatexHtml(latex), color)),
    [css, latex, color],
  );

  if (html === null) {
    return <View style={{ height }} />;
  }
  return (
    <View style={{ height }}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        scrollEnabled={false}
        style={{ backgroundColor: "transparent" }}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data) as { height: number };
          setHeight(data.height);
        }}
      />
    </View>
  );
}
