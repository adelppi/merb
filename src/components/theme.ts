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
} as const;
