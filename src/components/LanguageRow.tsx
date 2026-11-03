import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "./theme";

type Props = {
  name: string;
  selected: boolean;
  onPress: () => void;
};

// 設定画面の言語の行。選んでいる言語には、右端にチェックを付ける。
export function LanguageRow({ name, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text style={styles.name}>{name}</Text>
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
  name: { fontSize: 17, color: colors.text },
  check: { width: 18, height: 18 },
});
