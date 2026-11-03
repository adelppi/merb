import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { QuizView } from "../components/QuizView";
import { colors } from "../components/theme";
import { useI18n } from "../i18n/provider";
import { bundledQuestionFiles } from "../questions/bundled";
import { parseCategories, selectQuestions } from "../quiz/categories";
import { useQuiz } from "../quiz/use-quiz";

// 出題の画面。クエリ categories（コンマ区切りの分類の id）の問題を出す。なければすべての分類から出す。
// クエリ question（問題の id）があれば、最初の問題をそれにする（確かめ用）。
export default function Quiz() {
  const { categories, question } = useLocalSearchParams<{
    categories?: string | string[];
    question?: string;
  }>();
  const questions = useMemo(
    () => selectQuestions(bundledQuestionFiles(), parseCategories(categories)),
    [categories],
  );
  return (
    <QuizScreen
      key={`${String(categories)}/${question}`}
      questions={questions}
      firstId={question}
    />
  );
}

function QuizScreen({
  questions,
  firstId,
}: {
  questions: ReturnType<typeof selectQuestions>;
  firstId?: string;
}) {
  const { messages } = useI18n();
  const { state, dispatch, next } = useQuiz(questions, Math.random, firstId);
  if (questions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{messages.Quiz.noQuestions}</Text>
      </View>
    );
  }
  if (state === null) {
    return null;
  }
  return <QuizView state={state} dispatch={dispatch} next={next} />;
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  emptyText: { fontSize: 17, color: colors.secondaryText },
});
