import { Stack, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  backHeaderOptions,
  iconHeaderItem,
  largeTitleHeaderOptions,
} from "../components/headerOptions";
import { colors } from "../components/theme";
import { I18nProvider, useI18n } from "../i18n/provider";

function RootStack() {
  const { messages } = useI18n();
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          ...largeTitleHeaderOptions("merb", "Times New Roman"),
          // ホームは最初の画面なので、戻るボタンはない。
          unstable_headerRightItems: () => [
            iconHeaderItem({
              symbol: "gearshape",
              label: messages.Home.settings,
              onPress: () => router.push("/settings"),
            }),
          ],
        }}
      />
      <Stack.Screen
        name="settings"
        options={largeTitleHeaderOptions(messages.Settings.title)}
      />
      <Stack.Screen
        name="categories"
        options={largeTitleHeaderOptions(messages.Categories.title)}
      />
      <Stack.Screen
        name="quiz"
        options={{ ...backHeaderOptions(), gestureEnabled: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nProvider>
        <RootStack />
      </I18nProvider>
    </GestureHandlerRootView>
  );
}
