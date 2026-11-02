import katex, { type KatexOptions } from "katex";

// 仕様の「KaTeX で描ける」の設定。出題の画面でも同じ設定で描く。
export const katexOptions = {
  throwOnError: true,
  strict: "error",
} as const satisfies KatexOptions;

// KaTeX で描けなければ、そのエラーの文言を返す。描ければ null を返す。
export function findLatexError(latex: string): string | null {
  try {
    katex.renderToString(latex, katexOptions);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}
