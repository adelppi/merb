import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../components/theme";
import { useI18n } from "../i18n/provider";

// ホーム。大見出しと右上の歯車は、_layout.tsx のヘッダーで出す。下の「問題を解く」で分類を選ぶ画面へ移る。
export default function Home() {
  const { messages } = useI18n();
  const router = useRouter();
  return (
    <View style={styles.screen}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scroll}
      />
      <View style={styles.bottom}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/categories")}
          style={({ pressed }) => [styles.start, pressed && styles.pressed]}
        >
          <SymbolView
            name="play.fill"
            size={16}
            tintColor="#ffffff"
            weight="semibold"
          />
          <Text style={styles.startLabel}>{messages.Home.start}</Text>
        </Pressable>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 34,
  },
  start: {
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.indigo,
  },
  pressed: { opacity: 0.8 },
  startLabel: { fontSize: 17, fontWeight: "600", color: "#ffffff" },
});
