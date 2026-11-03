import katex from "katex";
import "katex/dist/katex.min.css";
import { katexOptions } from "@/questions/latex";

// 数式を KaTeX で描く。設定は問題の JSON の検査と同じにする。
export function MathFormula({ latex }: { latex: string }) {
  const html = katex.renderToString(latex, {
    ...katexOptions,
    displayMode: true,
  });
  // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX が問題の JSON の数式から作った HTML
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
