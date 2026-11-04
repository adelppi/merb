import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { PillButton } from "../components/PillButton";
import { colors } from "../components/theme";
import { useI18n } from "../i18n/provider";
import { mistakesParam, selectMistakeQuestions } from "../mistakes/mistakes";
import { useMistakes } from "../mistakes/provider";
import { bundledQuestionFiles } from "../questions/bundled";

// ホーム。大見出しと右上の歯車は、_layout.tsx のヘッダーで出す。下の「問題を解く」で分類を選ぶ画面へ移る。
export default function Home() {
  const { messages } = useI18n();
  const router = useRouter();
  const { ids } = useMistakes();
  const hasMistakes = useMemo(
    () => selectMistakeQuestions(bundledQuestionFiles(), ids).length > 0,
    [ids],
  );
  return (
    <View style={styles.screen}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scroll}
      />
      <View style={styles.bottom}>
        <PillButton
          label={messages.Home.start}
          variant="prominent"
          symbol="play.fill"
          height={56}
          onPress={() => router.push("/categories")}
        />
        <PillButton
          label={messages.Home.mistakes}
          variant="glass"
          disabled={!hasMistakes}
          onPress={() => router.push(`/quiz?${mistakesParam}=1`)}
        />
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
    gap: 12,
  },
});
