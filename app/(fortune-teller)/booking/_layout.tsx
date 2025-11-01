import { Stack } from "expo-router";

export default function P2PLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />

    </Stack>
  );
}
