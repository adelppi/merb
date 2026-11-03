import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "../i18n/provider";
import { type CategoryId, categoryIds } from "../questions/schema";
import { canStart, toggleCategory } from "../quiz/categories";
import { CategoryRow } from "./CategoryRow";
import { PillButton } from "./PillButton";
import { colors } from "./theme";

type Props = {
  // 問題が1問以上ある分類。これにない分類は選べない。
  available: readonly CategoryId[];
  onStart: (selected: CategoryId[]) => void;
  onStartAll: () => void;
};

// 分類を選ぶ画面の本体。選んだ分類はこの部品の state が持つ。大見出しと戻るボタンは _layout.tsx のヘッダーで出す。
export function CategorySelect({ available, onStart, onStartAll }: Props) {
  const { messages } = useI18n();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<CategoryId[]>([]);
  const bottom = Math.max(insets.bottom, 16);
  const footerHeight = 16 + 52 + 10 + 52 + bottom;
  return (
    <View style={styles.screen}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: footerHeight + 16 }}
      >
        <View style={styles.group}>
          {categoryIds.map((id, index) => (
            <View key={id}>
              {index > 0 ? <View style={styles.separator} /> : null}
              <CategoryRow
                name={messages.CategoryNames[id]}
                selected={selected.includes(id)}
                disabled={!available.includes(id)}
                onPress={() =>
                  setSelected((current) =>
                    toggleCategory(current, id, available),
                  )
                }
              />
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: bottom }]}>
        <PillButton
          label={messages.Categories.start}
          variant="prominent"
          disabled={!canStart(selected)}
          onPress={() => onStart(selected)}
        />
        <PillButton
          label={messages.Categories.all}
          variant="glass"
          onPress={onStartAll}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  group: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: colors.surface,
    borderRadius: 26,
    overflow: "hidden",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 20,
    backgroundColor: colors.separator,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 10,
    backgroundColor: colors.background,
  },
});
