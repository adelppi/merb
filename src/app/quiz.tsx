import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { QuizView } from "../components/QuizView";
import { colors } from "../components/theme";
import { useI18n } from "../i18n/provider";
import { mistakeChange, selectMistakeQuestions } from "../mistakes/mistakes";
import { useMistakes } from "../mistakes/provider";
import { bundledQuestionFiles } from "../questions/bundled";
import { parseCategories, selectQuestions } from "../quiz/categories";
import { useQuiz } from "../quiz/use-quiz";

// 出題の画面。クエリ categories（コンマ区切りの分類の id）の問題を出す。なければすべての分類から出す。
// クエリ mistakes=1 のときは、開いた時点で記録している、間違えた問題だけから出す。
// クエリ question（問題の id）があれば、最初の問題をそれにする（確かめ用）。
export default function Quiz() {
  const { categories, question, mistakes } = useLocalSearchParams<{
    categories?: string | string[];
    question?: string;
    mistakes?: string;
  }>();
  const retry = mistakes === "1";
  const { ids } = useMistakes();
  // 再挑戦の問題は、出題のあいだ変えない（正解して記録が減っても、問題の番号がずれないようにする）。
  const [retryQuestions] = useState(() =>
    retry ? selectMistakeQuestions(bundledQuestionFiles(), ids) : [],
  );
  const questions = useMemo(
    () =>
      retry
        ? retryQuestions
        : selectQuestions(bundledQuestionFiles(), parseCategories(categories)),
    [retry, retryQuestions, categories],
  );
  return (
    <QuizScreen
      key={`${String(categories)}/${question}/${mistakes}`}
      questions={questions}
      firstId={question}
      retry={retry}
    />
  );
}

function QuizScreen({
  questions,
  firstId,
  retry,
}: {
  questions: ReturnType<typeof selectQuestions>;
  firstId?: string;
  retry: boolean;
}) {
  const { messages } = useI18n();
  const { add, remove } = useMistakes();
  const { state, dispatch, next } = useQuiz(questions, Math.random, firstId);
  // 不正解になった問題を記録に足し、再挑戦で間違えずに正解した問題を記録から消す。
  useEffect(() => {
    const change = state && mistakeChange(state, retry);
    if (change?.type === "add") add(change.id);
    if (change?.type === "remove") remove(change.id);
  }, [state, retry, add, remove]);
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
