import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { colors } from "../components/theme";
import { I18nProvider, useI18n } from "../i18n/provider";

function RootStack() {
  const { messages } = useI18n();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
          title: messages.Settings.title,
          headerLargeTitleEnabled: true,
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
          headerLargeTitleShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          headerShown: true,
          title: messages.Categories.title,
          headerLargeTitleEnabled: true,
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
          headerLargeTitleShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="quiz"
        options={{
          headerShown: true,
          title: "",
          gestureEnabled: false,
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
        }}
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
