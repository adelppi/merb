import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "./theme";

type Props = {
  label: string;
  // prominent は藍の目立つボタン、glass は控えめなガラス（iOS 26 より前は半透明）のボタン。
  variant: "prominent" | "glass";
  disabled?: boolean;
  onPress: () => void;
};

// 文字だけの丸いボタン。押せないときは、背景を薄い灰色、文字を薄い色にする。
export function PillButton({
  label,
  variant,
  disabled = false,
  onPress,
}: Props) {
  const text = (
    <Text
      style={[
        styles.label,
        variant === "prominent" ? styles.onIndigo : styles.indigoText,
        disabled && styles.disabledLabel,
      ]}
    >
      {label}
    </Text>
  );
  let body: ReactNode;
  if (disabled) {
    body = <View style={[styles.pill, styles.disabled]}>{text}</View>;
  } else if (variant === "prominent") {
    body = <View style={[styles.pill, styles.indigo]}>{text}</View>;
  } else if (isLiquidGlassAvailable()) {
    body = (
      <GlassView style={styles.pill} isInteractive>
        {text}
      </GlassView>
    );
  } else {
    body = <View style={[styles.pill, styles.translucent]}>{text}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.hit, pressed && styles.pressed]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { height: 52 },
  pressed: { opacity: 0.7 },
  pill: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  indigo: { backgroundColor: colors.indigo },
  translucent: { backgroundColor: "rgba(255, 255, 255, 0.72)" },
  disabled: { backgroundColor: colors.disabledFill },
  label: { fontSize: 17, fontWeight: "600" },
  onIndigo: { color: "#ffffff" },
  indigoText: { color: colors.indigo },
  disabledLabel: { color: colors.disabledText },
});
