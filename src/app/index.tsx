import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { bundledQuestions } from "../questions/bundled";

// 画面の作り直し（#35〜#37）まで置くプレースホルダー。同梱した問題を Zod で検査して、問題の数を出す。
export default function Index() {
  const count = bundledQuestions().length;
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>merb</Text>
      <Text>{count}</Text>
      <StatusBar style="auto" />
    </View>
  );
}
