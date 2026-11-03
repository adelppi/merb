import katex, { type KatexOptions } from "katex";

// 仕様の「KaTeX で描ける」の設定。出題の画面でも同じ設定で描く。
export const katexOptions = {
  throwOnError: true,
  strict: "error",
} as const satisfies KatexOptions;

// 出題の画面で数式を描く HTML。検査と同じ設定で、数式を単独の行として描く。
// 描けなければ例外を投げる。
export function renderLatexHtml(latex: string): string {
  return katex.renderToString(latex, {
    ...katexOptions,
    displayMode: true,
    output: "html",
  });
}

// KaTeX で描けなければ、そのエラーの文言を返す。描ければ null を返す。
export function findLatexError(latex: string): string | null {
  try {
    katex.renderToString(latex, katexOptions);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}
