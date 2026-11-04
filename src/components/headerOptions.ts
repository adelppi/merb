import type {
  NativeStackHeaderItem,
  NativeStackNavigationOptions,
} from "expo-router";
import type { SymbolViewProps } from "expo-symbols";

type SFSymbol = Extract<SymbolViewProps["name"], string>;

import { colors } from "./theme";

// 画面遷移のヘッダーの設定。_layout.tsx の画面から呼ぶ（D-0024）。

// iOS 純正の大タイトル。ヘッダーの背景は透明にして画面の背景になじませる。
// 大タイトルを縮ませるには、画面の最初の子を ScrollView にし、
// contentInsetAdjustmentBehavior="automatic" を付ける。
export function largeTitleHeaderOptions(
  title: string,
  fontFamily?: string,
): NativeStackNavigationOptions {
  return {
    headerShown: true,
    title,
    headerLargeTitleEnabled: true,
    headerTransparent: true,
    headerBackButtonDisplayMode: "minimal",
    headerShadowVisible: false,
    headerLargeTitleShadowVisible: false,
    headerLargeTitleStyle: { color: colors.text, fontFamily },
  };
}

// 大見出しのない戻るだけのヘッダー。背景は画面と同じ色にする。
export function backHeaderOptions(): NativeStackNavigationOptions {
  return {
    headerShown: true,
    title: "",
    headerBackButtonDisplayMode: "minimal",
    headerShadowVisible: false,
    headerStyle: { backgroundColor: colors.background },
  };
}

// アイコンだけのネイティブのヘッダーボタン。iOS 26 では Liquid Glass で出る。
// sharesBackground: false で、複数のボタンが1つのカプセルにつながらないようにする。
// iOS 26 より前では、この指定は無視される。
export function iconHeaderItem(args: {
  symbol: SFSymbol;
  // アイコンだけなので、読み上げ用の名前が要る。
  label: string;
  onPress: () => void;
}): NativeStackHeaderItem {
  return {
    type: "button",
    label: "",
    accessibilityLabel: args.label,
    icon: { type: "sfSymbol", name: args.symbol },
    onPress: args.onPress,
    sharesBackground: false,
  };
}
