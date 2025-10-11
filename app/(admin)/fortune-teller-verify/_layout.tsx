import { Stack } from "expo-router";

export default function FortuneTellerVerifyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // ปิด header เดิม เพื่อใช้ HeaderBar custom ของเราเอง
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />

    </Stack>
  );
}
