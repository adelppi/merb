import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LanguageRow } from "../components/LanguageRow";
import { colors } from "../components/theme";
import { localeNames, locales } from "../i18n/locale";
import { useI18n } from "../i18n/provider";

// 設定画面。大見出しと戻るボタンは、_layout.tsx のヘッダーで出す。
export default function Settings() {
  const { locale, setLocale, messages } = useI18n();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.screen}
    >
      <Text accessibilityRole="header" style={styles.section}>
        {messages.Settings.language}
      </Text>
      <View style={styles.group} accessibilityRole="radiogroup">
        {locales.map((item, index) => (
          <View key={item}>
            {index > 0 ? <View style={styles.separator} /> : null}
            <LanguageRow
              name={localeNames[item]}
              selected={item === locale}
              onPress={() => setLocale(item)}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  section: {
    paddingTop: 12,
    paddingBottom: 6,
    paddingHorizontal: 36,
    fontSize: 13,
    color: colors.secondaryText,
  },
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
});
