import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "../i18n/provider";
import { type CategoryId, categoryIds } from "../questions/schema";
import {
  canStart,
  isAllSelected,
  toggleAllCategories,
  toggleCategory,
} from "../quiz/categories";
import { useSelection } from "../quiz/selection-provider";
import { CategoryRow } from "./CategoryRow";
import { PillButton } from "./PillButton";
import { colors } from "./theme";

type Props = {
  // 問題が1問以上ある分類。これにない分類は選べない。
  available: readonly CategoryId[];
  // 間違えた問題の記録があるか。ないときは「間違えた問題」を押せない。
  hasMistakes: boolean;
  onStart: (selected: readonly CategoryId[]) => void;
  onRetry: () => void;
};

// ホームの本体。分類の一覧と下のボタンを出す。選んだ分類は SelectionProvider が持つ。大見出しと歯車は _layout.tsx のヘッダーで出す。
export function CategorySelect({
  available,
  hasMistakes,
  onStart,
  onRetry,
}: Props) {
  const { messages } = useI18n();
  const insets = useSafeAreaInsets();
  const { selected, change } = useSelection();
  const allSelected = isAllSelected(selected, available);
  const toggleAllLabel = allSelected
    ? messages.Categories.deselectAll
    : messages.Categories.selectAll;
  const bottom = Math.max(insets.bottom, 16);
  const footerHeight = 16 + 52 + 10 + 52 + bottom;
  return (
    <View style={styles.screen}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: footerHeight + 16 }}
      >
        <View style={styles.listHeader}>
          <Text accessibilityRole="header" style={styles.listTitle}>
            {messages.Categories.title}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={toggleAllLabel}
            onPress={() =>
              change((current) => toggleAllCategories(current, available))
            }
            style={({ pressed }) => [
              styles.toggleAll,
              pressed && styles.pressed,
            ]}
          >
            <SymbolView
              name={allSelected ? "xmark.circle" : "checkmark.circle"}
              size={16}
              tintColor={colors.indigo}
            />
            <Text style={styles.toggleAllLabel}>{toggleAllLabel}</Text>
          </Pressable>
        </View>
        <View style={styles.group}>
          {categoryIds.map((id, index) => (
            <View key={id}>
              {index > 0 ? <View style={styles.separator} /> : null}
              <CategoryRow
                name={messages.CategoryNames[id]}
                selected={selected.includes(id)}
                disabled={!available.includes(id)}
                onPress={() =>
                  change((current) => toggleCategory(current, id, available))
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
          symbol="play.fill"
          disabled={!canStart(selected)}
          onPress={() => onStart(selected)}
        />
        <PillButton
          label={messages.Home.mistakes}
          variant="glass"
          symbol="arrow.counterclockwise"
          disabled={!hasMistakes}
          onPress={onRetry}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    paddingLeft: 36,
    paddingRight: 28,
  },
  listTitle: { flexShrink: 1, fontSize: 13, color: colors.secondaryText },
  // 文字のボタンでも、指で押せるよう高さを 44 にする。
  toggleAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 44,
    paddingHorizontal: 8,
  },
  pressed: { opacity: 0.5 },
  toggleAllLabel: { fontSize: 15, color: colors.indigo },
  group: {
    marginHorizontal: 16,
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
