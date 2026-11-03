import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "./theme";

type Props = {
  name: string;
  selected: boolean;
  // 問題が1問もない分類は選べない。
  disabled: boolean;
  onPress: () => void;
};

// 分類を選ぶ画面の行。選んでいる行には、右端にチェックを付ける。
export function CategoryRow({ name, selected, disabled, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text style={[styles.name, disabled && styles.nameDisabled]}>{name}</Text>
      <View style={styles.check}>
        {selected ? (
          <SymbolView
            name="checkmark"
            size={18}
            tintColor={colors.indigo}
            weight="semibold"
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 20,
    paddingRight: 16,
  },
  pressed: { backgroundColor: "rgba(60, 60, 67, 0.08)" },
  name: { flexShrink: 1, fontSize: 17, color: colors.text },
  nameDisabled: { color: colors.disabledText },
  check: { width: 18, height: 18 },
});
