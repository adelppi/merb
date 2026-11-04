import { SymbolView } from "expo-symbols";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "../i18n/provider";
import type { Answer } from "../questions/schema";
import { otherAnswers, type QuizAction, type QuizState } from "../quiz/reducer";
import { quizView } from "../quiz/view";
import { CardBoard } from "./CardBoard";
import { MathView } from "./MathView";
import { PillButton } from "./PillButton";
import { colors } from "./theme";

type Props = {
  state: QuizState;
  dispatch: (action: QuizAction) => void;
  // 次の問題を出す。
  next: () => void;
};

// 読み方。正解の text があれば text を、なければ cards を半角スペース1つでつないだもの。
function readingOf(answer: Answer): string {
  return answer.text ?? answer.cards.join(" ");
}

// 出題の画面の本体。戻るボタンは _layout.tsx のヘッダーで出す。
export function QuizView({ state, dispatch, next }: Props) {
  const { locale, messages } = useI18n();
  const insets = useSafeAreaInsets();
  const view = quizView(state);
  const bottom = Math.max(insets.bottom, 16);
  const others = view.showCorrect ? otherAnswers(state) : [];

  const status = (
    <>
      {view.showIncorrect ? (
        <IncorrectBadge key={state.checks} label={messages.Quiz.incorrect} />
      ) : null}
      {view.showCorrect ? (
        <>
          <Badge
            symbol="checkmark.circle.fill"
            color={colors.green}
            textColor={colors.greenText}
            label={messages.Quiz.correct}
          />
          {others.length > 0 ? (
            <Readings
              title={messages.Quiz.otherReadings}
              readings={others.map(readingOf)}
            />
          ) : null}
        </>
      ) : null}
      {view.showAnswers ? (
        <Readings
          title={messages.Quiz.answer}
          readings={state.question.answers.map(readingOf)}
        />
      ) : null}
    </>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.prompt}>{state.question.prompt[locale]}</Text>
        <View style={styles.math}>
          <MathView latex={state.question.latex} color={colors.text} />
        </View>
        <CardBoard
          key={state.index}
          cards={state.cards}
          placedIds={state.placed}
          movable={view.showPool}
          placedGreen={view.placedGreen}
          wrongIds={view.wrongIds}
          answerLabel={messages.Quiz.answerArea}
          poolLabel={messages.Quiz.pool}
          between={status}
          onPlace={(id, at) => dispatch({ type: "place", id, at })}
          onUnplace={(id) => dispatch({ type: "unplace", id })}
          onMove={(id, to) => dispatch({ type: "move", id, to })}
        />
      </View>
      <View style={[styles.footer, { paddingBottom: bottom }]}>
        {view.showReveal ? (
          <View style={styles.button}>
            <PillButton
              label={messages.Quiz.reveal}
              variant="glass"
              onPress={() => dispatch({ type: "reveal" })}
            />
          </View>
        ) : null}
        {view.showCheck ? (
          <View style={styles.button}>
            <PillButton
              label={messages.Quiz.check}
              variant="prominent"
              onPress={() => dispatch({ type: "check" })}
            />
          </View>
        ) : null}
        {view.showNext ? (
          <View style={styles.button}>
            <PillButton
              label={messages.Quiz.next}
              variant="prominent"
              onPress={next}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

type BadgeProps = {
  symbol: "checkmark.circle.fill" | "xmark.circle.fill";
  color: string;
  textColor: string;
  label: string;
};

// 「正解」「不正解」の印と文字。色だけでなく印と文字でも示す。
function Badge({ symbol, color, textColor, label }: BadgeProps) {
  return (
    <View style={styles.badge}>
      <SymbolView name={symbol} size={18} tintColor={color} />
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

// 「不正解」。出すたびに左右に小さく揺らす。動きを減らす設定のときは、揺らさずに薄い色から元の色へ戻す。
function IncorrectBadge({ label }: { label: string }) {
  const reduceMotion = useReducedMotion();
  const x = useSharedValue(0);
  const opacity = useSharedValue(1);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 出し直すたびに作り直すので、最初の1回だけ動かす
  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 0.25;
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      x.value = withSequence(
        withTiming(-6, { duration: 50 }),
        withRepeat(withTiming(6, { duration: 100 }), 2, true),
        withTiming(0, { duration: 50 }),
      );
    }
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }],
  }));

  return (
    <Animated.View style={style}>
      <Badge
        symbol="xmark.circle.fill"
        color={colors.red}
        textColor={colors.redText}
        label={label}
      />
    </Animated.View>
  );
}

// 読み方の一覧。画面の文言と同じ書体で、区切り線で分けて並べる。
function Readings({ title, readings }: { title: string; readings: string[] }) {
  return (
    <View style={styles.readings}>
      <Text style={styles.readingsTitle}>{title}</Text>
      <View style={styles.readingsBox}>
        {readings.map((reading, index) => (
          <View key={reading}>
            {index > 0 ? <View style={styles.separator} /> : null}
            <Text accessibilityLanguage="en-US" style={styles.reading}>
              {reading}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16 },
  prompt: {
    paddingHorizontal: 4,
    paddingTop: 8,
    fontSize: 15,
    color: colors.secondaryText,
  },
  math: { paddingVertical: 6, marginBottom: 4 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 17, fontWeight: "600" },
  readings: { marginTop: 18 },
  readingsTitle: {
    marginHorizontal: 4,
    marginBottom: 8,
    fontSize: 13,
    color: colors.secondaryText,
  },
  readingsBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  reading: { fontSize: 17, lineHeight: 25, color: colors.text },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 8,
    backgroundColor: colors.separator,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.background,
  },
  button: { flex: 1 },
});
