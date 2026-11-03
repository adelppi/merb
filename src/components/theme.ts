// デザイン（docs/design/ios/）の色。#35 から #37 で共有する。
export const colors = {
  background: "#f2f2f7",
  surface: "#ffffff",
  text: "#1c1c1e",
  secondaryText: "rgba(60, 60, 67, 0.6)",
  // 押せない行と押せないボタンの文字（iOS の標準の薄い文字色）
  disabledText: "rgba(60, 60, 67, 0.3)",
  // 押せないボタンの背景（iOS の標準の薄い塗り）
  disabledFill: "rgba(120, 120, 128, 0.16)",
  separator: "rgba(60, 60, 67, 0.2)",
  // oklch(0.48 0.14 265)
  indigo: "#3658ac",
  // 回答エリアの背景。oklch(0.94 0.03 265)
  answerArea: "#e4e8f6",
  // 正解の印と回答エリアの札。oklch(0.52 0.12 155)
  green: "#2e8556",
  // 正解の文字。oklch(0.45 0.12 155)
  greenText: "#1f6c42",
  // 不正解の印。oklch(0.55 0.17 25)
  red: "#d04a3f",
  // 不正解の文字。oklch(0.5 0.17 25)
  redText: "#b53a30",
} as const;
