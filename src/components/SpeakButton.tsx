import * as Speech from "expo-speech";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet } from "react-native";
import { useI18n } from "../i18n/provider";
import { colors } from "./theme";

// 読み方の音声を聞くボタン。前の読み上げを止めてから読む。
export function SpeakButton({ text }: { text: string }) {
  const { messages } = useI18n();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={messages.Quiz.listen}
      onPress={() => {
        Speech.stop();
        Speech.speak(text, { language: "en-US" });
      }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <SymbolView
        name="speaker.wave.2"
        size={20}
        tintColor={colors.indigo}
        resizeMode="scaleAspectFit"
        style={styles.icon}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.5 },
  icon: { width: 24, height: 24 },
});
