import { Stack } from "expo-router";

export default function FortuneTellerProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, 
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="[id_fortune_teller]" />
    </Stack>
  );
}
