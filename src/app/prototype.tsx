import { useLocalSearchParams } from "expo-router";
import { useReducer } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { CardBoard } from "../components/CardBoard";
import { MathView } from "../components/MathView";
import { bundledQuestions } from "../questions/bundled";
import { dealCards } from "../questions/cards";
import {
  placedCards,
  poolCards,
  type QuizState,
  quizReducer,
  startState,
} from "../quiz/reducer";

// #33 でライブラリを試すための画面。#35 で出題の画面を作るときに置き換える。
// 開くには、`?i=<問題の番号>` を付けて /prototype を開く。
function initialState(index: number): QuizState {
  const questions = bundledQuestions();
  const question = questions[index % questions.length];
  const cards = dealCards(question).map((text, id) => ({ id, text }));
  return startState(index, question, cards);
}

export default function Prototype() {
  const { i, m } = useLocalSearchParams<{ i?: string; m?: string }>();
  // `?m=1,2,3` を付けると、その番号の問題の数式だけを並べる（数式の描画を見比べるため）。
  if (m) {
    const questions = bundledQuestions();
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
          {m.split(",").map((n) => {
            const question = questions[Number(n) % questions.length];
            return (
              <View key={n}>
                <Text>{question.id}</Text>
                <MathView latex={question.latex} />
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }
  // 番号が変わったら、状態を作り直す。
  return <Trial key={i} index={Number(i ?? 0) || 0} />;
}

function Trial({ index }: { index: number }) {
  const [state, dispatch] = useReducer(quizReducer, index, initialState);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text>{state.question.id}</Text>
        <Text>{state.question.prompt.ja}</Text>
        <MathView latex={state.question.latex} />
        <CardBoard
          pool={poolCards(state)}
          placed={placedCards(state)}
          onPlace={(id, at) => dispatch({ type: "place", id, at })}
          onUnplace={(id) => dispatch({ type: "unplace", id })}
          onMove={(id, to) => dispatch({ type: "move", id, to })}
        />
        <View />
      </ScrollView>
    </SafeAreaView>
  );
}
