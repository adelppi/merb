import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Pressable, StyleSheet, View } from "react-native";
import { colors } from "./theme";

type Props = {
  symbol: SymbolViewProps["name"];
  // アイコンだけなので、読み上げ用の名前が要る。
  label: string;
  onPress: () => void;
};

// 丸いアイコンのボタン。Liquid Glass が使えるとき（iOS 26 以上）はガラス、それ以外は半透明の背景で出す。
export function GlassCircleButton({ symbol, label, onPress }: Props) {
  const glass = isLiquidGlassAvailable();
  const icon = (
    <SymbolView
      name={symbol}
      size={22}
      tintColor={colors.text}
      weight="medium"
    />
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.hit, pressed && styles.pressed]}
    >
      {glass ? (
        <GlassView style={styles.circle}>{icon}</GlassView>
      ) : (
        <View style={[styles.circle, styles.translucent]}>{icon}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { width: 44, height: 44 },
  pressed: { opacity: 0.6 },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  translucent: { backgroundColor: "rgba(255, 255, 255, 0.72)" },
});
