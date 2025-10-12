import {
  NotoSansThai_300Light,
  NotoSansThai_400Regular,
  NotoSansThai_500Medium,
  NotoSansThai_600SemiBold,
  NotoSansThai_700Bold,
  useFonts,
} from "@expo-google-fonts/noto-sans-thai";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";


import "./global.css";

SplashScreen.preventAutoHideAsync(); // keep splash while fonts load

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoSansThaiLight: NotoSansThai_300Light,
    NotoSansThaiRegular: NotoSansThai_400Regular,
    NotoSansThaiMedium: NotoSansThai_500Medium,
    NotoSansThaiSemiBold: NotoSansThai_600SemiBold,
    NotoSansThaiBold: NotoSansThai_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="role-redirect" />
      </Stack>
    </SafeAreaProvider>
  );
}
