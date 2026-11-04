import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "./theme";

type Props = {
  label: string;
  // prominent は藍に色付けしたガラス（iOS 26 より前は藍）のボタン、glass は控えめなガラス（iOS 26 より前は半透明）のボタン。
  variant: "prominent" | "glass";
  // 文字の左に出す SF Symbols の名前
  symbol?: Extract<SymbolViewProps["name"], string>;
  height?: number;
  disabled?: boolean;
  onPress: () => void;
};

// 丸いボタン。押せないときは、背景を薄い灰色、文字を薄い色にする。
export function PillButton({
  label,
  variant,
  symbol,
  height = 52,
  disabled = false,
  onPress,
}: Props) {
  const prominent = variant === "prominent";
  const pill = [styles.pill, { height, borderRadius: height / 2 }];
  const text = (
    <>
      {symbol ? (
        <SymbolView
          name={symbol}
          size={16}
          tintColor="#ffffff"
          weight="semibold"
        />
      ) : null}
      <Text
        style={[
          styles.label,
          prominent ? styles.onIndigo : styles.indigoText,
          disabled && styles.disabledLabel,
        ]}
      >
        {label}
      </Text>
    </>
  );
  let body: ReactNode;
  if (disabled) {
    body = <View style={[pill, styles.disabled]}>{text}</View>;
  } else if (isLiquidGlassAvailable()) {
    body = (
      <GlassView
        style={pill}
        isInteractive
        tintColor={prominent ? colors.indigo : undefined}
      >
        {text}
      </GlassView>
    );
  } else {
    body = (
      <View style={[pill, prominent ? styles.indigo : styles.translucent]}>
        {text}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [{ height }, pressed && styles.pressed]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  indigo: { backgroundColor: colors.indigo },
  translucent: { backgroundColor: "rgba(255, 255, 255, 0.72)" },
  disabled: { backgroundColor: colors.disabledFill },
  label: { fontSize: 17, fontWeight: "600" },
  onIndigo: { color: "#ffffff" },
  indigoText: { color: colors.indigo },
  disabledLabel: { color: colors.disabledText },
});
