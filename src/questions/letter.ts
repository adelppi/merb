// 札の文字列が英字1文字かどうか。英字1文字の札は、数式の中の文字と同じ斜体で出す（docs/specs/quiz.md の「画面」）。
export function isLetterCard(text: string): boolean {
  return /^[A-Za-z]$/.test(text);
}
