import { type Href, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassCircleButton } from "../components/GlassCircleButton";
import { colors } from "../components/theme";
import { useI18n } from "../i18n/provider";

// 分類を選ぶ画面は #36 で作る。それまでは、この移動先に画面がない。
const categoriesHref = "/categories" as Href;

// ホーム。右上の歯車で設定、下の「問題を解く」で分類を選ぶ画面へ移る。
export default function Home() {
  const { messages } = useI18n();
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.top}>
        <GlassCircleButton
          symbol="gearshape"
          label={messages.Home.settings}
          onPress={() => router.push("/settings")}
        />
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        merb
      </Text>
      <View style={styles.bottom}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(categoriesHref)}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  top: {
    height: 44,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  title: {
    paddingHorizontal: 20,
    paddingTop: 4,
    fontFamily: "Times New Roman",
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 41,
    color: colors.text,
  },
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
